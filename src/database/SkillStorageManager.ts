/**
 * Skill Storage Manager
 * Implements Bayesian EMA skill mastery calculations, 5 mastery tiers, and spaced repetition queries
 */

import { SQLiteClient } from './SQLiteClient';
import { CandidateSkill, MasteryLevel } from '../types';
import { ISkillRepository } from './repositories';

export class SkillStorageManager implements ISkillRepository {
  private client: SQLiteClient;

  constructor(client: SQLiteClient = SQLiteClient.getInstance()) {
    this.client = client;
  }

  static calculateBayesianEma(
    priorScore: number,
    turnScore: number,
    difficulty: number = 1.0,
    learningRate: number = 0.30
  ): { newScore: number; level: MasteryLevel; delta: number } {
    const clampedPrior = Math.min(100, Math.max(0, priorScore));
    const clampedTurn = Math.min(100, Math.max(0, turnScore));
    const clampedDifficulty = Math.min(1.5, Math.max(0.7, difficulty));

    // Bayesian EMA Formula: ΔS = η * (TurnScore - Sprior) * Dquestion
    const delta = learningRate * (clampedTurn - clampedPrior) * clampedDifficulty;
    const newScore = Math.round(Math.min(100, Math.max(0, clampedPrior + delta)) * 10) / 10;

    let level: MasteryLevel = 'NOVICE';
    if (newScore >= 90) level = 'STAFF';
    else if (newScore >= 80) level = 'SENIOR';
    else if (newScore >= 60) level = 'PROFICIENT';
    else if (newScore >= 40) level = 'DEVELOPING';

    return { newScore, level, delta };
  }

  async seedSkillsFromResume(skills: string[]): Promise<void> {
    const timestamp = Date.now();
    for (const skill of skills) {
      const skillId = skill.toLowerCase().replace(/[^a-z0-9]/g, '_');
      await this.client.execute(
        `INSERT OR IGNORE INTO candidate_skills 
         (skill_id, skill_name, category, current_score, mastery_level, total_questions_asked, last_tested_at)
         VALUES (?, ?, 'framework', 50.0, 'DEVELOPING', 0, ?);`,
        [skillId, skill, timestamp]
      );
    }
  }

  async recordTurnScore(
    sessionId: string,
    skillId: string,
    _turnIndex: number,
    _question: string,
    _answer: string,
    score: number,
    difficulty: number = 1.0
  ): Promise<{ newScore: number; masteryLevel: MasteryLevel }> {
    // 1. Fetch current score
    const res = await this.client.execute(
      `SELECT current_score, total_questions_asked FROM candidate_skills WHERE skill_id = ?;`,
      [skillId]
    );

    const currentScore = res.rows?.[0]?.current_score ?? 50.0;
    const totalAsked = (res.rows?.[0]?.total_questions_asked ?? 0) + 1;

    // 2. Compute Bayesian EMA
    const { newScore, level } = SkillStorageManager.calculateBayesianEma(currentScore, score, difficulty);

    // 3. Update candidate_skills
    await this.client.execute(
      `UPDATE candidate_skills 
       SET current_score = ?, mastery_level = ?, total_questions_asked = ?, last_tested_at = ? 
       WHERE skill_id = ?;`,
      [newScore, level, totalAsked, Date.now(), skillId]
    );

    // 4. Record history for radar chart & timeline graphs
    await this.client.execute(
      `INSERT INTO skill_score_history (skill_id, session_id, score_before, score_after, recorded_at)
       VALUES (?, ?, ?, ?, ?);`,
      [skillId, sessionId, currentScore, newScore, Date.now()]
    );

    return { newScore, masteryLevel: level };
  }

  async getAllSkills(): Promise<CandidateSkill[]> {
    const res = await this.client.execute(
      `SELECT skill_id, skill_name, category, current_score, mastery_level, total_questions_asked, last_tested_at 
       FROM candidate_skills ORDER BY current_score DESC;`
    );
    return res.rows ?? [];
  }

  async getWeakestSkills(limit: number = 3): Promise<Array<{ skill_id: string; skill_name: string; current_score: number }>> {
    const res = await this.client.execute(
      `SELECT skill_id, skill_name, current_score 
       FROM candidate_skills 
       ORDER BY current_score ASC LIMIT ?;`,
      [limit]
    );
    return res.rows ?? [];
  }
}
