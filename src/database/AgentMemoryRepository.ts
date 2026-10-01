import { SQLiteClient } from './SQLiteClient';
import { IMemoryRepository, MemoryFactRecord } from './repositories';
import { MascotProfile } from '../core/agent/AgentCoachingHarness';

/**
 * SQLite Implementation of IMemoryRepository
 * Manages persistent storage for Mascot profiles, long-term user career memory, and voice identities
 */
export class AgentMemoryRepository implements IMemoryRepository {
  private client: SQLiteClient;

  constructor(client: SQLiteClient = SQLiteClient.getInstance()) {
    this.client = client;
  }

  async getMascotProfile(id: string = 'mascot_primary'): Promise<MascotProfile | null> {
    const res = await this.client.execute('SELECT * FROM mascot_profile WHERE id = ?;', [id]);
    if (!res.rows || res.rows.length === 0) return null;

    const row = res.rows[0];
    return {
      id: row.id,
      name: (!row.name || row.name === 'Nova') ? 'Teddy' : row.name,
      level: row.level || 1,
      xp: row.xp || 0,
      xpToNextLevel: (row.level || 1) * 100,
      personalityTier: row.personality_tier || 'Warm Friend & Coding Buddy',
      relationshipSummary: row.relationship_summary || 'A warm, supportive friendship learning together and reaching your career goals.',
      coachingStyle: row.coaching_style || 'Warm, Socratic & Conversational Growth',
      totalTurns: 0,
    };
  }

  async saveMascotProfile(profile: MascotProfile): Promise<void> {
    await this.client.execute(
      `INSERT OR REPLACE INTO mascot_profile (id, name, level, xp, personality_tier, relationship_summary, coaching_style, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        profile.id,
        profile.name,
        profile.level,
        profile.xp,
        profile.personalityTier,
        profile.relationshipSummary,
        profile.coachingStyle,
        Date.now(),
      ]
    );
  }

  async updateMascotProfile(profile: MascotProfile): Promise<void> {
    await this.client.execute(
      `UPDATE mascot_profile 
       SET level = ?, xp = ?, personality_tier = ?, coaching_style = ?, updated_at = ?
       WHERE id = ?;`,
      [
        profile.level,
        profile.xp,
        profile.personalityTier,
        profile.coachingStyle,
        Date.now(),
        profile.id,
      ]
    );
  }

  async saveMemoryFact(
    category: string,
    key: string,
    value: string,
    confidence: number = 1.0
  ): Promise<void> {
    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await this.client.execute(
      `INSERT OR REPLACE INTO agent_user_memory (memory_id, category, fact_key, fact_value, confidence, created_at, last_referenced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [id, category, key, value, confidence, Date.now(), Date.now()]
    );
  }

  async getAllMemoryFacts(): Promise<MemoryFactRecord[]> {
    const res = await this.client.execute('SELECT * FROM agent_user_memory ORDER BY created_at ASC;');
    if (!res.rows) return [];
    return res.rows.map((row: any) => ({
      memoryId: row.memory_id,
      category: row.category,
      factKey: row.fact_key,
      factValue: row.fact_value,
      confidence: row.confidence ?? 1.0,
      createdAt: row.created_at,
      lastReferencedAt: row.last_referenced_at,
    }));
  }

  async clearMemoryFacts(): Promise<void> {
    await this.client.execute('DELETE FROM agent_user_memory;');
  }
}
