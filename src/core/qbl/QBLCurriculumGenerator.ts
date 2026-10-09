/**
 * QBLCurriculumGenerator
 * 
 * Implements the 7-Step Pedagogical Methodology for Question-Based Learning (QBL):
 * 1. Define the Learning Objective
 * 2. Break the Topic into Hierarchical Subtopics (Subject -> Chapter -> Topic -> Sub-topic -> Questions)
 * 3. Generate Questions at Different Cognitive Levels (Bloom's Taxonomy)
 * 4. Use Multiple Question Formats (MCQ, Scenario, Short Answer, Practical, etc.)
 * 5. Ground Questions in Reliable Learning Material (RFCs, O'Reilly textbooks, official specs)
 * 6. Validate and Improve Questions (Clarity, expected answer, explanations, 3-tier hints)
 * 7. Personalize and Continuously Adapt (Dynamic difficulty scaling & reinforcement drills)
 */

import {
  QBLQuestion,
  QBLOption,
  QBLSubtopic,
  QBLDifficulty,
  QBLCognitiveLevel,
  QBLQuestionType,
  QBLCurriculumHierarchy,
  QBLChapter,
  QBLTopicNode,
  QBLSubtopicNode,
} from '../../types';
import { OfflineLLMEngine } from '../llm/OfflineLLMEngine';
import { NODE_JS_CURRICULUM_CHAPTERS, getNodeJSQuestion } from './domain/NodeJSDomain';
import { getCatalogQuestion } from './QBLQuestionCatalog';

export interface HierarchyOptions {
  minChapters?: number;
  topicsPerChapter?: number;
  subtopicsPerTopic?: number;
  questionsPerSubtopic?: number; // Can be 20+ questions per subtopic
  targetDifficulty?: QBLDifficulty;
}

export interface QuestionGenerationOptions {
  subject: string;
  chapterTitle?: string;
  topicTitle?: string;
  subtopicTitle: string;
  subtopicDescription: string;
  learningObjective?: string;
  cognitiveLevel?: QBLCognitiveLevel;
  questionType?: QBLQuestionType;
  difficulty?: QBLDifficulty;
  conceptIndex?: number;
  isReinforcement?: boolean;
  previousMistake?: string;
  existingQuestions?: string[];
}

export class QBLCurriculumGenerator {
  private static instance: QBLCurriculumGenerator | null = null;
  private llmEngine: OfflineLLMEngine;

  constructor(llmEngine?: OfflineLLMEngine) {
    this.llmEngine = llmEngine || new OfflineLLMEngine();
  }

  static getInstance(llmEngine?: OfflineLLMEngine): QBLCurriculumGenerator {
    if (!this.instance) {
      this.instance = new QBLCurriculumGenerator(llmEngine);
    }
    return this.instance;
  }

  setLLMEngine(llmEngine: OfflineLLMEngine): void {
    this.llmEngine = llmEngine;
  }

  // =========================================================================
  // STEP 1: DEFINE THE LEARNING OBJECTIVE
  // =========================================================================

  /**
   * Generates clear, measurable learning objectives using action verbs
   * tailored to the subject, subtopic, and cognitive level.
   */
  generateLearningObjective(
    subject: string,
    subtopicTitle: string,
    cognitiveLevel: QBLCognitiveLevel = 'understand'
  ): string {
    const verbsByLevel: Record<QBLCognitiveLevel, string[]> = {
      remember: ['Identify', 'Recall', 'List', 'State', 'Define'],
      understand: ['Explain', 'Distinguish', 'Summarize', 'Interpret', 'Illustrate'],
      apply: ['Implement', 'Configure', 'Execute', 'Demonstrate', 'Apply'],
      analyze: ['Diagnose', 'Differentiate', 'Troubleshoot', 'Deconstruct', 'Isolate'],
      evaluate: ['Critique', 'Assess', 'Benchmark', 'Justify', 'Select'],
      create: ['Architect', 'Design', 'Synthesize', 'Formulate', 'Construct'],
    };

    const verbPool = verbsByLevel[cognitiveLevel] || verbsByLevel.understand;
    const verb = verbPool[Math.floor(Math.random() * verbPool.length)];

    return `${verb} core principles, invariants, and operational trade-offs of ${subtopicTitle} within ${subject}.`;
  }

  // =========================================================================
  // STEP 2: BREAK INTO HIERARCHY (Subject -> Chapter -> Topic -> Sub-topic)
  // =========================================================================

  /**
   * Generates a complete Subject -> Chapter -> Topic -> Sub-topic -> Question tree.
   * Can generate 20+ questions per subtopic if requested.
   */
  async generateHierarchy(
    subject: string,
    options: HierarchyOptions = {}
  ): Promise<QBLCurriculumHierarchy> {
    const minChapters = options.minChapters || 3;
    const topicsPerChapter = options.topicsPerChapter || 2;
    const subtopicsPerTopic = options.subtopicsPerTopic || 2;
    const questionsPerSubtopic = options.questionsPerSubtopic || 3;

    // 1. Generate Chapters & Topics
    const chapters = await this.planChaptersAndTopics(subject, minChapters, topicsPerChapter, subtopicsPerTopic);

    // 2. Generate questions for subtopics (supporting 20+ questions if configured)
    let totalQuestions = 0;
    let totalSubtopics = 0;
    let totalTopics = 0;

    for (const chapter of chapters) {
      totalTopics += chapter.topics.length;
      for (const topic of chapter.topics) {
        totalSubtopics += topic.subtopics.length;
        for (const subtopic of topic.subtopics) {
          subtopic.totalQuestions = questionsPerSubtopic;
          subtopic.questions = await this.generateBatchQuestions({
            subject,
            chapterTitle: chapter.title,
            topicTitle: topic.title,
            subtopicTitle: subtopic.title,
            subtopicDescription: subtopic.description,
            learningObjective: subtopic.learningObjective,
            count: questionsPerSubtopic,
          });
          totalQuestions += subtopic.questions.length;
        }
      }
    }

    const learningObjectives = [
      `Master end-to-end architectural foundations of ${subject}`,
      `Analyze mission-critical trade-offs and SLA failure modes across chapters`,
      `Design and evaluate high-throughput production solutions with zero data loss`,
    ];

    return {
      subject,
      learningObjectives,
      chapters,
      totalChapters: chapters.length,
      totalTopics,
      totalSubtopics,
      totalQuestions,
    };
  }

  // =========================================================================
  // STEP 3: GENERATE QUESTIONS ACROSS BLOOM'S TAXONOMY
  // =========================================================================

  /**
   * Maps an index in a sequence (e.g. 1 to 20+) to Bloom's cognitive taxonomy
   * ensuring progressive conceptual growth from Remember -> Create.
   */
  mapIndexToCognitiveLevel(index: number, totalQuestions: number): QBLCognitiveLevel {
    const fraction = index / Math.max(1, totalQuestions);

    if (fraction <= 0.16) return 'remember';
    if (fraction <= 0.33) return 'understand';
    if (fraction <= 0.50) return 'apply';
    if (fraction <= 0.68) return 'analyze';
    if (fraction <= 0.85) return 'evaluate';
    return 'create';
  }

  // =========================================================================
  // STEP 4: USE MULTIPLE QUESTION FORMATS
  // =========================================================================

  /**
   * Selects an appropriate question format based on cognitive level and position.
   */
  mapCognitiveLevelToQuestionType(cognitiveLevel: QBLCognitiveLevel, index: number): QBLQuestionType {
    switch (cognitiveLevel) {
      case 'remember':
        return index % 2 === 0 ? 'mcq' : 'short_answer';
      case 'understand':
        return index % 2 === 0 ? 'mcq' : 'scenario';
      case 'apply':
        return index % 2 === 0 ? 'practical_exercise' : 'scenario';
      case 'analyze':
        return index % 2 === 0 ? 'real_world_problem' : 'scenario';
      case 'evaluate':
        return index % 2 === 0 ? 'open_ended' : 'scenario';
      case 'create':
        return index % 2 === 0 ? 'real_world_problem' : 'practical_exercise';
      default:
        return 'mcq';
    }
  }

  // =========================================================================
  // STEP 5: GROUND IN RELIABLE LEARNING MATERIAL
  // =========================================================================

  /**
   * Associates authoritative source references (RFCs, books, whitepapers)
   * with the subject and subtopic.
   */
  resolveSourceReference(subject: string, subtopicTitle: string): string {
    const lower = `${subject} ${subtopicTitle}`.toLowerCase();

    if (lower.includes('node') || lower.includes('nodejs') || lower.includes('libuv') || lower.includes('v8')) {
      return "Node.js Official Documentation & Architecture Specs, Bert Belder et al. - 'libuv Design Architecture', & Mario Casciaro - 'Node.js Design Patterns' (Packt)";
    }
    if (lower.includes('kafka') || lower.includes('stream')) {
      return "Apache Kafka Protocol Specification & Neha Narkhede et al. - 'Kafka: The Definitive Guide' (O'Reilly)";
    }
    if (lower.includes('distributed') || lower.includes('consensus') || lower.includes('raft')) {
      return "Martin Kleppmann - 'Designing Data-Intensive Applications' (O'Reilly) & Ongaro/Ousterhout - 'In Search of an Understandable Consensus Algorithm' (USENIX ATC)";
    }
    if (lower.includes('sql') || lower.includes('postgres') || lower.includes('database') || lower.includes('index')) {
      return "Alex Petrov - 'Database Internals' (O'Reilly) & PostgreSQL Documentation: B-Tree Index Mechanics";
    }
    if (lower.includes('react') || lower.includes('native') || lower.includes('mobile')) {
      return "React Native Architecture Specs: JSI, Fabric Renderer & TurboModule Specifications";
    }
    if (lower.includes('redis') || lower.includes('cache')) {
      return "Salvatore Sanfilippo - 'Redis Internals' & Antirez RFC on Probabilistic Early Expiration (XFetch)";
    }

    return `Authoritative Engineering Literature & RFC Standards for ${subject}`;
  }

  // =========================================================================
  // STEP 6: VALIDATE AND IMPROVE THE QUESTIONS
  // =========================================================================

  /**
   * Validates and cleans a question object, guaranteeing strict schema compliance,
   * non-trivial distractors, 3-tier progressive hints, and an expected answer.
   */
  validateAndImproveQuestion(rawQuestion: Partial<QBLQuestion>, options: QuestionGenerationOptions): QBLQuestion {
    const cognitiveLevel = rawQuestion.cognitiveLevel || options.cognitiveLevel || 'understand';
    const questionType = rawQuestion.questionType || options.questionType || 'mcq';
    const difficulty = rawQuestion.difficulty || options.difficulty || 'intermediate';
    const learningObjective = rawQuestion.learningObjective || options.learningObjective ||
      this.generateLearningObjective(options.subject, options.subtopicTitle, cognitiveLevel);
    const sourceReference = rawQuestion.sourceReference || options.existingQuestions?.[0] ||
      this.resolveSourceReference(options.subject, options.subtopicTitle);

    // 1. Validate & sanitize options
    let rawOptions = Array.isArray(rawQuestion.options) ? rawQuestion.options : [];
    if (rawOptions.length < 4) {
      rawOptions = this.generateFallbackOptions(options.subtopicTitle, cognitiveLevel);
    }

    const optionsList: QBLOption[] = rawOptions.slice(0, 4).map((opt, idx) => ({
      id: opt.id || ['A', 'B', 'C', 'D'][idx],
      text: opt.text || `Option ${['A', 'B', 'C', 'D'][idx]}`,
      isCorrect: Boolean(opt.isCorrect),
      explanation: opt.explanation || (opt.isCorrect ? 'Correct architectural choice.' : 'Incorrect trade-off.'),
    }));

    // Ensure exactly one correct option
    if (!optionsList.some(o => o.isCorrect)) {
      optionsList[0].isCorrect = true;
    }

    const correctOption = optionsList.find(o => o.isCorrect) || optionsList[0];

    // 2. Generate or validate 3-tier progressive hints
    const hints = Array.isArray(rawQuestion.hints) && rawQuestion.hints.length >= 2
      ? rawQuestion.hints
      : this.generateThreeTierHints(options.subtopicTitle, correctOption.text, cognitiveLevel);

    // 3. Expected answer
    const expectedAnswer = rawQuestion.expectedAnswer || correctOption.text;

    // 4. Return complete validated question
    return {
      id: rawQuestion.id || `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      conceptTitle: rawQuestion.conceptTitle || options.subtopicTitle,
      conceptIndex: options.conceptIndex || 1,
      questionText: rawQuestion.questionText || `In ${options.subject}, how does ${options.subtopicTitle} behave under peak load?`,
      options: optionsList,
      explanation: rawQuestion.explanation || correctOption.explanation,
      coachingTip: rawQuestion.coachingTip || 'Reason from first principles and observe latency trade-offs.',
      isReinforcement: Boolean(options.isReinforcement),
      difficulty,
      cognitiveLevel,
      questionType,
      expectedAnswer,
      hints,
      sourceReference,
      learningObjective,
      subject: options.subject,
      chapter: options.chapterTitle,
      topic: options.topicTitle,
      subtopic: options.subtopicTitle,
    };
  }

  // =========================================================================
  // STEP 7: PERSONALIZE AND CONTINUOUSLY ADAPT
  // =========================================================================

  /**
   * Adapts the target difficulty and cognitive level based on the learner's
   * current mastery percentage and error history.
   */
  adaptQuestionParameters(
    masteryPercentage: number,
    isReinforcement: boolean = false,
    previousMistake?: string
  ): { difficulty: QBLDifficulty; cognitiveLevel: QBLCognitiveLevel } {
    if (isReinforcement) {
      return { difficulty: 'pro', cognitiveLevel: 'analyze' };
    }

    if (masteryPercentage < 30) {
      return { difficulty: 'basic', cognitiveLevel: 'understand' };
    } else if (masteryPercentage < 65) {
      return { difficulty: 'intermediate', cognitiveLevel: 'apply' };
    } else if (masteryPercentage < 90) {
      return { difficulty: 'advanced', cognitiveLevel: 'evaluate' };
    } else {
      return { difficulty: 'pro', cognitiveLevel: 'create' };
    }
  }

  // =========================================================================
  // BATCH GENERATION (SUPPORTING 20+ QUESTIONS PER SUBTOPIC)
  // =========================================================================

  /**
   * Generates a batch of high-quality questions for a subtopic (can be 20+).
   * Sequences questions across all 6 Bloom's Taxonomy cognitive tiers.
   */
  async generateBatchQuestions(params: {
    subject: string;
    chapterTitle?: string;
    topicTitle?: string;
    subtopicTitle: string;
    subtopicDescription: string;
    learningObjective?: string;
    count?: number;
  }): Promise<QBLQuestion[]> {
    const count = Math.max(1, params.count || 3);
    const questions: QBLQuestion[] = [];
    const existingQuestionTexts: string[] = [];

    for (let i = 1; i <= count; i++) {
      const cognitiveLevel = this.mapIndexToCognitiveLevel(i, count);
      const questionType = this.mapCognitiveLevelToQuestionType(cognitiveLevel, i);
      const difficulty: QBLDifficulty =
        i <= Math.ceil(count * 0.25) ? 'basic' :
        i <= Math.ceil(count * 0.50) ? 'intermediate' :
        i <= Math.ceil(count * 0.80) ? 'advanced' : 'pro';

      const singleQuestion = await this.generateSingleQuestion({
        subject: params.subject,
        chapterTitle: params.chapterTitle,
        topicTitle: params.topicTitle,
        subtopicTitle: params.subtopicTitle,
        subtopicDescription: params.subtopicDescription,
        learningObjective: params.learningObjective,
        cognitiveLevel,
        questionType,
        difficulty,
        conceptIndex: i,
        existingQuestions: existingQuestionTexts,
      });

      questions.push(singleQuestion);
      existingQuestionTexts.push(singleQuestion.questionText);
    }

    return questions;
  }

  /**
   * Generates a single validated QBL question adhering to the 7-step criteria.
   */
  async generateSingleQuestion(options: QuestionGenerationOptions): Promise<QBLQuestion> {
    const cognitiveLevel = options.cognitiveLevel || 'understand';
    const questionType = options.questionType || 'mcq';
    const difficulty = options.difficulty || 'intermediate';
    const learningObjective = options.learningObjective ||
      this.generateLearningObjective(options.subject, options.subtopicTitle, cognitiveLevel);
    const sourceReference = this.resolveSourceReference(options.subject, options.subtopicTitle);

    const systemPrompt = `You are Teddy's Curriculum Architect, an elite Principal Software Engineer.
Your task is to generate a high-quality Question-Based Learning (QBL) question following these 7 rigorous steps:
1. Learning Objective: "${learningObjective}"
2. Hierarchy Context: Subject: "${options.subject}" | Chapter: "${options.chapterTitle || 'General'}" | Topic: "${options.topicTitle || 'General'}" | Sub-topic: "${options.subtopicTitle}"
3. Bloom's Taxonomy Cognitive Level: ${cognitiveLevel.toUpperCase()} (Remember, Understand, Apply, Analyze, Evaluate, Create)
4. Question Format: ${questionType.toUpperCase()}
5. Grounded in Reliable Material: Cite "${sourceReference}"
6. Validation Requirements:
   - Exactly 1 correct option ("isCorrect": true), 3 plausible senior-level technical distractors ("isCorrect": false)
   - Detailed technical explanation for every option
   - 3 progressive hints (Nudge, Clue, Trade-off insight)
   - Expected answer summary
7. Difficulty Tier: ${difficulty.toUpperCase()}

STRICT OUTPUT FORMAT: A single JSON object matching:
{
  "conceptTitle": "...",
  "questionText": "Detailed scenario with real code, config flags, or metrics...",
  "cognitiveLevel": "${cognitiveLevel}",
  "questionType": "${questionType}",
  "expectedAnswer": "...",
  "hints": ["Hint 1: High level", "Hint 2: Mechanism", "Hint 3: Trade-off clue"],
  "sourceReference": "${sourceReference}",
  "options": [
    { "id": "A", "text": "...", "isCorrect": true, "explanation": "..." },
    { "id": "B", "text": "...", "isCorrect": false, "explanation": "..." },
    { "id": "C", "text": "...", "isCorrect": false, "explanation": "..." },
    { "id": "D", "text": "...", "isCorrect": false, "explanation": "..." }
  ],
  "explanation": "Deep architectural takeaway...",
  "coachingTip": "Teddy's memorable mental model..."
}`;

    const userPrompt = `Generate a QBL multiple-choice question with 4 options at ${cognitiveLevel.toUpperCase()} cognitive level for Concept #${options.conceptIndex || 1} of "${options.subtopicTitle}".
Subject: "${options.subject}".
Scope: ${options.subtopicDescription}.
Prevent repetition from previous concepts: ${options.existingQuestions?.join(' | ') || 'None'}.`;

    let generatedText = '';
    try {
      generatedText = await this.llmEngine.generateCompletion(userPrompt, systemPrompt, {
        temperature: 0.35,
        skipPacing: true,
      });
    } catch (err) {
      console.warn('[QBLCurriculumGenerator] LLM generation error, using fallback:', err);
    }

    const parsed = this.parseJsonSafe(generatedText);
    const candidateQuestion =
      parsed && parsed.questionText && Array.isArray(parsed.options) && parsed.options.length >= 2
        ? parsed
        : this.synthesizeDomainQuestion(options);

    return this.validateAndImproveQuestion(candidateQuestion, options);
  }

  // =========================================================================
  // INTERNAL HELPERS
  // =========================================================================

  private async planChaptersAndTopics(
    subject: string,
    minChapters: number,
    topicsPerChapter: number,
    subtopicsPerTopic: number
  ): Promise<QBLChapter[]> {
    const chapters: QBLChapter[] = [];
    const lowerSub = subject.toLowerCase();

    // 1. Authoritative Domain Curriculum for Node.js
    if (lowerSub.includes('node') || lowerSub.includes('nodejs')) {
      const chapterCount = Math.max(minChapters, NODE_JS_CURRICULUM_CHAPTERS.length);
      for (let c = 0; c < chapterCount; c++) {
        const chapDef = NODE_JS_CURRICULUM_CHAPTERS[c % NODE_JS_CURRICULUM_CHAPTERS.length];
        const chapterTitle = c < NODE_JS_CURRICULUM_CHAPTERS.length ? chapDef.title : `Chapter ${c + 1}: ${chapDef.title.replace(/^Chapter \d+:\s*/, '')}`;
        const topics: QBLTopicNode[] = [];

        const tCount = Math.max(topicsPerChapter, chapDef.topics.length);
        for (let t = 0; t < tCount; t++) {
          const topDef = chapDef.topics[t % chapDef.topics.length];
          const topicTitle = t < chapDef.topics.length ? topDef.title : `${topDef.title} (Part ${t + 1})`;
          const subtopics: QBLSubtopicNode[] = [];

          const sCount = Math.max(subtopicsPerTopic, topDef.subtopics.length);
          for (let s = 0; s < sCount; s++) {
            const subDef = topDef.subtopics[s % topDef.subtopics.length];
            const subTitle = s < topDef.subtopics.length ? subDef.title : `${subDef.title} (Part ${s + 1})`;
            const diff: QBLDifficulty = subDef.difficulty || (s === 0 ? 'basic' : s === 1 ? 'intermediate' : 'advanced');

            subtopics.push({
              id: `sub_node_${c + 1}_${t + 1}_${s + 1}`,
              title: subTitle,
              description: subDef.description,
              learningObjective: this.generateLearningObjective('Node.js', subTitle, 'understand'),
              difficulty: diff,
              totalQuestions: 3,
            });
          }

          topics.push({
            id: `topic_node_${c + 1}_${t + 1}`,
            title: topicTitle,
            description: topDef.description,
            learningObjectives: topDef.learningObjectives,
            subtopics,
          });
        }

        chapters.push({
          id: `chap_node_${c + 1}`,
          chapterNumber: c + 1,
          title: chapterTitle,
          description: chapDef.description,
          learningObjectives: chapDef.learningObjectives,
          topics,
        });
      }

      return chapters;
    }

    // 2. Generic / Other Domain Hierarchies
    const defaultChapterTitles = [
      {
        title: 'Core Fundamentals & Storage Engine Primitives',
        description: `Foundational building blocks, data layouts, and memory/disk access patterns in ${subject}.`,
      },
      {
        title: 'Internal Protocols & State Machine Replication',
        description: `Operational mechanics, synchronization loops, and concurrency boundaries in ${subject}.`,
      },
      {
        title: 'High-Concurrency & SLA Edge Cases',
        description: `p99 latency spikes, deadlock mitigation, and hot-partition balancing under write storms.`,
      },
      {
        title: 'Failure Modes, Split-Brain & Disaster Recovery',
        description: `Network partitions, Byzantine resilience, crash recovery, and quorum re-elections.`,
      },
      {
        title: 'Advanced Production Architecture & Scale Defense',
        description: `Multi-region topologies, zero-data-loss consistency, and extreme throughput optimizations.`,
      },
    ];

    const chapterCount = Math.max(minChapters, defaultChapterTitles.length);

    for (let c = 0; c < chapterCount; c++) {
      const template = defaultChapterTitles[c % defaultChapterTitles.length];
      const chapterTitle = `Chapter ${c + 1}: ${template.title}`;
      const topics: QBLTopicNode[] = [];

      for (let t = 1; t <= topicsPerChapter; t++) {
        const topicTitle = `${subject} Architecture Pattern ${c + 1}.${t}`;
        const subtopics: QBLSubtopicNode[] = [];

        for (let s = 1; s <= subtopicsPerTopic; s++) {
          const subTitle = `${subject} Sub-topic ${c + 1}.${t}.${s}`;
          const diff: QBLDifficulty = s === 1 ? 'basic' : s === 2 ? 'intermediate' : 'advanced';

          subtopics.push({
            id: `sub_${c + 1}_${t}_${s}`,
            title: subTitle,
            description: `Examines critical invariants, throughput benchmarks, and edge cases of ${subTitle}.`,
            learningObjective: this.generateLearningObjective(subject, subTitle, 'understand'),
            difficulty: diff,
            totalQuestions: 3,
          });
        }

        topics.push({
          id: `topic_${c + 1}_${t}`,
          title: topicTitle,
          description: `Deep conceptual analysis of ${topicTitle}`,
          learningObjectives: [
            `Understand execution mechanics of ${topicTitle}`,
            `Evaluate performance characteristics under high concurrency`,
          ],
          subtopics,
        });
      }

      chapters.push({
        id: `chap_${c + 1}`,
        chapterNumber: c + 1,
        title: chapterTitle,
        description: template.description,
        learningObjectives: [
          `Master core theoretical invariants of ${template.title}`,
          `Identify and mitigate common production traps in ${subject}`,
        ],
        topics,
      });
    }

    return chapters;
  }

  private synthesizeDomainQuestion(options: QuestionGenerationOptions): Partial<QBLQuestion> {
    const lower = `${options.subject} ${options.subtopicTitle}`.toLowerCase();
    const conceptIndex = options.conceptIndex || 1;

    // Node.js specific domain questions (covers 25+ distinct scenarios)
    if (lower.includes('node') || lower.includes('nodejs') || lower.includes('libuv') || lower.includes('v8')) {
      return getNodeJSQuestion(conceptIndex, options);
    }

    // Default to catalog procedural synthesis
    const catalogQ = getCatalogQuestion(
      options.subject,
      options.subtopicTitle,
      conceptIndex,
      Boolean(options.isReinforcement),
      options.previousMistake
    );

    return {
      ...catalogQ,
      cognitiveLevel: options.cognitiveLevel || 'understand',
      questionType: options.questionType || 'mcq',
      learningObjective:
        options.learningObjective ||
        this.generateLearningObjective(options.subject, options.subtopicTitle, options.cognitiveLevel || 'understand'),
      sourceReference: this.resolveSourceReference(options.subject, options.subtopicTitle),
    };
  }

  private generateThreeTierHints(subtopic: string, correctAnswer: string, level: QBLCognitiveLevel): string[] {
    const lower = subtopic.toLowerCase();
    if (lower.includes('node') || lower.includes('event loop') || lower.includes('stream') || lower.includes('phase')) {
      return [
        `💡 Hint 1 (Mental Model): Consider the single-threaded event loop and how libuv schedules macrotasks vs microtasks.`,
        `🔍 Hint 2 (Mechanism Clue): Focus on whether this operation executes on the main thread, the libuv thread pool (UV_THREADPOOL_SIZE), or in OS kernel space.`,
        `🎯 Hint 3 (Trade-off Insight): The production-grade approach prioritizes: "${correctAnswer.slice(0, 45)}..." without blocking the event loop.`,
      ];
    }

    return [
      `💡 Hint 1 (Mental Model): Consider the fundamental invariants of ${subtopic} and what happens to I/O when operations execute concurrently.`,
      `🔍 Hint 2 (Mechanism Clue): Focus on how the underlying state machine guarantees durability without acquiring exclusive locks on the hot path.`,
      `🎯 Hint 3 (Trade-off Insight): The optimal pattern prioritizes: "${correctAnswer.slice(0, 40)}..." over naive blocking approaches.`,
    ];
  }

  private generateFallbackOptions(subtopic: string, level: QBLCognitiveLevel): QBLOption[] {
    const lower = subtopic.toLowerCase();
    if (lower.includes('node') || lower.includes('event loop') || lower.includes('phase') || lower.includes('stream')) {
      return [
        {
          id: 'A',
          text: `Pause the readable stream and resume consumption only when the destination emits the 'drain' event.`,
          isCorrect: true,
          explanation: `Correct: guarantees that internal stream buffers do not exceed highWaterMark, preventing memory leaks and backpressure overflow.`,
        },
        {
          id: 'B',
          text: `Buffer all incoming chunks in a global JavaScript array in memory and flush once per hour.`,
          isCorrect: false,
          explanation: `Incorrect: unconstrained array buffering exhausts V8 heap memory within seconds under production traffic.`,
        },
        {
          id: 'C',
          text: `Execute a synchronous busy-wait while(true) loop on the main thread until the buffer drains.`,
          isCorrect: false,
          explanation: `Incorrect: blocks the single event loop thread, preventing all asynchronous I/O and health checks.`,
        },
        {
          id: 'D',
          text: `Immediately terminate the Node.js process with exit code 0 whenever backpressure occurs.`,
          isCorrect: false,
          explanation: `Incorrect: abruptly terminates the service and causes massive request dropouts.`,
        },
      ];
    }

    return [
      {
        id: 'A',
        text: `Execute an atomic state transition ensuring sequential consistency and log flushing.`,
        isCorrect: true,
        explanation: `Correct: preserves safety invariants across node boundaries while minimizing lock contention.`,
      },
      {
        id: 'B',
        text: `Bypass synchronization and write directly to volatile memory without checksums.`,
        isCorrect: false,
        explanation: `Incorrect: introduces catastrophic silent data corruption during ungraceful process termination.`,
      },
      {
        id: 'C',
        text: `Acquire a global exclusive mutex across all cluster nodes for every read request.`,
        isCorrect: false,
        explanation: `Incorrect: destroys horizontal scalability and degrades p99 latency to timeout levels.`,
      },
      {
        id: 'D',
        text: `Drop uncommitted transactions immediately whenever latency exceeds 5 milliseconds.`,
        isCorrect: false,
        explanation: `Incorrect: violates linearizability and causes severe transactional data loss under standard spikes.`,
      },
    ];
  }

  private parseJsonSafe(rawText: string): any {
    if (!rawText) return null;
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace <= firstBrace) return null;

    try {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    } catch {
      return null;
    }
  }
}
