/**
 * Session Storage Manager
 * Handles persisting interview sessions, turn evaluations, prosody acoustic metrics, and mistake autopsies
 */

import { SQLiteClient } from './SQLiteClient';
import { InterviewSession, MistakeDiagnostic, SpeechProsodyReport, TurnEvaluation } from '../types';

export class SessionStorageManager {
  private client: SQLiteClient;

  constructor(client: SQLiteClient = SQLiteClient.getInstance()) {
    this.client = client;
  }

  async saveInterviewSession(session: InterviewSession): Promise<void> {
    await this.client.execute(
      `INSERT OR REPLACE INTO interview_sessions 
       (session_id, target_role, started_at, completed_at, duration_seconds, overall_score, audio_path, summary_feedback)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        session.sessionId,
        session.targetRole,
        session.startedAt,
        session.completedAt || Date.now(),
        session.durationSeconds || 0,
        session.overallScore || 0,
        session.audioPath || '',
        session.summaryFeedback || '',
      ]
    );

    for (const turn of session.turns) {
      await this.saveTurnEvaluation(turn);
    }
  }

  async saveTurnEvaluation(turn: TurnEvaluation): Promise<void> {
    await this.client.execute(
      `INSERT OR REPLACE INTO session_turn_evaluations 
       (turn_id, session_id, skill_id, turn_index, interviewer_question, candidate_answer, turn_score, question_difficulty, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        turn.turnId,
        turn.sessionId,
        turn.skillId,
        turn.turnIndex,
        turn.interviewerQuestion,
        turn.candidateAnswer,
        turn.turnScore,
        turn.questionDifficulty,
        turn.timestamp,
      ]
    );

    if (turn.mistake) {
      await this.saveMistakeDiagnostic(turn.mistake);
    }
  }

  async saveMistakeDiagnostic(mistake: MistakeDiagnostic): Promise<void> {
    await this.client.execute(
      `INSERT OR REPLACE INTO mistake_diagnostics 
       (mistake_id, session_id, skill_id, turn_index, candidate_quote, mistake_category, critique, missing_concept, golden_response, coaching_rule, is_drilled, drilled_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        mistake.mistakeId,
        mistake.sessionId,
        mistake.skillId,
        mistake.turnIndex,
        mistake.candidateQuote,
        mistake.mistakeCategory,
        mistake.critique,
        mistake.missingSeniorConcepts.join('; '),
        mistake.goldenResponse,
        mistake.coachingMentalModel,
        mistake.isDrilled ? 1 : 0,
        mistake.drilledScore,
      ]
    );
  }

  async saveProsodyMetrics(sessionId: string, prosody: SpeechProsodyReport): Promise<void> {
    await this.client.execute(
      `INSERT INTO session_prosody_metrics 
       (session_id, average_wpm, total_filler_words, filler_density_per_100_words, turn_latency_avg_ms, monotone_energy_variance)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        sessionId,
        prosody.wpm,
        prosody.fillerCount,
        prosody.fillerDensityPercent,
        prosody.turnLatencyMs,
        0.85, // energy variance
      ]
    );
  }

  async markMistakeAsDrilled(mistakeId: string, drilledScore: number): Promise<void> {
    await this.client.execute(
      `UPDATE mistake_diagnostics 
       SET is_drilled = 1, drilled_score = ? 
       WHERE mistake_id = ?;`,
      [drilledScore, mistakeId]
    );
  }

  async getInterviewSession(sessionId: string): Promise<InterviewSession | null> {
    const res = await this.client.execute(
      `SELECT session_id, target_role, started_at, completed_at, duration_seconds, overall_score, audio_path, summary_feedback 
       FROM interview_sessions WHERE session_id = ?;`,
      [sessionId]
    );
    if (!res.rows || res.rows.length === 0) return null;

    const row = res.rows[0];
    const turnsRes = await this.client.execute(
      `SELECT turn_id, session_id, skill_id, turn_index, interviewer_question, candidate_answer, turn_score, question_difficulty, timestamp 
       FROM session_turn_evaluations WHERE session_id = ? ORDER BY turn_index ASC;`,
      [sessionId]
    );

    return {
      sessionId: row.session_id,
      targetRole: row.target_role,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      durationSeconds: row.duration_seconds,
      overallScore: row.overall_score,
      audioPath: row.audio_path,
      summaryFeedback: row.summary_feedback,
      turns: (turnsRes.rows ?? []).map((t: any) => ({
        turnId: t.turn_id,
        sessionId: t.session_id,
        skillId: t.skill_id,
        turnIndex: t.turn_index,
        interviewerQuestion: t.interviewer_question,
        candidateAnswer: t.candidate_answer,
        turnScore: t.turn_score,
        questionDifficulty: t.question_difficulty,
        timestamp: t.timestamp,
        prosody: {
          wpm: 135,
          fillerCount: 0,
          fillerDensityPercent: 0,
          turnLatencyMs: 900,
          fillerWordsFound: [],
          vocalPacingScore: 92,
        },
      })),
    };
  }

  async getRecentSessions(limit: number = 5): Promise<any[]> {
    const res = await this.client.execute(
      `SELECT session_id, target_role, started_at, completed_at, duration_seconds, overall_score 
       FROM interview_sessions ORDER BY started_at DESC LIMIT ?;`,
      [limit]
    );
    return res.rows ?? [];
  }

  async getUncoachedMistakes(): Promise<MistakeDiagnostic[]> {
    const res = await this.client.execute(
      `SELECT mistake_id, session_id, skill_id, turn_index, candidate_quote, mistake_category, critique, missing_concept, golden_response, coaching_rule, is_drilled, drilled_score 
       FROM mistake_diagnostics 
       WHERE is_drilled = 0 
       ORDER BY turn_index ASC LIMIT 5;`
    );

    return (res.rows ?? []).map((r: any) => ({
      mistakeId: r.mistake_id,
      sessionId: r.session_id,
      skillId: r.skill_id,
      turnIndex: r.turn_index,
      candidateQuote: r.candidate_quote,
      mistakeCategory: r.mistake_category,
      critique: r.critique,
      missingSeniorConcepts: (r.missing_concept || '').split('; '),
      goldenResponse: r.golden_response,
      coachingMentalModel: r.coaching_rule,
      isDrilled: r.is_drilled === 1,
      drilledScore: r.drilled_score || 0,
    }));
  }

  async getMistakesForSession(sessionId: string): Promise<MistakeDiagnostic[]> {
    const res = await this.client.execute(
      `SELECT mistake_id, session_id, skill_id, turn_index, candidate_quote, mistake_category, critique, missing_concept, golden_response, coaching_rule, is_drilled, drilled_score 
       FROM mistake_diagnostics 
       WHERE session_id = ? 
       ORDER BY turn_index ASC;`,
      [sessionId]
    );

    return (res.rows ?? []).map((r: any) => ({
      mistakeId: r.mistake_id,
      sessionId: r.session_id,
      skillId: r.skill_id,
      turnIndex: r.turn_index,
      candidateQuote: r.candidate_quote,
      mistakeCategory: r.mistake_category,
      critique: r.critique,
      missingSeniorConcepts: (r.missing_concept || '').split('; '),
      goldenResponse: r.golden_response,
      coachingMentalModel: r.coaching_rule,
      isDrilled: r.is_drilled === 1,
      drilledScore: r.drilled_score || 0,
    }));
  }
}
