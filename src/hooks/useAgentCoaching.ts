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
import { OfflineLLMEngine } from '../core/llm/OfflineLLMEngine';
import { ModelAssetManager } from '../core/models/ModelAssetManager';
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
  const llmEngine = useRef(new OfflineLLMEngine());
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

        const assetManager = ModelAssetManager.getInstance();
        if (!assetManager.isModelDownloaded('minicpm5_2b')) {
          setCurrentSubtitle('Downloading MiniCPM5-2B LLM from CDN...');
          await assetManager.ensureModelDownloaded('minicpm5_2b');
        }

        setCurrentSubtitle('Waking up your AI Coach...');

        await harness.current.initialize();
        if (isMounted) {
          setMascotProfile(harness.current.getMascotProfile());
          setUserMemory(harness.current.getUserMemory());
        }

        await Promise.all([
          llmEngine.current.loadModel('MiniCPM5-2B-Q4_K_M.gguf'),
          ttsService.current.initialize('kokoro_models', 'hf_alpha'),
          audioEngine.current.initializeWithAEC({ sampleRate: 16000, bufferSize: 320 }),
        ]);

        harness.current.setLLMEngine(llmEngine.current);
        await audioEngine.current.setSpeakerphone(true);
        // Do NOT start recording stream on boot — mic is enabled only when user taps to speak

        if (isMounted) {
          setState('READY');
          setCurrentSubtitle('Nova is ready. Tap to Speak to begin.');
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
      llmEngine.current.release();
    };
  }, []);

  // 2. Controlled Turn Engine (Push-to-Talk with explicit Send button)
  const startListening = useCallback(() => {
    isInterruptedRef.current = false;
    userSpeechBufferRef.current = '';

    // Stop any ongoing TTS audio before opening mic
    audioEngine.current.stopPlaybackAndClearBuffers();
    ttsService.current.stopPlayback();

    setState('LISTENING');
    setCurrentSubtitle('👂 Listening... Speak now and tap Send when done.');
    audioEngine.current.startRecordingStream();
  }, []);

  const cancelListening = useCallback(() => {
    audioEngine.current.stopRecordingStream();
    userSpeechBufferRef.current = '';
    setState('READY');
    setCurrentSubtitle('Nova is ready. Tap to Speak.');
  }, []);

  const stopMascotSpeaking = useCallback(() => {
    audioEngine.current.stopPlaybackAndClearBuffers();
    ttsService.current.stopPlayback();
    setState('READY');
  }, []);

  const speakMascotResponse = useCallback(async (text: string) => {
    // Ensure microphone is completely stopped while AI speaks to avoid any echo
    audioEngine.current.stopRecordingStream();
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

    try {
      await ttsService.current.synthesizeClause(text, 'hf_alpha');

      // When audio finishes playing out of hardware speaker, return cleanly to READY
      audioEngine.current.onPlaybackDrained(() => {
        setState('READY');
        setCurrentSubtitle(text);
      }, 45000);
    } catch (err) {
      console.warn('[useAgentCoaching] TTS error:', err);
      setState('READY');
      setCurrentSubtitle(text);
    }
  }, []);

  const stopAndSend = useCallback(async (overrideText?: string) => {
    // 1. Immediately shut off microphone
    audioEngine.current.stopRecordingStream();

    const recognizedText = (overrideText || userSpeechBufferRef.current || '').trim();
    if (!recognizedText) {
      setState('READY');
      setCurrentSubtitle('No speech detected. Tap to Speak again.');
      return;
    }

    setState('THINKING');
    setCurrentSubtitle('🧠 Thinking...');
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

    // 2. Process with Agent Coaching Harness
    const currentTurn = turnIndexRef.current;
    const outcome = await harness.current.processUserSpeechTurn(recognizedText, currentTurn);

    turnIndexRef.current += 1;
    setTurnIndex(turnIndexRef.current);
    setMascotProfile(harness.current.getMascotProfile());
    setUserMemory(harness.current.getUserMemory());

    // 3. Mascot responds out loud
    await speakMascotResponse(outcome.responseClause);
  }, [speakMascotResponse]);

  // 3. Audio & Transcription Listeners
  useEffect(() => {
    const unsubVAD = audioEngine.current.onVADEvent((event: VADEvent) => {
      setAudioLevel(event.volume);

      if (state === 'LISTENING') {
        if (event.isSpeech && event.volume > 0.05) {
          setState('USER_SPEAKING');
        }
      }
    });

    const unsubPartial = audioEngine.current.onPartialTranscript((text: string) => {
      const clean = text.trim();
      if (!clean) return;
      if (state === 'LISTENING' || state === 'USER_SPEAKING') {
        userSpeechBufferRef.current = clean;
        setState('USER_SPEAKING');
        setCurrentSubtitle(`🗣️ "${clean}"`);
      }
    });

    const unsubFinal = audioEngine.current.onFinalTranscript((text: string) => {
      const clean = text.trim();
      if (clean && (state === 'LISTENING' || state === 'USER_SPEAKING')) {
        userSpeechBufferRef.current = clean;
        setCurrentSubtitle(`🗣️ "${clean}"`);
      }
    });

    return () => {
      unsubVAD();
      unsubPartial();
      unsubFinal();
    };
  }, [state]);

  const startSession = useCallback(async () => {
    const welcome = `Hello! I'm Nova, your personal AI career coach. My goal is to learn about you, sharpen your skills, and help you advance in your career. What role or level are you aiming for next, and what are you working on right now?`;
    await speakMascotResponse(welcome);
  }, [speakMascotResponse]);

  // Secondary Backup Text Input: Send typed text when candidate cannot talk
  const sendBackupTextMessage = useCallback(async (typedText: string) => {
    if (!typedText.trim()) return;

    if (state === 'AI_SPEAKING') {
      audioEngine.current.stopPlaybackAndClearBuffers();
      ttsService.current.stopPlayback();
    }
    await stopAndSend(typedText.trim());
  }, [state, stopAndSend]);

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
    startListening,
    stopAndSend,
    cancelListening,
    stopMascotSpeaking,
    triggerBargeIn: stopMascotSpeaking,
    handleUserFinishedSpeaking: stopAndSend,
    sendBackupTextMessage,
    toggleSpeakerphone,
    toggleHandsFree,
  };
}
