/**
 * Agent Coaching Harness & Mascot Personality Engine
 * 
 * Implements:
 * 1. Persistent Long-Term User Career Memory (Goals, Roles, Strengths, Learning Targets)
 * 2. Mascot Personality Progression (XP, Tiers, Relationship Leveling)
 * 3. Autonomous Hands-Free Coaching Curriculum (Discovery, Skill Sharpening, New Skill Teaching)
 * 4. Zero-Cloud-Egress Offline Storage via SQLite
 */

import { SQLiteClient } from '../../database/SQLiteClient';

export interface MascotProfile {
  id: string;
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  personalityTier: string;
  relationshipSummary: string;
  coachingStyle: string;
  totalTurns: number;
}

export interface UserCareerMemory {
  candidateName: string;
  currentRole: string;
  targetRole: string;
  targetCompany: string;
  careerAmbition: string;
  strengths: string[];
  skillsToSharpen: string[];
  newSkillsToLearn: string[];
  recentTopics: string[];
}

export interface TurnCoachingOutcome {
  responseClause: string;
  mascotReaction: 'speaking' | 'listening' | 'thinking' | 'celebrating';
  xpGained: number;
  didLevelUp: boolean;
  newTier?: string;
  newLevel?: number;
  extractedFacts: Array<{ category: string; key: string; value: string }>;
}

export class AgentCoachingHarness {
  private db: SQLiteClient;
  private mascot: MascotProfile;
  private memory: UserCareerMemory;
  private isInitialized = false;

  constructor() {
    this.db = SQLiteClient.getInstance();
    this.mascot = {
      id: 'mascot_primary',
      name: 'Nova',
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      personalityTier: 'Curious Explorer',
      relationshipSummary: 'Getting to know your technical background and career goals.',
      coachingStyle: 'Socratic & Encouraging',
      totalTurns: 0,
    };
    this.memory = {
      candidateName: 'Candidate',
      currentRole: 'Software Engineer',
      targetRole: 'Staff Software Architect',
      targetCompany: 'Tier-1 Tech',
      careerAmbition: 'Advance career through technical mastery and system design excellence.',
      strengths: ['React Native', 'TypeScript'],
      skillsToSharpen: ['System Design', 'Concurrency'],
      newSkillsToLearn: ['Distributed Consensus', 'Kafka Partitioning'],
      recentTopics: [],
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    await this.db.initialize();

    try {
      // 1. Load or seed Mascot state
      const mascotRes = await this.db.execute('SELECT * FROM mascot_profile WHERE id = ?', ['mascot_primary']);
      if (mascotRes.rows && mascotRes.rows.length > 0) {
        const row = mascotRes.rows[0];
        this.mascot.name = row.name || 'Nova';
        this.mascot.level = row.level || 1;
        this.mascot.xp = row.xp || 0;
        this.mascot.xpToNextLevel = (row.level || 1) * 100;
        this.mascot.personalityTier = row.personality_tier || this.getTierForLevel(this.mascot.level);
        this.mascot.relationshipSummary = row.relationship_summary || this.mascot.relationshipSummary;
        this.mascot.coachingStyle = row.coaching_style || this.mascot.coachingStyle;
      } else {
        await this.db.execute(
          `INSERT INTO mascot_profile (id, name, level, xp, personality_tier, relationship_summary, coaching_style, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'mascot_primary',
            this.mascot.name,
            this.mascot.level,
            this.mascot.xp,
            this.mascot.personalityTier,
            this.mascot.relationshipSummary,
            this.mascot.coachingStyle,
            Date.now(),
          ]
        );
      }

      // 2. Load stored user facts
      const factsRes = await this.db.execute('SELECT * FROM agent_user_memory ORDER BY created_at ASC');
      if (factsRes.rows && factsRes.rows.length > 0) {
        for (const row of factsRes.rows) {
          this.applyMemoryFact(row.category, row.fact_key, row.fact_value);
        }
      }
    } catch (err) {
      console.warn('[AgentCoachingHarness] Error loading state from SQLite:', err);
    }

    this.isInitialized = true;
  }

  getMascotProfile(): MascotProfile {
    return { ...this.mascot };
  }

  getUserMemory(): UserCareerMemory {
    return { ...this.memory };
  }

  getTierForLevel(level: number): string {
    if (level >= 5) return 'Distinguished Fellow Companion';
    if (level === 4) return 'Staff Engineering Partner';
    if (level === 3) return 'Technical Strategist';
    if (level === 2) return 'Dedicated Coach';
    return 'Curious Explorer';
  }

  private applyMemoryFact(category: string, key: string, value: string): void {
    if (category === 'career_goal' || key === 'target_role') {
      this.memory.targetRole = value;
    } else if (category === 'current_role' || key === 'current_role') {
      this.memory.currentRole = value;
    } else if (category === 'candidate_name' || key === 'name') {
      this.memory.candidateName = value;
    } else if (category === 'target_company' || key === 'target_company') {
      this.memory.targetCompany = value;
    } else if (category === 'strength') {
      if (!this.memory.strengths.includes(value)) {
        this.memory.strengths.push(value);
      }
    } else if (category === 'skill_to_sharpen') {
      if (!this.memory.skillsToSharpen.includes(value)) {
        this.memory.skillsToSharpen.push(value);
      }
    } else if (category === 'new_skill_to_learn') {
      if (!this.memory.newSkillsToLearn.includes(value)) {
        this.memory.newSkillsToLearn.push(value);
      }
    }
  }

  async recordMemoryFact(category: string, key: string, value: string): Promise<void> {
    this.applyMemoryFact(category, key, value);
    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    try {
      await this.db.execute(
        `INSERT OR REPLACE INTO agent_user_memory (memory_id, category, fact_key, fact_value, confidence, created_at, last_referenced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, category, key, value, 1.0, Date.now(), Date.now()]
      );
    } catch (err) {
      console.warn('[AgentCoachingHarness] Error saving memory fact:', err);
    }
  }

  /**
   * Evaluates user input, extracts knowledge, grants XP, and advances Mascot personality
   */
  async processUserSpeechTurn(
    userText: string,
    turnIndex: number
  ): Promise<TurnCoachingOutcome> {
    const textLower = userText.toLowerCase();
    const extractedFacts: Array<{ category: string; key: string; value: string }> = [];
    let xpEarned = 25; // Base XP for answering

    this.mascot.totalTurns += 1;

    // 1. Entity & Career Goal Extraction
    if (textLower.includes('staff') || textLower.includes('principal') || textLower.includes('architect') || textLower.includes('lead')) {
      const match = userText.match(/(staff|principal|lead|architect)[^.,!]+/i);
      const roleStr = match ? match[0].trim() : 'Staff Software Architect';
      await this.recordMemoryFact('career_goal', 'target_role', roleStr);
      extractedFacts.push({ category: 'career_goal', key: 'target_role', value: roleStr });
      xpEarned += 30;
    }

    if (textLower.includes('working at') || textLower.includes('currently at') || textLower.includes('engineer at') || textLower.includes('company')) {
      const match = userText.match(/(?:at|company)\s+([A-Za-z0-9_]+)/i);
      if (match && match[1]) {
        await this.recordMemoryFact('current_company', 'company', match[1]);
        extractedFacts.push({ category: 'current_company', key: 'company', value: match[1] });
      }
    }

    if (textLower.includes('want to learn') || textLower.includes('don\'t know') || textLower.includes('teach me') || textLower.includes('how does')) {
      const match = userText.match(/(?:learn|about|how does)\s+([A-Za-z0-9_ -]+)/i);
      const skill = match ? match[1].slice(0, 30).trim() : 'Distributed Systems';
      await this.recordMemoryFact('new_skill_to_learn', 'skill', skill);
      extractedFacts.push({ category: 'new_skill_to_learn', key: 'skill', value: skill });
      xpEarned += 35;
    }

    // Technical concept detection (identifying user strengths)
    const techKeywords = ['kafka', 'redis', 'react native', 'jsi', 'concurrency', 'sharding', 'postgres', 'microservices', 'graphql', 'raft', 'cache stampede'];
    for (const kw of techKeywords) {
      if (textLower.includes(kw) && !this.memory.strengths.includes(kw)) {
        await this.recordMemoryFact('strength', 'tech_concept', kw);
        extractedFacts.push({ category: 'strength', key: 'tech_concept', value: kw });
        xpEarned += 15;
      }
    }

    // 2. XP & Personality Level Up Engine
    this.mascot.xp += xpEarned;
    let didLevelUp = false;
    let newTier: string | undefined;

    if (this.mascot.xp >= this.mascot.xpToNextLevel) {
      this.mascot.level += 1;
      this.mascot.xpToNextLevel = this.mascot.level * 100;
      this.mascot.personalityTier = this.getTierForLevel(this.mascot.level);
      didLevelUp = true;
      newTier = this.mascot.personalityTier;

      // Update coaching style based on level
      if (this.mascot.level === 2) {
        this.mascot.coachingStyle = 'Deep Diagnostic & Feedback';
      } else if (this.mascot.level === 3) {
        this.mascot.coachingStyle = 'Architectural Socratic Rigor';
      } else if (this.mascot.level >= 4) {
        this.mascot.coachingStyle = 'Staff Leadership & Impact Strategy';
      }

      await this.persistMascotState();
    }

    // 3. Generate Next Coaching Action Response
    const responseClause = this.craftCoachingResponse(userText, turnIndex, didLevelUp);

    return {
      responseClause,
      mascotReaction: didLevelUp ? 'celebrating' : 'speaking',
      xpGained: xpEarned,
      didLevelUp,
      newTier,
      newLevel: this.mascot.level,
      extractedFacts,
    };
  }

  private craftCoachingResponse(
    userText: string,
    turnIndex: number,
    didLevelUp: boolean
  ): string {
    const textLower = userText.toLowerCase();

    // Level up special celebratory opener
    if (didLevelUp) {
      return `Level up! I've upgraded to Level ${this.mascot.level} (${this.mascot.personalityTier}). As our partnership grows, I'm deepening our drills to match your career goals. Let's tackle your next challenge: how do you ensure zero data loss during high-volume node failovers in your target architecture?`;
    }

    // Turn 1: Onboarding & Discovery
    if (turnIndex === 0 || textLower.includes('hello') || textLower.includes('hi ') || textLower.includes('start')) {
      return `Hello! I'm Nova, your personal AI career coach. My goal is to learn about you, sharpen your technical depth, and help you reach your next career milestone. What role or level are you aiming for next, and what are you working on right now?`;
    }

    // Responding to career goal / ambition
    if (textLower.includes('staff') || textLower.includes('architect') || textLower.includes('lead') || textLower.includes('senior')) {
      return `That is a high-impact career goal. Stepping into that level requires moving from writing code to defending systemic trade-offs under scale. In your current projects, how did you handle data consistency and caching when traffic spiked unexpectedly?`;
    }

    // Responding to learning requests / gaps
    if (textLower.includes('teach me') || textLower.includes('don\'t know') || textLower.includes('what is') || textLower.includes('explain')) {
      return `Let's break that down simply. Think of cache stampede protection like a single VIP door pass: when a key expires, only one worker regenerates it while others read from stale memory. How would you implement that distributed lock in production?`;
    }

    // Technical drill responses tailored to personality tier
    if (this.mascot.level >= 3) {
      // High-level Architectural Rigor
      if (textLower.includes('redis') || textLower.includes('cache')) {
        return `Interesting trade-off. But what happens if the Redis primary crashes before replication completes, causing cache desynchronization with your database? How would you design for that failure mode?`;
      }
      if (textLower.includes('react native') || textLower.includes('mobile') || textLower.includes('app')) {
        return `Great point. As a Staff mobile architect, how do you prevent bridge serialization bottlenecks and ensure UI thread fluency when receiving continuous real-time socket streams?`;
      }
      return `Good reasoning. Now let's explore the operational cost: what specific latency metrics and telemetry would you monitor to prove that design succeeded in production?`;
    }

    // Level 1-2: Constructive & Probing Coach
    if (textLower.includes('redis') || textLower.includes('cache')) {
      return `That's a solid start regarding caching. Could you explain how you prevented cache stampedes and dog-piling when keys expired during peak sales traffic?`;
    }

    if (textLower.includes('concurrency') || textLower.includes('thread') || textLower.includes('lock')) {
      return `Concurrency hazards are critical in senior interviews. What strategy did you use to prevent deadlocks and thread starvation in that pipeline?`;
    }

    return `Understood. When deploying those services at scale, how did you manage distributed transactions and eventual consistency across multiple services?`;
  }

  async persistMascotState(): Promise<void> {
    try {
      await this.db.execute(
        `UPDATE mascot_profile 
         SET level = ?, xp = ?, personality_tier = ?, coaching_style = ?, updated_at = ?
         WHERE id = ?`,
        [
          this.mascot.level,
          this.mascot.xp,
          this.mascot.personalityTier,
          this.mascot.coachingStyle,
          Date.now(),
          'mascot_primary',
        ]
      );
    } catch (err) {
      console.warn('[AgentCoachingHarness] Error updating mascot profile:', err);
    }
  }
}
