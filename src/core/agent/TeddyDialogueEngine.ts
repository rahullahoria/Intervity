/**
 * Teddy Dialogue Engine: The Mascot Personality & Connected Conversation Core
 *
 * Implements:
 * 1. Strategy & Chain-of-Responsibility Patterns: Modular, prioritized dialogue strategies
 * 2. Warm Friendship Persona: Empathetic, humble, enthusiastic, caring, celebratory
 * 3. Connected Conversations ONLY: Every response explicitly references what the user just said
 * 4. Relationship Building: Emotional check-ins, remembering projects/names, validating struggles
 * 5. Conversational Learning: Discovery, Validation, Improvement, and Learning with vivid analogies
 * 6. Kokoro-82M TTS Spoken Cleanliness: No markdown, no emojis, concise 2-4 sentences, single warm ending question
 */

import {
  IDialogueStrategy,
  GratitudeWrapUpStrategy,
  EmotionalSupportStrategy,
  AnalogicalTeachingStrategy,
  StaffElevationStrategy,
  HighScaleValidationStrategy,
  ProjectDiscoveryStrategy,
  GreetingStrategy,
  MascotLevelUpFallbackStrategy,
  RotatingCurriculumFallbackStrategy,
} from './strategies';

export interface TeddyDialogueContext {
  candidateName?: string;
  currentRole?: string;
  targetRole?: string;
  targetCompany?: string;
  strengths?: string[];
  validatedSkills?: string[];
  skillsToSharpen?: string[];
  newSkillsToLearn?: string[];
  currentPhase?: 'DISCOVERY' | 'VALIDATION' | 'IMPROVEMENT' | 'LEARNING';
  turnIndex?: number;
  mascotLevel?: number;
  mascotTier?: string;
  recentTopics?: string[];
  didLevelUp?: boolean;
}

export class TeddyDialogueEngine {
  private static strategies: IDialogueStrategy[] = [
    new GratitudeWrapUpStrategy(),
    new EmotionalSupportStrategy(),
    new AnalogicalTeachingStrategy(),
    new StaffElevationStrategy(),
    new HighScaleValidationStrategy(),
    new ProjectDiscoveryStrategy(),
    new GreetingStrategy(),
    new MascotLevelUpFallbackStrategy(),
    new RotatingCurriculumFallbackStrategy(),
  ].sort((a, b) => b.priority - a.priority);

  /**
   * Registers a custom dialogue strategy into the pipeline (Open/Closed Principle)
   */
  static registerStrategy(strategy: IDialogueStrategy): void {
    this.strategies.push(strategy);
    this.strategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Inspect currently active strategies in evaluation priority order
   */
  static getRegisteredStrategies(): readonly IDialogueStrategy[] {
    return this.strategies;
  }

  /**
   * Resets strategies to default built-in configuration (useful for unit tests)
   */
  static resetStrategies(): void {
    this.strategies = [
      new GratitudeWrapUpStrategy(),
      new EmotionalSupportStrategy(),
      new AnalogicalTeachingStrategy(),
      new StaffElevationStrategy(),
      new HighScaleValidationStrategy(),
      new ProjectDiscoveryStrategy(),
      new GreetingStrategy(),
      new MascotLevelUpFallbackStrategy(),
      new RotatingCurriculumFallbackStrategy(),
    ].sort((a, b) => b.priority - a.priority);
  }

  /**
   * Generates a completely connected, friend-like response from Teddy
   * that directly reflects the user's speech and advances the relationship and learning.
   */
  static generateConnectedResponse(
    userText: string,
    context: TeddyDialogueContext = {}
  ): string {
    const textLower = userText.toLowerCase().trim();
    const {
      mascotLevel = 1,
      mascotTier = 'Warm Friend & Coding Buddy',
      didLevelUp = false,
    } = context;

    // Concise, punchy level-up celebration that keeps TTS spoken sentence count optimal
    const levelUpPrefix = didLevelUp
      ? `Level ${mascotLevel} unlocked as ${mascotTier}! `
      : '';

    for (const strategy of this.strategies) {
      if (strategy.canHandle(textLower, context)) {
        return strategy.generateResponse(textLower, context, levelUpPrefix);
      }
    }

    return new RotatingCurriculumFallbackStrategy().generateResponse(
      textLower,
      context,
      levelUpPrefix
    );
  }
}
