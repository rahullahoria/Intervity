import test from 'node:test';
import assert from 'node:assert';
import { SkillStorageManager } from '../src/database/SkillStorageManager';
import { SQLiteClient } from '../src/database/SQLiteClient';

test('Bayesian EMA Math & Mastery Leveling', () => {
  // Test 1: Baseline update with difficulty 1.0
  // Formula: ΔS = 0.3 * (80 - 50) * 1.0 = +9.0 -> newScore = 59.0 (DEVELOPING)
  const res1 = SkillStorageManager.calculateBayesianEma(50.0, 80.0, 1.0);
  assert.strictEqual(res1.newScore, 59.0);
  assert.strictEqual(res1.level, 'DEVELOPING');

  // Test 2: High difficulty multiplier (1.4) and high turn score (95)
  // ΔS = 0.3 * (95 - 60) * 1.4 = +14.7 -> newScore = 74.7 (PROFICIENT)
  const res2 = SkillStorageManager.calculateBayesianEma(60.0, 95.0, 1.4);
  assert.strictEqual(res2.newScore, 74.7);
  assert.strictEqual(res2.level, 'PROFICIENT');

  // Test 3: Promotion to SENIOR (score >= 80)
  // Prior: 78, Turn: 90 -> ΔS = 0.3 * 12 * 1.0 = 3.6 -> newScore = 81.6 (SENIOR)
  const res3 = SkillStorageManager.calculateBayesianEma(78.0, 90.0, 1.0);
  assert.strictEqual(res3.newScore, 81.6);
  assert.strictEqual(res3.level, 'SENIOR');

  // Test 4: Promotion to STAFF (score >= 90)
  // Prior: 88, Turn: 100 -> ΔS = 0.3 * 12 * 1.0 = 3.6 -> newScore = 91.6 (STAFF)
  const res4 = SkillStorageManager.calculateBayesianEma(88.0, 100.0, 1.0);
  assert.strictEqual(res4.newScore, 91.6);
  assert.strictEqual(res4.level, 'STAFF');

  // Test 5: Clamping bounds at 0 and 100
  const resMax = SkillStorageManager.calculateBayesianEma(98.0, 150.0, 1.5);
  assert.ok(resMax.newScore <= 100.0);

  const resMin = SkillStorageManager.calculateBayesianEma(10.0, -20.0, 1.5);
  assert.ok(resMin.newScore >= 0.0);
});

test('SkillStorageManager SQLite Integration', async () => {
  const db = SQLiteClient.getInstance();
  await db.initialize();
  const manager = new SkillStorageManager(db);

  // Seed skills
  await manager.seedSkillsFromResume(['React Native', 'Distributed Caching', 'Kafka']);

  const allSkills = await manager.getAllSkills();
  assert.ok(allSkills.length >= 3);

  // Record a turn score
  const update = await manager.recordTurnScore(
    'test_session_1',
    'distributed_caching',
    0,
    'How do you prevent cache stampede?',
    'I used distributed locks with probabilistic early expiration.',
    88,
    1.2
  );

  assert.ok(update.newScore > 50.0);

  // Query weakest skills
  const weakest = await manager.getWeakestSkills(2);
  assert.ok(weakest.length <= 2);
});
