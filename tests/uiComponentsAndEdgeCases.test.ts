import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SoftSkillsProsodyAnalyzer } from '../src/analytics/SoftSkillsProsodyAnalyzer';
import { MistakeClassifier } from '../src/analytics/MistakeClassifier';
import { StarMethodEvaluator } from '../src/analytics/StarMethodEvaluator';
import { OfflineResumeParser } from '../src/core/resume/OfflineResumeParser';
import { ModelAssetManager } from '../src/core/models/ModelAssetManager';
import { SQLiteClient } from '../src/database/SQLiteClient';

describe('UI Components Logic, Metrics & System Boundary Edge Cases', () => {
  describe('SoftSkillsProsodyAnalyzer Boundary & Robustness', () => {
    it('handles empty string and zero duration without crashing or NaN', () => {
      const result = SoftSkillsProsodyAnalyzer.analyzeTurnProsody('', 0, 0);
      assert.strictEqual(result.wpm, 0);
      assert.strictEqual(result.fillerCount, 0);
      assert.strictEqual(result.fillerDensityPercent, 0);
      assert.ok(!Number.isNaN(result.wpm));
    });

    it('handles extreme high WPM (>400 WPM) gracefully', () => {
      // 50 words spoken in 5 seconds = 600 WPM
      const rapidWords = Array(50).fill('system').join(' ');
      const result = SoftSkillsProsodyAnalyzer.analyzeTurnProsody(rapidWords, 5, 500);
      assert.ok(result.wpm >= 400);
      assert.ok(!Number.isNaN(result.wpm));
    });

    it('accurately identifies Indian English filler words and colloquial hedges', () => {
      const candidateSpeech = 'Actually, um, basically we preponed the release, like, ya know, uh, right.';
      const result = SoftSkillsProsodyAnalyzer.analyzeTurnProsody(candidateSpeech, 10, 1000);
      assert.ok(result.fillerCount >= 4, `Expected at least 4 filler words, detected ${result.fillerCount}`);
      assert.ok(result.fillerWordsFound.length >= 4);
    });

    it('verifies cadence categories across different speech speeds', () => {
      // Slow: < 110 WPM
      const slow = SoftSkillsProsodyAnalyzer.analyzeTurnProsody('One two three four five', 5, 500); // 60 WPM
      assert.ok(slow.wpm < 110, `Slow cadence should have WPM < 110, got ${slow.wpm}`);

      // Optimal: 110 - 165 WPM
      const optimalWords = Array(23).fill('word').join(' '); // 23 words in 10s = 138 WPM
      const optimal = SoftSkillsProsodyAnalyzer.analyzeTurnProsody(optimalWords, 10, 500);
      assert.ok(optimal.wpm >= 110 && optimal.wpm <= 165, `Optimal cadence should be 110-165 WPM, got ${optimal.wpm}`);

      // Fast: > 165 WPM
      const fastWords = Array(40).fill('word').join(' '); // 40 words in 10s = 240 WPM
      const fast = SoftSkillsProsodyAnalyzer.analyzeTurnProsody(fastWords, 10, 500);
      assert.ok(fast.wpm > 165, `Fast cadence should have WPM > 165, got ${fast.wpm}`);
    });
  });

  describe('MistakeClassifier Taxonomy Verification', () => {
    const sessionId = 'test_session_diag';

    it('classifies CONCEPTUAL fallacy when violating runtime threading rules', () => {
      const diag = MistakeClassifier.classifyTurnMistake(
        sessionId,
        'react_native_arch',
        1,
        'How does React Native interact with native view components?',
        'We render DOM elements direct on GPU using threads without locks.'
      );
      assert.ok(diag !== null);
      assert.strictEqual(diag?.mistakeCategory, 'CONCEPTUAL');
      assert.ok(diag?.critique.length ?? 0 > 10);
      assert.ok(diag?.goldenResponse.length ?? 0 > 20);
    });

    it('classifies STRUCTURAL mistake when response lacks ownership or quantitative metrics', () => {
      const diag = MistakeClassifier.classifyTurnMistake(
        sessionId,
        'system_design',
        2,
        'Explain your architecture.',
        'First and then basically also additionally then after that we did some other stuff in the backend service.'
      );
      assert.ok(diag !== null);
      assert.strictEqual(diag?.mistakeCategory, 'STRUCTURAL');
    });

    it('classifies VAGUE mistake when response uses short hand-waving buzzwords', () => {
      const diag = MistakeClassifier.classifyTurnMistake(
        sessionId,
        'performance_tuning',
        3,
        'What were the quantitative results of your optimization?',
        'It handled everything.'
      );
      assert.ok(diag !== null);
      assert.strictEqual(diag?.mistakeCategory, 'VAGUE');
    });

    it('returns null (no mistake) for a well-rounded senior response with personal ownership and metrics', () => {
      const diag = MistakeClassifier.classifyTurnMistake(
        sessionId,
        'distributed_systems',
        4,
        'How do you manage distributed consensus?',
        'I implemented Raft consensus with etcd to guarantee sub-15ms linearizable state reads and quorum-based leader election.'
      );
      assert.strictEqual(diag, null);
    });
  });

  describe('StarMethodEvaluator Edge Cases', () => {
    it('handles minimal input without crashing and flags missing ownership', () => {
      const evalResult = StarMethodEvaluator.evaluateAnswer('Yes.');
      assert.ok(evalResult.totalScore < 50);
      assert.ok(evalResult.feedback.length > 0);
    });

    it('awards high score for complete STAR narrative with personal ownership and quantified metrics', () => {
      const speech =
        'While working at our ecommerce platform, we faced a major bottleneck where checkout API latency spiked to 500ms. ' +
        'My goal was cutting p99 latency in half. ' +
        'I implemented partial indexing on active carts and I refactored Redis caching to use connection pooling. ' +
        'As a result, this reduced p99 latency by 68% and eliminated all database timeouts, saving $250k.';

      const evalResult = StarMethodEvaluator.evaluateAnswer(speech);
      assert.ok(evalResult.situationScore >= 15);
      assert.ok(evalResult.taskScore >= 15);
      assert.ok(evalResult.actionScore >= 35);
      assert.ok(evalResult.resultScore >= 20);
      assert.ok(evalResult.totalScore >= 80);
    });
  });

  describe('OfflineResumeParser Resilience', () => {
    it('handles empty resume string without error and provides standard defaults', () => {
      const parsed = OfflineResumeParser.parseResumeText('');
      assert.strictEqual(parsed.candidateName, 'Candidate');
      assert.strictEqual(parsed.yearsOfExperience, 4);
      assert.ok(Array.isArray(parsed.skills));
      assert.ok(parsed.skills.length >= 3);
    });

    it('correctly parses Indian CTC, college tier, and modern engineering stack', () => {
      const resume = `
        Arun Kumar
        IIT Delhi B.Tech 2019
        Current CTC: 65 LPA.
        Skills: Kafka, Docker, Kubernetes, PostgreSQL, TypeScript, Go, System Design.
      `;
      const parsed = OfflineResumeParser.parseResumeText(resume);
      assert.strictEqual(parsed.candidateName, 'Arun Kumar');
      assert.ok(parsed.skills.includes('Kafka'));
      assert.ok(parsed.skills.includes('Docker'));
      assert.ok(parsed.skills.includes('Kubernetes'));
      assert.ok(parsed.skills.includes('System Design'));
    });
  });

  describe('ModelAssetManager Lifecycle & Verification', () => {
    it('tracks downloads, verifies sizes and allows reset', async () => {
      const manager = new ModelAssetManager();
      const models = manager.getModels();
      assert.ok(models.length >= 3);

      const totalBytes = manager.getTotalRequiredBytes();
      assert.ok(totalBytes > 500 * 1024 * 1024, 'Total model assets should be > 500MB');

      let notified = false;
      const unsub = manager.subscribeProgress(() => {
        notified = true;
      });
      assert.strictEqual(notified, true);
      unsub();

      manager.clearStorage();
      assert.strictEqual(manager.getTotalDownloadedBytes(), 0);
      assert.strictEqual(manager.areAllModelsReady(), false);
    });
  });

  describe('SQLite Database Schema & Relational Integrity', () => {
    it('executes schema and supports all relational operations without error', async () => {
      const client = SQLiteClient.getInstance();
      await client.initialize();

      // Test candidate_skills table
      const skillId = `test_skill_${Date.now()}`;
      await client.execute(
        'INSERT INTO candidate_skills (skill_id, skill_name, category, current_score, mastery_level, total_questions_asked, last_tested_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [skillId, 'Concurrency', 'fundamentals', 75.0, 'PROFICIENT', 3, Date.now()]
      );

      const selectResult = await client.execute('SELECT * FROM candidate_skills WHERE skill_id = ?', [skillId]);
      assert.strictEqual(selectResult.rows.length, 1);
      assert.strictEqual(selectResult.rows[0].skill_name, 'Concurrency');

      // Test interview_sessions table
      const sessionId = `test_sess_${Date.now()}`;
      await client.execute(
        'INSERT INTO interview_sessions (session_id, target_role, started_at, completed_at, duration_seconds, overall_score, audio_path, summary_feedback) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [sessionId, 'Staff Engineer', Date.now(), Date.now(), 600, 88.0, '', 'Excellent communication']
      );

      const sessResult = await client.execute('SELECT * FROM interview_sessions WHERE session_id = ?', [sessionId]);
      assert.strictEqual(sessResult.rows.length, 1);
      assert.strictEqual(sessResult.rows[0].target_role, 'Staff Engineer');

      // Test mistake_diagnostics table
      const mistakeId = `test_mistake_${Date.now()}`;
      await client.execute(
        'INSERT INTO mistake_diagnostics (mistake_id, session_id, skill_id, turn_index, candidate_quote, mistake_category, critique, missing_concept, golden_response, coaching_rule, is_drilled, drilled_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [mistakeId, sessionId, skillId, 1, 'Quote', 'L4_CEILING', 'Critique', 'Concept', 'Golden', 'Rule', 0, 0.0]
      );

      const mistakeResult = await client.execute('SELECT * FROM mistake_diagnostics WHERE session_id = ?', [sessionId]);
      assert.strictEqual(mistakeResult.rows.length, 1);
      assert.strictEqual(mistakeResult.rows[0].mistake_id, mistakeId);
    });
  });
});
