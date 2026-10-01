import { InterviewSession, TurnEvaluation, MistakeDiagnostic, SpeechProsodyReport } from '../../types';

/**
 * Repository Contract for Interview Sessions and Turn Metrics
 * (Repository Pattern)
 */
export interface ISessionRepository {
  saveInterviewSession(session: InterviewSession): Promise<void>;
  getInterviewSession(sessionId: string): Promise<InterviewSession | null>;
  getRecentSessions(limit?: number): Promise<any[]>;
  saveTurnEvaluation(turn: TurnEvaluation): Promise<void>;
  saveMistakeDiagnostic(diagnostic: MistakeDiagnostic): Promise<void>;
  saveProsodyMetrics(sessionId: string, prosody: SpeechProsodyReport): Promise<void>;
  markMistakeAsDrilled(mistakeId: string, drilledScore: number): Promise<void>;
  getUncoachedMistakes(): Promise<MistakeDiagnostic[]>;
  getMistakesForSession(sessionId: string): Promise<MistakeDiagnostic[]>;
}
