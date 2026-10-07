/**
 * QBL Storage Manager
 * Persists and retrieves Question-Driven Learning sessions, subtopics, and turns
 */

import { SQLiteClient } from './SQLiteClient';
import { QBLSession, QBLSubtopic } from '../types';
import { IQBLRepository, QBLSessionTurnRecord } from './repositories';

export class QBLStorageManager implements IQBLRepository {
  private client: SQLiteClient;

  constructor(client: SQLiteClient = SQLiteClient.getInstance()) {
    this.client = client;
  }

  async saveSession(session: QBLSession): Promise<void> {
    const subtopicsJson = JSON.stringify(session.subtopics);
    await this.client.execute(
      `INSERT OR REPLACE INTO qbl_skill_sessions
       (session_id, topic_name, subtopics_json, current_subtopic_index, total_subtopics, status, overall_mastery_percentage, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        session.sessionId,
        session.topicName,
        subtopicsJson,
        session.currentSubtopicIndex,
        session.totalSubtopics,
        session.status,
        session.overallMasteryPercentage,
        session.createdAt,
        session.updatedAt || Date.now(),
      ]
    );
  }

  async getSession(sessionId: string): Promise<QBLSession | null> {
    const res = await this.client.execute(
      `SELECT * FROM qbl_skill_sessions WHERE session_id = ?;`,
      [sessionId]
    );
    if (!res.rows || res.rows.length === 0) return null;
    return this.mapRowToSession(res.rows[0]);
  }

  async getLatestSession(): Promise<QBLSession | null> {
    const res = await this.client.execute(
      `SELECT * FROM qbl_skill_sessions ORDER BY updated_at DESC;`
    );
    if (!res.rows || res.rows.length === 0) return null;
    return this.mapRowToSession(res.rows[0]);
  }

  async getAllSessions(limit: number = 20): Promise<QBLSession[]> {
    const res = await this.client.execute(
      `SELECT * FROM qbl_skill_sessions ORDER BY updated_at DESC;`
    );
    if (!res.rows) return [];
    return res.rows.slice(0, limit).map((r) => this.mapRowToSession(r));
  }

  async saveTurn(turn: QBLSessionTurnRecord): Promise<void> {
    await this.client.execute(
      `INSERT OR REPLACE INTO qbl_session_turns
       (turn_id, session_id, subtopic_id, concept_title, question_text, options_json, user_selected_option_id, is_correct, feedback_text, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        turn.turnId,
        turn.sessionId,
        turn.subtopicId,
        turn.conceptTitle || '',
        turn.questionText,
        turn.optionsJson,
        turn.userSelectedOptionId,
        turn.isCorrect ? 1 : 0,
        turn.feedbackText,
        turn.createdAt || Date.now(),
      ]
    );
  }

  async getTurnsForSession(sessionId: string): Promise<QBLSessionTurnRecord[]> {
    const res = await this.client.execute(
      `SELECT * FROM qbl_session_turns WHERE session_id = ?;`,
      [sessionId]
    );
    if (!res.rows) return [];
    return res.rows.map((r) => ({
      turnId: r.turn_id,
      sessionId: r.session_id,
      subtopicId: r.subtopic_id,
      conceptTitle: r.concept_title,
      questionText: r.question_text,
      optionsJson: r.options_json,
      userSelectedOptionId: r.user_selected_option_id,
      isCorrect: Boolean(r.is_correct),
      feedbackText: r.feedback_text,
      createdAt: r.created_at,
    }));
  }

  async getMistakesForSession(sessionId: string): Promise<QBLSessionTurnRecord[]> {
    const res = await this.client.execute(
      `SELECT * FROM qbl_session_turns WHERE session_id = ? AND is_correct = 0 ORDER BY created_at ASC;`,
      [sessionId]
    );
    if (!res.rows) return [];
    return res.rows.map((r) => ({
      turnId: r.turn_id,
      sessionId: r.session_id,
      subtopicId: r.subtopic_id,
      conceptTitle: r.concept_title,
      questionText: r.question_text,
      optionsJson: r.options_json,
      userSelectedOptionId: r.user_selected_option_id,
      isCorrect: Boolean(r.is_correct),
      feedbackText: r.feedback_text,
      createdAt: r.created_at,
    }));
  }

  private mapRowToSession(row: any): QBLSession {
    let subtopics: QBLSubtopic[];
    try {
      subtopics = typeof row.subtopics_json === 'string'
        ? JSON.parse(row.subtopics_json)
        : (row.subtopics_json || []);
    } catch {
      subtopics = [];
    }


    return {
      sessionId: row.session_id,
      topicName: row.topic_name,
      subtopics,
      currentSubtopicIndex: row.current_subtopic_index ?? 0,
      totalSubtopics: row.total_subtopics ?? subtopics.length,
      status: row.status ?? 'IN_PROGRESS',
      overallMasteryPercentage: row.overall_mastery_percentage ?? 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
