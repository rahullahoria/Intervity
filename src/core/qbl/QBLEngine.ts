/**
 * Question-Driven Learning (QBL) Engine
 * 
 * Implements:
 * 1. Sub-topic Planning (5+ comprehensive masterclass sub-topics)
 * 2. Question-Based Learning Loop (Multiple Choice: A, B, C, D)
 * 3. 100% Mastery Gate (3 mastered concepts per subtopic)
 * 4. Error Diagnostics: Explains WHY chosen option is wrong & what the correct answer is
 * 5. Teddy Emotional Reactions: celebrating, puzzled, thinking, speaking
 * 6. Reinforcement questions on failed concepts until 100% mastery is achieved
 */

import { OfflineLLMEngine, QBL_JSON_GBNF } from '../llm/OfflineLLMEngine';
import { IQBLRepository, QBLStorageManager } from '../../database';
import {
  QBLSession,
  QBLSubtopic,
  QBLQuestion,
  QBLOption,
  QBLTurnResult,
  QBLDifficulty,
  QBLMistakeReviewItem,
  QBLCurriculumHierarchy,
} from '../../types';
import { getCatalogQuestion } from './QBLQuestionCatalog';
import { QBLCurriculumGenerator, HierarchyOptions } from './QBLCurriculumGenerator';

export class QBLEngine {
  private llmEngine: OfflineLLMEngine;
  private repository: IQBLRepository;
  private prefetchCache: Map<string, Promise<QBLQuestion>> = new Map();

  constructor(
    llmEngine?: OfflineLLMEngine,
    repository?: IQBLRepository
  ) {
    this.llmEngine = llmEngine || new OfflineLLMEngine();
    this.repository = repository || new QBLStorageManager();
  }

  setLLMEngine(engine: OfflineLLMEngine): void {
    this.llmEngine = engine;
  }

  getRepository(): IQBLRepository {
    return this.repository;
  }

  /**
   * Generates a deterministic cache key for pre-generated questions
   */
  getPrefetchKey(topicName: string, subtopicId: string, conceptIndex: number, isReinforcement: boolean): string {
    return `${topicName.trim().toLowerCase()}_${subtopicId}_c${conceptIndex}_r${isReinforcement ? 1 : 0}`;
  }

  /**
   * Clears the background prefetch cache
   */
  clearPrefetchCache(): void {
    this.prefetchCache.clear();
  }

  /**
   * Checks whether a question is already pre-generated or actively in flight
   */
  hasPrefetchedQuestion(topicName: string, subtopicId: string, conceptIndex: number, isReinforcement: boolean = false): boolean {
    const key = this.getPrefetchKey(topicName, subtopicId, conceptIndex, isReinforcement);
    return this.prefetchCache.has(key);
  }

  /**
   * Optimization 1: Pipelined Background Pre-generation
   * Asynchronously generates a question in the background and caches the Promise.
   * When the candidate reaches this question, resolution latency is 0ms.
   */
  prefetchQuestion(
    topicName: string,
    subtopic: QBLSubtopic,
    conceptIndex: number,
    isReinforcement: boolean = false,
    previousMistake?: string
  ): Promise<QBLQuestion> {
    const key = this.getPrefetchKey(topicName, subtopic.id, conceptIndex, isReinforcement);
    if (this.prefetchCache.has(key)) {
      return this.prefetchCache.get(key)!;
    }

    const promise = this.generateQuestionInternal(
      topicName,
      subtopic,
      conceptIndex,
      isReinforcement,
      previousMistake
    ).catch((err) => {
      console.warn('[QBLEngine] Prefetch failed, using fallback catalog:', err);
      return this.getDefaultQuestion(topicName, subtopic, conceptIndex, isReinforcement, previousMistake);
    });

    this.prefetchCache.set(key, promise);
    return promise;
  }

  /**
   * Plans 5+ comprehensive sub-topics for any skill or topic.
   */
  async planSubtopics(topicName: string): Promise<QBLSubtopic[]> {
    const cleanTopic = topicName.trim();
    const systemPrompt = `You are Teddy's Curriculum Planner, an elite engineering mentor.
Your task is to break down the user's skill/topic into 5 or more logically ordered, comprehensive sub-topics for Question-Driven Learning (QBL).
Output MUST be strictly a JSON array of objects with keys:
- "id": string (e.g. "sub_1", "sub_2")
- "title": string (engaging, specific title)
- "description": string (clear summary of concepts covered)

Do not output any markdown headers or commentary outside the JSON array.`;

    const userPrompt = `Plan 5 or more comprehensive sub-topics to master: "${cleanTopic}".`;

    let generatedText = '';
    try {
      generatedText = await this.llmEngine.generateCompletion(userPrompt, systemPrompt);
    } catch (err) {
      console.warn('[QBLEngine] LLM planSubtopics error, using fallback:', err);
    }

    let parsedSubtopics: Array<{ id?: string; title: string; description: string }> = [];

    if (generatedText) {
      try {
        const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          parsedSubtopics = JSON.parse(jsonMatch[0]);
        }
      } catch (parseErr) {
        console.warn('[QBLEngine] Failed to parse LLM subtopic JSON:', parseErr);
      }
    }

    // If fewer than 5 subtopics parsed, build / supplement to ensure 5+ comprehensive subtopics
    if (!parsedSubtopics || parsedSubtopics.length < 5) {
      parsedSubtopics = this.getDefaultCurriculum(cleanTopic);
    }

    return parsedSubtopics.map((item, index) => {
      const difficulty: QBLDifficulty =
        index === 0 ? 'basic' : index === 1 ? 'intermediate' : index === 2 ? 'advanced' : 'pro';
      return {
        id: item.id || `sub_${index + 1}`,
        title: item.title,
        description: item.description,
        conceptsMastered: 0,
        totalConcepts: 3,
        masteryPercentage: 0,
        status: index === 0 ? 'IN_PROGRESS' : 'PENDING',
        difficulty,
      };
    });
  }

  /**
   * Generates a 4-option multiple choice question for a specific concept in a subtopic.
   * If pre-generated in the background cache, returns immediately (0ms latency).
   * Automatically pipelines prefetching for the subsequent concept.
   */
  async generateQuestion(
    topicName: string,
    subtopic: QBLSubtopic,
    conceptIndex: number, // 1, 2, or 3
    isReinforcement: boolean = false,
    previousMistake?: string
  ): Promise<QBLQuestion> {
    const key = this.getPrefetchKey(topicName, subtopic.id, conceptIndex, isReinforcement);
    let questionPromise: Promise<QBLQuestion>;

    if (this.prefetchCache.has(key)) {
      questionPromise = this.prefetchCache.get(key)!;
      this.prefetchCache.delete(key);
    } else {
      questionPromise = this.generateQuestionInternal(
        topicName,
        subtopic,
        conceptIndex,
        isReinforcement,
        previousMistake
      );
    }

    const question = await questionPromise;

    // Optimization 1: Pipelined Background Pre-generation
    // While the user reads and thinks through this question, pre-generate the next concept
    if (!isReinforcement && conceptIndex < subtopic.totalConcepts) {
      this.prefetchQuestion(topicName, subtopic, conceptIndex + 1, false);
    }

    return question;
  }

  /**
   * Optimization 2 & 3: Deep Technical Prompt Engineering with Real Engineering Artifacts
   * and Token-Level GBNF Constrained Decoding.
   */
  private async generateQuestionInternal(
    topicName: string,
    subtopic: QBLSubtopic,
    conceptIndex: number,
    isReinforcement: boolean = false,
    previousMistake?: string
  ): Promise<QBLQuestion> {
    const difficulty: QBLDifficulty = isReinforcement || conceptIndex >= 4
      ? 'pro'
      : conceptIndex === 3
      ? 'advanced'
      : conceptIndex === 2
      ? 'intermediate'
      : 'basic';

    const artifactGuidance = difficulty === 'basic'
      ? `Include a concrete mental model or foundational code/schema snippet. Focus on core primitives, fundamental invariants, and basic architectural definitions. Distractors should represent common junior/mid misconceptions.`
      : difficulty === 'intermediate'
      ? `Include a real-world code snippet (e.g. TypeScript/Python/Go/SQL), standard configuration parameters, or an operational workflow. Focus on runtime mechanics, state lifecycle, and standard operational trade-offs.`
      : difficulty === 'advanced'
      ? `Include a production scenario with concrete metrics (e.g. "p99 latency spiked from 12ms to 850ms under 50k RPS"), an EXPLAIN execution plan, thread dump, or configuration conflict (e.g. max.poll.interval.ms vs processing time). Distractors must be plausible engineering approaches that fail under high load or edge cases.`
      : `Include a mission-critical distributed systems failure, split-brain scenario, catastrophic memory/disk exhaustion, or zero-data-loss consistency dilemma. Focus on staff-level decision making, CAP theorem trade-offs, and consensus protocols.`;

    const systemPrompt = `You are Teddy, a world-class Principal Software Engineer and compassionate mentor.
Your mission is to craft deeply technical, scenario-based Multiple Choice Questions for Question-Driven Learning (QBL).

CRITICAL REQUIREMENTS:
1. Every question must be grounded in real-world software engineering reality with concrete artifacts:
   - Real code blocks (TypeScript, Python, Java, Go, C++, or SQL)
   - Configuration key-value pairs (e.g., timeout flags, buffer sizes, retry policies)
   - Real system metrics (e.g., p99 latency, IOPS, cache hit ratios, thread contention)
   - Real error logs or execution plans (e.g. EXPLAIN ANALYZE, deadlock traces, OOM)
2. ${artifactGuidance}
3. Distractors (incorrect options) MUST be realistic technical traps that senior engineers debate, NOT obvious joke answers.
4. Exactly ONE option must be correct ("isCorrect": true). The other three must be false ("isCorrect": false).
5. For each option, provide a rigorous 1-2 sentence engineering explanation of why it works or why it fails at scale.
6. Provide an insightful overarching explanation and a punchy, memorable "coachingTip" from Teddy.
7. Output STRICT valid JSON matching the schema without markdown code blocks, preamble, or postscript.`;

    const reinforcementClause = isReinforcement
      ? `\nREINFORCEMENT DRILL: The candidate previously made an error (${previousMistake || 'conceptual misconception'}). Create an alternative scenario testing the same core architectural invariant from a different angle to guarantee 100% mastery.`
      : '';

    const userPrompt = `Generate a rigorous ${difficulty.toUpperCase()} tier QBL question.
Topic: ${topicName}
Sub-topic: ${subtopic.title}
Sub-topic Scope: ${subtopic.description}
Concept #${conceptIndex} of 3
Difficulty Tier: ${difficulty.toUpperCase()}${reinforcementClause}

Output JSON schema:
{
  "conceptTitle": "Specific Concept Name",
  "questionText": "Detailed scenario with embedded code, config, or metrics...",
  "options": [
    { "id": "A", "text": "Concrete option A", "isCorrect": boolean, "explanation": "Why A works or fails..." },
    { "id": "B", "text": "Concrete option B", "isCorrect": boolean, "explanation": "Why B works or fails..." },
    { "id": "C", "text": "Concrete option C", "isCorrect": boolean, "explanation": "Why C works or fails..." },
    { "id": "D", "text": "Concrete option D", "isCorrect": boolean, "explanation": "Why D works or fails..." }
  ],
  "explanation": "Deep architectural takeaway...",
  "coachingTip": "Teddy's memorable mental model..."
}`;

    let generatedText = '';
    try {
      generatedText = await this.llmEngine.generateCompletion(userPrompt, systemPrompt, {
        grammar: QBL_JSON_GBNF,
        temperature: 0.3,
      });
    } catch (err) {
      console.warn('[QBLEngine] LLM generateQuestion error, using fallback:', err);
    }

    const generator = QBLCurriculumGenerator.getInstance(this.llmEngine);
    const parsedQuestion = this.parseAndValidateQuestionJSON(generatedText) ||
      this.getDefaultQuestion(topicName, subtopic, conceptIndex, isReinforcement, previousMistake);

    const cognitiveLevel = generator.mapIndexToCognitiveLevel(conceptIndex, subtopic.totalConcepts || 3);
    const questionType = generator.mapCognitiveLevelToQuestionType(cognitiveLevel, conceptIndex);

    return generator.validateAndImproveQuestion(parsedQuestion, {
      subject: topicName,
      subtopicTitle: subtopic.title,
      subtopicDescription: subtopic.description,
      conceptIndex,
      difficulty,
      cognitiveLevel,
      questionType,
      isReinforcement,
      previousMistake,
    });
  }

  /**
   * Optimization 3: Constrained Decoding & Schema Defense Sanitizer
   * Extracts valid JSON object, strips markdown code fences, and validates required schema fields.
   */
  private parseAndValidateQuestionJSON(rawText: string): any {
    if (!rawText || typeof rawText !== 'string') return null;

    // 1. Strip markdown fences if present
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, cleaned.length - 3);
    }
    cleaned = cleaned.trim();

    // 2. Extract outermost JSON object
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }

    const jsonCandidate = cleaned.slice(firstBrace, lastBrace + 1);

    try {
      const parsed = JSON.parse(jsonCandidate);
      if (
        parsed &&
        typeof parsed.questionText === 'string' &&
        Array.isArray(parsed.options) &&
        parsed.options.length >= 4
      ) {
        return parsed;
      }
    } catch {
      // Attempt repair of unescaped newlines within strings
      try {
        const repaired = jsonCandidate.replace(/(?<!\\)\n/g, '\\n');
        const parsed = JSON.parse(repaired);
        if (parsed && typeof parsed.questionText === 'string' && Array.isArray(parsed.options)) {
          return parsed;
        }
      } catch {
        // Parsing failed, return null to use catalog fallback
      }
    }

    return null;
  }

  /**
   * Evaluates the candidate's chosen option, awards XP, updates mastery,
   * explains why it was right or why it was wrong, and records the turn.
   */
  async evaluateAnswer(
    session: QBLSession,
    subtopic: QBLSubtopic,
    question: QBLQuestion,
    selectedOptionId: string
  ): Promise<QBLTurnResult> {
    const selectedOption = question.options.find((o) => o.id === selectedOptionId) || question.options[0];
    const correctOption = question.options.find((o) => o.isCorrect) || question.options[0];
    const isCorrect = selectedOption.isCorrect;

    let teddyEmotion: 'celebrating' | 'puzzled' = isCorrect ? 'celebrating' : 'puzzled';
    let feedbackText: string;
    let xpAwarded: number;

    if (isCorrect) {

      xpAwarded = 25;
      subtopic.conceptsMastered = Math.min(subtopic.totalConcepts, subtopic.conceptsMastered + 1);
      subtopic.masteryPercentage = Math.round((subtopic.conceptsMastered / subtopic.totalConcepts) * 100);

      feedbackText = `🎉 Spot on! That is exactly right!\n\n${selectedOption.explanation}\n\n💡 Teddy's Mental Model: ${question.coachingTip || question.explanation}`;
    } else {
      xpAwarded = 5; // XP for learning from mistakes
      feedbackText = `🤔 Not quite, but this is a very common trap!\n\nHere is why Option ${selectedOption.id} is incorrect:\n${selectedOption.explanation}\n\n✅ The correct answer is Option ${correctOption.id}: "${correctOption.text}"\n\n📘 Key Concept: ${question.explanation}\n\n💪 Let's do a quick reinforcement question to solidify this concept and get you to 100%!`;
    }

    const isSubtopicCompleted = subtopic.masteryPercentage >= 100;
    if (isSubtopicCompleted) {
      subtopic.status = 'COMPLETED';
      teddyEmotion = 'celebrating';
    }

    // Update overall session mastery percentage
    const totalPossibleConcepts = session.subtopics.length * 3;
    const totalMasteredConcepts = session.subtopics.reduce((sum, s) => sum + s.conceptsMastered, 0);
    session.overallMasteryPercentage = Math.round((totalMasteredConcepts / totalPossibleConcepts) * 100);

    const isSessionCompleted = session.subtopics.every((s) => s.status === 'COMPLETED');
    if (isSessionCompleted) {
      session.status = 'COMPLETED';
    }

    session.updatedAt = Date.now();

    // Persist to SQLite
    const turnId = `turn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await this.repository.saveTurn({
      turnId,
      sessionId: session.sessionId,
      subtopicId: subtopic.id,
      conceptTitle: question.conceptTitle,
      questionText: question.questionText,
      optionsJson: JSON.stringify(question.options),
      userSelectedOptionId: selectedOption.id,
      isCorrect,
      feedbackText,
      createdAt: Date.now(),
    });

    await this.repository.saveSession(session);

    // Optimization 1: Pipelined Background Pre-generation
    if (!isCorrect) {
      // Candidate made an error: prefetch reinforcement question while they read diagnostics
      this.prefetchQuestion(session.topicName, subtopic, question.conceptIndex, true, selectedOption.text);
    } else if (isSubtopicCompleted) {
      // Subtopic completed: prefetch Concept 1 of next subtopic if available
      const nextSubIndex = session.currentSubtopicIndex + 1;
      if (nextSubIndex < session.subtopics.length) {
        const nextSub = session.subtopics[nextSubIndex];
        this.prefetchQuestion(session.topicName, nextSub, 1, false);
      }
    }

    return {
      turnId,
      isCorrect,
      selectedOption,
      correctOption,
      teddyEmotion,
      feedbackText,
      subtopicMastery: subtopic.masteryPercentage,
      isSubtopicCompleted,
      isSessionCompleted,
      xpAwarded,
    };
  }

  /**
   * Starts a brand new QBL session for a given skill or topic
   */
  async createNewSession(topicName: string): Promise<QBLSession> {
    this.clearPrefetchCache();
    const subtopics = await this.planSubtopics(topicName);
    const session: QBLSession = {
      sessionId: `qbl_${Date.now()}`,
      topicName: topicName.trim(),
      subtopics,
      currentSubtopicIndex: 0,
      totalSubtopics: subtopics.length,
      status: 'IN_PROGRESS',
      overallMasteryPercentage: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await this.repository.saveSession(session);

    // Immediately prefetch Concept 1 of the initial subtopic in the background
    if (subtopics.length > 0) {
      this.prefetchQuestion(topicName, subtopics[0], 1, false);
    }

    return session;
  }

  /**
   * Resumes a previous session by ID
   */
  async resumeSession(sessionId: string): Promise<QBLSession | null> {
    return this.repository.getSession(sessionId);
  }

  /**
   * Fetches latest session if any exists
   */
  async getLatestSession(): Promise<QBLSession | null> {
    return this.repository.getLatestSession();
  }

  /**
   * Fetches all past sessions for the session picker
   */
  async getAllSessions(): Promise<QBLSession[]> {
    return this.repository.getAllSessions(20);
  }

  /**
   * Fetches all mistake turns for a session to power the post-topic Mistake Review Session
   */
  async getMistakesForSession(sessionId: string): Promise<QBLMistakeReviewItem[]> {
    const turns = await this.repository.getMistakesForSession(sessionId);
    return turns.map((t) => {
      let options: QBLOption[] = [];
      try {
        options = JSON.parse(t.optionsJson);
      } catch {
        options = [];
      }
      const userSelectedOption = options.find((o) => o.id === t.userSelectedOptionId) || {
        id: t.userSelectedOptionId,
        text: `Option ${t.userSelectedOptionId}`,
        isCorrect: false,
        explanation: 'Selected choice',
      };
      const correctOption = options.find((o) => o.isCorrect) || {
        id: 'A',
        text: 'Correct pattern',
        isCorrect: true,
        explanation: 'Authoritative pattern',
      };
      return {
        turnId: t.turnId,
        sessionId: t.sessionId,
        subtopicId: t.subtopicId,
        conceptTitle: t.conceptTitle || 'Conceptual Challenge',
        questionText: t.questionText,
        userSelectedOption,
        correctOption,
        allOptions: options,
        feedbackText: t.feedbackText,
        timestamp: t.createdAt,
      };
    });
  }

  /**
   * Answers candidate's free-form conversational queries (hints, analogies, clarifications)
   */
  async answerFreeformQuestion(
    userText: string,
    currentQuestion?: QBLQuestion,
    subtopic?: QBLSubtopic
  ): Promise<string> {
    const systemPrompt = `You are Teddy, an encouraging AI friend and engineering tutor.
The user is currently studying the sub-topic "${subtopic?.title || 'Engineering Architecture'}".
Current question context: "${currentQuestion?.questionText || 'Mastery Question'}".
Answer their question directly, warmly, and concisely with an intuitive real-world analogy. Keep response within 2-3 sentences and encourage them to tackle the question options!`;

    try {
      const resp = await this.llmEngine.generateCompletion(userText, systemPrompt);
      if (resp && resp.trim().length > 5) {
        return resp.trim();
      }
    } catch {
      // Fallback
    }

    return `Think of this like an assembly line! When you want reliability, you never want a single bottleneck or unverified handoff. Look closely at the options that guarantee synchronization! You've got this! 🐻`;
  }

  /**
   * Built-in high-quality curriculum fallback for topics
   */
  private getDefaultCurriculum(topic: string): Array<{ title: string; description: string }> {
    const tLower = topic.toLowerCase();

    if (tLower.includes('kafka') || tLower.includes('event')) {
      return [
        {
          title: 'Topics, Partitions & Offset Semantics',
          description: 'Master partition distribution, message ordering, consumer groups, and offset commit trade-offs.',
        },
        {
          title: 'Producer Idempotence & Acknowledgement Semantics',
          description: 'Deep dive into acks=all, retries, idempotent producers, and transactional event streams.',
        },
        {
          title: 'Broker Architecture, Replication & In-Sync Replicas (ISR)',
          description: 'Understand leader-follower replication, min.insync.replicas, and surviving network partitions.',
        },
        {
          title: 'Consumer Rebalancing & Partition Assignment Strategies',
          description: 'Prevent consumer group stop-the-world pauses using cooperative sticky rebalancing.',
        },
        {
          title: 'Staff-Level High Throughput & Zero-Data-Loss Architectures',
          description: 'Architecting for 100k events/sec, pagecache tuning, zero-copy, and exactly-once processing (EOS).',
        },
      ];
    }

    if (tLower.includes('react native') || tLower.includes('mobile')) {
      return [
        {
          title: 'New Architecture: JSI, Fabric & TurboModules',
          description: 'Compare synchronous C++ memory sharing with the legacy serialized asynchronous JSON bridge.',
        },
        {
          title: 'UI Thread Scheduling & 60 FPS Render Optimization',
          description: 'Eliminate frame drops, bridge traffic congestion, layout thrashing, and unneeded re-renders.',
        },
        {
          title: 'Offline-First SQLite State & Memory Management',
          description: 'Design local-first SQLite persistence, transaction locks, and zero-egress background sync.',
        },
        {
          title: 'Native Modules & Thread Concurrency (GCD / NSOperation)',
          description: 'Bridging native iOS/Android background threads safely without blocking the main UI dispatcher.',
        },
        {
          title: 'Staff Mobile Architecture & Large-Scale App Performance',
          description: 'App startup time (TTI) optimization, Hermes bytecode pre-compilation, and memory leak profiling.',
        },
      ];
    }

    return [
      {
        title: `Core Fundamentals & Primitives of ${topic}`,
        description: `Master foundational building blocks, core definitions, and mental models of ${topic}.`,
      },
      {
        title: `Internal Mechanisms & Architecture Lifecycle`,
        description: `Explore data flow, execution models, and behind-the-scenes mechanics under real workloads.`,
      },
      {
        title: `Concurrency, State & Consistency Guarantees`,
        description: `Analyze thread safety, atomicity, consistency models, and conflict resolution policies.`,
      },
      {
        title: `Failure Modes, Edge Cases & Performance Bottlenecks`,
        description: `Identify crash points, memory bottlenecks, network latencies, and debugging strategies.`,
      },
      {
        title: `Staff-Level Trade-offs, Scale & System Design`,
        description: `Design enterprise-grade architectures balancing durability, developer velocity, and SLA guarantees.`,
      },
    ];
  }

  /**
   * Built-in scenario questions fallback
   */
  private getDefaultQuestion(
    topic: string,
    subtopic: QBLSubtopic,
    conceptIndex: number,
    isReinforcement: boolean,
    previousMistake?: string
  ): any {
    return getCatalogQuestion(topic, subtopic.title, conceptIndex, isReinforcement, previousMistake);
  }

  /**
   * Generates a complete Subject -> Chapter -> Topic -> Sub-topic -> Question hierarchy
   * following the 7-step pedagogical method. Can generate 20+ questions per subtopic.
   */
  async generateCurriculumHierarchy(
    subject: string,
    options?: HierarchyOptions
  ): Promise<QBLCurriculumHierarchy> {
    const generator = QBLCurriculumGenerator.getInstance(this.llmEngine);
    return generator.generateHierarchy(subject, options);
  }

  /**
   * Generates a batch of questions for a specific subtopic (supporting 20+ questions)
   * sequenced across all 6 Bloom's Taxonomy cognitive tiers.
   */
  async generateSubtopicBatchQuestions(
    subject: string,
    subtopicTitle: string,
    subtopicDescription: string,
    count: number = 20
  ): Promise<QBLQuestion[]> {
    const generator = QBLCurriculumGenerator.getInstance(this.llmEngine);
    return generator.generateBatchQuestions({
      subject,
      subtopicTitle,
      subtopicDescription,
      count,
    });
  }
}
