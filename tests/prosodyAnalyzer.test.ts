import test from 'node:test';
import assert from 'node:assert';
import { SoftSkillsProsodyAnalyzer } from '../src/analytics/SoftSkillsProsodyAnalyzer';

test('SoftSkillsProsodyAnalyzer WPM and Filler Word Detection', () => {
  // Test 1: Ideal conversational cadence (130 WPM, 0 fillers)
  const fluentSpeech =
    'In our distributed system we partitioned topics across five brokers to maintain low latency during heavy batch consumer runs.';
  const report1 = SoftSkillsProsodyAnalyzer.analyzeTurnProsody(fluentSpeech, 8.5, 1200);

  assert.ok(report1.wpm >= 120 && report1.wpm <= 155, `Expected 120-155 WPM, got ${report1.wpm}`);
  assert.strictEqual(report1.fillerCount, 0);
  assert.strictEqual(report1.fillerDensityPercent, 0);
  assert.ok(report1.vocalPacingScore >= 95, `Expected >=95 pacing score, got ${report1.vocalPacingScore}`);

  // Test 2: Detection of Indian English verbal crutches ("ya", "na", "basically", "actually")
  const indianFillerSpeech =
    'So basically we used Redis, ya, and na, actually it handled the cache stampede well, means we saw no downtime, correct?';
  const report2 = SoftSkillsProsodyAnalyzer.analyzeTurnProsody(indianFillerSpeech, 10, 1500);

  assert.ok(report2.fillerCount >= 4, `Expected >= 4 fillers, found ${report2.fillerCount}`);
  assert.ok(report2.fillerWordsFound.includes('basically'));
  assert.ok(report2.fillerWordsFound.includes('ya'));
  assert.ok(report2.fillerWordsFound.includes('actually'));
  assert.ok(report2.fillerDensityPercent > 4.0, `Expected filler density > 4%, got ${report2.fillerDensityPercent}%`);
  assert.ok(report2.vocalPacingScore < 80, `Expected pacing score penalty, got ${report2.vocalPacingScore}`);

  // Test 3: Rushing speech penalty (> 175 WPM)
  const rushedSpeech =
    'We quickly deployed the microservices container image to the cluster and scaled up the pods to handle incoming traffic bursts.';
  const report3 = SoftSkillsProsodyAnalyzer.analyzeTurnProsody(rushedSpeech, 4.0, 1000); // ~285 WPM
  assert.ok(report3.wpm > 175);
  assert.ok(report3.vocalPacingScore < 90);
});
