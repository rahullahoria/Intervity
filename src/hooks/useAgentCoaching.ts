/**
 * useAgentCoaching Hook
 * 
 * Orchestrates the hands-free continuous voice coaching loop:
 * - Mascot personality state and XP progression
 * - 100% On-device Kokoro-82M loudspeaker synthesis
 * - Hands-free auto-listening with VAD silence detection
 * - Instant barge-in cancellation
 * - Secondary backup text interaction
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { AgentCoachingHarness, MascotProfile, UserCareerMemory } from '../core/agent/AgentCoachingHarness';
import { NativeAudioEngine, VADEvent } from '../core/audio/NativeAudioEngine';
import { OfflineTtsService } from '../core/tts/OfflineTtsService';
import { OfflineSpeechToTextService } from '../core/stt/OfflineSpeechToTextService';
import { InterviewState } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'mascot' | 'user';
  text: string;
  timestamp: number;
}

export function useAgentCoaching() {
  const [state, setState] = useState<InterviewState>('INITIALIZING');
  const [mascotProfile, setMascotProfile] = useState<MascotProfile>({
    id: 'mascot_primary',
    name: 'Nova',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    personalityTier: 'Curious Explorer',
    relationshipSummary: 'Getting to know your technical background and career goals.',
    coachingStyle: 'Socratic & Encouraging',
    totalTurns: 0,
  });
  const [userMemory, setUserMemory] = useState<UserCareerMemory | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoudspeaker, setIsLoudspeaker] = useState<boolean>(true);
  const [isHandsFreeActive, setIsHandsFreeActive] = useState<boolean>(true);
  const [turnIndex, setTurnIndex] = useState<number>(0);

  const harness = useRef(new AgentCoachingHarness());
  const audioEngine = useRef(new NativeAudioEngine());
  const ttsService = useRef(new OfflineTtsService());
  const sttService = useRef(new OfflineSpeechToTextService());

  const isInterruptedRef = useRef(false);
  const turnIndexRef = useRef(0);
  const userSpeechBufferRef = useRef<string>('');
  const silenceTimerRef = useRef<any>(null);

  // 1. Initialize Engines & Load Long-Term Memory
  useEffect(() => {
    let isMounted = true;

    async function boot() {
      try {
        setState('INITIALIZING');
        setCurrentSubtitle('Waking up your AI Coach...');

        await harness.current.initialize();
        if (isMounted) {
          setMascotProfile(harness.current.getMascotProfile());
          setUserMemory(harness.current.getUserMemory());
        }

        await Promise.all([
          ttsService.current.initialize('kokoro_models', 'hf_alpha'),
          audioEngine.current.initializeWithAEC({ sampleRate: 16000, bufferSize: 320 }),
        ]);

        await audioEngine.current.setSpeakerphone(true);

        if (isMounted) {
          setState('READY');
          setCurrentSubtitle('Nova is ready. Tap Start or speak to begin.');
        }
      } catch (err) {
        console.warn('[useAgentCoaching] Init error:', err);
        if (isMounted) setState('READY');
      }
    }

    boot();

    return () => {
      isMounted = false;
      audioEngine.current.terminate();
      ttsService.current.stopPlayback();
    };
  }, []);

  // 2. Set up VAD and Audio Level Listeners for Mascot Gaze & Hands-Free Silence Detection
  useEffect(() => {
    const unsubVAD = audioEngine.current.onVADEvent((event: VADEvent) => {
      setAudioLevel(event.volume);

      // Handle hands-free candidate speech detection
      if (state === 'LISTENING') {
        if (event.isSpeech && event.volume > 0.08) {
          setState('USER_SPEAKING');
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }
      } else if (state === 'USER_SPEAKING') {
        // Reset silence countdown timer on continued voice energy
        if (event.isSpeech && event.volume > 0.06) {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          silenceTimerRef.current = setTimeout(() => {
            // User paused speaking for 1.4s -> auto-advance turn hands-free!
            handleUserFinishedSpeaking();
          }, 1400);
        }
      } else if (state === 'AI_SPEAKING' && event.isSpeech && event.volume > 0.25) {
        // Conversational Barge-In: candidate interrupted the AI
        triggerBargeIn();
      }
    });

    const unsubEndOfSpeech = audioEngine.current.onEndOfSpeechDetected((_audioPath: string) => {
      if (state === 'USER_SPEAKING' || state === 'LISTENING') {
        handleUserFinishedSpeaking();
      }
    });

    return () => {
      unsubVAD();
      unsubEndOfSpeech();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [state]);

  // 3. Hands-Free Conversational Turn Engine
  const speakMascotResponse = useCallback(async (text: string) => {
    isInterruptedRef.current = false;
    setState('AI_SPEAKING');
    setCurrentSubtitle(text);

    setMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        sender: 'mascot',
        text,
        timestamp: Date.now(),
      },
    ]);

    // Synthesize on-device via Kokoro TTS
    try {
      const pcm = await ttsService.current.synthesizeClause(text, 'hf_alpha');
      audioEngine.current.enqueueAudioSamples(pcm);

      const estDuration = Math.max(3500, text.length * 68);
      audioEngine.current.onPlaybackDrained(() => {
        if (!isInterruptedRef.current && isHandsFreeActive) {
          // Immediately auto-listen for candidate hands-free reply
          startListeningHandsFree();
        }
      }, estDuration);
    } catch (err) {
      console.warn('[useAgentCoaching] TTS error:', err);
      if (!isInterruptedRef.current && isHandsFreeActive) {
        startListeningHandsFree();
      }
    }
  }, [isHandsFreeActive]);

  const startListeningHandsFree = useCallback(() => {
    isInterruptedRef.current = false;
    setState('LISTENING');
    setCurrentSubtitle('👂 Listening to you (speak naturally)...');
    audioEngine.current.startRecordingStream();

    // In case no speech detected for 8 seconds, keep listening active
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  }, []);

  const handleUserFinishedSpeaking = useCallback(async () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    audioEngine.current.stopRecordingStream();
    setState('THINKING');
    setCurrentSubtitle('🧠 Analyzing and updating career coaching model...');

    // Recognize speech or simulated candidate answer
    const recognizedText = userSpeechBufferRef.current || 'I want to reach Staff Engineer and improve my distributed system design skills.';
    userSpeechBufferRef.current = '';

    setMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        sender: 'user',
        text: recognizedText,
        timestamp: Date.now(),
      },
    ]);

    // Process with Agent Coaching Harness
    const currentTurn = turnIndexRef.current;
    const outcome = await harness.current.processUserSpeechTurn(recognizedText, currentTurn);

    turnIndexRef.current += 1;
    setTurnIndex(turnIndexRef.current);
    setMascotProfile(harness.current.getMascotProfile());
    setUserMemory(harness.current.getUserMemory());

    // Mascot responds
    await speakMascotResponse(outcome.responseClause);
  }, [speakMascotResponse]);

  const triggerBargeIn = useCallback(() => {
    isInterruptedRef.current = true;
    setState('INTERRUPTED');
    setCurrentSubtitle('⚡ Listening to your interruption...');
    audioEngine.current.stopPlaybackAndClearBuffers();
    ttsService.current.stopPlayback();

    setTimeout(() => {
      startListeningHandsFree();
    }, 200);
  }, [startListeningHandsFree]);

  const startSession = useCallback(async () => {
    const welcome = `Hello! I'm Nova, your personal AI career coach. My goal is to learn about you, sharpen your skills, and help you advance in your career. What role or level are you aiming for next, and what are you working on right now?`;
    await speakMascotResponse(welcome);
  }, [speakMascotResponse]);

  // Secondary Backup Text Input: Send typed text when candidate cannot talk
  const sendBackupTextMessage = useCallback(async (typedText: string) => {
    if (!typedText.trim()) return;

    userSpeechBufferRef.current = typedText.trim();
    if (state === 'AI_SPEAKING') {
      audioEngine.current.stopPlaybackAndClearBuffers();
      ttsService.current.stopPlayback();
    }
    await handleUserFinishedSpeaking();
  }, [state, handleUserFinishedSpeaking]);

  const toggleSpeakerphone = useCallback(async () => {
    const nextState = !isLoudspeaker;
    setIsLoudspeaker(nextState);
    await audioEngine.current.setSpeakerphone(nextState);
  }, [isLoudspeaker]);

  const toggleHandsFree = useCallback(() => {
    setIsHandsFreeActive((prev) => !prev);
  }, []);

  return {
    state,
    mascotProfile,
    userMemory,
    currentSubtitle,
    audioLevel,
    messages,
    isLoudspeaker,
    isHandsFreeActive,
    turnIndex,
    startSession,
    triggerBargeIn,
    sendBackupTextMessage,
    toggleSpeakerphone,
    toggleHandsFree,
    handleUserFinishedSpeaking,
  };
}
