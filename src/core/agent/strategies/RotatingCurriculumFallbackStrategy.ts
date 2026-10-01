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

    const fallbackTemplates = [
      `That makes a lot of sense, buddy! To think like a ${targetRole}, what specific latency metrics like p99 or error budgets would you monitor to prove to stakeholders that this design is holding up in production?`,
      `I really appreciate that technical perspective! When scaling that design across multiple availability zones, what is your primary strategy for data consistency and partition tolerance?`,
      `That is a super cool engineering approach! If traffic suddenly spiked by a factor of ten during a viral flash sale, what is the first component in that chain you would expect to bottleneck?`,
      `You are definitely thinking about the right trade-offs! How would you communicate that architectural decision to product managers who might be anxious about delivery timelines?`,
    ];

    return fallbackTemplates[turnIndex % fallbackTemplates.length];
  }
}
