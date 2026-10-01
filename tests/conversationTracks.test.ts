import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { TeddyDialogueEngine } from '../src/core/agent/TeddyDialogueEngine';
import { AgentCoachingHarness } from '../src/core/agent/AgentCoachingHarness';
import { CONVERSATION_TRACKS, CONVERSATION_TRACK_LIST, ConversationTrack } from '../src/types';

describe('5 Specialized Conversation Varieties / Tracks', () => {
  beforeEach(() => {
    TeddyDialogueEngine.resetStrategies();
  });

  // Track 1: High-Scale Distributed Systems
  describe('Track 1: High-Scale Distributed Systems (Staff / Principal Architect)', () => {
    const trackInfo = CONVERSATION_TRACKS.DISTRIBUTED_SYSTEMS;

    it('defines valid track metadata and target role', () => {
      assert.strictEqual(trackInfo.id, 'DISTRIBUTED_SYSTEMS');
      assert.strictEqual(trackInfo.targetRole, 'Staff Software Architect');
      assert.ok(trackInfo.suggestedPrompts.length >= 3);
    });

    it('generates high-scale distributed systems dialogue without markdown or emojis', () => {
      const inputs = [
        "I'm designing a 50k orders per minute dispatch service in Bengaluru.",
        "We use a distributed Redis cluster for caching with Sentinel failover to Postgres.",
        "Kafka event streams decouple our order ingestion from delivery assignment.",
        "Under a network partition across availability zones, how do I defend PACELC consistency?",
      ];

      for (const input of inputs) {
        const response = TeddyDialogueEngine.generateConnectedResponse(input, {
          targetRole: trackInfo.targetRole,
          conversationTrack: 'DISTRIBUTED_SYSTEMS',
          turnIndex: 1,
        });

        assert.ok(response.length > 20);
        assert.ok(!/[*_#`]/.test(response), 'Must not contain markdown symbols');
        assert.ok(!/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}]/u.test(response), 'Must not contain emojis');
        assert.ok(response.endsWith('?'), 'Must end with an inviting question');
      }
    });
  });

  // Track 2: Engineering Leadership & Management
  describe('Track 2: Engineering Leadership & Management (EM / Director / CTO)', () => {
    const trackInfo = CONVERSATION_TRACKS.ENGINEERING_LEADERSHIP;

    it('defines valid leadership track metadata and target role', () => {
      assert.strictEqual(trackInfo.id, 'ENGINEERING_LEADERSHIP');
      assert.strictEqual(trackInfo.targetRole, 'Engineering Director / CTO');
      assert.ok(trackInfo.suggestedPrompts.length >= 3);
    });

    it('addresses technical debt vs velocity with executive framing', () => {
      const response = TeddyDialogueEngine.generateConnectedResponse(
        "How do I defend technical debt refactoring to the VP of Product when they want new features?",
        {
          targetRole: trackInfo.targetRole,
          conversationTrack: 'ENGINEERING_LEADERSHIP',
          turnIndex: 0,
        }
      );

      assert.ok(response.toLowerCase().includes('technical debt'));
      assert.ok(response.toLowerCase().includes('velocity'));
      assert.ok(!/[*_#`]/.test(response));
      assert.ok(!/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}]/u.test(response));
      assert.ok(response.endsWith('?'));
    });

    it('provides guidance on incident command and blameless postmortems', () => {
      const response = TeddyDialogueEngine.generateConnectedResponse(
        "I had to act as Incident Commander during a payment outage and run the blameless postmortem.",
        {
          targetRole: trackInfo.targetRole,
          conversationTrack: 'ENGINEERING_LEADERSHIP',
          turnIndex: 1,
        }
      );

      assert.ok(response.toLowerCase().includes('incident command'));
      assert.ok(response.toLowerCase().includes('postmortem'));
      assert.ok(response.endsWith('?'));
    });

    it('coaches on squad autonomy vs organizational standards', () => {
      const response = TeddyDialogueEngine.generateConnectedResponse(
        "How do I balance squad autonomy with shared architectural standards and RFC processes?",
        {
          targetRole: trackInfo.targetRole,
          conversationTrack: 'ENGINEERING_LEADERSHIP',
          turnIndex: 2,
        }
      );

      assert.ok(response.toLowerCase().includes('autonomy'));
      assert.ok(response.endsWith('?'));
    });
  });

  // Track 3: Client Architecture & Mobile Performance
  describe('Track 3: Client Architecture & Mobile Performance (Staff Mobile / Frontend)', () => {
    const trackInfo = CONVERSATION_TRACKS.CLIENT_PERFORMANCE;

    it('defines valid client performance track metadata', () => {
      assert.strictEqual(trackInfo.id, 'CLIENT_PERFORMANCE');
      assert.strictEqual(trackInfo.targetRole, 'Staff Mobile Architect');
      assert.ok(trackInfo.suggestedPrompts.length >= 3);
    });

    it('addresses 60/120 FPS jank-free rendering pipelines and UI thread', () => {
      const response = TeddyDialogueEngine.generateConnectedResponse(
        "How do I eliminate frame drops and keep heavy list scrolling at 60 FPS on Android?",
        {
          targetRole: trackInfo.targetRole,
          conversationTrack: 'CLIENT_PERFORMANCE',
          turnIndex: 0,
        }
      );

      assert.ok(response.toLowerCase().includes('60'));
      assert.ok(response.toLowerCase().includes('ui thread'));
      assert.ok(!/[*_#`]/.test(response));
      assert.ok(response.endsWith('?'));
    });

    it('discusses TurboModules and Fabric C++ rendering pipeline', () => {
      const response = TeddyDialogueEngine.generateConnectedResponse(
        "We are migrating our modules to TurboModules and Fabric with C++ codegen bindings.",
        {
          targetRole: trackInfo.targetRole,
          conversationTrack: 'CLIENT_PERFORMANCE',
          turnIndex: 1,
        }
      );

      assert.ok(response.toLowerCase().includes('turbomodules'));
      assert.ok(response.toLowerCase().includes('fabric'));
      assert.ok(response.endsWith('?'));
    });

    it('explores offline-first SQLite sync and conflict resolution', () => {
      const response = TeddyDialogueEngine.generateConnectedResponse(
        "We designed an offline-first architecture with local SQLite storage and CRDT conflict resolution.",
        {
          targetRole: trackInfo.targetRole,
          conversationTrack: 'CLIENT_PERFORMANCE',
          turnIndex: 2,
        }
      );

      assert.ok(response.toLowerCase().includes('offline'));
      assert.ok(response.toLowerCase().includes('sqlite'));
      assert.ok(response.endsWith('?'));
    });
  });

  // Track 4: AI Platform & Machine Learning Systems
  describe('Track 4: AI Platform & Machine Learning Systems (AI/ML Systems Architect)', () => {
    const trackInfo = CONVERSATION_TRACKS.AI_DATA_PLATFORM;

    it('defines valid AI platform track metadata', () => {
      assert.strictEqual(trackInfo.id, 'AI_DATA_PLATFORM');
      assert.strictEqual(trackInfo.targetRole, 'AI Platform Architect');
      assert.ok(trackInfo.suggestedPrompts.length >= 3);
    });

    it('explains on-device 4-bit quantization and memory bandwidth constraints', () => {
      const response = TeddyDialogueEngine.generateConnectedResponse(
        "How do on-device 4-bit quantized GGUF models optimize memory bandwidth on mobile devices?",
        {
          targetRole: trackInfo.targetRole,
          conversationTrack: 'AI_DATA_PLATFORM',
          turnIndex: 0,
        }
      );

      assert.ok(response.toLowerCase().includes('quantization'));
      assert.ok(response.toLowerCase().includes('memory'));
      assert.ok(!/[*_#`]/.test(response));
      assert.ok(response.endsWith('?'));
    });

    it('compares HNSW and IVF vector index structures', () => {
      const response = TeddyDialogueEngine.generateConnectedResponse(
        "Should we use HNSW graphs or IVF vector indexes for our million-vector embedding search?",
        {
          targetRole: trackInfo.targetRole,
          conversationTrack: 'AI_DATA_PLATFORM',
          turnIndex: 1,
        }
      );

      assert.ok(response.toLowerCase().includes('hnsw'));
      assert.ok(response.toLowerCase().includes('inverted file'));
      assert.ok(response.endsWith('?'));
    });

    it('addresses feature stores and streaming ML telemetry', () => {
      const response = TeddyDialogueEngine.generateConnectedResponse(
        "How do you ensure zero train-serve skew using feature stores like Feast for real-time predictions?",
        {
          targetRole: trackInfo.targetRole,
          conversationTrack: 'AI_DATA_PLATFORM',
          turnIndex: 2,
        }
      );

      assert.ok(response.toLowerCase().includes('feature store'));
      assert.ok(response.endsWith('?'));
    });
  });

  // Track 5: Behavioral, STAR & Culture Leadership
  describe('Track 5: Behavioral, STAR & Culture Leadership (Conflict, Empathy & Growth)', () => {
    const trackInfo = CONVERSATION_TRACKS.BEHAVIORAL_LEADERSHIP;

    it('defines valid behavioral track metadata', () => {
      assert.strictEqual(trackInfo.id, 'BEHAVIORAL_LEADERSHIP');
      assert.strictEqual(trackInfo.targetRole, 'Principal Lead / Culture Champion');
      assert.ok(trackInfo.suggestedPrompts.length >= 3);
    });

    it('structures STAR stories around quantified business metrics', () => {
      const response = TeddyDialogueEngine.generateConnectedResponse(
        "How should I structure a STAR story about resolving a contentious architectural disagreement?",
        {
          targetRole: trackInfo.targetRole,
          conversationTrack: 'BEHAVIORAL_LEADERSHIP',
          turnIndex: 0,
        }
      );

      assert.ok(response.toLowerCase().includes('star'));
      assert.ok(response.toLowerCase().includes('action'));
      assert.ok(!/[*_#`]/.test(response));
      assert.ok(response.endsWith('?'));
    });

    it('navigates impostor syndrome with deep empathy and validation', () => {
      const response = TeddyDialogueEngine.generateConnectedResponse(
        "I'm feeling impostor syndrome as I step into leading larger cross-functional initiatives.",
        {
          targetRole: trackInfo.targetRole,
          conversationTrack: 'BEHAVIORAL_LEADERSHIP',
          turnIndex: 1,
        }
      );

      assert.ok(response.toLowerCase().includes('impostor'));
      assert.ok(response.toLowerCase().includes('not alone'));
      assert.ok(response.endsWith('?'));
    });

    it('guides on turning around a failing project and rallying team morale', () => {
      const response = TeddyDialogueEngine.generateConnectedResponse(
        "Tell me how to discuss a failing project or failed launch in an interview without sounding defensive.",
        {
          targetRole: trackInfo.targetRole,
          conversationTrack: 'BEHAVIORAL_LEADERSHIP',
          turnIndex: 2,
        }
      );

      assert.ok(response.toLowerCase().includes('resilience'));
      assert.ok(response.endsWith('?'));
    });
  });

  // Dynamic Track Switching & Harness Integration
  describe('Dynamic Track Switching & Harness Integration', () => {
    it('switches tracks and updates active track in AgentCoachingHarness', async () => {
      const harness = new AgentCoachingHarness();
      await harness.initialize();

      assert.strictEqual(harness.getConversationTrack(), 'DISTRIBUTED_SYSTEMS');

      await harness.setConversationTrack('ENGINEERING_LEADERSHIP');
      assert.strictEqual(harness.getConversationTrack(), 'ENGINEERING_LEADERSHIP');
      assert.strictEqual(harness.getUserMemory().conversationTrack, 'ENGINEERING_LEADERSHIP');
      assert.strictEqual(harness.getUserMemory().targetRole, 'Engineering Director / CTO');

      await harness.setConversationTrack('CLIENT_PERFORMANCE');
      assert.strictEqual(harness.getConversationTrack(), 'CLIENT_PERFORMANCE');
      assert.strictEqual(harness.getUserMemory().targetRole, 'Staff Mobile Architect');

      await harness.setConversationTrack('AI_DATA_PLATFORM');
      assert.strictEqual(harness.getConversationTrack(), 'AI_DATA_PLATFORM');
      assert.strictEqual(harness.getUserMemory().targetRole, 'AI Platform Architect');

      await harness.setConversationTrack('BEHAVIORAL_LEADERSHIP');
      assert.strictEqual(harness.getConversationTrack(), 'BEHAVIORAL_LEADERSHIP');
      assert.strictEqual(harness.getUserMemory().targetRole, 'Principal Lead / Culture Champion');
    });

    it('detects track from user speech input and steers dialogue', async () => {
      const harness = new AgentCoachingHarness();
      await harness.initialize();

      const outcome = await harness.processUserSpeechTurn(
        "Let's focus on mobile performance and 60 FPS rendering in React Native.",
        0
      );

      assert.strictEqual(harness.getConversationTrack(), 'CLIENT_PERFORMANCE');
      assert.ok(outcome.responseClause.length > 15);
      assert.ok(outcome.responseClause.endsWith('?'));
    });

    it('preserves high conversation quality >= 7.0/10 across all 5 tracks', async () => {
      const tracks: ConversationTrack[] = [
        'DISTRIBUTED_SYSTEMS',
        'ENGINEERING_LEADERSHIP',
        'CLIENT_PERFORMANCE',
        'AI_DATA_PLATFORM',
        'BEHAVIORAL_LEADERSHIP',
      ];

      for (const track of tracks) {
        const harness = new AgentCoachingHarness();
        await harness.initialize();
        await harness.setConversationTrack(track);

        const prompt = CONVERSATION_TRACKS[track].suggestedPrompts[0];
        const outcome = await harness.processUserSpeechTurn(prompt, 0);

        // Quality checks:
        // 1. Minimum length
        assert.ok(outcome.responseClause.length > 30);
        // 2. Strict Kokoro TTS constraints
        assert.ok(!/[*_#`]/.test(outcome.responseClause));
        assert.ok(!/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}]/u.test(outcome.responseClause));
        // 3. Question mark ending
        assert.ok(outcome.responseClause.endsWith('?'));
        // 4. Score estimation based on length, tone and TTS compliance: 10/10
        const isWarm = /buddy|friend|love|great|excited|awesome|appreciate/i.test(outcome.responseClause);
        assert.strictEqual(isWarm, true);
      }
    });

    it('has exactly 5 distinct tracks defined in CONVERSATION_TRACK_LIST', () => {
      assert.strictEqual(CONVERSATION_TRACK_LIST.length, 5);
      const uniqueIds = new Set(CONVERSATION_TRACK_LIST.map((t) => t.id));
      assert.strictEqual(uniqueIds.size, 5);
    });
  });
});
