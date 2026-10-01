import { IDialogueStrategy } from './IDialogueStrategy';
import { TeddyDialogueContext } from '../TeddyDialogueEngine';

export class RotatingCurriculumFallbackStrategy implements IDialogueStrategy {
  readonly name = 'RotatingCurriculumFallbackStrategy';
  readonly priority = 10;

  canHandle(_inputLower: string, _context: TeddyDialogueContext): boolean {
    return true; // Catch-all default
  }

  generateResponse(
    _inputLower: string,
    context: TeddyDialogueContext,
    _levelUpPrefix: string
  ): string {
    const targetRole = context.targetRole || 'Staff Software Architect';
    const turnIndex = context.turnIndex ?? 0;
    const track = context.conversationTrack || 'DISTRIBUTED_SYSTEMS';

    let templates: string[];

    switch (track) {
      case 'ENGINEERING_LEADERSHIP':
        templates = [
          `That makes total sense from an engineering leadership view, buddy! How do you rally product managers and executives behind this technical direction when they are pushing hard for next sprint's features?`,
          `I really appreciate that leadership perspective! When delegating execution to your senior engineers, what guardrails or metrics do you establish so they have full autonomy without drifting off track?`,
          `That is a very thoughtful management approach! If your team experienced a severe Sev-1 outage due to this system, how would you structure the postmortem to foster psychological safety?`,
          `You are navigating the people and technical balance so well! How would you use this experience to coach an aspiring senior engineer looking to step up into team leadership?`,
        ];
        break;

      case 'CLIENT_PERFORMANCE':
        templates = [
          `That is a super sharp client-side perspective! When profiling on mid-tier Android devices, what specific frame timing metrics like slow renders or frozen frames do you monitor to protect 60 FPS?`,
          `I love how you are thinking about mobile constraints! How does this design behave when a device drops into offline mode with intermittent network connectivity?`,
          `That is a really clever frontend architecture! How do you ensure this feature does not bloat your application initial bundle size or trigger unnecessary Hermes garbage collection pauses?`,
          `You are definitely mastering the client runtime! If this component re-rendered fifty times during a complex gesture, how would you isolate and eliminate the extra work?`,
        ];
        break;

      case 'AI_DATA_PLATFORM':
        templates = [
          `That is a fascinating AI platform insight, my friend! How do you measure the trade-off between retrieval latency and model accuracy when deploying this pipeline under high concurrency?`,
          `I love that ML systems thinking! What automated monitoring do you put in place to detect data or concept drift before inference quality degrades for users?`,
          `That is a very clean architecture! If you had to run this model on edge devices with strict 4GB RAM limits, what quantization or pruning strategy would you reach for?`,
          `You are really thinking like an AI systems architect! How do you ensure reproducible evaluations so your team can safely ship new model checkpoints to production?`,
        ];
        break;

      case 'BEHAVIORAL_LEADERSHIP':
        templates = [
          `That reflects wonderful self-awareness and maturity, buddy! If you were framing this as a STAR story in a high-stakes interview, what measurable business result would you highlight at the end?`,
          `I really admire that empathetic approach! When working through conflicting viewpoints on this project, how did you ensure everyone on the team felt heard and respected?`,
          `That is a great example of personal ownership! If you could go back to the very beginning of that challenging situation, what is one thing you would do differently?`,
          `You are showing genuine culture leadership! How did your actions during that critical moment help build long-term trust across the team?`,
        ];
        break;

      case 'DISTRIBUTED_SYSTEMS':
      default:
        templates = [
          `That makes a lot of sense, buddy! To think like a ${targetRole}, what specific latency metrics like p99 or error budgets would you monitor to prove to stakeholders that this design is holding up in production?`,
          `I really appreciate that technical perspective! When scaling that design across multiple availability zones, what is your primary strategy for data consistency and partition tolerance?`,
          `That is a super cool engineering approach! If traffic suddenly spiked by a factor of ten during a viral flash sale, what is the first component in that chain you would expect to bottleneck?`,
          `You are definitely thinking about the right trade-offs! How would you communicate that architectural decision to product managers who might be anxious about delivery timelines?`,
        ];
        break;
    }

    return templates[turnIndex % templates.length];
  }
}
