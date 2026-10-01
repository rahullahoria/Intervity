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
import { TeddyDialogueEngine } from './TeddyDialogueEngine';

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
      name: 'Teddy',
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      personalityTier: 'Warm Friend & Coding Buddy',
      relationshipSummary: 'A warm, supportive friendship learning together and reaching your career goals.',
      coachingStyle: 'Warm, Socratic & Conversational Growth',
      totalTurns: 0,
    };
    this.memory = {
      candidateName: 'Friend',
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
        this.mascot.name = (!row.name || row.name === 'Nova') ? 'Teddy' : row.name;
        this.mascot.level = row.level || 1;
        this.mascot.xp = row.xp || 0;
        this.mascot.xpToNextLevel = (row.level || 1) * 100;
        this.mascot.personalityTier = (row.personality_tier === 'Curious Explorer' || !row.personality_tier)
          ? this.getTierForLevel(this.mascot.level)
          : row.personality_tier;
        this.mascot.relationshipSummary = row.relationship_summary || this.mascot.relationshipSummary;
        this.mascot.coachingStyle = row.coaching_style || this.mascot.coachingStyle;

        if (row.name === 'Nova') {
          await this.db.execute('UPDATE mascot_profile SET name = ? WHERE id = ?', ['Teddy', 'mascot_primary']);
        }
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

      // 3. Load enrolled user voice profile if present
      const profileRes = await this.db.execute('SELECT * FROM user_profiles WHERE user_id = ?', ['user_primary']);
      if (profileRes.rows && profileRes.rows.length > 0) {
        const p = profileRes.rows[0];
        if (p.name) {
          this.memory.candidateName = p.name;
        }
        if (p.target_role) {
          this.memory.targetRole = p.target_role;
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
    if (level >= 5) return 'Lifelong Partner & Champion';
    if (level === 4) return 'Career Co-Pilot & Confidant';
    if (level === 3) return 'Trusted Ally & Tech Mentor';
    if (level === 2) return 'Close Friend & Pair Partner';
    return 'Warm Friend & Coding Buddy';
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
   * Uses MiniCPM5-2B via OfflineLLMEngine when active with native LlamaContext,
   * with high-fidelity pedagogical friend dialogue across all 3 coaching pillars.
   */
  private async generateCoachingResponse(
    userText: string,
    turnIndex: number,
    didLevelUp: boolean,
    phase: CoachingPhase
  ): Promise<string> {
    // 1. If LLM engine has native llamaContext loaded, stream from MiniCPM5-2B
    if (this.llmEngine && this.llmEngine.getLlamaContext()) {
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
        console.warn('[AgentCoachingHarness] LLM generation error, falling back to TeddyDialogueEngine:', err);
      }
    }

    // 2. High-Fidelity Smart Pedagogical Engine (Connected Friend Dialogue)
    const fallbackResponse = this.generateSmartPedagogicalResponse(userText, turnIndex, didLevelUp, phase);
    this.conversationHistory.push({ role: 'user', content: userText });
    this.conversationHistory.push({ role: 'assistant', content: fallbackResponse });
    return fallbackResponse;
  }

  /**
   * Pedagogical Response Synthesizer via TeddyDialogueEngine covering:
   * 1. Warm friendship persona & emotional relationship building
   * 2. Connected conversations ONLY (every turn acknowledges & connects to user speech)
   * 3. 3-pillar learning (Validation, Improvement, Learning) with intuitive analogies
   * 4. Strict Kokoro-82M TTS voice constraints
   */
  private generateSmartPedagogicalResponse(
    userText: string,
    turnIndex: number,
    didLevelUp: boolean,
    phase: CoachingPhase
  ): string {
    return TeddyDialogueEngine.generateConnectedResponse(userText, {
      candidateName: this.memory.candidateName,
      currentRole: this.memory.currentRole,
      targetRole: this.memory.targetRole,
      targetCompany: this.memory.targetCompany,
      strengths: this.memory.strengths,
      validatedSkills: this.memory.validatedSkills,
      skillsToSharpen: this.memory.skillsToSharpen,
      newSkillsToLearn: this.memory.newSkillsToLearn,
      currentPhase: phase,
      turnIndex,
      mascotLevel: this.mascot.level,
      mascotTier: this.mascot.personalityTier,
      recentTopics: this.memory.recentTopics,
      didLevelUp,
    });
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
