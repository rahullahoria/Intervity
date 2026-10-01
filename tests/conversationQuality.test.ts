import { describe, it } from 'node:test';
import assert from 'node:assert';
import { run20TurnBenchmark } from '../scripts/test_conversation_quality';

describe('20-Turn Conversation Quality & Scoring Benchmark', () => {
  it('achieves a score of >= 7.0/10 over at least 20 continuous turns', async () => {
    const result = await run20TurnBenchmark();

    assert.ok(result.totalTurns >= 20, `Must evaluate at least 20 turns (evaluated ${result.totalTurns})`);
    assert.ok(result.overallScore >= 7.0, `Score must be at least 7.0/10 (achieved: ${result.overallScore}/10)`);
    assert.strictEqual(result.isPassing, true);

    // Verify all dimension standards
    assert.ok(result.dimensionAverages.friendshipAndWarmth >= 1.5, 'Must maintain high warmth');
    assert.ok(result.dimensionAverages.connectedContinuity >= 1.8, 'Must maintain unbroken continuity without repeats');
    assert.ok(result.dimensionAverages.coachingProgression >= 1.8, 'Must maintain coaching progression');
    assert.ok(result.dimensionAverages.technicalDepth >= 1.8, 'Must maintain technical depth');
    assert.ok(result.dimensionAverages.speechTtsQuality >= 1.8, 'Must maintain Kokoro TTS spoken constraints');
  });
});
