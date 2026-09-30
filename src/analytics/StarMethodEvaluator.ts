/**
 * STAR Method Evaluator for behavioral and architectural questions
 * Analyzes Situation (15%), Task (15%), Action (50%), and Result (20%)
 */

export interface StarScoreReport {
  situationScore: number;
  taskScore: number;
  actionScore: number;
  resultScore: number;
  totalScore: number;
  feedback: string[];
}

export class StarMethodEvaluator {
  static evaluateAnswer(answer: string): StarScoreReport {
    const text = answer.toLowerCase();
    const feedback: string[] = [];

    // 1. Situation: Context setting
    const hasSituation =
      text.includes('when') || text.includes('at') || text.includes('project') || text.includes('team') || text.includes('while working');
    const situationScore = hasSituation ? 15 : 5;
    if (!hasSituation) feedback.push('Clarify the business context or project scope early in your response.');

    // 2. Task: Problem definition or SLA
    const hasTask =
      text.includes('goal') || text.includes('needed to') || text.includes('problem') || text.includes('sla') || text.includes('bottleneck') || text.includes('challenge') || text.includes('issue') || text.includes('faced');
    const taskScore = hasTask ? 15 : 5;
    if (!hasTask) feedback.push('Explicitly state the SLA, deadline, or engineering hurdle.');

    // 3. Action: Individual contribution ("I designed", "I implemented", "I refactored", "I solved")
    const actionCount = (text.match(/\b(i implemented|i designed|i built|i refactored|i profiled|i debugged|i led|i chose|i solved|i resolved)\b/g) || []).length;
    let actionScore = 20;
    if (actionCount >= 2) actionScore = 50;
    else if (actionCount >= 1) actionScore = 35;
    else feedback.push('Take direct ownership using "I designed/implemented" instead of ambiguous "We" phrasing.');

    // 4. Result: Measurable metrics (p95/p99, %, ms, $, users, throughput)
    const hasMetrics =
      /\b(\d+%\s*|\d+\s*ms|\d+\s*seconds|\$\d+|\d+\s*k|\d+\s*qps|\d+\s*users)\b/i.test(text) ||
      text.includes('reduced') || text.includes('increased') || text.includes('improved');
    const resultScore = hasMetrics ? 20 : 5;
    if (!hasMetrics) feedback.push('Quantify the outcome with concrete metrics (e.g. latency reduction, cost savings, RPS).');

    const totalScore = situationScore + taskScore + actionScore + resultScore;

    return {
      situationScore,
      taskScore,
      actionScore,
      resultScore,
      totalScore,
      feedback,
    };
  }
}
