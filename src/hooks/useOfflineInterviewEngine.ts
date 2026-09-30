/**
 * Offline Voice Interview Engine Controller Hook
 * Coordinates full-duplex audio, Whisper STT, MiniCPM LLM, Kokoro TTS, and Barge-In interruption
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ChatMessage,
  InterviewOptions,
  InterviewSession,
  InterviewState,
  TurnEvaluation,
} from '../types';
import { NativeAudioEngine } from '../core/audio/NativeAudioEngine';
import { OfflineSpeechToTextService, INDIAN_ENGLISH_WHISPER_PROMPT } from '../core/stt/OfflineSpeechToTextService';
import { OfflineLLMEngine } from '../core/llm/OfflineLLMEngine';
import { OfflineTtsService } from '../core/tts/OfflineTtsService';
import { buildInterviewerPrompt } from '../core/llm/SystemPrompts';
import { SkillStorageManager } from '../database/SkillStorageManager';
import { SessionStorageManager } from '../database/SessionStorageManager';
import { SoftSkillsProsodyAnalyzer } from '../analytics/SoftSkillsProsodyAnalyzer';
import { MistakeClassifier } from '../analytics/MistakeClassifier';

export function useOfflineInterviewEngine(options: InterviewOptions) {
  const {
    resume,
    targetRole,
    dialect = 'en-IN',
    voiceProfile = 'hf_alpha',
    interviewerPersona = 'bengaluru_tech_lead',
    targetLevel = 'Senior Engineer (L5)',
  } = options;

  const [state, setState] = useState<InterviewState>('INITIALIZING');
  const [transcript, setTranscript] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [activeQuestion, setActiveQuestion] = useState<string>('');
  const [sessionRecord, setSessionRecord] = useState<InterviewSession | null>(null);

  const sttService = useRef(new OfflineSpeechToTextService());
  const llmEngine = useRef(new OfflineLLMEngine());
  const ttsService = useRef(new OfflineTtsService());
  const audioEngine = useRef(new NativeAudioEngine());
  const skillDb = useRef(new SkillStorageManager());
  const sessionDb = useRef(new SessionStorageManager());

  const activeAiResponse = useRef<string>('');
  const isInterruptedRef = useRef<boolean>(false);
  const turnStartTimeRef = useRef<number>(Date.now());
  const turnLatencyRef = useRef<number>(1200);
  const sessionIdRef = useRef<string>(`session_${Date.now()}`);

  // 1. Initialize Engines & Persist Resume Skills
  useEffect(() => {
    let isMounted = true;

    async function boot() {
      try {
        setState('INITIALIZING');

        await Promise.all([
          sttService.current.initializeModel('ggml-tiny.en.bin'),
          llmEngine.current.loadModel('qwen2.5-0.5b-instruct-q4_k_m.gguf'),
          ttsService.current.initialize('kokoro_models', voiceProfile),
          audioEngine.current.initializeWithAEC({ sampleRate: 16000, bufferSize: 320 }),
        ]);

        // Seed skills extracted from candidate resume into SQLite
        await skillDb.current.seedSkillsFromResume(resume.skills);

        // Retrieve historical candidate weaknesses for spaced repetition
        const weakSkills = await skillDb.current.getWeakestSkills(2);
        const weaknessContext = weakSkills.length > 0
          ? `CANDIDATE HISTORICAL WEAKNESSES TO PROBE:\n${weakSkills.map(w => `- ${w.skill_name} (Score: ${Math.round(w.current_score)}/100)`).join('\n')}`
          : '';

        const systemPrompt = buildInterviewerPrompt({
          jobRole: targetRole,
          resumeText: resume.rawText,
          dialect,
          persona: interviewerPersona,
          targetLevel,
          weaknessContext,
        });

        if (isMounted) {
          setMessages([{ role: 'system', content: systemPrompt }]);
          setSessionRecord({
            sessionId: sessionIdRef.current,
            targetRole,
            startedAt: Date.now(),
            turns: [],
          });
          setState('READY');
        }
      } catch (err) {
        console.error('[useOfflineInterviewEngine] Engine init error:', err);
        if (isMounted) setState('READY');
      }
    }

    boot();

    return () => {
      isMounted = false;
      sttService.current.release();
      llmEngine.current.release();
      audioEngine.current.terminate();
    };
  }, [resume, targetRole, dialect, voiceProfile, interviewerPersona, targetLevel]);

  // 2. Interruption Handler (Triggered on candidate barge-in while AI speaks/thinks)
  const triggerInterruption = useCallback(() => {
    if (state !== 'AI_SPEAKING' && state !== 'THINKING') return;

    console.log('[BARGE-IN] Candidate interrupted the AI interviewer!');
    isInterruptedRef.current = true;

    // A. Immediately kill audio playback & purge hardware buffer (<15ms)
    audioEngine.current.stopPlaybackAndClearBuffers();
    ttsService.current.stopPlayback();

    // B. Abort LLM token inference loop atomically
    llmEngine.current.stopGeneration();

    // C. Record partially spoken sentence with interruption indicator
    if (activeAiResponse.current.trim().length > 0) {
      const truncated = `${activeAiResponse.current.trim()} ... [interrupted by candidate]`;
      setMessages((prev) => [...prev, { role: 'assistant', content: truncated }]);
      activeAiResponse.current = '';
    }

    setState('INTERRUPTED');
    startListening();
  }, [state]);

  // 3. Audio & VAD Event Subscriptions
  useEffect(() => {
    if (state === 'INITIALIZING' || state === 'READY' || state === 'COMPLETED') return;

    const unsubVAD = audioEngine.current.onVADEvent(({ isSpeech, volume }) => {
      setAudioLevel(volume);

      if (isSpeech) {
        if (state === 'AI_SPEAKING' || state === 'THINKING') {
          // Barge-in detected!
          triggerInterruption();
        } else if (state === 'LISTENING') {
          setState('USER_SPEAKING');
          turnStartTimeRef.current = Date.now();
        }
      }
    });

    const unsubSilence = audioEngine.current.onEndOfSpeechDetected(async (audioPath) => {
      if (state === 'USER_SPEAKING' || state === 'INTERRUPTED' || state === 'LISTENING') {
        await handleUserFinishedSpeaking(audioPath);
      }
    });

    return () => {
      unsubVAD();
      unsubSilence();
    };
  }, [state, triggerInterruption]);

  // 4. Handle Candidate Finished Speaking
  const handleUserFinishedSpeaking = async (audioPath: string) => {
    setState('THINKING');
    isInterruptedRef.current = false;

    const speechDurationSeconds = Math.max(1, (Date.now() - turnStartTimeRef.current) / 1000);

    try {
      // Step A: STT Transcription with Indian English prompt biasing
      const userText = await sttService.current.transcribeAudioChunk(
        audioPath,
        INDIAN_ENGLISH_WHISPER_PROMPT
      );

      if (!userText || userText.length < 2) {
        startListening();
        return;
      }

      setTranscript(userText);
      const updatedMessages: ChatMessage[] = [...messages, { role: 'user', content: userText }];
      setMessages(updatedMessages);

      // Step B: Speech Prosody & Filler Analysis
      const prosody = SoftSkillsProsodyAnalyzer.analyzeTurnProsody(
        userText,
        speechDurationSeconds,
        turnLatencyRef.current
      );

      // Step C: Stream LLM response & pipe into Kokoro TTS
      activeAiResponse.current = '';
      let isFirstChunk = true;

      await llmEngine.current.streamInterviewResponse(
        updatedMessages,
        (_token) => {
          // Live token emission
        },
        async (clause) => {
          if (isInterruptedRef.current) return;

          activeAiResponse.current += (activeAiResponse.current ? ' ' : '') + clause;

          if (isFirstChunk) {
            setState('AI_SPEAKING');
            isFirstChunk = false;
          }

          // Synthesize clause via Kokoro and stream to AudioTrack
          const pcmAudioSamples = await ttsService.current.synthesizeClause(clause, voiceProfile);
          if (!isInterruptedRef.current && pcmAudioSamples && pcmAudioSamples.length > 0) {
            audioEngine.current.enqueueAudioSamples(pcmAudioSamples);
          }
        }
      );

      // Step D: Complete turn if not interrupted
      if (!isInterruptedRef.current) {
        const fullQuestion = activeAiResponse.current.trim();
        setActiveQuestion(fullQuestion);

        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: fullQuestion },
        ]);

        // Evaluate turn & update Bayesian EMA skill score in SQLite
        const skillId = resume.skills[currentTurnIndex % resume.skills.length] || 'system_design';
        const turnScore = Math.max(45, Math.min(95, Math.round(prosody.vocalPacingScore * 0.4 + (userText.length > 50 ? 50 : 25))));

        await skillDb.current.recordTurnScore(
          sessionIdRef.current,
          skillId.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          currentTurnIndex,
          activeQuestion,
          userText,
          turnScore,
          1.1
        );

        // Classify turn mistakes for diagnostic autopsy
        const mistake = MistakeClassifier.classifyTurnMistake(
          sessionIdRef.current,
          skillId,
          currentTurnIndex,
          activeQuestion,
          userText,
          targetLevel
        );

        const evaluation: TurnEvaluation = {
          turnId: `turn_${currentTurnIndex}`,
          sessionId: sessionIdRef.current,
          skillId,
          turnIndex: currentTurnIndex,
          interviewerQuestion: activeQuestion,
          candidateAnswer: userText,
          turnScore,
          questionDifficulty: 1.1,
          timestamp: Date.now(),
          prosody,
          mistake: mistake || undefined,
        };

        if (sessionRecord) {
          sessionRecord.turns.push(evaluation);
        }

        setCurrentTurnIndex((prev) => prev + 1);

        // Wait until native audio buffer finishes playback before listening again
        const estDuration = Math.max(4000, fullQuestion.length * 70);
        audioEngine.current.onPlaybackDrained(() => {
          if (!isInterruptedRef.current) {
            startListening();
          }
        }, estDuration);
      }
    } catch (err) {
      console.error('[useOfflineInterviewEngine] Error during turn cycle:', err);
      startListening();
    }
  };

  const startListening = () => {
    isInterruptedRef.current = false;
    setState('LISTENING');
    audioEngine.current.startRecordingStream();
  };

  const startInterview = () => {
    isInterruptedRef.current = false;
    // Generate initial opening question
    const openingQuestion = `Hello ${resume.candidateName}, thanks for joining today. To start off, could you walk me through your architectural experience with ${resume.skills[0] || 'distributed systems'} and how you handled high throughput in your recent projects?`;
    setActiveQuestion(openingQuestion);
    setMessages((prev) => [...prev, { role: 'assistant', content: openingQuestion }]);
    setState('AI_SPEAKING');

    ttsService.current.synthesizeClause(openingQuestion, voiceProfile).then((pcm) => {
      if (pcm && pcm.length > 0) {
        audioEngine.current.enqueueAudioSamples(pcm);
      }
      audioEngine.current.onPlaybackDrained(() => {
        startListening();
      }, 45000);
    });
  };

  const endInterview = async () => {
    setState('COMPLETED');
    audioEngine.current.stopPlaybackAndClearBuffers();
    audioEngine.current.stopRecordingStream();

    if (sessionRecord) {
      const totalScore = sessionRecord.turns.length > 0
        ? Math.round(sessionRecord.turns.reduce((sum, t) => sum + t.turnScore, 0) / sessionRecord.turns.length)
        : 75;

      sessionRecord.completedAt = Date.now();
      sessionRecord.durationSeconds = Math.round((Date.now() - sessionRecord.startedAt) / 1000);
      sessionRecord.overallScore = totalScore;
      sessionRecord.summaryFeedback = `Completed mock interview for ${targetRole} with ${sessionRecord.turns.length} conversational turns.`;

      await sessionDb.current.saveInterviewSession(sessionRecord);
    }
  };

  // Helper for simulated candidate speech in testing/demo
  const simulateCandidateAnswer = (text: string) => {
    sttService.current.setSimulatedTranscript(text);
    audioEngine.current.simulateUserSpeechTurn(text, 1500);
  };

  // Immediate manual turn submission (skips waiting for silence detection)
  const finishSpeakingManually = () => {
    if (state === 'LISTENING' || state === 'USER_SPEAKING' || state === 'INTERRUPTED') {
      audioEngine.current.finishTurnManually();
    }
  };

  // Direct text submission (e.g. typing or pre-prepared answers)
  const submitCandidateAnswer = async (text: string) => {
    if (state === 'LISTENING' || state === 'USER_SPEAKING' || state === 'INTERRUPTED') {
      audioEngine.current.stopRecordingStream();
      sttService.current.setSimulatedTranscript(text);
      await handleUserFinishedSpeaking('direct_input.m4a');
    }
  };

  // Loudspeaker / Speakerphone routing control
  const setSpeakerphone = async (enable: boolean = true) => {
    return await audioEngine.current.setSpeakerphone(enable);
  };

  return {
    state,
    messages,
    transcript,
    audioLevel,
    currentTurnIndex,
    activeQuestion,
    sessionRecord,
    startInterview,
    endInterview,
    triggerInterruption,
    finishSpeakingManually,
    submitCandidateAnswer,
    simulateCandidateAnswer,
    setSpeakerphone,
  };
}
