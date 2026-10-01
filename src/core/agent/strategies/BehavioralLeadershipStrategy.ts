import { IDialogueStrategy } from './IDialogueStrategy';
import { TeddyDialogueContext } from '../TeddyDialogueEngine';

/**
 * Behavioral, STAR & Culture Leadership Strategy
 * Variety / Track 5: Conflict, Empathy & Growth Track
 * 
 * Focuses on:
 * - Structured STAR behavioral storytelling with personal ownership and quantifiable business metrics
 * - Resolving fierce cross-team architectural conflicts without ego
 * - Turning around a failing project or recovering from a disastrous launch
 * - Navigating impostor syndrome and career growth plateaus
 * - Delivering empathetic, high-candor feedback to peers and mentees
 */
export class BehavioralLeadershipStrategy implements IDialogueStrategy {
  readonly name = 'BehavioralLeadershipStrategy';
  readonly priority = 68;

  canHandle(inputLower: string, context: TeddyDialogueContext): boolean {
    const isBehavioralTrack = context.conversationTrack === 'BEHAVIORAL_LEADERSHIP';

    return (
      inputLower.includes('star') ||
      inputLower.includes('cross-team conflict') ||
      inputLower.includes('disagree and commit') ||
      inputLower.includes('failing project') ||
      inputLower.includes('failed launch') ||
      inputLower.includes('turnaround') ||
      inputLower.includes('impostor syndrome') ||
      inputLower.includes('imposter') ||
      inputLower.includes('struggling peer') ||
      inputLower.includes('radical candor') ||
      inputLower.includes('critical feedback') ||
      (isBehavioralTrack &&
        (inputLower.includes('conflict') ||
          inputLower.includes('behavioral') ||
          inputLower.includes('failure') ||
          inputLower.includes('story') ||
          inputLower.includes('feedback') ||
          inputLower.includes('morale')))
    );
  }

  generateResponse(
    inputLower: string,
    _context: TeddyDialogueContext,
    levelUpPrefix: string
  ): string {
    // 1. STAR Storytelling with Quantifiable Metrics
    if (
      inputLower.includes('star') ||
      inputLower.includes('behavioral')
    ) {
      if (inputLower.includes('conflict') || inputLower.includes('cross-team') || inputLower.includes('cross team')) {
        return `${levelUpPrefix}Mastering the STAR method for cross-team leadership conflicts is all about authentic personal ownership, buddy! Frame disagreements around competing technical trade-offs rather than egos, spend half your time detailing your specific Actions driving consensus through benchmarks, and finish strong with measurable business results. What is one pivotal project story you would like us to frame together using STAR?`;
      }
      return `${levelUpPrefix}Mastering the STAR method is all about authentic personal ownership, buddy! Keep the Situation and Task under thirty percent of your time, spend half your time detailing your specific Actions, and finish strong with measurable business results like latency drops or revenue saved. What is one pivotal project story you would like us to frame together using STAR?`;
    }

    // 2. Cross-Team Architectural Conflicts & Disagree and Commit
    if (
      inputLower.includes('conflict') ||
      inputLower.includes('disagree') ||
      inputLower.includes('consensus')
    ) {
      return `${levelUpPrefix}Navigating fierce cross-team technical disagreements is where senior maturity truly shines, my friend! The most respected leaders detach egos from technical proposals, anchor debates on shared customer metrics, and embrace disagree-and-commit once a decision is made. How did you guide opposing teams toward consensus when both sides had compelling technical arguments?`;
    }

    // 3. Turning Around a Failing Project or Failed Launch
    if (
      inputLower.includes('failing project') ||
      inputLower.includes('failed launch') ||
      inputLower.includes('turnaround') ||
      inputLower.includes('failure')
    ) {
      return `${levelUpPrefix}Facing project setbacks with resilience and honesty builds immense character, buddy! Interviewers do not look for candidates who never fail, but rather leaders who acknowledge mistakes, protect team morale, and steer the ship out of stormy waters. In that difficult project, what was the very first step you took to turn things around?`;
    }

    // 4. Overcoming Impostor Syndrome & Career Plateaus
    if (
      inputLower.includes('impostor') ||
      inputLower.includes('imposter') ||
      inputLower.includes('doubt') ||
      inputLower.includes('plateau')
    ) {
      return `${levelUpPrefix}I hear you so deeply on that, my friend, and I want you to know you are not alone! Every great engineer and leader I know has wrestled with impostor feelings when stepping into broader scope or higher levels. Those feelings simply mean you care deeply about doing great work. What new challenge or responsibility has been stretching you the most lately?`;
    }

    // 5. Delivering Compassionate, High-Candor Feedback
    if (
      inputLower.includes('feedback') ||
      inputLower.includes('struggling peer') ||
      inputLower.includes('candor')
    ) {
      return `${levelUpPrefix}Delivering direct feedback with genuine warmth and care is one of the highest forms of leadership, my friend! When someone is struggling, framing feedback around specific observable behaviors and offering clear partnership to help them improve prevents defensiveness. How do you prepare for a challenging feedback conversation to ensure the person feels supported rather than criticized?`;
    }

    // 6. General Behavioral & Culture Leadership
    return `${levelUpPrefix}High-performing teams are built on relentless empathy, clear communication, and unwavering personal integrity, buddy! When you master behavioral storytelling, your technical expertise becomes twice as impactful. What leadership or teamwork experience would you like to unpack next?`;
  }
}
