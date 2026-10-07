import { QBLSession } from '../../types';

export interface QBLSessionTurnRecord {
  turnId: string;
  sessionId: string;
  subtopicId: string;
  conceptTitle?: string;
  questionText: string;
  optionsJson: string;
  userSelectedOptionId: string;
  isCorrect: boolean;
  feedbackText: string;
  createdAt: number;
}

export interface IQBLRepository {
  saveSession(session: QBLSession): Promise<void>;
  getSession(sessionId: string): Promise<QBLSession | null>;
  getLatestSession(): Promise<QBLSession | null>;
  getAllSessions(limit?: number): Promise<QBLSession[]>;
  saveTurn(turn: QBLSessionTurnRecord): Promise<void>;
  getTurnsForSession(sessionId: string): Promise<QBLSessionTurnRecord[]>;
  getMistakesForSession(sessionId: string): Promise<QBLSessionTurnRecord[]>;
}
