/**
 * Agent Coaching Harness & Mascot Personality Engine
 * 
 * Implements:
 * 1. Persistent Long-Term User Career Memory (Goals, Roles, Strengths, Validated Skills, Learning Targets)
 * 2. Mascot Personality Progression (XP, Tiers, Relationship Leveling)
 * 3. Autonomous Hands-Free Coaching Curriculum:
 *    - DISCOVERY: Learn about the user, their engineering depth, and next target role
 *    - SKILL VALIDATION: Pressure-test claimed strengths with real-world scenarios for the next role
 *    - SKILL IMPROVEMENT: Break the L4 ceiling and elevate answers to Staff/Leadership depth
 *    - SKILL LEARNING: Teach brand new concepts from first principles with actionable metaphors
 * 4. Integration with OfflineLLMEngine & buildAgentCoachingSystemPrompt
 * 5. Zero-Cloud-Egress Offline Storage via SQLite
 */

import { SQLiteClient } from '../../database/SQLiteClient';
import { buildAgentCoachingSystemPrompt, CoachingPhase } from '../llm/SystemPrompts';
import { OfflineLLMEngine } from '../llm/OfflineLLMEngine';

export type { CoachingPhase };

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
  validatedSkills: string[];
  currentPhase: CoachingPhase;
}

export interface TurnCoachingOutcome {
  responseClause: string;
  mascotReaction: 'speaking' | 'listening' | 'thinking' | 'celebrating';
  xpGained: number;
  didLevelUp: boolean;
  newTier?: string;
  newLevel?: number;
  extractedFacts: Array<{ category: string; key: string; value: string }>;
  currentPhase: CoachingPhase;
}

export class AgentCoachingHarness {
  private db: SQLiteClient;
  private mascot: MascotProfile;
  private memory: UserCareerMemory;
  private isInitialized = false;
  private llmEngine: OfflineLLMEngine | null = null;
  private conversationHistory: Array<{ role: string; content: string }> = [];

  constructor(llmEngine?: OfflineLLMEngine) {
    this.db = SQLiteClient.getInstance();
    this.llmEngine = llmEngine || null;
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
      careerAmbition: 'Advance career through technical mastery, leadership, and system design excellence.',
      strengths: ['React Native', 'TypeScript'],
      skillsToSharpen: ['System Design', 'Concurrency'],
      newSkillsToLearn: ['Distributed Consensus', 'Kafka Partitioning'],
      recentTopics: [],
      validatedSkills: [],
      currentPhase: 'DISCOVERY',
    };
  }

  setLLMEngine(engine: OfflineLLMEngine): void {
    this.llmEngine = engine;
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
    } else if (category === 'career_ambition' || key === 'career_ambition') {
      this.memory.careerAmbition = value;
    } else if (category === 'current_phase') {
      if (['DISCOVERY', 'VALIDATION', 'IMPROVEMENT', 'LEARNING'].includes(value)) {
        this.memory.currentPhase = value as CoachingPhase;
      }
    } else if (category === 'validated_skill') {
      if (!this.memory.validatedSkills.includes(value)) {
        this.memory.validatedSkills.push(value);
      }
      if (!this.memory.strengths.includes(value)) {
        this.memory.strengths.push(value);
      }
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
   * Evaluates user input, extracts knowledge, advances phase, grants XP, and generates smart coaching action
   */
  async processUserSpeechTurn(
    userText: string,
    turnIndex: number
  ): Promise<TurnCoachingOutcome> {
    const textLower = userText.toLowerCase();
    const extractedFacts: Array<{ category: string; key: string; value: string }> = [];
    let xpEarned = 25; // Base XP for engaging

    this.mascot.totalTurns += 1;

    // 1. Determine Dynamic Coaching Phase
    let determinedPhase: CoachingPhase = this.memory.currentPhase;

    if (turnIndex === 0 || !this.memory.targetRole || this.memory.targetRole === 'Software Engineer') {
      determinedPhase = 'DISCOVERY';
    } else if (
      textLower.includes('want to learn') ||
      textLower.includes('don\'t know') ||
      textLower.includes('dont know') ||
      textLower.includes('teach me') ||
      textLower.includes('what is') ||
      textLower.includes('how does') ||
      textLower.includes('explain') ||
      textLower.includes('never used')
    ) {
      determinedPhase = 'LEARNING';
    } else if (turnIndex === 1) {
      determinedPhase = 'VALIDATION';
    } else if (turnIndex === 2) {
      determinedPhase = 'IMPROVEMENT';
    } else {
      const phaseCycle: CoachingPhase[] = ['VALIDATION', 'IMPROVEMENT', 'LEARNING'];
      determinedPhase = phaseCycle[(turnIndex - 1) % phaseCycle.length];
    }

    this.memory.currentPhase = determinedPhase;
    await this.recordMemoryFact('system_state', 'current_phase', determinedPhase);

    // 2. Entity & Career Goal Extraction (DISCOVERY Pillar)
    if (
      textLower.includes('cto') ||
      textLower.includes('city') || // STT common phonetic transcript of "CTO"
      textLower.includes('director') ||
      textLower.includes('vp') ||
      textLower.includes('head of') ||
      textLower.includes('leadership')
    ) {
      const roleStr = textLower.includes('director') ? 'Engineering Director' : 'Chief Technology Officer (CTO)';
      await this.recordMemoryFact('career_goal', 'target_role', roleStr);
      extractedFacts.push({ category: 'career_goal', key: 'target_role', value: roleStr });
      xpEarned += 35;
    } else if (textLower.includes('staff') || textLower.includes('principal') || textLower.includes('architect') || textLower.includes('lead')) {
      const match = userText.match(/(staff|principal|lead|architect)[^.,!]+/i);
      let roleStr = match ? match[0].replace(/\b(next|role|level|position|soon|please|in|at)\b/gi, '').trim() : 'Staff Software Architect';
      if (!roleStr) roleStr = 'Staff Software Architect';
      await this.recordMemoryFact('career_goal', 'target_role', roleStr);
      extractedFacts.push({ category: 'career_goal', key: 'target_role', value: roleStr });
      xpEarned += 30;
    } else if (textLower.includes('manager') || textLower.includes('em ')) {
      await this.recordMemoryFact('career_goal', 'target_role', 'Engineering Manager');
      extractedFacts.push({ category: 'career_goal', key: 'target_role', value: 'Engineering Manager' });
      xpEarned += 30;
    }

    if (textLower.includes('working at') || textLower.includes('currently at') || textLower.includes('engineer at') || textLower.includes('company')) {
      const match = userText.match(/(?:at|company)\s+([A-Za-z0-9_]+)/i);
      if (match && match[1]) {
        await this.recordMemoryFact('current_company', 'company', match[1]);
        extractedFacts.push({ category: 'current_company', key: 'company', value: match[1] });
      }
    }

    // 3. Skill Learning Extraction (LEARNING Pillar)
    if (
      textLower.includes('want to learn') ||
      textLower.includes('don\'t know') ||
      textLower.includes('teach me') ||
      textLower.includes('how does') ||
      textLower.includes('what is')
    ) {
      const match = userText.match(/(?:learn|about|how does|what is|teach me)\s+([A-Za-z0-9_ -]+)/i);
      const skill = match ? match[1].slice(0, 30).trim() : 'Distributed Systems';
      await this.recordMemoryFact('new_skill_to_learn', 'skill', skill);
      extractedFacts.push({ category: 'new_skill_to_learn', key: 'skill', value: skill });
      xpEarned += 35;
    }

    // 4. Technical Concepts, Strengths & Skill Validation (VALIDATION Pillar)
    const techKeywords = [
      'kafka', 'redis', 'react native', 'jsi', 'concurrency',
      'sharding', 'postgres', 'microservices', 'graphql', 'raft',
      'cache stampede', 'sqlite', 'docker', 'kubernetes', 'grpc'
    ];
    for (const kw of techKeywords) {
      if (textLower.includes(kw)) {
        if (!this.memory.strengths.includes(kw)) {
          await this.recordMemoryFact('strength', 'tech_concept', kw);
          extractedFacts.push({ category: 'strength', key: 'tech_concept', value: kw });
          xpEarned += 15;
        }

        // Validate skill when candidate explains how they used it
        if (
          (determinedPhase === 'VALIDATION' || textLower.includes('used') || textLower.includes('implemented')) &&
          !this.memory.validatedSkills.includes(kw)
        ) {
          await this.recordMemoryFact('validated_skill', 'skill', kw);
          extractedFacts.push({ category: 'validated_skill', key: 'skill', value: kw });
          xpEarned += 25;
        }
      }
    }

    // 5. XP & Personality Level Up Progression
    this.mascot.xp += xpEarned;
    let didLevelUp = false;
    let newTier: string | undefined;

    if (this.mascot.xp >= this.mascot.xpToNextLevel) {
      this.mascot.level += 1;
      this.mascot.xpToNextLevel = this.mascot.level * 250;
      this.mascot.personalityTier = this.getTierForLevel(this.mascot.level);
      didLevelUp = true;
      newTier = this.mascot.personalityTier;

      if (this.mascot.level === 2) {
        this.mascot.coachingStyle = 'Deep Diagnostic & Feedback';
      } else if (this.mascot.level === 3) {
        this.mascot.coachingStyle = 'Architectural Socratic Rigor';
      } else if (this.mascot.level >= 4) {
        this.mascot.coachingStyle = 'Staff Leadership & Impact Strategy';
      }

      await this.persistMascotState();
    }

    // 6. Generate Smart Coaching Action Response
    const responseClause = await this.generateCoachingResponse(
      userText,
      turnIndex,
      didLevelUp,
      determinedPhase
    );

    return {
      responseClause,
      mascotReaction: didLevelUp ? 'celebrating' : 'speaking',
      xpGained: xpEarned,
      didLevelUp,
      newTier,
      newLevel: this.mascot.level,
      extractedFacts,
      currentPhase: determinedPhase,
    };
  }

  /**
   * Generates intelligent, role-advancing coaching dialogue:
   * Uses MiniCPM5-2B via OfflineLLMEngine when active,
   * with high-fidelity pedagogical fallbacks across all 3 coaching pillars.
   */
  private async generateCoachingResponse(
    userText: string,
    turnIndex: number,
    didLevelUp: boolean,
    phase: CoachingPhase
  ): Promise<string> {
    // 1. If LLM engine is loaded and operational, use system prompt to query MiniCPM5-2B
    if (this.llmEngine) {
      try {
        const systemPrompt = buildAgentCoachingSystemPrompt({
          mascotName: this.mascot.name,
          mascotLevel: this.mascot.level,
          personalityTier: this.mascot.personalityTier,
          coachingStyle: this.mascot.coachingStyle,
          candidateName: this.memory.candidateName,
          currentRole: this.memory.currentRole,
          targetRole: this.memory.targetRole,
          targetCompany: this.memory.targetCompany,
          strengths: this.memory.strengths,
          skillsToSharpen: this.memory.skillsToSharpen,
          newSkillsToLearn: this.memory.newSkillsToLearn,
          validatedSkills: this.memory.validatedSkills,
          currentPhase: phase,
          turnIndex,
          recentTopics: this.memory.recentTopics,
        });

        this.conversationHistory.push({ role: 'user', content: userText });
        const messagesToSend = [
          { role: 'system', content: systemPrompt },
          ...this.conversationHistory.slice(-6),
        ];

        let generated = '';
        await this.llmEngine.streamInterviewResponse(
          messagesToSend,
          (token) => { generated += token; },
          () => {}
        );

        const cleanResponse = this.cleanForVoiceTTS(generated);
        if (cleanResponse && cleanResponse.length > 15) {
          this.conversationHistory.push({ role: 'assistant', content: cleanResponse });
          return cleanResponse;
        }
      } catch (err) {
        console.warn('[AgentCoachingHarness] LLM generation error, falling back to smart pedagogical engine:', err);
      }
    }

    // 2. High-Fidelity Smart Pedagogical Engine (Fallback & Offline Execution)
    return this.generateSmartPedagogicalResponse(userText, turnIndex, didLevelUp, phase);
  }

  /**
   * Pedagogical Response Synthesizer covering:
   * 1. Discovery (Learn about user & aspirations)
   * 2. Skill Validation (Verify production readiness for next role)
   * 3. Skill Improvement (Break L4 ceiling, elevate to Staff/Leadership)
   * 4. Skill Learning (Teach new concepts from first principles)
   */
  private generateSmartPedagogicalResponse(
    userText: string,
    turnIndex: number,
    didLevelUp: boolean,
    phase: CoachingPhase
  ): string {
    const textLower = userText.toLowerCase();

    // Level up milestone response
    if (didLevelUp) {
      return `Level up to Level ${this.mascot.level}! I'm elevating our technical drills for your ${this.memory.targetRole} target. How do you ensure zero data loss during high-volume node failovers in your architecture?`;
    }

    // 1. PHASE: DISCOVERY (Learning about the candidate)
    if (phase === 'DISCOVERY' || turnIndex === 0 || textLower.includes('hello') || textLower.includes('hi ') || textLower.includes('start')) {
      if (this.memory.targetRole && this.memory.targetRole !== 'Software Engineer' && this.memory.targetRole !== 'Staff Software Architect') {
        return `Targeting ${this.memory.targetRole} is an ambitious and impactful goal. Tell me about the core technical stack and scale of systems you are currently engineering.`;
      }
      return `Hello! I'm Nova, your personal career coach. What role or leadership level are you aiming for next, and what are you working on right now?`;
    }

    // 2. PHASE: SKILL LEARNING (Teaching new concepts & filling gaps)
    if (phase === 'LEARNING' || textLower.includes('teach me') || textLower.includes('don\'t know') || textLower.includes('dont know') || textLower.includes('what is') || textLower.includes('explain')) {
      if (textLower.includes('cache stampede') || textLower.includes('redis') || textLower.includes('cache')) {
        return `Let's break down cache stampedes simply. When a hot key expires under heavy traffic, all requests hit the database simultaneously. To prevent this, use probabilistic early expiration or a distributed Redis lock so only one worker rebuilds the cache. How would you handle stale reads while that lock is held?`;
      }
      if (textLower.includes('consensus') || textLower.includes('raft') || textLower.includes('split brain')) {
        return `In distributed systems, consensus ensures multiple nodes agree on state even if some fail. Raft achieves this through leader election and replicated write logs. If a network partition isolates the leader with a minority of nodes, how does Raft prevent split-brain writes?`;
      }
      if (textLower.includes('concurrency') || textLower.includes('lock') || textLower.includes('deadlock')) {
        return `Let's break down concurrency simply. Deadlocks happen when multiple threads hold locks while waiting on each other in a cyclic dependency. To prevent this, always acquire locks in a globally defined order or use lock-free atomic primitives. How would you detect lock contention in production?`;
      }
      return `Let's break that down from first principles. When designing scalable architectures, you trade off immediate consistency for high availability. What strategy would you use to reconcile eventual consistency across microservice boundaries?`;
    }

    // 3. PHASE: SKILL IMPROVEMENT (Elevating past the L4 ceiling to Staff/Leadership)
    if (phase === 'IMPROVEMENT') {
      const isLeadership =
        this.memory.targetRole.includes('Manager') ||
        this.memory.targetRole.includes('Director') ||
        this.memory.targetRole.includes('VP') ||
        this.memory.targetRole.includes('CTO');

      if (isLeadership) {
        return `Leading as a ${this.memory.targetRole} requires balancing executive technology strategy with hiring and execution. When scaling your engineering org, how do you balance technical debt against speed to market?`;
      }

      return `Stepping into ${this.memory.targetRole} requires defending systemic trade-offs under scale. In your systems, how did you handle data consistency and telemetry when traffic spiked unexpectedly?`;
    }

    // 4. PHASE: SKILL VALIDATION (Probing claimed skills with production scenarios)
    if (textLower.includes('redis') || textLower.includes('cache')) {
      return `What happens if your Redis primary fails before replication finishes, causing cache desync with the database? How would you design for that failure?`;
    }

    if (textLower.includes('concurrency') || textLower.includes('thread') || textLower.includes('lock')) {
      return `Concurrency hazards are critical at ${this.memory.targetRole} level. What strategy did you use to prevent deadlocks and thread starvation in that pipeline?`;
    }

    if (textLower.includes('react native') || textLower.includes('mobile') || textLower.includes('app')) {
      return `As a mobile architect, how do you prevent bridge serialization bottlenecks and ensure UI thread fluency with real-time socket streams?`;
    }

    if (textLower.includes('kafka') || textLower.includes('event') || textLower.includes('stream')) {
      return `If your Kafka message broker experiences a consumer lag surge under peak burst load, how do you prevent cascading downstream failures?`;
    }

    // Rotating Deep Scenario Probes
    const scenarioDrills = [
      `Understood. How do you design your active-active database replication to prevent split-brain during sudden network partitions?`,
      `Good point. What specific latency metrics and telemetry would you monitor to prove that design succeeded in production?`,
      `When scaling write capacity across database shards, what strategy ensures cross-shard transactional consistency?`,
      `How do you defend high-cost architectural refactors to non-technical executive stakeholders?`,
    ];

    return scenarioDrills[turnIndex % scenarioDrills.length];
  }

  private cleanForVoiceTTS(text: string): string {
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s+/g, '')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
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
