import { IDialogueStrategy } from './IDialogueStrategy';
import { TeddyDialogueContext } from '../TeddyDialogueEngine';

export class GreetingStrategy implements IDialogueStrategy {
  readonly name = 'GreetingStrategy';
  readonly priority = 40;

  canHandle(inputLower: string, context: TeddyDialogueContext): boolean {
    const turnIndex = context.turnIndex ?? 0;
    return (
      turnIndex === 0 ||
      inputLower === 'hello' ||
      inputLower === 'hi' ||
      inputLower === 'hey' ||
      inputLower.startsWith('hello') ||
      inputLower.startsWith('hi') ||
      inputLower.startsWith('hey') ||
      inputLower.includes('practice') ||
      inputLower.includes('start') ||
      inputLower.length < 8
    );
  }

  generateResponse(
    _inputLower: string,
    context: TeddyDialogueContext,
    levelUpPrefix: string
  ): string {
    const friendName = context.candidateName && context.candidateName !== 'Candidate' && context.candidateName !== 'Friend'
      ? `, ${context.candidateName}`
      : '';

    return `${levelUpPrefix}Hey there${friendName}! I am Teddy, your coding buddy and personal career coach. I am so excited to practice with you! Tell me, what are you working on right now, or what is a dream role you have got your eyes on?`;
  }
}
