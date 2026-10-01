import { CandidateSkill, MasteryLevel } from '../../types';

/**
 * Repository Contract for Bayesian EMA Skill Mastery and Evaluation Logs
 * (Repository Pattern)
 */
export interface ISkillRepository {
  seedSkillsFromResume(skills: string[]): Promise<void>;
  recordTurnScore(
    sessionId: string,
    skillId: string,
    turnIndex: number,
    question: string,
    answer: string,
    score: number,
    difficulty?: number
  ): Promise<{ newScore: number; masteryLevel: MasteryLevel }>;
  getAllSkills(): Promise<CandidateSkill[]>;
  getWeakestSkills(limit?: number): Promise<Array<{ skill_id: string; skill_name: string; current_score: number }>>;
}
