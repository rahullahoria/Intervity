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

import { OfflineLLMEngine } from '../llm/OfflineLLMEngine';
import { IQBLRepository, QBLStorageManager } from '../../database';
import {
  QBLSession,
  QBLSubtopic,
  QBLQuestion,
  QBLOption,
  QBLTurnResult,
  QBLDifficulty,
  QBLMistakeReviewItem,
} from '../../types';
import { getCatalogQuestion } from './QBLQuestionCatalog';

export class QBLEngine {
  private llmEngine: OfflineLLMEngine;
  private repository: IQBLRepository;

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
   */
  async generateQuestion(
    topicName: string,
    subtopic: QBLSubtopic,
    conceptIndex: number, // 1, 2, or 3
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

    const difficultyGuide = difficulty === 'basic'
      ? 'TARGET DIFFICULTY: BASIC. Start from core intuition, foundational mental models, basic definitions, and primary purpose. Do NOT jump to advanced production trade-offs or complex edge cases yet!'
      : difficulty === 'intermediate'
      ? 'TARGET DIFFICULTY: INTERMEDIATE. Focus on standard operational mechanisms, core algorithms, data structures, and practical application rules.'
      : difficulty === 'advanced'
      ? 'TARGET DIFFICULTY: ADVANCED. Focus on production edge cases, performance bottlenecks, cost-based optimizer decisions, and engineering trade-offs.'
      : 'TARGET DIFFICULTY: PRO. Focus on staff-level architecture, catastrophic failure isolation, distributed consensus, and zero-data-loss guarantees.';

    const systemPrompt = `You are Teddy, a warm and brilliant engineering mentor.
Create a real-world, scenario-based multiple-choice question testing Concept #${conceptIndex} of sub-topic "${subtopic.title}" in "${topicName}".
${difficultyGuide}
Provide exactly 4 options labeled A, B, C, D. Exactly ONE option must be correct (isCorrect: true).
For each option, explain clearly and concisely why it is correct or why it is incorrect.
Output strictly a JSON object with this exact schema:
{
  "conceptTitle": "string",
  "questionText": "string",
  "options": [
    { "id": "A", "text": "string", "isCorrect": boolean, "explanation": "string" },
    { "id": "B", "text": "string", "isCorrect": boolean, "explanation": "string" },
    { "id": "C", "text": "string", "isCorrect": boolean, "explanation": "string" },
    { "id": "D", "text": "string", "isCorrect": boolean, "explanation": "string" }
  ],
  "explanation": "string (comprehensive takeaway)",
  "coachingTip": "string (Teddy's friendly mental model tip)"
}`;

    const reinforcementClause = isReinforcement
      ? `The candidate previously selected a wrong answer (${previousMistake || 'conceptual trap'}). Craft a fresh reinforcement question testing this same core concept from a different practical angle to help them reach 100% mastery.`
      : '';

    const userPrompt = `Generate a QBL multiple-choice question for:
Topic: ${topicName}
Sub-topic: ${subtopic.title} (${subtopic.description})
Difficulty: ${difficulty.toUpperCase()}
Concept #${conceptIndex} of 3
${reinforcementClause}`;

    let generatedText = '';
    try {
      generatedText = await this.llmEngine.generateCompletion(userPrompt, systemPrompt);
    } catch (err) {
      console.warn('[QBLEngine] LLM generateQuestion error, using fallback:', err);
    }

    let parsedQuestion: any = null;
    if (generatedText) {
      try {
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedQuestion = JSON.parse(jsonMatch[0]);
        }
      } catch (parseErr) {
        console.warn('[QBLEngine] Failed to parse question JSON:', parseErr);
      }
    }

    if (!parsedQuestion || !parsedQuestion.options || parsedQuestion.options.length < 4) {
      parsedQuestion = this.getDefaultQuestion(topicName, subtopic, conceptIndex, isReinforcement, previousMistake);
    }

    // Ensure options array has valid IDs and exactly one correct option
    const options: QBLOption[] = (parsedQuestion.options as any[]).slice(0, 4).map((opt, idx) => ({
      id: opt.id || ['A', 'B', 'C', 'D'][idx],
      text: opt.text || `Option ${['A', 'B', 'C', 'D'][idx]}`,
      isCorrect: Boolean(opt.isCorrect),
      explanation: opt.explanation || (opt.isCorrect ? 'Correct application of principles.' : 'Incorrect option.'),
    }));

    if (!options.some((o) => o.isCorrect)) {
      options[0].isCorrect = true;
    }

    return {
      id: `q_${Date.now()}_${conceptIndex}`,
      conceptTitle: parsedQuestion.conceptTitle || `Core Concept ${conceptIndex}`,
      conceptIndex,
      questionText: parsedQuestion.questionText || `How does ${subtopic.title} operate in high-scale production?`,
      options,
      explanation: parsedQuestion.explanation || 'Mastering this architectural principle ensures resilience and low latency.',
      coachingTip: parsedQuestion.coachingTip || 'Always reason from first principles and latency trade-offs.',
      isReinforcement,
      difficulty,
    };
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
}
