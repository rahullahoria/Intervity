import { IDialogueStrategy } from './IDialogueStrategy';
import { TeddyDialogueContext } from '../TeddyDialogueEngine';

export class EmotionalSupportStrategy implements IDialogueStrategy {
  readonly name = 'EmotionalSupportStrategy';
  readonly priority = 90;

  canHandle(inputLower: string): boolean {
    return (
      inputLower.includes('nervous') ||
      inputLower.includes('stressed') ||
      inputLower.includes('scared') ||
      inputLower.includes('anxious') ||
      inputLower.includes('worried') ||
      inputLower.includes('overwhelmed') ||
      inputLower.includes('impostor') ||
      inputLower.includes('imposter')
    );
  }

  generateResponse(
    inputLower: string,
    context: TeddyDialogueContext,
    levelUpPrefix: string
  ): string {
    const friendName = context.candidateName && context.candidateName !== 'Candidate' && context.candidateName !== 'Friend'
      ? `, ${context.candidateName}`
      : '';

    if (
      inputLower.includes('failure mode') ||
      inputLower.includes('system design') ||
      inputLower.includes('interview')
    ) {
      return `${levelUpPrefix}Hey${friendName}, take a deep breath! It is completely normal to feel nervous when interviewers probe failure modes, because even veteran Staff architects get butterflies. We will conquer it together by treating failure as an expected state. What specific failure scenario feels most intimidating to you?`;
    }

    return `${levelUpPrefix}Hey${friendName}, take a deep breath. It is completely normal to feel that way! Even senior architects get butterflies before big milestones. I am right here in your corner and we will take it one step at a time together. What is the one thing that feels most intimidating right now?`;
  }
}
