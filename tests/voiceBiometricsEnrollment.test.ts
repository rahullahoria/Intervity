/**
 * Voice Profile Biometrics & Enrollment Test Suite
 * 
 * Verifies:
 * 1. Personalized prompt generation calling the user by name
 * 2. 192-dimensional acoustic voiceprint extraction & L2-normalization
 * 3. Cosine similarity speaker verification
 * 4. SQLite persistence of user_profiles table
 * 5. Integration with AgentCoachingHarness addressing candidate by name
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { VoiceBiometricsService } from '../src/core/voice/VoiceBiometricsService';
import { SQLiteClient } from '../src/database/SQLiteClient';
import { AgentCoachingHarness } from '../src/core/agent/AgentCoachingHarness';

describe('Voice Profile Biometrics & Enrollment', () => {
  let biometrics: VoiceBiometricsService;
  let db: SQLiteClient;

  beforeEach(async () => {
    db = SQLiteClient.getInstance();
    await db.initialize();
    biometrics = new VoiceBiometricsService(db);
    await biometrics.initialize();
    await biometrics.clearVoiceProfile('user_primary');
  });

  describe('Personalized Prompts Calling Candidate by Name', () => {
    it('generates personalized spoken prompts and calibration sentence for a given name', () => {
      const candidateName = 'Rahul';
      const prompt = biometrics.generateEnrollmentPrompts(candidateName);

      assert.strictEqual(prompt.candidateName, 'Rahul');
      assert.ok(prompt.calibrationSentence.includes('I am Rahul'));
      assert.ok(prompt.spokenGreeting.includes('Hello Rahul!'));
      assert.ok(prompt.spokenGreeting.includes("read this sentence out loud: 'I am Rahul"));
      assert.ok(prompt.spokenSuccess.includes('Wonderful, Rahul!'));
    });

    it('handles multi-word or spaced names gracefully', () => {
      const prompt = biometrics.generateEnrollmentPrompts('  Rahul Sharma  ');
      assert.strictEqual(prompt.candidateName, 'Rahul Sharma');
      assert.ok(prompt.spokenGreeting.includes('Hello Rahul Sharma!'));
      assert.strictEqual(prompt.calibrationSentence, 'I am Rahul Sharma, and I am ready to level up my engineering career.');
    });

    it('falls back to Candidate if name is empty', () => {
      const prompt = biometrics.generateEnrollmentPrompts('');
      assert.strictEqual(prompt.candidateName, 'Candidate');
      assert.ok(prompt.spokenGreeting.includes('Hello Candidate!'));
    });
  });


  describe('192-Dimensional Acoustic Embedding Extraction', () => {
    it('extracts a 192-dimensional normalized unit vector', () => {
      const mockAudio = new Float32Array(16000); // 1 second of 16kHz audio
      for (let i = 0; i < mockAudio.length; i++) {
        mockAudio[i] = Math.sin((2 * Math.PI * 220 * i) / 16000);
      }

      const embedding = biometrics.extractVoiceEmbedding(mockAudio, 'Rahul');
      assert.strictEqual(embedding.length, 192);

      // Verify L2 unit norm (sum of squares is ~1.0)
      let sumSq = 0;
      for (const val of embedding) {
        sumSq += val * val;
      }
      assert.ok(sumSq > 0.95);
      assert.ok(sumSq < 1.05);
    });

    it('produces identical embeddings for identical speaker acoustic signatures', () => {
      const mockAudio = new Float32Array([0.1, 0.4, 0.7, 0.2, 0.5, 0.8]);
      const emb1 = biometrics.extractVoiceEmbedding(mockAudio, 'Rahul');
      const emb2 = biometrics.extractVoiceEmbedding(mockAudio, 'Rahul');

      const sim = biometrics.cosineSimilarity(emb1, emb2);
      assert.ok(Math.abs(sim - 1.0) < 0.005);
    });

    it('produces lower similarity between distinct speaker audio signatures', () => {
      const audioRahul = new Float32Array(8000);
      for (let i = 0; i < audioRahul.length; i++) {
        audioRahul[i] = Math.sin((2 * Math.PI * 180 * i) / 8000); // 180 Hz pitch
      }

      const audioImposter = new Float32Array(8000);
      for (let i = 0; i < audioImposter.length; i++) {
        audioImposter[i] = (Math.random() - 0.5) * 0.8; // White noise
      }

      const embRahul = biometrics.extractVoiceEmbedding(audioRahul, 'Rahul');
      const embImposter = biometrics.extractVoiceEmbedding(audioImposter, 'Stranger');

      const sim = biometrics.cosineSimilarity(embRahul, embImposter);
      assert.ok(sim < 0.70, `Expected similarity < 0.70, got ${sim}`);
    });
  });

  describe('SQLite Persistence & Speaker Verification', () => {
    it('enrolls and retrieves candidate voice profile from SQLite', async () => {
      const mockAudio = new Float32Array([0.2, 0.5, 0.8, 0.3, 0.6]);
      const sentence = 'I am Rahul, and I am ready to level up my engineering career.';

      const enrolled = await biometrics.enrollVoiceProfile(
        'user_primary',
        'Rahul',
        mockAudio,
        sentence,
        'Staff Software Architect'
      );

      assert.strictEqual(enrolled.name, 'Rahul');
      assert.strictEqual(enrolled.voiceEnrolled, true);
      assert.strictEqual(enrolled.voiceEmbedding.length, 192);

      // Verify retrieval
      const fetched = await biometrics.getVoiceProfile('user_primary');
      assert.ok(fetched !== null);
      assert.strictEqual(fetched?.name, 'Rahul');
      assert.strictEqual(fetched?.voiceEnrolled, true);
      assert.strictEqual(fetched?.sampleText, sentence);
      assert.strictEqual(fetched?.voiceEmbedding.length, 192);
    });

    it('verifies speaker identity against enrolled voice profile', async () => {
      const mockAudio = new Float32Array([0.2, 0.5, 0.8, 0.3, 0.6]);
      await biometrics.enrollVoiceProfile(
        'user_primary',
        'Rahul',
        mockAudio,
        'I am Rahul, and I am ready to level up my engineering career.'
      );

      // 1. Same user speaking
      const verifyResult = await biometrics.verifyVoice(mockAudio, 'Rahul', 'user_primary', 0.75);
      assert.strictEqual(verifyResult.isMatch, true);
      assert.strictEqual(verifyResult.candidateName, 'Rahul');
      assert.ok(verifyResult.similarity >= 0.75);

      // 2. Different speaker
      const noise = new Float32Array([0.9, -0.9, 0.1, -0.1, 0.8]);
      const imposterResult = await biometrics.verifyVoice(noise, 'UnknownSpeaker', 'user_primary', 0.75);
      assert.strictEqual(imposterResult.isMatch, false);
      assert.strictEqual(imposterResult.candidateName, 'Unknown Speaker');
    });

    it('clears voice profile successfully', async () => {
      const mockAudio = new Float32Array([0.2, 0.5, 0.8]);
      await biometrics.enrollVoiceProfile('user_primary', 'Rahul', mockAudio, 'Sample sentence');

      await biometrics.clearVoiceProfile('user_primary');
      const fetched = await biometrics.getVoiceProfile('user_primary');
      assert.strictEqual(fetched, null);
    });
  });

  describe('Agent Coaching Integration Calling Candidate by Name', () => {
    it('initializes AgentCoachingHarness with enrolled candidate name and addresses them in greetings', async () => {
      // 1. Enroll Rahul Sharma
      const mockAudio = new Float32Array([0.3, 0.6, 0.9]);
      await biometrics.enrollVoiceProfile(
        'user_primary',
        'Rahul',
        mockAudio,
        'I am Rahul, and I am ready to level up my engineering career.',
        'Staff Software Architect'
      );

      // 2. Boot AgentCoachingHarness
      const harness = new AgentCoachingHarness();
      await harness.initialize();

      const memory = harness.getUserMemory();
      assert.strictEqual(memory.candidateName, 'Rahul');

      // 3. Process first turn greeting
      const turnOutcome = await harness.processUserSpeechTurn('Hi Nova, I am here to practice.', 0);
      assert.ok(turnOutcome.responseClause.includes('Rahul'), `Expected response to include Rahul, got ${turnOutcome.responseClause}`);
    });
  });

});
