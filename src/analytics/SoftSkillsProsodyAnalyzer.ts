/**
 * Soft Skills Prosody Analyzer
 * Evaluates speech pacing (WPM), disfluency filler density (including Indian English verbal crutches),
 * turn-taking latency, and acoustic vocal delivery.
 */

import { SpeechProsodyReport } from '../types';

export class SoftSkillsProsodyAnalyzer {
  // Universal fillers + Indian English conversational crutches
  private static FILLER_REGEX =
    /\b(um|uh|like|you know|basically|actually|sort of|kind of|i mean|ya|na|means|correct\?)\b/gi;

  static analyzeTurnProsody(
    transcript: string,
    speechDurationSeconds: number,
    turnLatencyMs: number
  ): SpeechProsodyReport {
    const text = (transcript || '').trim();
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // 1. Calculate Words Per Minute (WPM)
    const duration = speechDurationSeconds > 0 ? speechDurationSeconds : 1;
    const wpm = wordCount > 0 ? Math.round((wordCount / duration) * 60) : 0;

    // 2. Detect Filler Words
    const matches = text.match(this.FILLER_REGEX) || [];
    const fillerCount = matches.length;
    const fillerDensityPercent = wordCount > 0
      ? Number(((fillerCount / wordCount) * 100).toFixed(1))
      : 0;

    // 3. Score Pacing (120 - 155 WPM is sweet spot for technical interviews)
    let pacingScore = 100;
    if (wpm > 0) {
      if (wpm < 100) {
        pacingScore -= (100 - wpm) * 0.8; // Hesitant penalty
      } else if (wpm > 165) {
        pacingScore -= (wpm - 165) * 0.7; // Rushing penalty
      }
    }

    // 4. Penalize Filler Density (Target: < 1.5%)
    if (fillerDensityPercent > 1.5) {
      pacingScore -= (fillerDensityPercent - 1.5) * 8;
    }

    // 5. Penalize excessive turn hesitation (> 4.5s)
    if (turnLatencyMs > 4500) {
      pacingScore -= (turnLatencyMs - 4500) / 200;
    }

    return {
      wpm,
      fillerCount,
      fillerDensityPercent,
      turnLatencyMs,
      fillerWordsFound: matches.map(m => m.toLowerCase()),
      vocalPacingScore: Math.min(100, Math.max(0, Math.round(pacingScore))),
    };
  }
}
