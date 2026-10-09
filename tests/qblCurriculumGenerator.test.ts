/**
 * QBL Curriculum Generator & 7-Step Pedagogical Methodology Test Suite
 * 
 * Verifies:
 * 1. Step 1: Learning Objective Definition
 * 2. Step 2: Subject -> Chapter -> Topic -> Sub-topic Hierarchy
 * 3. Step 3: Bloom's Taxonomy Cognitive Level Progression (Remember -> Create)
 * 4. Step 4: Multiple Question Formats (MCQ, Scenario, Practical, etc.)
 * 5. Step 5: Reliable Source Grounding (RFCs, O'Reilly textbooks, official specs)
 * 6. Step 6: Question Validation, Expected Answer & 3-Tier Progressive Hints
 * 7. Step 7: Personalization & Dynamic Difficulty Adaptation
 * 8. 20+ Questions per Subtopic Batch Generation
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { QBLCurriculumGenerator } from '../src/core/qbl/QBLCurriculumGenerator';
import { OfflineLLMEngine } from '../src/core/llm/OfflineLLMEngine';
import { QBLEngine } from '../src/core/qbl/QBLEngine';

describe('7-Step QBL Curriculum & Question Generator', () => {
  let generator: QBLCurriculumGenerator;
  let llmEngine: OfflineLLMEngine;

  beforeEach(() => {
    llmEngine = new OfflineLLMEngine();
    generator = new QBLCurriculumGenerator(llmEngine);
  });

  describe('Step 1: Define Learning Objectives', () => {
    it('generates actionable learning objectives across different Bloom levels', () => {
      const objRemember = generator.generateLearningObjective('Kafka & Event Streaming', 'Partition ISR Quorum', 'remember');
      assert.ok(objRemember.length > 20);
      assert.ok(objRemember.includes('Partition ISR Quorum'));
      assert.ok(objRemember.includes('Kafka & Event Streaming'));

      const objCreate = generator.generateLearningObjective('Distributed Systems', 'Raft Consensus', 'create');
      assert.ok(objCreate.length > 20);
      assert.ok(objCreate.includes('Raft Consensus'));
    });
  });

  describe('Step 2: Subject -> Chapter -> Topic -> Sub-topic Hierarchy', () => {
    it('generates a comprehensive hierarchy with chapters, topics, subtopics and questions', async () => {
      const hierarchy = await generator.generateHierarchy('Distributed Systems', {
        minChapters: 3,
        topicsPerChapter: 2,
        subtopicsPerTopic: 2,
        questionsPerSubtopic: 3,
      });

      assert.strictEqual(hierarchy.subject, 'Distributed Systems');
      assert.ok(hierarchy.totalChapters >= 3);
      assert.ok(hierarchy.totalTopics >= 6);
      assert.ok(hierarchy.totalSubtopics >= 12);
      assert.ok(hierarchy.totalQuestions >= 36);

      // Verify Chapter structure
      const chapter1 = hierarchy.chapters[0];
      assert.ok(chapter1.title.startsWith('Chapter 1'));
      assert.ok(chapter1.topics.length >= 2);
      assert.ok(chapter1.learningObjectives.length >= 2);

      // Verify Topic & Subtopic structure
      const topic1 = chapter1.topics[0];
      assert.ok(topic1.subtopics.length >= 2);
      const subtopic1 = topic1.subtopics[0];
      assert.ok(subtopic1.learningObjective.length > 10);
      assert.strictEqual(subtopic1.questions?.length, 3);

      // Verify Question attributes
      const q = subtopic1.questions[0];
      assert.ok(q.id);
      assert.ok(q.questionText);
      assert.strictEqual(q.options.length, 4);
      assert.ok(q.cognitiveLevel);
      assert.ok(q.questionType);
      assert.ok(q.expectedAnswer);
      assert.ok(q.sourceReference);
      assert.ok(Array.isArray(q.hints) && q.hints.length >= 2);
    });
  });

  describe('Step 3: Bloom’s Taxonomy Cognitive Levels', () => {
    it('progresses smoothly through all 6 Bloom levels across a question sequence', () => {
      const total = 20;
      const levels = Array.from({ length: total }, (_, i) => generator.mapIndexToCognitiveLevel(i + 1, total));

      assert.strictEqual(levels[0], 'remember');
      assert.strictEqual(levels[2], 'remember');
      assert.strictEqual(levels[3], 'understand');
      assert.strictEqual(levels[7], 'apply');
      assert.strictEqual(levels[12], 'analyze');
      assert.strictEqual(levels[16], 'evaluate');
      assert.strictEqual(levels[19], 'create');
    });
  });

  describe('Step 4: Multiple Question Formats', () => {
    it('maps cognitive levels to appropriate question formats', () => {
      assert.strictEqual(generator.mapCognitiveLevelToQuestionType('remember', 2), 'mcq');
      assert.strictEqual(generator.mapCognitiveLevelToQuestionType('remember', 1), 'short_answer');
      assert.strictEqual(generator.mapCognitiveLevelToQuestionType('apply', 2), 'practical_exercise');
      assert.strictEqual(generator.mapCognitiveLevelToQuestionType('analyze', 2), 'real_world_problem');
      assert.strictEqual(generator.mapCognitiveLevelToQuestionType('evaluate', 2), 'open_ended');
      assert.strictEqual(generator.mapCognitiveLevelToQuestionType('create', 2), 'real_world_problem');
    });
  });

  describe('Step 5: Reliable Source Material Grounding', () => {
    it('resolves authoritative engineering references and RFCs', () => {
      const kafkaRef = generator.resolveSourceReference('Kafka', 'ISR Replication');
      assert.ok(kafkaRef.includes('Kafka: The Definitive Guide') || kafkaRef.includes('Apache Kafka'));

      const distRef = generator.resolveSourceReference('Distributed Systems', 'Raft Consensus');
      assert.ok(distRef.includes('Designing Data-Intensive Applications') || distRef.includes('Consensus'));

      const sqlRef = generator.resolveSourceReference('SQL', 'B-Tree Indexing');
      assert.ok(sqlRef.includes('Database Internals') || sqlRef.includes('PostgreSQL'));
    });
  });

  describe('Step 6: Validation, Expected Answer & 3-Tier Progressive Hints', () => {
    it('validates questions, ensuring 4 options, expected answer and 3-tier hints', () => {
      const validated = generator.validateAndImproveQuestion(
        {
          conceptTitle: 'Raft Log Invariants',
          questionText: 'How does Raft ensure committed entries are never overwritten?',
        },
        {
          subject: 'Distributed Systems',
          subtopicTitle: 'Raft Invariants',
          subtopicDescription: 'Leader completeness and log matching property',
          cognitiveLevel: 'analyze',
          difficulty: 'advanced',
        }
      );

      assert.strictEqual(validated.options.length, 4);
      assert.strictEqual(validated.options.filter(o => o.isCorrect).length, 1);
      assert.ok(validated.expectedAnswer && validated.expectedAnswer.length > 5);
      assert.strictEqual(validated.hints?.length, 3);
      assert.ok(validated.hints[0].includes('Hint 1'));
      assert.ok(validated.hints[1].includes('Hint 2'));
      assert.ok(validated.hints[2].includes('Hint 3'));
      assert.ok(validated.sourceReference?.length);
      assert.strictEqual(validated.cognitiveLevel, 'analyze');
      assert.strictEqual(validated.difficulty, 'advanced');
    });
  });

  describe('Step 7: Personalize and Continuously Adapt', () => {
    it('adapts difficulty and cognitive tier based on learner mastery and error history', () => {
      // Beginner / low mastery
      const beginner = generator.adaptQuestionParameters(20, false);
      assert.strictEqual(beginner.difficulty, 'basic');
      assert.strictEqual(beginner.cognitiveLevel, 'understand');

      // Intermediate mastery
      const intermediate = generator.adaptQuestionParameters(50, false);
      assert.strictEqual(intermediate.difficulty, 'intermediate');
      assert.strictEqual(intermediate.cognitiveLevel, 'apply');

      // High mastery
      const advanced = generator.adaptQuestionParameters(85, false);
      assert.strictEqual(advanced.difficulty, 'advanced');
      assert.strictEqual(advanced.cognitiveLevel, 'evaluate');

      // Reinforcement drill on error
      const reinforcement = generator.adaptQuestionParameters(50, true, 'Violated linearizability');
      assert.strictEqual(reinforcement.difficulty, 'pro');
      assert.strictEqual(reinforcement.cognitiveLevel, 'analyze');
    });
  });

  describe('20+ Questions per Subtopic Batch Generation', () => {
    it('generates 20+ questions for a single subtopic covering all Bloom cognitive tiers', async () => {
      const questions = await generator.generateBatchQuestions({
        subject: 'Database Internals',
        subtopicTitle: 'WAL & Checkpointing',
        subtopicDescription: 'Write-ahead log buffer flushing, ARIES recovery, and fuzzy checkpoints',
        count: 20,
      });

      assert.strictEqual(questions.length, 20);

      // Verify cognitive diversity across the 20 questions
      const cognitiveLevels = new Set(questions.map(q => q.cognitiveLevel));
      assert.ok(cognitiveLevels.has('remember'));
      assert.ok(cognitiveLevels.has('understand'));
      assert.ok(cognitiveLevels.has('apply'));
      assert.ok(cognitiveLevels.has('analyze'));
      assert.ok(cognitiveLevels.has('evaluate'));
      assert.ok(cognitiveLevels.has('create'));

      // Verify every question has options, hints, and expected answers
      questions.forEach((q, i) => {
        assert.strictEqual(q.options.length, 4, `Question ${i + 1} must have 4 options`);
        assert.ok(q.expectedAnswer, `Question ${i + 1} must have an expected answer`);
        assert.ok(q.hints && q.hints.length >= 2, `Question ${i + 1} must have progressive hints`);
        assert.ok(q.sourceReference, `Question ${i + 1} must cite source material`);
      });
    });
  });

  describe('Integration with QBLEngine', () => {
    it('qblEngine produces 7-step pedagogical questions with hints and cognitive levels', async () => {
      const qbl = new QBLEngine(llmEngine);
      const subtopics = await qbl.planSubtopics('Kafka & Event Streaming');
      const question = await qbl.generateQuestion('Kafka & Event Streaming', subtopics[0], 1, false);

      assert.ok(question.cognitiveLevel, 'Question must have cognitiveLevel');
      assert.ok(question.questionType, 'Question must have questionType');
      assert.ok(question.expectedAnswer, 'Question must have expectedAnswer');
      assert.ok(question.hints && question.hints.length >= 2, 'Question must have hints');
      assert.ok(question.sourceReference, 'Question must have sourceReference');
      assert.ok(question.learningObjective, 'Question must have learningObjective');
    });

    it('qblEngine supports generateCurriculumHierarchy and batch questions', async () => {
      const qbl = new QBLEngine(llmEngine);
      const hierarchy = await qbl.generateCurriculumHierarchy('React Native Architecture', {
        minChapters: 2,
        topicsPerChapter: 1,
        subtopicsPerTopic: 1,
        questionsPerSubtopic: 2,
      });

      assert.ok(hierarchy.chapters.length >= 2);
      assert.ok(hierarchy.totalQuestions >= 4);

      const batch = await qbl.generateSubtopicBatchQuestions(
        'React Native Architecture',
        'JSI Host Objects',
        'Synchronous C++ bindings without JSON serialization',
        5
      );
      assert.strictEqual(batch.length, 5);
      assert.ok(batch[0].hints);
    });
  });
});
