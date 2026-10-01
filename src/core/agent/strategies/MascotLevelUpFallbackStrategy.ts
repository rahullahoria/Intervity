import { IDialogueStrategy } from './IDialogueStrategy';
import { TeddyDialogueContext } from '../TeddyDialogueEngine';

export class MascotLevelUpFallbackStrategy implements IDialogueStrategy {
  readonly name = 'MascotLevelUpFallbackStrategy';
  readonly priority = 30;

  canHandle(_inputLower: string, context: TeddyDialogueContext): boolean {
    return Boolean(context.didLevelUp);
  }

  generateResponse(
    _inputLower: string,
    context: TeddyDialogueContext,
    levelUpPrefix: string
  ): string {
    const mascotLevel = context.mascotLevel ?? 2;
    const levelQuestions = [
      `How do you handle multi-region failovers and ensure zero data loss when critical database nodes go down under peak scale?`,
      `At this higher tier, how do you balance technical debt and architectural purity against rapid business feature delivery?`,
      `When mentoring other senior engineers, what is your approach to establishing coding standards and architectural reviews?`,
      `In distributed consensus, how do you prevent split-brain scenarios when cross-datacenter fiber links are severed?`,
    ];
    const q = levelQuestions[(mascotLevel - 2) % levelQuestions.length];
    return `${levelUpPrefix}${q}`;
  }
}
