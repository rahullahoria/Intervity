/**
 * Strategy Contract for Connected Mascot Dialogue Generation
 * 
 * Part of the Strategy & Chain-of-Responsibility Pattern.
 * Adheres to:
 * - Single Responsibility Principle (each strategy manages one pedagogical domain)
 * - Open/Closed Principle (new technical topics can be added without modifying existing strategies)
 */

import { TeddyDialogueContext } from '../TeddyDialogueEngine';

export interface IDialogueStrategy {
  /** Human-readable strategy identifier for telemetry & debugging */
  readonly name: string;

  /** Priority for evaluation order (higher numbers are evaluated first) */
  readonly priority: number;

  /** Determines if this strategy should handle the candidate's speech */
  canHandle(inputLower: string, context: TeddyDialogueContext): boolean;

  /** Generates a warm, connected, TTS-compliant spoken response */
  generateResponse(
    inputLower: string,
    context: TeddyDialogueContext,
    levelUpPrefix: string
  ): string;
}
