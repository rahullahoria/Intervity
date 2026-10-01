import { IDialogueStrategy } from './IDialogueStrategy';
import { TeddyDialogueContext } from '../TeddyDialogueEngine';

export class GratitudeWrapUpStrategy implements IDialogueStrategy {
  readonly name = 'GratitudeWrapUpStrategy';
  readonly priority = 100;

  canHandle(inputLower: string): boolean {
    return (
      (inputLower.includes('thank') || inputLower.includes('thanks')) &&
      (inputLower.includes('fantastic') ||
        inputLower.includes('great') ||
        inputLower.includes('awesome') ||
        inputLower.includes('practice') ||
        inputLower.includes('session') ||
        inputLower.includes('confident'))
    );
  }

  generateResponse(
    _inputLower: string,
    context: TeddyDialogueContext,
    levelUpPrefix: string
  ): string {
    const targetRole = context.targetRole || 'Staff Software Architect';
    return `${levelUpPrefix}I am so proud of you, buddy! You navigated deep distributed trade-offs and leadership scenarios with awesome clarity. You belong in that ${targetRole} chair, so go crush it! What is your final game plan before interview day?`;
  }
}
