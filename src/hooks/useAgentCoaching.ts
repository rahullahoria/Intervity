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
import { VoiceBiometricsService } from '../core/voice/VoiceBiometricsService';
import { InterviewState, UserVoiceProfile, ConversationTrack, CONVERSATION_TRACKS } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'mascot' | 'user';
  text: string;
  timestamp: number;
}

export function useAgentCoaching() {
  const [state, setState] = useState<InterviewState>('INITIALIZING');
  const [conversationTrack, setConversationTrackState] = useState<ConversationTrack>('DISTRIBUTED_SYSTEMS');
  const [mascotProfile, setMascotProfile] = useState<MascotProfile>({
    id: 'mascot_primary',
    name: 'Teddy',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    personalityTier: 'Warm Friend & Coding Buddy',
    relationshipSummary: 'A warm, supportive friendship learning together and reaching your career goals.',
    coachingStyle: 'Warm, Socratic & Conversational Growth',
    totalTurns: 0,
  });
  const [userMemory, setUserMemory] = useState<UserCareerMemory | null>(null);
  const [voiceProfile, setVoiceProfile] = useState<UserVoiceProfile | null>(null);
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
  const pendingFinalResolverRef = useRef<((text: string) => void) | null>(null);

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
          setConversationTrackState(harness.current.getConversationTrack());
        }

        const biometrics = VoiceBiometricsService.getInstance();
        const enrolledProfile = await biometrics.getVoiceProfile();
        if (isMounted && enrolledProfile) {
          setVoiceProfile(enrolledProfile);
          if (enrolledProfile.name) {
            await harness.current.recordMemoryFact('candidate_name', 'name', enrolledProfile.name);
            setUserMemory(harness.current.getUserMemory());
          }
        }

        await Promise.all([
          llmEngine.current.loadModel('MiniCPM5-2B-Q4_K_M.gguf'),
          ttsService.current.initialize('kokoro_models', 'hf_alpha'),
          audioEngine.current.initializeWithAEC({ sampleRate: 16000, bufferSize: 320 }),
          sttService.current.initializeModel('ggml-tiny.en.bin'),
        ]);

        harness.current.setLLMEngine(llmEngine.current);
        await audioEngine.current.setSpeakerphone(true);
        // Do NOT start recording stream on boot — mic is enabled only when user taps to speak

        if (isMounted) {
          setState('READY');
          setCurrentSubtitle('Teddy is ready. Tap to Speak to begin.');
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
    if (pendingFinalResolverRef.current) {
      pendingFinalResolverRef.current = null;
    }
    audioEngine.current.cancelRecordingStream();
    userSpeechBufferRef.current = '';
    setState('READY');
    setCurrentSubtitle('Teddy is ready. Tap to Speak.');
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
    // 1. Immediately request microphone stop & finalize recognition
    audioEngine.current.stopRecordingStream();

    let recognizedText = (overrideText || userSpeechBufferRef.current || '').trim();

    // If buffer is still empty (e.g. user just finished speaking and tapped Send),
    // wait up to 900ms for SpeechRecognizer's onFinalTranscript to arrive
    if (!recognizedText && !overrideText) {
      setCurrentSubtitle('⏳ Transcribing your speech...');
      recognizedText = await new Promise<string>((resolve) => {
        pendingFinalResolverRef.current = resolve;
        setTimeout(() => {
          if (pendingFinalResolverRef.current === resolve) {
            pendingFinalResolverRef.current = null;
            resolve((userSpeechBufferRef.current || '').trim());
          }
        }, 900);
      });
    }

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

  // 3. Audio & Transcription Listeners (Mounted once, zero dropped events)
  useEffect(() => {
    const unsubVAD = audioEngine.current.onVADEvent((event: VADEvent) => {
      setAudioLevel(event.volume);
      if (event.isSpeech && event.volume > 0.05) {
        setState((current) => (current === 'LISTENING' ? 'USER_SPEAKING' : current));
      }
    });

    const unsubPartial = audioEngine.current.onPartialTranscript((text: string) => {
      const clean = text.trim();
      if (!clean) return;
      console.log('[useAgentCoaching] onPartialTranscript:', clean);
      userSpeechBufferRef.current = clean;
      setState((current) => (current === 'LISTENING' ? 'USER_SPEAKING' : current));
      setCurrentSubtitle(`🗣️ "${clean}"`);
    });

    const unsubFinal = audioEngine.current.onFinalTranscript((text: string) => {
      const clean = text.trim();
      if (clean) {
        console.log('[useAgentCoaching] onFinalTranscript:', clean);
        userSpeechBufferRef.current = clean;
        setCurrentSubtitle(`🗣️ "${clean}"`);
        if (pendingFinalResolverRef.current) {
          const resolver = pendingFinalResolverRef.current;
          pendingFinalResolverRef.current = null;
          resolver(clean);
        }
      }
    });

    return () => {
      unsubVAD();
      unsubPartial();
      unsubFinal();
    };
  }, []);

  const startSession = useCallback(async () => {
    const memory = harness.current.getUserMemory();
    const candidateName = voiceProfile?.name || (memory?.candidateName !== 'Candidate' ? memory?.candidateName : '');
    const nameCall = candidateName ? `, ${candidateName}` : '';
    const welcome = `Hey there${nameCall}! I'm Teddy, your coding buddy and friend. I'm so excited to hang out with you! Tell me, what are you working on right now, or what is a dream role you've got your eyes on?`;
    await speakMascotResponse(welcome);
  }, [speakMascotResponse, voiceProfile]);

  const refreshVoiceProfile = useCallback(async () => {
    const biometrics = VoiceBiometricsService.getInstance();
    const profile = await biometrics.getVoiceProfile();
    setVoiceProfile(profile);
    if (profile?.name) {
      await harness.current.recordMemoryFact('candidate_name', 'name', profile.name);
      setUserMemory(harness.current.getUserMemory());
    }
  }, []);

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

  const selectConversationTrack = useCallback(async (track: ConversationTrack) => {
    setConversationTrackState(track);
    await harness.current.setConversationTrack(track);
    setUserMemory(harness.current.getUserMemory());

    const trackInfo = CONVERSATION_TRACKS[track];
    if (state === 'AI_SPEAKING') {
      audioEngine.current.stopPlaybackAndClearBuffers();
      ttsService.current.stopPlayback();
    }
    await speakMascotResponse(trackInfo.starterGreeting);
  }, [speakMascotResponse, state]);

  return {
    state,
    mascotProfile,
    userMemory,
    voiceProfile,
    conversationTrack,
    refreshVoiceProfile,
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
    selectConversationTrack,
  };
}

