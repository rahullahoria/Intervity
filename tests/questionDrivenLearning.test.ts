/**
 * Question-Driven Learning (QBL) Test Suite
 * 
 * Verifies:
 * 1. Sub-topic planning (5+ comprehensive sub-topics)
 * 2. 4-Option multiple-choice generation with explanations
 * 3. Correct answer flow: +33% mastery per concept, celebrating emotion, XP award
 * 4. Wrong answer flow: explains why chosen answer is wrong & what the right answer is,
 *    puzzled emotion, and delivers reinforcement question
 * 5. 100% subtopic mastery gate and progression to next subtopic
 * 6. SQLite persistence and session resumption
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { SQLiteClient } from '../src/database/SQLiteClient';
import { QBLStorageManager } from '../src/database/QBLStorageManager';
import { QBLEngine } from '../src/core/qbl/QBLEngine';
import { OfflineLLMEngine, QBL_JSON_GBNF } from '../src/core/llm/OfflineLLMEngine';

describe('Question-Driven Learning (QBL) Core Engine & Flow', () => {
  let db: SQLiteClient;
  let storage: QBLStorageManager;
  let llmEngine: OfflineLLMEngine;
  let qblEngine: QBLEngine;

  beforeEach(async () => {
    db = SQLiteClient.getInstance();
    await db.initialize();
    await db.execute('DELETE FROM qbl_skill_sessions;');
    await db.execute('DELETE FROM qbl_session_turns;');
    storage = new QBLStorageManager(db);
    llmEngine = new OfflineLLMEngine();
    await llmEngine.loadModel('MiniCPM5-2B-Q4_K_M.gguf');
    qblEngine = new QBLEngine(llmEngine, storage);
  });


  describe('Sub-topic Planning (5+ Comprehensive Roadmap)', () => {
    it('plans at least 5 logically structured sub-topics for any given skill topic', async () => {
      const subtopics = await qblEngine.planSubtopics('Kafka & Event Streaming');
      assert.ok(Array.isArray(subtopics));
      assert.ok(subtopics.length >= 5, `Expected >= 5 subtopics, got ${subtopics.length}`);

      // Verify structure of each subtopic
      subtopics.forEach((sub, idx) => {
        assert.ok(sub.id, `Subtopic ${idx} must have an id`);
        assert.ok(sub.title && sub.title.length > 5, `Subtopic ${idx} must have a descriptive title`);
        assert.ok(sub.description && sub.description.length > 10, `Subtopic ${idx} must have a description`);
        assert.strictEqual(sub.conceptsMastered, 0);
        assert.strictEqual(sub.totalConcepts, 3);
        assert.strictEqual(sub.masteryPercentage, 0);
        assert.strictEqual(sub.status, idx === 0 ? 'IN_PROGRESS' : 'PENDING');
      });
    });
  });

  describe('4-Option Question Generation', () => {
    it('generates a multiple-choice question with 4 options and valid explanations', async () => {
      const subtopics = await qblEngine.planSubtopics('Distributed Systems');
      const question = await qblEngine.generateQuestion('Distributed Systems', subtopics[0], 1, false);

      assert.ok(question.id);
      assert.ok(question.questionText && question.questionText.length > 15);
      assert.strictEqual(question.options.length, 4);

      // Exactly one option must be marked correct
      const correctOptions = question.options.filter((o) => o.isCorrect);
      assert.strictEqual(correctOptions.length, 1, 'Must have exactly one correct option');

      // Verify labels A, B, C, D and explanations
      const ids = question.options.map((o) => o.id);
      assert.deepStrictEqual(ids, ['A', 'B', 'C', 'D']);
      question.options.forEach((opt) => {
        assert.ok(opt.text.length > 0);
        assert.ok(opt.explanation.length > 0, `Option ${opt.id} must explain why it is right or wrong`);
      });
    });
  });

  describe('Correct Answer Flow & Mastery Tracking', () => {
    it('awards +33% mastery on correct answer, triggers celebrating emotion and awards XP', async () => {
      const session = await qblEngine.createNewSession('Distributed Systems');
      const currentSub = session.subtopics[0];
      const question = await qblEngine.generateQuestion(session.topicName, currentSub, 1, false);

      const correctOpt = question.options.find((o) => o.isCorrect)!;
      const result = await qblEngine.evaluateAnswer(session, currentSub, question, correctOpt.id);

      assert.strictEqual(result.isCorrect, true);
      assert.strictEqual(result.teddyEmotion, 'celebrating');
      assert.strictEqual(result.xpAwarded, 25);
      assert.strictEqual(currentSub.conceptsMastered, 1);
      assert.strictEqual(currentSub.masteryPercentage, 33);
      assert.ok(result.feedbackText.includes('Spot on') || result.feedbackText.includes('right'));
      assert.ok(result.feedbackText.includes(correctOpt.explanation));
    });

    it('advances subtopic to 100% and COMPLETED after 3 correct concepts', async () => {
      const session = await qblEngine.createNewSession('Distributed Systems');
      const currentSub = session.subtopics[0];

      for (let conceptIdx = 1; conceptIdx <= 3; conceptIdx++) {
        const question = await qblEngine.generateQuestion(session.topicName, currentSub, conceptIdx, false);
        const correctOpt = question.options.find((o) => o.isCorrect)!;
        await qblEngine.evaluateAnswer(session, currentSub, question, correctOpt.id);
      }

      assert.strictEqual(currentSub.conceptsMastered, 3);
      assert.strictEqual(currentSub.masteryPercentage, 100);
      assert.strictEqual(currentSub.status, 'COMPLETED');
    });
  });

  describe('Wrong Answer Flow: Diagnostics & Reinforcement', () => {
    it('explains why selected option is wrong, reveals correct answer, and queues reinforcement', async () => {
      const session = await qblEngine.createNewSession('Kafka');
      const currentSub = session.subtopics[0];
      const question = await qblEngine.generateQuestion(session.topicName, currentSub, 1, false);

      const wrongOpt = question.options.find((o) => !o.isCorrect)!;
      const correctOpt = question.options.find((o) => o.isCorrect)!;

      const result = await qblEngine.evaluateAnswer(session, currentSub, question, wrongOpt.id);

      assert.strictEqual(result.isCorrect, false);
      assert.strictEqual(result.teddyEmotion, 'puzzled');
      assert.strictEqual(result.xpAwarded, 5); // Learning from mistakes XP
      assert.strictEqual(currentSub.conceptsMastered, 0); // Not incremented
      assert.strictEqual(currentSub.masteryPercentage, 0);

      // Verify diagnostics in feedback text
      assert.ok(result.feedbackText.includes(`Option ${wrongOpt.id} is incorrect`));
      assert.ok(result.feedbackText.includes(wrongOpt.explanation));
      assert.ok(result.feedbackText.includes(`Option ${correctOpt.id}`));
      assert.ok(result.feedbackText.includes(correctOpt.text));

      // Generate reinforcement question
      const reinforceQ = await qblEngine.generateQuestion(
        session.topicName,
        currentSub,
        1,
        true,
        wrongOpt.text
      );
      assert.strictEqual(reinforceQ.isReinforcement, true);
      assert.strictEqual(reinforceQ.options.length, 4);
    });
  });

  describe('Session Persistence & Resumption', () => {
    it('persists session and turns in SQLite and restores accurately on resume', async () => {
      const created = await qblEngine.createNewSession('React Native Architecture');
      assert.ok(created.sessionId);

      // Answer 1 question correctly
      const sub0 = created.subtopics[0];
      const q = await qblEngine.generateQuestion(created.topicName, sub0, 1, false);
      const correctOpt = q.options.find((o) => o.isCorrect)!;
      await qblEngine.evaluateAnswer(created, sub0, q, correctOpt.id);

      // Resume session from database
      const resumed = await qblEngine.resumeSession(created.sessionId);
      assert.ok(resumed);
      assert.strictEqual(resumed.sessionId, created.sessionId);
      assert.strictEqual(resumed.topicName, 'React Native Architecture');
      assert.strictEqual(resumed.subtopics.length, created.subtopics.length);
      assert.strictEqual(resumed.subtopics[0].conceptsMastered, 1);
      assert.strictEqual(resumed.subtopics[0].masteryPercentage, 33);

      // Verify latest session query
      const latest = await qblEngine.getLatestSession();
      assert.ok(latest);
      assert.strictEqual(latest.sessionId, created.sessionId);

      // Verify recorded turn
      const turns = await storage.getTurnsForSession(created.sessionId);
      assert.strictEqual(turns.length, 1);
      assert.strictEqual(turns[0].isCorrect, true);
      assert.strictEqual(turns[0].userSelectedOptionId, correctOpt.id);
    });
  });

  describe('Teddy Mascot Emotion Lifecycle (Talking ONLY during LLM Output Generation)', () => {
    it('guarantees evaluateAnswer never sets emotion to speaking (only celebrating or puzzled)', async () => {
      const session = await qblEngine.createNewSession('System Design');
      const sub = session.subtopics[0];
      const q = await qblEngine.generateQuestion(session.topicName, sub, 1, false);

      const correctOpt = q.options.find((o) => o.isCorrect)!;
      const wrongOpt = q.options.find((o) => !o.isCorrect)!;

      const correctResult = await qblEngine.evaluateAnswer(session, sub, q, correctOpt.id);
      assert.strictEqual(correctResult.teddyEmotion, 'celebrating');
      assert.notStrictEqual(correctResult.teddyEmotion, 'speaking');

      const wrongResult = await qblEngine.evaluateAnswer(session, sub, q, wrongOpt.id);
      assert.strictEqual(wrongResult.teddyEmotion, 'puzzled');
      assert.notStrictEqual(wrongResult.teddyEmotion, 'speaking');
    });
  });

  describe('Question Distinctness & Diversity (Zero Duplication Between Concepts)', () => {
    it('generates strictly distinct questions across Concept 1, Concept 2, Concept 3 and Reinforcement for a track', async () => {
      const session = await qblEngine.createNewSession('SQL Indexing & Sharding');
      const sub = session.subtopics[0];

      const q1 = await qblEngine.generateQuestion(session.topicName, sub, 1, false);
      const q2 = await qblEngine.generateQuestion(session.topicName, sub, 2, false);
      const q3 = await qblEngine.generateQuestion(session.topicName, sub, 3, false);
      const qReinforce = await qblEngine.generateQuestion(session.topicName, sub, 1, true, 'Composite indexes');

      const questions = [q1.questionText, q2.questionText, q3.questionText, qReinforce.questionText];
      const uniqueQuestions = new Set(questions);

      assert.strictEqual(uniqueQuestions.size, 4, 'All 4 questions must have distinct question texts');
      assert.notStrictEqual(q1.questionText, q2.questionText);
      assert.notStrictEqual(q2.questionText, q3.questionText);
      assert.notStrictEqual(q1.questionText, q3.questionText);
    });

    it('generates distinct questions for different tracks and arbitrary custom topics', async () => {
      const kafkaSession = await qblEngine.createNewSession('Kafka & Event Streaming');
      const rnSession = await qblEngine.createNewSession('React Native Architecture');
      const customSession = await qblEngine.createNewSession('Docker & Kubernetes Containerization');

      const qKafka = await qblEngine.generateQuestion(kafkaSession.topicName, kafkaSession.subtopics[0], 1, false);
      const qRN = await qblEngine.generateQuestion(rnSession.topicName, rnSession.subtopics[0], 1, false);
      const qCustom = await qblEngine.generateQuestion(customSession.topicName, customSession.subtopics[0], 1, false);

      assert.notStrictEqual(qKafka.questionText, qRN.questionText);
      assert.notStrictEqual(qKafka.questionText, qCustom.questionText);
      assert.notStrictEqual(qRN.questionText, qCustom.questionText);
      assert.ok(qCustom.questionText.includes('Docker') || qCustom.questionText.includes('Containerization'));
    });
  });

  describe('Graduated Difficulty Progression (Basic -> Intermediate -> Advanced -> Pro)', () => {
    it('assigns step-by-step graduated difficulty across subtopics in the learning roadmap', async () => {
      const subtopics = await qblEngine.planSubtopics('SQL Indexing & Sharding');
      assert.ok(subtopics.length >= 5);
      assert.strictEqual(subtopics[0].difficulty, 'basic');
      assert.strictEqual(subtopics[1].difficulty, 'intermediate');
      assert.strictEqual(subtopics[2].difficulty, 'advanced');
      assert.strictEqual(subtopics[3].difficulty, 'pro');
      assert.strictEqual(subtopics[4].difficulty, 'pro');
    });

    it('generates questions with graduated difficulty tiers (Concept 1 Basic -> Concept 2 Interm -> Concept 3 Adv -> Drill Pro)', async () => {
      const session = await qblEngine.createNewSession('SQL Indexing & Sharding');
      const sub = session.subtopics[0];

      const qBasic = await qblEngine.generateQuestion(session.topicName, sub, 1, false);
      assert.strictEqual(qBasic.difficulty, 'basic');
      // Concept 1 must start with foundational intuition (e.g. index purpose vs full table scan)
      assert.ok(
        qBasic.questionText.toLowerCase().includes('primary purpose') ||
        qBasic.questionText.toLowerCase().includes('index') ||
        qBasic.questionText.toLowerCase().includes('full table scan')
      );

      const qInterm = await qblEngine.generateQuestion(session.topicName, sub, 2, false);
      assert.strictEqual(qInterm.difficulty, 'intermediate');

      const qAdv = await qblEngine.generateQuestion(session.topicName, sub, 3, false);
      assert.strictEqual(qAdv.difficulty, 'advanced');

      const qPro = await qblEngine.generateQuestion(session.topicName, sub, 1, true, 'B+Tree');
      assert.strictEqual(qPro.difficulty, 'pro');
      assert.strictEqual(qPro.isReinforcement, true);
    });
  });

  describe('Post-Topic Mistake Review Session', () => {
    it('records failed turns in SQLite and retrieves comprehensive autopsy review items', async () => {
      const session = await qblEngine.createNewSession('Kafka & Event Streaming');
      const sub = session.subtopics[0];

      // Question 1: User makes a mistake
      const q1 = await qblEngine.generateQuestion(session.topicName, sub, 1, false);
      const wrongOpt1 = q1.options.find((o) => !o.isCorrect)!;
      const correctOpt1 = q1.options.find((o) => o.isCorrect)!;
      const turn1 = await qblEngine.evaluateAnswer(session, sub, q1, wrongOpt1.id);
      assert.strictEqual(turn1.isCorrect, false);

      // Question 2: User answers correctly
      const q2 = await qblEngine.generateQuestion(session.topicName, sub, 1, false);
      const correctOpt2 = q2.options.find((o) => o.isCorrect)!;
      const turn2 = await qblEngine.evaluateAnswer(session, sub, q2, correctOpt2.id);
      assert.strictEqual(turn2.isCorrect, true);

      // Question 3: User makes another mistake on Concept 2
      const q3 = await qblEngine.generateQuestion(session.topicName, sub, 2, false);
      const wrongOpt3 = q3.options.find((o) => !o.isCorrect)!;
      const correctOpt3 = q3.options.find((o) => o.isCorrect)!;
      const turn3 = await qblEngine.evaluateAnswer(session, sub, q3, wrongOpt3.id);
      assert.strictEqual(turn3.isCorrect, false);

      // Retrieve mistake review items for session
      const mistakes = await qblEngine.getMistakesForSession(session.sessionId);
      assert.strictEqual(mistakes.length, 2, 'Must contain exactly the 2 failed turns');

      // Verify Mistake Item 1 details
      const m1 = mistakes[0];
      assert.strictEqual(m1.sessionId, session.sessionId);
      assert.strictEqual(m1.questionText, q1.questionText);
      assert.strictEqual(m1.userSelectedOption.id, wrongOpt1.id);
      assert.strictEqual(m1.correctOption.id, correctOpt1.id);
      assert.ok(m1.feedbackText.includes('Not quite') || m1.feedbackText.includes('incorrect'));

      // Verify Mistake Item 2 details
      const m2 = mistakes[1];
      assert.strictEqual(m2.sessionId, session.sessionId);
      assert.strictEqual(m2.questionText, q3.questionText);
      assert.strictEqual(m2.userSelectedOption.id, wrongOpt3.id);
      assert.strictEqual(m2.correctOption.id, correctOpt3.id);
    });

    it('returns empty array when user achieves flawless first-pass mastery without mistakes', async () => {
      const session = await qblEngine.createNewSession('Distributed Systems');
      const sub = session.subtopics[0];

      // Answer all 3 concepts correctly
      for (let c = 1; c <= 3; c++) {
        const q = await qblEngine.generateQuestion(session.topicName, sub, c, false);
        const correct = q.options.find((o) => o.isCorrect)!;
        await qblEngine.evaluateAnswer(session, sub, q, correct.id);
      }

      const mistakes = await qblEngine.getMistakesForSession(session.sessionId);
      assert.strictEqual(mistakes.length, 0, 'Zero mistakes recorded for flawless session');
    });
  });

  describe('Optimization 1: Pipelined Background Pre-generation', () => {
    it('pre-generates Concept 1 on createNewSession and pre-generates Concept N+1 on generating Concept N', async () => {
      const session = await qblEngine.createNewSession('Distributed Systems');
      const sub = session.subtopics[0];

      // 1. Check that createNewSession pre-cached Concept 1
      assert.strictEqual(
        qblEngine.hasPrefetchedQuestion(session.topicName, sub.id, 1, false),
        true,
        'Concept 1 must be pre-fetched into cache upon session creation'
      );

      // 2. Generating Concept 1 consumes it and automatically triggers prefetch for Concept 2
      const q1 = await qblEngine.generateQuestion(session.topicName, sub, 1, false);
      assert.ok(q1.questionText);
      assert.strictEqual(
        qblEngine.hasPrefetchedQuestion(session.topicName, sub.id, 2, false),
        true,
        'Concept 2 must be automatically pre-fetched in the background while user reads Concept 1'
      );

      // 3. Generating Concept 2 consumes it and triggers prefetch for Concept 3
      const q2 = await qblEngine.generateQuestion(session.topicName, sub, 2, false);
      assert.ok(q2.questionText);
      assert.strictEqual(
        qblEngine.hasPrefetchedQuestion(session.topicName, sub.id, 3, false),
        true,
        'Concept 3 must be automatically pre-fetched while user reads Concept 2'
      );
    });

    it('pre-generates reinforcement drill immediately upon incorrect answer', async () => {
      const session = await qblEngine.createNewSession('Kafka & Event Streaming');
      const sub = session.subtopics[0];

      const q1 = await qblEngine.generateQuestion(session.topicName, sub, 1, false);
      const wrongOpt = q1.options.find((o) => !o.isCorrect)!;

      // Submit wrong answer
      await qblEngine.evaluateAnswer(session, sub, q1, wrongOpt.id);

      // Verify reinforcement question is now actively cached
      assert.strictEqual(
        qblEngine.hasPrefetchedQuestion(session.topicName, sub.id, 1, true),
        true,
        'Reinforcement drill for Concept 1 must be pre-fetched immediately upon wrong answer'
      );
    });

    it('pre-generates Concept 1 of the NEXT subtopic upon completing current subtopic', async () => {
      const session = await qblEngine.createNewSession('Kafka & Event Streaming');
      const sub1 = session.subtopics[0];
      const sub2 = session.subtopics[1];

      // Complete all 3 concepts of Subtopic 1
      for (let c = 1; c <= 3; c++) {
        const q = await qblEngine.generateQuestion(session.topicName, sub1, c, false);
        const correct = q.options.find((o) => o.isCorrect)!;
        await qblEngine.evaluateAnswer(session, sub1, q, correct.id);
      }

      assert.strictEqual(sub1.status, 'COMPLETED');

      // Verify Subtopic 2 Concept 1 was automatically pre-fetched into cache
      assert.strictEqual(
        qblEngine.hasPrefetchedQuestion(session.topicName, sub2.id, 1, false),
        true,
        'Next subtopic Concept 1 must be pre-fetched when previous subtopic completes'
      );
    });
  });

  describe('Optimization 2: Technical Subtopic Diversity (No Repetition)', () => {
    it('generates distinct, non-repeating technical questions across all 5 subtopics', async () => {
      const session = await qblEngine.createNewSession('Kafka & Event Streaming');
      assert.ok(session.subtopics.length >= 5);

      const concept1Questions: string[] = [];

      for (let i = 0; i < Math.min(session.subtopics.length, 5); i++) {
        const sub = session.subtopics[i];
        const q = await qblEngine.generateQuestion(session.topicName, sub, 1, false);
        assert.ok(q.questionText && q.questionText.length > 20);
        concept1Questions.push(q.questionText);
      }

      // Verify that all 5 subtopics have unique, distinct questions for Concept 1
      const uniqueQuestions = new Set(concept1Questions);
      assert.strictEqual(
        uniqueQuestions.size,
        concept1Questions.length,
        'Every subtopic must have a distinct, non-repeating question for Concept 1'
      );
    });
  });

  describe('Optimization 3: GBNF Grammar & Robust Schema Defense', () => {
    it('defines a valid token-level GBNF grammar for strict JSON schema compliance', () => {
      assert.ok(QBL_JSON_GBNF);
      assert.ok(QBL_JSON_GBNF.includes('root ::='));
      assert.ok(QBL_JSON_GBNF.includes('conceptTitle'));
      assert.ok(QBL_JSON_GBNF.includes('questionText'));
      assert.ok(QBL_JSON_GBNF.includes('optionsList'));
    });

    it('safely extracts and sanitizes questions even when wrapped in markdown fences or noise', () => {
      const rawWithFences = `\`\`\`json
{
  "conceptTitle": "Distributed Commit Invariants",
  "questionText": "Under two-phase commit, what prevents coordinator failure from blocking participants indefinitely?",
  "options": [
    { "id": "A", "text": "Three-phase commit with non-blocking timeouts.", "isCorrect": true, "explanation": "3PC adds a pre-commit state." },
    { "id": "B", "text": "Rebooting participant servers.", "isCorrect": false, "explanation": "Rebooting does not release locks." },
    { "id": "C", "text": "Disabling logs.", "isCorrect": false, "explanation": "Disabling logs breaks durability." },
    { "id": "D", "text": "Sending UDP packets.", "isCorrect": false, "explanation": "UDP lacks delivery guarantees." }
  ],
  "explanation": "3PC uses timeouts in pre-commit.",
  "coachingTip": "Always design for non-blocking fallbacks."
}
\`\`\``;

      // Access private method for testing via any cast
      const parsed = (qblEngine as any).parseAndValidateQuestionJSON(rawWithFences);
      assert.ok(parsed);
      assert.strictEqual(parsed.conceptTitle, 'Distributed Commit Invariants');
      assert.strictEqual(parsed.options.length, 4);
      assert.strictEqual(parsed.options[0].isCorrect, true);
    });
  });
});

