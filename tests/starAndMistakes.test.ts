import test from 'node:test';
import assert from 'node:assert';
import { StarMethodEvaluator } from '../src/analytics/StarMethodEvaluator';
import { MistakeClassifier } from '../src/analytics/MistakeClassifier';

test('StarMethodEvaluator STAR behavioral scoring', () => {
  // Test 1: Full STAR method with metrics and personal ownership
  const exemplaryStarAnswer =
    'When working at my previous company, our payment service suffered from 850ms p99 latencies during peak sales. ' +
    'The SLA target needed to be under 200ms. I designed and implemented a Redis read-through caching cluster with compound Postgres indexes. ' +
    'As a result, we reduced p99 latency by 76% down to 140ms and saved $12k in monthly database hosting costs.';

  const evaluation1 = StarMethodEvaluator.evaluateAnswer(exemplaryStarAnswer);
  assert.ok(evaluation1.situationScore === 15);
  assert.ok(evaluation1.taskScore === 15);
  assert.ok(evaluation1.actionScore >= 35);
  assert.ok(evaluation1.resultScore === 20);
  assert.ok(evaluation1.totalScore >= 85, `Expected score >= 85, got ${evaluation1.totalScore}`);

  // Test 2: Incomplete / vague answer without metrics
  const vagueAnswer = 'We had some slow servers so we just restarted them.';
  const evaluation2 = StarMethodEvaluator.evaluateAnswer(vagueAnswer);
  assert.ok(evaluation2.totalScore < 50);
  assert.ok(evaluation2.feedback.length > 0);
});

test('MistakeClassifier 4-tier taxonomy diagnostics', () => {
  // Tier 1: Conceptual Fallacy
  const conceptualMistake = MistakeClassifier.classifyTurnMistake(
    'sess_1',
    'react_native',
    0,
    'How does React Native render components?',
    'React Native runs JavaScript directly on GPU with dom elements.'
  );
  assert.ok(conceptualMistake);
  assert.strictEqual(conceptualMistake.mistakeCategory, 'CONCEPTUAL');
  assert.ok(conceptualMistake.goldenResponse.includes('JSI'));

  // Tier 2: L4 Ceiling (Mid-level answer omitting scale/stampede)
  const l4CeilingMistake = MistakeClassifier.classifyTurnMistake(
    'sess_1',
    'distributed_caching',
    1,
    'How do you manage high read traffic?',
    'We used Redis cache to speed up read traffic across the site.'
  );
  assert.ok(l4CeilingMistake);
  assert.strictEqual(l4CeilingMistake.mistakeCategory, 'L4_CEILING');
  assert.ok(l4CeilingMistake.missingSeniorConcepts.some(c => c.toLowerCase().includes('stampede')));

  // Tier 3: Vague Hand-Waving
  const vagueMistake = MistakeClassifier.classifyTurnMistake(
    'sess_1',
    'kafka',
    2,
    'Explain your message streaming architecture',
    'We used Kafka to make it fast.'
  );
  assert.ok(vagueMistake);
  assert.strictEqual(vagueMistake.mistakeCategory, 'VAGUE');
});
