import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AgentCoachingHarness } from '../src/core/agent/AgentCoachingHarness';
import { buildAgentCoachingSystemPrompt } from '../src/core/llm/SystemPrompts';
import { SQLiteClient } from '../src/database/SQLiteClient';

describe('Agent Coaching Harness & System Prompt Integration', () => {
  beforeEach(async () => {
    const db = SQLiteClient.getInstance();
    await db.initialize();
    await db.execute('DELETE FROM mascot_profile');
    await db.execute('DELETE FROM agent_user_memory');
    await db.execute('DELETE FROM user_profiles');
  });


  describe('Harness-Based System Prompt Construction', () => {
    it('builds comprehensive system prompt anchored to candidate memory and target role', () => {
      const prompt = buildAgentCoachingSystemPrompt({
        mascotName: 'Teddy',
        mascotLevel: 3,
        personalityTier: 'Trusted Ally & Tech Mentor',
        coachingStyle: 'Warm, Socratic & Conversational Growth',
        candidateName: 'Rahul',
        currentRole: 'Senior Software Engineer',
        targetRole: 'Staff Software Architect',
        targetCompany: 'Tier-1 Product Unicorn',
        strengths: ['React Native', 'TypeScript', 'Redis'],
        validatedSkills: ['React Native'],
        skillsToSharpen: ['Distributed Consensus'],
        newSkillsToLearn: ['Kafka Partitioning'],
        currentPhase: 'VALIDATION',
        turnIndex: 2,
        recentTopics: ['Distributed Caching'],
      });

      // Verification of Core Mission & Friend Persona
      assert.ok(prompt.includes('You are Teddy'), 'Must identify mascot as Teddy');
      assert.ok(prompt.includes('TALK LIKE A REAL FRIEND'), 'Must include friend persona instructions');
      assert.ok(prompt.includes('CONNECTED CONVERSATIONS ONLY'), 'Must enforce strictly connected conversations');
      assert.ok(prompt.includes('Staff Software Architect'), 'Must anchor to target role');
      assert.ok(prompt.includes('SKILL VALIDATION'), 'Must include validation pillar');
      assert.ok(prompt.includes('SKILL IMPROVEMENT'), 'Must include improvement pillar');
      assert.ok(prompt.includes('SKILL LEARNING'), 'Must include learning pillar');
      assert.ok(prompt.includes('LEARN ABOUT THE USER'), 'Must instruct learning about user');

      // Verification of TTS Voice Rules
      assert.ok(prompt.includes('STRICT KOKORO-82M TTS VOICE RULES'), 'Must enforce TTS voice constraints');
      assert.ok(prompt.includes('ABSOLUTELY NO MARKDOWN'), 'Must strictly forbid markdown');
      assert.ok(prompt.includes('NO EMOJIS'), 'Must strictly forbid emojis');
      assert.ok(prompt.includes('ONE warm, connected question'), 'Must enforce single warm question per turn');
    });

    it('adapts coaching guidance for Engineering Leadership (EM/Director/CTO)', () => {
      const leadershipPrompt = buildAgentCoachingSystemPrompt({
        targetRole: 'Chief Technology Officer (CTO)',
        currentPhase: 'IMPROVEMENT',
      });

      assert.ok(leadershipPrompt.includes('Chief Technology Officer (CTO)'));
      assert.ok(leadershipPrompt.includes('Leadership (Engineering Manager, Director, VP, CTO)'));
      assert.ok(leadershipPrompt.includes('tech debt vs delivery speed'));
    });
  });

  describe('Agent Coaching Harness Lifecycle', () => {
    it('executes full 4-phase coaching progression: Discovery -> Validation -> Improvement -> Learning', async () => {
      const harness = new AgentCoachingHarness();
      await harness.initialize();

      // TURN 1: DISCOVERY (Learning about the user & aspirations)
      const turn1Outcome = await harness.processUserSpeechTurn(
        'Hello, I am a senior engineer at Swiggy aiming for Staff Software Architect next.',
        0
      );

      assert.strictEqual(turn1Outcome.currentPhase, 'DISCOVERY');
      assert.ok(turn1Outcome.responseClause.length > 20);
      assert.strictEqual(harness.getUserMemory().targetRole, 'Staff Software Architect');
      assert.ok(turn1Outcome.extractedFacts.some(f => f.key === 'target_role'));

      // TURN 2: SKILL VALIDATION (Pressure-testing claimed skills for next role)
      const turn2Outcome = await harness.processUserSpeechTurn(
        'In our catalog microservices, I implemented Redis caching with cluster sharding to handle 100k requests per second.',
        1
      );

      assert.strictEqual(turn2Outcome.currentPhase, 'VALIDATION');
      assert.ok(turn2Outcome.responseClause.toLowerCase().includes('redis') || turn2Outcome.responseClause.toLowerCase().includes('fail'));
      assert.ok(harness.getUserMemory().strengths.includes('redis'));
      assert.ok(harness.getUserMemory().validatedSkills.includes('redis'));

      // TURN 3: SKILL IMPROVEMENT (Elevating past the L4 ceiling to Staff standards)
      const turn3Outcome = await harness.processUserSpeechTurn(
        'We used master-replica replication with sentinel for failovers, and cached read keys for 1 hour.',
        2
      );

      assert.strictEqual(turn3Outcome.currentPhase, 'IMPROVEMENT');
      assert.ok(turn3Outcome.responseClause.includes('Staff Software Architect'));
      assert.ok(turn3Outcome.responseClause.includes('trade-offs') || turn3Outcome.responseClause.includes('consistency') || turn3Outcome.responseClause.includes('scale'));

      // TURN 4: SKILL LEARNING (Teaching brand new concepts from first principles)
      const turn4Outcome = await harness.processUserSpeechTurn(
        "I don't know much about cache stampedes or probabilistic early expiration, teach me how that works.",
        3
      );

      assert.strictEqual(turn4Outcome.currentPhase, 'LEARNING');
      assert.ok(turn4Outcome.responseClause.includes('cache stampede') || turn4Outcome.responseClause.includes('stampedes'));
      assert.ok(turn4Outcome.responseClause.includes('distributed') || turn4Outcome.responseClause.includes('lock'));
      assert.ok(harness.getUserMemory().newSkillsToLearn.length > 0);

      // Verify Mascot progression
      const profile = harness.getMascotProfile();
      assert.ok(profile.totalTurns >= 4);
      assert.ok(profile.xp > 0);
    });

    it('advances mascot level and upgrades personality tier on reaching XP milestones', async () => {
      const harness = new AgentCoachingHarness();
      await harness.initialize();

      // Feed multiple high-impact turns to trigger level-up
      await harness.processUserSpeechTurn('I want to become Chief Technology Officer (CTO) at high growth unicorn.', 0);
      await harness.processUserSpeechTurn('I designed distributed Kafka event streams and Postgres sharding with Raft consensus.', 1);
      const outcome = await harness.processUserSpeechTurn('Teach me how to mitigate consumer lag surges in event streams.', 2);

      const profile = harness.getMascotProfile();
      assert.ok(profile.level >= 2, 'Mascot should level up after multiple rich turns');
      assert.ok(profile.xpToNextLevel > 100, 'Threshold scales with level');
      assert.notStrictEqual(profile.personalityTier, 'Curious Explorer');
    });
  });

  describe('Teddy Friend Persona & Connected Conversations', () => {
    it('maintains strictly connected conversations when candidate speaks about their projects', async () => {
      const harness = new AgentCoachingHarness();
      await harness.initialize();

      const outcome = await harness.processUserSpeechTurn('I am working on AI app', 0);
      assert.ok(outcome.responseClause.toLowerCase().includes('ai app'), 'Must connect to AI app');
      assert.ok(
        outcome.responseClause.toLowerCase().includes('cool') ||
        outcome.responseClause.toLowerCase().includes('love') ||
        outcome.responseClause.toLowerCase().includes('amazing'),
        'Must talk like an encouraging friend'
      );
    });

    it('responds with empathy and relationship validation when user feels nervous', async () => {
      const harness = new AgentCoachingHarness();
      await harness.initialize();

      const outcome = await harness.processUserSpeechTurn('I am feeling nervous about my upcoming interview', 1);
      assert.ok(
        outcome.responseClause.toLowerCase().includes('normal') ||
        outcome.responseClause.toLowerCase().includes('corner') ||
        outcome.responseClause.toLowerCase().includes('breath'),
        'Must validate emotions like a friend'
      );
    });

    it('teaches technical concepts through friendly, intuitive analogies', async () => {
      const harness = new AgentCoachingHarness();
      await harness.initialize();

      const outcome = await harness.processUserSpeechTurn('What is a cache stampede? Explain it to me.', 2);
      assert.ok(
        outcome.responseClause.toLowerCase().includes('bakery') ||
        outcome.responseClause.toLowerCase().includes('rush'),
        'Must use intuitive analogy'
      );
      assert.ok(
        outcome.responseClause.toLowerCase().includes('lock') ||
        outcome.responseClause.toLowerCase().includes('worker'),
        'Must teach real engineering solution'
      );
    });
  });
});
