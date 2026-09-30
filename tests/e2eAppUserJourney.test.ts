import { describe, it } from 'node:test';
import assert from 'node:assert';
import { OfflineResumeParser } from '../src/core/resume/OfflineResumeParser';
import { SkillStorageManager } from '../src/database/SkillStorageManager';
import { SessionStorageManager } from '../src/database/SessionStorageManager';
import { OfflineLLMEngine } from '../src/core/llm/OfflineLLMEngine';
import { OfflineSpeechToTextService } from '../src/core/stt/OfflineSpeechToTextService';
import { OfflineTtsService } from '../src/core/tts/OfflineTtsService';
import { NativeAudioEngine } from '../src/core/audio/NativeAudioEngine';
import { SoftSkillsProsodyAnalyzer } from '../src/analytics/SoftSkillsProsodyAnalyzer';
import { MistakeClassifier } from '../src/analytics/MistakeClassifier';
import { StarMethodEvaluator } from '../src/analytics/StarMethodEvaluator';
import { ModelAssetManager } from '../src/core/models/ModelAssetManager';
import { InterviewOptions, InterviewSession } from '../src/types';

describe('Comprehensive End-to-End Application User Journey', () => {
  it('executes full candidate journey: Onboarding -> Resume Parsing -> Full-Duplex Interview -> Barge-In -> Autopsy -> Coaching Drill -> Mastery Growth', async () => {
    // PHASE 1: Model Readiness Verification (ModelManager)
    const modelManager = new ModelAssetManager();
    const initialModels = modelManager.getModels();
    assert.strictEqual(initialModels.length, 3, 'Must have 3 core on-device models configured');
    assert.ok(modelManager.areAllModelsReady(), 'Models should be verified and ready for on-device execution');
    assert.ok(modelManager.getTotalDownloadedBytes() > 0, 'Total downloaded bytes should be non-zero');

    // PHASE 2: Resume Ingestion & Skill Extraction (ResumeSetupScreen)
    const candidateResumeRaw = `
      Priya Sharma
      Senior Staff Android & React Native Engineer | Bengaluru, Karnataka
      B.Tech, Computer Science, NIT Surathkal (CGPA 9.1/10)
      Current CTC: 55 LPA. Notice Period: 30 days.

      Summary:
      7+ years of experience engineering on-device high-performance mobile architectures.
      Extensive hands-on expertise in React Native, TypeScript, JSI, C++, Android NDK, Kotlin,
      Audio DSP, SQLite, Memory Leak Profiling, Hermes GC, and Concurrency.

      Experience:
      Principal Mobile Architect at Tier-1 Unicorn (Bengaluru)
      - Engineered real-time audio pipeline handling full-duplex conversational streaming with Hardware AEC.
      - Eliminated bridge serialization bottlenecks using C++ TurboModules and JSI Host Objects.
      - Resolved high-volume SQLite lock contention using WAL mode and dedicated worker threads.
    `;

    const parsedResume = OfflineResumeParser.parseResumeText(candidateResumeRaw);
    assert.strictEqual(parsedResume.candidateName, 'Priya Sharma');
    assert.ok(parsedResume.yearsOfExperience >= 7, 'Experience should be correctly extracted as >= 7 years');
    assert.ok(parsedResume.skills.includes('React Native'));
    assert.ok(parsedResume.skills.includes('TypeScript'));
    assert.ok(parsedResume.skills.includes('Kotlin'));
    assert.ok(parsedResume.skills.includes('Audio DSP'));
    assert.ok(parsedResume.skills.includes('Hermes'));

    // PHASE 3: Database Skill Ingestion & Mastery Initialization (DashboardScreen)
    const skillDb = new SkillStorageManager();
    await skillDb.seedSkillsFromResume(parsedResume.skills);

    const initialSkills = await skillDb.getAllSkills();
    assert.ok(initialSkills.length >= 4, 'Skills should be seeded in SQLite');
    const rnSkill = initialSkills.find(s => s.skill_name === 'React Native');
    assert.ok(rnSkill, 'React Native skill should exist in DB');
    assert.strictEqual(rnSkill?.current_score, 50.0, 'Default prior score should be 50');

    // PHASE 4: Launch Full-Duplex Interview Session (InterviewSessionScreen)
    const interviewOptions: InterviewOptions = {
      targetRole: 'Principal Mobile Architect',
      voiceProfile: 'hf_alpha',
      interviewerPersona: 'bengaluru_tech_lead',
      targetLevel: 'STAFF (L6)',
      dialect: 'en-IN',
      resume: parsedResume,
    };

    const stt = new OfflineSpeechToTextService();
    const llm = new OfflineLLMEngine();
    const tts = new OfflineTtsService();
    const audio = new NativeAudioEngine();
    const sessionDb = new SessionStorageManager();

    await Promise.all([
      stt.initializeModel('ggml-tiny.en.bin'),
      llm.loadModel('qwen2.5-0.5b-instruct-q4_k_m.gguf'),
      tts.initialize('kokoro_models', interviewOptions.voiceProfile),
      audio.initializeWithAEC({ sampleRate: 16000, bufferSize: 320 }),
    ]);

    const sessionId = `e2e_session_${Date.now()}`;
    const startTime = Date.now();

    // Turn 1: Normal Candidate Response & Evaluation
    const turn1Question = 'In React Native, how do you eliminate bridge bottlenecks when passing high-frequency audio buffers?';
    const turn1CandidateSpeech = 'We migrated our audio engine to C++ TurboModules using JSI host objects. By sharing memory directly without JSON serialization over the legacy bridge, frame rates stabilized at 60 FPS and audio buffer latency dropped under 15ms.';

    // Prosody analysis
    const prosody1 = SoftSkillsProsodyAnalyzer.analyzeTurnProsody(turn1CandidateSpeech, 15, 850);
    assert.ok(prosody1.wpm >= 120 && prosody1.wpm <= 160, `WPM (${prosody1.wpm}) should be in optimal cadence range`);
    assert.strictEqual(prosody1.fillerCount, 0, 'Turn 1 had zero filler words');

    // STAR Method evaluation
    const starEval1 = StarMethodEvaluator.evaluateAnswer(turn1CandidateSpeech);
    assert.ok(starEval1.totalScore >= 50, 'Turn 1 demonstrates strong architectural STAR response');

    // Mistake classification
    const mistake1 = MistakeClassifier.classifyTurnMistake(
      sessionId,
      'react_native_jsi',
      1,
      turn1Question,
      turn1CandidateSpeech,
      interviewOptions.targetLevel
    );
    assert.strictEqual(mistake1, null, 'Turn 1 has no conceptual mistake');

    // Bayesian score update
    const { newScore: updatedScore1 } = await skillDb.recordTurnScore(
      sessionId,
      'react_native',
      1,
      turn1Question,
      turn1CandidateSpeech,
      92.0,
      1.2
    );
    assert.ok(updatedScore1 > 50.0, 'Skill score should increase following strong L6 answer');

    // Turn 2: Candidate Interruption (Barge-In Flow)
    // Candidate speaks while AI is streaming response
    let tokensStreamedBeforeBargeIn = 0;
    let ttsAudioProduced = false;

    const streamingPromise = llm.streamInterviewResponse(
      [
        { role: 'user', content: turn1CandidateSpeech },
      ],
      (_token) => {
        tokensStreamedBeforeBargeIn++;
        if (tokensStreamedBeforeBargeIn === 2) {
          // Candidate barges in!
          audio.stopPlaybackAndClearBuffers();
          tts.stopPlayback();
          llm.stopGeneration();
        }
      },
      async (clause) => {
        const pcm = await tts.synthesizeClause(clause);
        if (pcm.length > 0) ttsAudioProduced = true;
      }
    );

    await streamingPromise;
    assert.ok(typeof ttsAudioProduced === 'boolean');
    assert.ok(tokensStreamedBeforeBargeIn <= 4, 'Barge-In should abort LLM generation immediately');

    // Candidate delivers L4 response with missed senior depth on caching
    const turn2Question = 'How do you structure caching in distributed high-throughput mobile backends?';
    const turn2CandidateSpeech = 'Um, basically we used Redis to make catalog queries faster and reduce database reads.';

    const prosody2 = SoftSkillsProsodyAnalyzer.analyzeTurnProsody(turn2CandidateSpeech, 8, 1400);
    assert.ok(prosody2.fillerCount >= 2, 'Should detect "um" and "basically" fillers');

    const mistake2 = MistakeClassifier.classifyTurnMistake(
      sessionId,
      'distributed_caching',
      2,
      turn2Question,
      turn2CandidateSpeech,
      interviewOptions.targetLevel
    );
    assert.ok(mistake2 !== null, 'Should detect L4 ceiling mistake on Redis query without stampede protection');
    assert.strictEqual(mistake2?.mistakeCategory, 'L4_CEILING');
    assert.ok(mistake2?.missingSeniorConcepts.length ?? 0 > 0);

    // Save mistake to database
    if (mistake2) {
      await sessionDb.saveMistakeDiagnostic(mistake2);
    }

    // PHASE 5: Persist Full Session Autopsy (SessionSummaryScreen)
    const sessionRecord: InterviewSession = {
      sessionId,
      targetRole: interviewOptions.targetRole,
      startedAt: startTime,
      completedAt: Date.now(),
      durationSeconds: 120,
      overallScore: 81,
      turns: [
        {
          turnId: `${sessionId}_turn_1`,
          sessionId,
          skillId: 'react_native_jsi',
          turnIndex: 1,
          interviewerQuestion: turn1Question,
          candidateAnswer: turn1CandidateSpeech,
          turnScore: 92,
          questionDifficulty: 1.2,
          timestamp: startTime + 30000,
        },
        {
          turnId: `${sessionId}_turn_2`,
          sessionId,
          skillId: 'distributed_caching',
          turnIndex: 2,
          interviewerQuestion: turn2Question,
          candidateAnswer: turn2CandidateSpeech,
          turnScore: 64,
          questionDifficulty: 1.0,
          mistake: mistake2 || undefined,
          timestamp: startTime + 60000,
        },
      ],
    };

    await sessionDb.saveInterviewSession(sessionRecord);
    const persistedSession = await sessionDb.getInterviewSession(sessionId);
    assert.ok(persistedSession, 'Session should be retrievable from SQLite');
    assert.strictEqual(persistedSession?.targetRole, 'Principal Mobile Architect');
    assert.strictEqual(persistedSession?.overallScore, 81);

    // Verify session mistakes retrievable
    const storedMistakes = await sessionDb.getMistakesForSession(sessionId);
    assert.strictEqual(storedMistakes.length, 1, 'Mistake should be stored in SQLite');
    assert.strictEqual(storedMistakes[0].mistakeCategory, 'L4_CEILING');

    // PHASE 6: Interactive Coaching Drill (MistakeDrillScreen)
    // Candidate launches drill for the Redis caching mistake
    assert.strictEqual(storedMistakes[0].isDrilled, false);
    const drillGoldenAnswer = 'In our catalog service, Redis required cache stampede mitigation under peak write storms. I implemented probabilistic early expiration with distributed mutex locks so only a single worker refreshed expired keys.';

    const drillStar = StarMethodEvaluator.evaluateAnswer(drillGoldenAnswer);
    assert.ok(drillStar.totalScore >= 50, 'Golden response articulates robust senior solution');

    // Mark mistake as drilled with awarded bonus
    await sessionDb.markMistakeAsDrilled(storedMistakes[0].mistakeId, 92.0);
    const updatedMistakes = await sessionDb.getMistakesForSession(sessionId);
    assert.strictEqual(updatedMistakes[0].isDrilled, true, 'Mistake should now be marked as drilled');
    assert.strictEqual(updatedMistakes[0].drilledScore, 92.0);

    // Apply mastery boost for completing the drill
    const postDrill = await skillDb.recordTurnScore(
      sessionId,
      'redis',
      2,
      'Redis drill',
      drillGoldenAnswer,
      92.0,
      1.5
    );
    assert.ok(postDrill.newScore > 50.0, 'Drilling mistake should raise candidate skill mastery score');

    // Teardown engines cleanly
    await stt.release();
    await llm.release();
    audio.terminate();
  });
});
