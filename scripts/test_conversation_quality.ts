/**
 * 20-Turn Conversation Quality Benchmark & Automated Scorer
 * 
 * Simulates a realistic senior engineer preparing for Staff Software Architect / Tech Lead.
 * Evaluates:
 * 1. Warmth & Friendship Persona (Relationship building, emotional support, celebratory)
 * 2. Connected Continuity (No generic repeats, directly references candidate topics/words)
 * 3. Coaching Progression (Discovery -> Validation -> Improvement -> Learning)
 * 4. Technical Depth & Smartness (Analogies, architectural trade-offs, p99, failure modes)
 * 5. Spoken TTS Quality (Clean sentences, no markdown, no emojis, concise 2-4 sentences)
 */

import { AgentCoachingHarness } from '../src/core/agent/AgentCoachingHarness';
import { TeddyDialogueEngine } from '../src/core/agent/TeddyDialogueEngine';

export interface ConversationTurnEvaluation {
  turn: number;
  candidateSpeech: string;
  teddyResponse: string;
  phase: string;
  mascotLevel: number;
  scores: {
    friendshipAndWarmth: number;    // 0 to 2
    connectedContinuity: number;     // 0 to 2
    coachingProgression: number;     // 0 to 2
    technicalDepth: number;          // 0 to 2
    speechTtsQuality: number;        // 0 to 2
    turnTotal: number;               // 0 to 10
  };
  critiques: string[];
}

export interface ConversationBenchmarkResult {
  totalTurns: number;
  overallScore: number; // out of 10
  dimensionAverages: {
    friendshipAndWarmth: number;
    connectedContinuity: number;
    coachingProgression: number;
    technicalDepth: number;
    speechTtsQuality: number;
  };
  turnEvaluations: ConversationTurnEvaluation[];
  isPassing: boolean; // >= 7.0
}

// 20-turn realistic candidate trajectory
export const CANDIDATE_20_TURNS = [
  // Phase 1: DISCOVERY & RELATIONSHIP (Turns 1 - 4)
  "Hey Teddy! Excited to practice with you today.",
  "I am currently a senior engineer at Swiggy in Bengaluru, and my goal is to crack the Staff Software Architect role.",
  "Honestly, I get pretty nervous during system design interviews when interviewers probe deep failure modes.",
  "I've been leading the design of our high-throughput order dispatch service handling over 50,000 orders per minute.",

  // Phase 2: SKILL VALIDATION (Turns 5 - 9)
  "We rely heavily on Kafka for our event streams to decouple the order creation from delivery partner assignment.",
  "When Kafka consumer lag spikes during lunch peaks, we dynamically scale consumer pods and use partition key rebalancing.",
  "For low latency status lookups, we cache active delivery routes in a distributed Redis cluster.",
  "If the Redis node crashes, we implement Redis Sentinel automatic failover, and critical mutations fall back to PostgreSQL with row-level locks.",
  "We also implemented database sharding on PostgreSQL partitioned by restaurant city ID to prevent any single database hotspot.",

  // Phase 3: SKILL IMPROVEMENT - BREAKING THE L4 CEILING (Turns 10 - 14)
  "As a Staff candidate, how should I justify choosing asynchronous event streams over synchronous gRPC for order dispatch?",
  "When handling network partitions across multiple availability zones, how do I defend the trade-off between CAP consistency and availability?",
  "I also need to mentor junior engineers on the team who struggle with race conditions in concurrent Go routines.",
  "How do I present telemetry to senior leadership to prove our p99 latency SLA stays under 100 milliseconds?",
  "During a major production outage where the primary payment gateway failed, I stepped up to lead the incident bridge and coordinated disaster recovery.",

  // Phase 4: SKILL LEARNING - ADVANCED ARCHITECTURE (Turns 15 - 20)
  "Can you teach me how to prevent cache stampede when a viral restaurant discount drops simultaneously for a million users?",
  "Could you explain Raft distributed consensus and how leader election avoids split-brain scenarios?",
  "I have heard about database deadlocks under high concurrency, what is the best way to explain prevention in an interview?",
  "What about JSI vs the old React Native bridge? How does host object memory sharing actually work?",
  "How should I structure my final STAR answers when answering questions about cross-team engineering leadership conflicts?",
  "Thanks Teddy, this practice session was fantastic! I feel so much more confident walking into my Staff Architect interview."
];

export async function run20TurnBenchmark(): Promise<ConversationBenchmarkResult> {
  const harness = new AgentCoachingHarness();
  await harness.initialize();

  const turnEvaluations: ConversationTurnEvaluation[] = [];
  const seenResponses = new Set<string>();

  for (let i = 0; i < CANDIDATE_20_TURNS.length; i++) {
    const candidateSpeech = CANDIDATE_20_TURNS[i];
    const outcome = await harness.processUserSpeechTurn(candidateSpeech, i);
    const teddyResponse = outcome.responseClause;

    // Evaluate turn quality
    const critiques: string[] = [];
    let friendshipScore = 2.0;
    let continuityScore = 2.0;
    let coachingScore = 2.0;
    let technicalScore = 2.0;
    let ttsScore = 2.0;

    // 1. Spoken TTS Quality Checks
    const hasMarkdown = /[\*#`_~\[\]]/.test(teddyResponse);
    const hasEmoji = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}]/u.test(teddyResponse);
    const sentenceCount = (teddyResponse.match(/[.?!](\s|$)/g) || []).length;
    const wordCount = teddyResponse.split(/\s+/).length;

    if (hasMarkdown) {
      ttsScore -= 1.0;
      critiques.push('Contained markdown formatting (unsuitable for TTS)');
    }
    if (hasEmoji) {
      ttsScore -= 1.0;
      critiques.push('Contained emojis (TTS cannot speak emojis naturally)');
    }
    if (wordCount > 75 || sentenceCount > 5) {
      ttsScore -= 0.5;
      critiques.push(`Too verbose for voice turn (${wordCount} words, ${sentenceCount} sentences)`);
    }
    if (wordCount < 10) {
      ttsScore -= 1.0;
      critiques.push('Too brief for a meaningful coaching turn');
    }

    // 2. Connected Continuity & Repetition Checks
    if (seenResponses.has(teddyResponse)) {
      continuityScore -= 1.5;
      critiques.push('Repeated identical response from a previous turn (breaks connected dialogue)');
    }
    seenResponses.add(teddyResponse);

    // Check if Teddy acknowledged keywords or topics from candidate speech
    const candidateWords = candidateSpeech.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 4 && !['about', 'there', 'today', 'really', 'pretty', 'under', 'handling', 'doing'].includes(w));
    
    const responseLower = teddyResponse.toLowerCase();
    const hasWordEcho = candidateWords.some(w => responseLower.includes(w));
    if (!hasWordEcho && !['hello', 'hi', 'hey'].includes(candidateSpeech.toLowerCase())) {
      continuityScore -= 0.5;
      critiques.push('Did not echo or explicitly connect to candidate key nouns/concepts');
    }

    // 3. Friendship & Warmth Checks
    const warmWords = ['hey', 'friend', 'excited', 'proud', 'awesome', 'breath', 'together', 'love', 'buddy', 'corner', 'win', 'normal', 'fun', 'super', 'explore'];
    const hasWarmth = warmWords.some(w => responseLower.includes(w));
    if (!hasWarmth) {
      friendshipScore -= 0.8;
      critiques.push('Lacks warm friend tone / conversational connection');
    }

    // 4. Coaching Progression Checks
    const endsWithQuestion = teddyResponse.trim().endsWith('?');
    if (!endsWithQuestion) {
      coachingScore -= 0.8;
      critiques.push('Does not end with a focused coaching question or prompt');
    }

    // 5. Technical Depth Checks
    const techInsightWords = ['kafka', 'redis', 'raft', 'shard', 'latency', 'lock', 'concurrency', 'p99', 'trade-off', 'failover', 'scale', 'partition', 'stampede', 'bridge', 'jsi', 'consensus', 'outage', 'sla', 'leader'];
    const hasTechDepth = techInsightWords.some(w => responseLower.includes(w));
    if (i >= 4 && !hasTechDepth) {
      technicalScore -= 0.8;
      critiques.push('Lacks technical specificity / architectural rigor');
    }

    // Clamp scores
    friendshipScore = Math.max(0, Math.min(2, friendshipScore));
    continuityScore = Math.max(0, Math.min(2, continuityScore));
    coachingScore = Math.max(0, Math.min(2, coachingScore));
    technicalScore = Math.max(0, Math.min(2, technicalScore));
    ttsScore = Math.max(0, Math.min(2, ttsScore));

    const turnTotal = Number((friendshipScore + continuityScore + coachingScore + technicalScore + ttsScore).toFixed(1));

    turnEvaluations.push({
      turn: i + 1,
      candidateSpeech,
      teddyResponse,
      phase: outcome.currentPhase,
      mascotLevel: outcome.newLevel || 1,
      scores: {
        friendshipAndWarmth: friendshipScore,
        connectedContinuity: continuityScore,
        coachingProgression: coachingScore,
        technicalDepth: technicalScore,
        speechTtsQuality: ttsScore,
        turnTotal,
      },
      critiques,
    });
  }

  // Calculate dimension averages
  const count = turnEvaluations.length;
  const avg = (fn: (e: ConversationTurnEvaluation) => number) =>
    Number((turnEvaluations.reduce((sum, e) => sum + fn(e), 0) / count).toFixed(2));

  const dimensionAverages = {
    friendshipAndWarmth: avg(e => e.scores.friendshipAndWarmth),
    connectedContinuity: avg(e => e.scores.connectedContinuity),
    coachingProgression: avg(e => e.scores.coachingProgression),
    technicalDepth: avg(e => e.scores.technicalDepth),
    speechTtsQuality: avg(e => e.scores.speechTtsQuality),
  };

  const overallScore = Number((
    dimensionAverages.friendshipAndWarmth +
    dimensionAverages.connectedContinuity +
    dimensionAverages.coachingProgression +
    dimensionAverages.technicalDepth +
    dimensionAverages.speechTtsQuality
  ).toFixed(2));

  return {
    totalTurns: count,
    overallScore,
    dimensionAverages,
    turnEvaluations,
    isPassing: overallScore >= 7.0,
  };
}

// Run if called directly
if (import.meta.main) {
  run20TurnBenchmark().then(res => {
    console.log('====================================================');
    console.log(`20-TURN CONVERSATION BENCHMARK RESULT: ${res.overallScore} / 10.0`);
    console.log(`Status: ${res.isPassing ? 'PASSED (>= 7.0)' : 'FAILED (< 7.0)'}`);
    console.log('Dimension Breakdown:');
    console.log(`- Friendship & Warmth:    ${res.dimensionAverages.friendshipAndWarmth} / 2.0`);
    console.log(`- Connected Continuity:   ${res.dimensionAverages.connectedContinuity} / 2.0`);
    console.log(`- Coaching Progression:   ${res.dimensionAverages.coachingProgression} / 2.0`);
    console.log(`- Technical Depth:        ${res.dimensionAverages.technicalDepth} / 2.0`);
    console.log(`- Spoken TTS Quality:     ${res.dimensionAverages.speechTtsQuality} / 2.0`);
    console.log('====================================================');
    
    // Print turns with critiques
    for (const t of res.turnEvaluations) {
      console.log(`\n[Turn ${t.turn}] [Score: ${t.scores.turnTotal}/10] [Phase: ${t.phase}] [Lvl: ${t.mascotLevel}]`);
      console.log(`Candidate: "${t.candidateSpeech}"`);
      console.log(`Teddy:     "${t.teddyResponse}"`);
      if (t.critiques.length > 0) {
        console.log(`Critiques: ${t.critiques.join('; ')}`);
      }
    }
  });
}
