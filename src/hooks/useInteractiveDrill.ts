/**
 * Interactive Coaching Drill Hook ("Level-Up Mode")
 * Coordinates:
 * - Drill A: Zero-Filler Biofeedback Reflex Trainer
 * - Drill B: 60-Second STAR Elevator Pitch
 * - Drill C: Skeptical Architect Pushback Drill
 */

import { useState, useRef, useEffect } from 'react';
import { MistakeDiagnostic } from '../types';
import { SessionStorageManager } from '../database/SessionStorageManager';
import { SkillStorageManager } from '../database/SkillStorageManager';
import { SoftSkillsProsodyAnalyzer } from '../analytics/SoftSkillsProsodyAnalyzer';
import { StarMethodEvaluator } from '../analytics/StarMethodEvaluator';

export type DrillType = 'ZERO_FILLER' | 'STAR_PITCH' | 'SKEPTICAL_ARCHITECT' | 'MISTAKE_CORRECTION';

export interface DrillConfig {
  type: DrillType;
  title: string;
  prompt: string;
  targetSkillId: string;
  timeLimitSeconds: number;
  mistake?: MistakeDiagnostic;
}

export function useInteractiveDrill(drill: DrillConfig) {
  const [drillState, setDrillState] = useState<'INTRO' | 'RECORDING' | 'EVALUATING' | 'PASSED' | 'FAILED'>('INTRO');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(drill.timeLimitSeconds);
  const [candidateTranscript, setCandidateTranscript] = useState<string>('');
  const [hapticCount, setHapticCount] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [scoreAwarded, setScoreAwarded] = useState<number>(0);

  const timerRef = useRef<any>(null);
  const sessionDb = useRef(new SessionStorageManager());
  const skillDb = useRef(new SkillStorageManager());

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startDrill = () => {
    setDrillState('RECORDING');
    setSecondsRemaining(drill.timeLimitSeconds);
    setCandidateTranscript('');
    setHapticCount(0);
    setFeedback('');

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finishDrill();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onCandidateSpokeChunk = (text: string) => {
    setCandidateTranscript((prev) => prev + ' ' + text);

    // Biofeedback check for Zero-Filler drill
    if (drill.type === 'ZERO_FILLER') {
      const prosody = SoftSkillsProsodyAnalyzer.analyzeTurnProsody(text, 1, 0);
      if (prosody.fillerCount > 0) {
        setHapticCount((prev) => prev + prosody.fillerCount);
      }
    }
  };

  const finishDrill = async (finalSpeech?: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setDrillState('EVALUATING');

    const speech = (finalSpeech || candidateTranscript).trim();
    const prosody = SoftSkillsProsodyAnalyzer.analyzeTurnProsody(
      speech,
      drill.timeLimitSeconds - secondsRemaining || 10,
      1000
    );

    let passed = false;
    let feedbackMsg = '';
    let bonus = 0;

    if (drill.type === 'ZERO_FILLER') {
      if (prosody.fillerCount === 0 && speech.length > 20) {
        passed = true;
        bonus = 12;
        feedbackMsg = 'Flawless cadence! Zero filler words detected with confident pacing.';
      } else {
        passed = false;
        feedbackMsg = `Detected ${prosody.fillerCount} filler words (${prosody.fillerWordsFound.join(', ')}). Try pausing silently instead of using verbal crutches.`;
      }
    } else if (drill.type === 'STAR_PITCH') {
      const star = StarMethodEvaluator.evaluateAnswer(speech);
      if (star.totalScore >= 70) {
        passed = true;
        bonus = 15;
        feedbackMsg = `Executive delivery! Clear Action and measurable Result articulated in under 60 seconds (Score: ${star.totalScore}/100).`;
      } else {
        passed = false;
        feedbackMsg = star.feedback.join(' ') || 'Missing clear individual action and measurable business outcome.';
      }
    } else if (drill.type === 'SKEPTICAL_ARCHITECT' || drill.type === 'MISTAKE_CORRECTION') {
      const hasSeniorTerms =
        speech.toLowerCase().includes('trade-off') ||
        speech.toLowerCase().includes('stampede') ||
        speech.toLowerCase().includes('eviction') ||
        speech.toLowerCase().includes('latency') ||
        speech.toLowerCase().includes('scale');

      if (hasSeniorTerms && speech.length > 40) {
        passed = true;
        bonus = 12;
        feedbackMsg = 'Senior-level response verified! You articulated trade-offs and edge-case mitigations effectively.';
      } else {
        passed = false;
        feedbackMsg = 'Answer hit the mid-level ceiling. Remember to address cache stampede, distributed lock concurrency, and eviction policies.';
      }
    }

    if (passed) {
      setScoreAwarded(bonus);
      setDrillState('PASSED');

      // Update SQLite mistake ledger and skill score
      if (drill.mistake) {
        await sessionDb.current.markMistakeAsDrilled(drill.mistake.mistakeId, 90);
      }
      await skillDb.current.recordTurnScore(
        drill.mistake?.sessionId || 'drill_session',
        drill.targetSkillId.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        999,
        drill.prompt,
        speech,
        88,
        1.2
      );
    } else {
      setDrillState('FAILED');
    }

    setFeedback(feedbackMsg);
  };

  return {
    drillState,
    secondsRemaining,
    candidateTranscript,
    hapticCount,
    feedback,
    scoreAwarded,
    startDrill,
    finishDrill,
    onCandidateSpokeChunk,
  };
}
