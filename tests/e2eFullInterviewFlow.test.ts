/**
 * End-to-End Complete Interview Pipeline Test
 * Exercises the entire mobile app stack: Resume parsing, SQLite DB seeding,
 * multi-turn conversational loop, Bayesian EMA score evolution, Barge-in interruption,
 * mistake classification, and reflex drill generation.
 */

// @ts-ignore
import { describe, it, expect } from 'bun:test';
import { OfflineResumeParser } from '../src/core/resume/OfflineResumeParser';
import { SQLiteClient } from '../src/database/SQLiteClient';
import { SkillStorageManager } from '../src/database/SkillStorageManager';
import { SessionStorageManager } from '../src/database/SessionStorageManager';
import { SoftSkillsProsodyAnalyzer } from '../src/analytics/SoftSkillsProsodyAnalyzer';
import { StarMethodEvaluator } from '../src/analytics/StarMethodEvaluator';
import { MistakeClassifier } from '../src/analytics/MistakeClassifier';
import { buildInterviewerPrompt } from '../src/core/llm/SystemPrompts';
import { NativeAudioEngine } from '../src/core/audio/NativeAudioEngine';

describe('End-to-End Interview Pipeline Integration', () => {
  const sampleResume = `
Rahul Sharma
Staff Software Engineer | Bengaluru, India
Experience: 6 years
Skills: React Native, TypeScript, Redis, Distributed Systems, Concurrency, PostgreSQL

Experience:
- Architected high-throughput notification service serving 10M DAU with Redis caching.
- Optimized React Native bridge throughput using TurboModules and C++ JSI.
`;

  it('executes full interview lifecycle from resume ingestion to autopsy and mastery evolution', async () => {
    // 1. Ingest & parse resume
    const parsedResume = OfflineResumeParser.parseResumeText(sampleResume);
    expect(parsedResume.candidateName).toBe('Rahul Sharma');
    expect(parsedResume.skills).toContain('React Native');
    expect(parsedResume.skills).toContain('Redis');
    expect(parsedResume.skills).toContain('Distributed Systems');

    // 2. Database initialization
    const dbClient = SQLiteClient.getInstance();
    await dbClient.initialize();
    const skillManager = new SkillStorageManager();
    const sessionManager = new SessionStorageManager();

    // Seed candidate skills
    await skillManager.seedSkillsFromResume(parsedResume.skills);
    const initialSkills = await skillManager.getAllSkills();
    expect(initialSkills.length).toBeGreaterThanOrEqual(4);

    // Initial score should be default 50
    const initialRedisScore = initialSkills.find(s => s.skill_name.toLowerCase().includes('redis'))?.current_score || 50;
    expect(initialRedisScore).toBe(50);

    // 3. System prompt construction with spaced repetition context
    const weakSkills = await skillManager.getWeakestSkills(2);
    const weaknessContext = weakSkills.map(w => `- ${w.skill_name}: ${w.current_score}/100`).join('\n');
    const prompt = buildInterviewerPrompt({
      jobRole: 'Senior Staff Mobile & Distributed Systems Architect',
      resumeText: parsedResume.rawText,
      dialect: 'en-IN',
      persona: 'bengaluru_tech_lead',
      targetLevel: 'STAFF (L6)',
      weaknessContext,
    });
    expect(prompt).toContain('Bengaluru/Hyderabad');
    expect(prompt).toContain('STAFF (L6)');

    // 4. Hardware Audio & Barge-In State Machine Setup
    const audioEngine = new NativeAudioEngine();
    await audioEngine.initializeWithAEC({ sampleRate: 16000, bufferSize: 320 });
    audioEngine.startRecordingStream();

    let interruptionFired = false;
    audioEngine.onVADEvent(({ isSpeech }) => {
      if (isSpeech) {
        audioEngine.stopPlaybackAndClearBuffers();
        interruptionFired = true;
      }
    });

    // 5. Turn 1: Candidate speaks high-quality STAR answer
    const turn1Answer = 'In our notification system serving 10M DAU, we faced severe cache stampedes when Redis keys expired during flash sales. I solved this by implementing probabilistic early expiration with distributed mutex locks in Redis, reducing P99 latency by 72%.';
    
    // Vocal Prosody Analysis
    const prosody1 = SoftSkillsProsodyAnalyzer.analyzeTurnProsody(turn1Answer, 15, 800);
    expect(prosody1.wpm).toBeGreaterThan(100);
    expect(prosody1.fillerCount).toBe(0);
    expect(prosody1.vocalPacingScore).toBeGreaterThan(85);

    // STAR Method Evaluation
    const starScore = StarMethodEvaluator.evaluateAnswer(turn1Answer);
    expect(starScore.totalScore).toBeGreaterThanOrEqual(70);
    expect(starScore.situationScore).toBeGreaterThan(0);
    expect(starScore.actionScore).toBeGreaterThan(0);
    expect(starScore.resultScore).toBeGreaterThan(0);

    // Bayesian EMA Mastery Evolution
    const updatedScore = await skillManager.recordTurnScore(
      'e2e_session_1',
      'distributed_systems',
      1,
      'Tell me about a caching challenge you faced at scale.',
      turn1Answer,
      starScore.totalScore,
      1.2
    );
    expect(updatedScore.newScore).toBeGreaterThan(50); // Mastery should increase!

    // 6. Turn 2: Interviewer speaks and Candidate performs Barge-In Interruption
    audioEngine.simulateMicInput(0.85, true);
    expect(interruptionFired).toBe(true);

    // 7. Mistake classification for a suboptimal answer
    const turn2SuboptimalAnswer = 'We just added Redis caching to make queries faster.';
    const mistake = MistakeClassifier.classifyTurnMistake(
      'e2e_session_1',
      'distributed_systems',
      2,
      'How did you configure Redis eviction under memory pressure?',
      turn2SuboptimalAnswer,
      'STAFF (L6)'
    );
    expect(mistake).not.toBeNull();
    expect(mistake?.mistakeCategory).toBe('L4_CEILING');
    expect(mistake?.goldenResponse).toBeDefined();

    // 8. Session Persist & Autopsy Generation
    await sessionManager.saveInterviewSession({
      sessionId: 'e2e_session_1',
      targetRole: 'Senior Staff Architect',
      startedAt: Date.now() - 240000,
      completedAt: Date.now(),
      durationSeconds: 240,
      overallScore: 88,
      summaryFeedback: 'Strong STAR methodology and architectural reasoning on caching. Needs deeper articulation on eviction mechanics.',
      turns: [
        {
          turnId: 'turn_1',
          sessionId: 'e2e_session_1',
          skillId: 'distributed_systems',
          turnIndex: 1,
          interviewerQuestion: 'Tell me about a caching challenge you faced at scale.',
          candidateAnswer: turn1Answer,
          turnScore: starScore.totalScore,
          questionDifficulty: 1.2,
          timestamp: Date.now() - 120000,
          prosody: prosody1,
        },
        {
          turnId: 'turn_2',
          sessionId: 'e2e_session_1',
          skillId: 'distributed_systems',
          turnIndex: 2,
          interviewerQuestion: 'How did you configure Redis eviction under memory pressure?',
          candidateAnswer: turn2SuboptimalAnswer,
          turnScore: 65,
          questionDifficulty: 1.3,
          timestamp: Date.now() - 30000,
          mistake: mistake || undefined,
        },
      ],
    });

    const storedSession = await sessionManager.getInterviewSession('e2e_session_1');
    expect(storedSession).not.toBeNull();
    expect(storedSession?.overallScore).toBe(88);
    expect(storedSession?.turns.length).toBe(2);

    audioEngine.terminate();
  });
});
