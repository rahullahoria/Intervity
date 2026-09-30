/**
 * Mistake Classifier & Next-Level Golden Response Synthesizer
 * Evaluates candidate answers against 4 mistake tiers: Conceptual, L4 Ceiling, Structural, Vague
 */

import { MistakeCategory, MistakeDiagnostic } from '../types';

export class MistakeClassifier {
  static classifyTurnMistake(
    sessionId: string,
    skillId: string,
    turnIndex: number,
    interviewerQuestion: string,
    candidateAnswer: string,
    _targetLevel: string = 'Senior Engineer (L5)'
  ): MistakeDiagnostic | null {
    const text = candidateAnswer.toLowerCase();

    let category: MistakeCategory = 'NONE';
    let critique = '';
    let missingSeniorConcepts: string[] = [];
    let goldenResponse = '';
    let coachingMentalModel = '';

    // Rule 1: Conceptual / Factual Fallacy
    if (text.includes('direct on gpu') || text.includes('dom element') || text.includes('threads without locks')) {
      category = 'CONCEPTUAL';
      critique = 'Fundamental misunderstanding of core architecture and runtime memory models.';
      missingSeniorConcepts = [
        'React Native JSI C++ host objects vs ShadowTree',
        'Thread safety & memory fencing in native modules',
      ];
      goldenResponse =
        'React Native operates on a multi-threaded architecture where JavaScript communicates with C++ host objects via the JSI (JavaScript Interface), avoiding bridge serialization overhead while Yoga calculates layout off the main thread.';
      coachingMentalModel = 'Always ground explanations in memory ownership and native runtime thread boundaries.';
    }
    // Rule 2: The Mid-Level (L4) Ceiling
    else if (text.includes('redis') && !text.includes('stampede') && !text.includes('eviction') && !text.includes('lock')) {
      category = 'L4_CEILING';
      critique = 'Technically correct happy-path, but omitted high-throughput failure modes such as cache stampede and eviction policies.';
      missingSeniorConcepts = [
        'Cache Stampede mitigation via distributed mutex or probabilistic early expiration (XFetch)',
        'Redis memory eviction strategies (allkeys-lru vs volatile-lfu)',
        'Stale-while-revalidate caching semantics under write storms',
      ];
      goldenResponse =
        'In high-throughput services, caching with Redis requires mitigating cache stampede; key expiration triggers thundering herd queries on the primary database. I resolve this by combining probabilistic early expiration with distributed mutex locks to ensure only one worker regenerates the cache while others serve slightly stale data.';
      coachingMentalModel = 'When discussing caching, never stop at "faster reads"; always explain invalidation, concurrency locks, and eviction policies.';
    }
    // Rule 3: Vague Hand-Waving
    else if (text.length < 50 || text.includes('we used kafka to make it fast') || text.includes('it handled everything')) {
      category = 'VAGUE';
      critique = 'Superficial buzzword usage without explaining underlying mechanics, partition keys, or failure recovery.';
      missingSeniorConcepts = [
        'Kafka partition key strategy for ordered delivery',
        'Consumer group rebalance mitigation and offset commit semantics',
        'Exact consumer lag monitoring metrics',
      ];
      goldenResponse =
        'We partitioned our Kafka topics by merchant ID to guarantee sequential processing, tuned consumer batch sizes to 500 records, and maintained sub-200ms lag even during peak promotional spikes.';
      coachingMentalModel = 'Never state what technology you used without quantifying throughput, partition strategies, and failure modes.';
    }
    // Rule 4: Structural Deficit
    else if (!text.includes('i ') && !text.includes('latency') && !text.includes('percent') && !text.includes('ms')) {
      category = 'STRUCTURAL';
      critique = 'Answer lacks quantitative metrics and personal ownership, failing the STAR method expectations for senior leadership.';
      missingSeniorConcepts = [
        'Quantified engineering outcomes (p99 latency reduction, SLA compliance, compute cost savings)',
        'Explicit personal contributions ("I designed" vs "We had")',
      ];
      goldenResponse =
        'I identified a database bottleneck causing 850ms p99 latencies during peak hours. By introducing compound indexes and partitioning the audit log table, I reduced query execution time by 74% and saved $8,000 monthly in compute costs.';
      coachingMentalModel = 'Always deliver Bottom Line Up Front (BLUF) and close with measurable business impact.';
    }

    if (category === 'NONE') return null;

    return {
      mistakeId: `mistake_${sessionId}_${turnIndex}`,
      sessionId,
      skillId,
      turnIndex,
      candidateQuote: candidateAnswer.slice(0, 180),
      mistakeCategory: category,
      critique,
      missingSeniorConcepts,
      goldenResponse,
      coachingMentalModel,
      isDrilled: false,
      drilledScore: 0,
    };
  }
}
