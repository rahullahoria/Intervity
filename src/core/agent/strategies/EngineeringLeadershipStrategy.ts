import { IDialogueStrategy } from './IDialogueStrategy';
import { TeddyDialogueContext } from '../TeddyDialogueEngine';

/**
 * Engineering Leadership & Management Strategy
 * Variety / Track 2: EM, Director, and VP / CTO Level Conversations
 * 
 * Focuses on:
 * - Balancing technical debt refactoring with product delivery velocity
 * - Defending engineering architecture to executive stakeholders
 * - Incident command, disaster recovery, and blameless postmortems
 * - Squad autonomy, architectural RFCs, and cross-team alignment
 * - Performance management, retention, and engineering culture
 */
export class EngineeringLeadershipStrategy implements IDialogueStrategy {
  readonly name = 'EngineeringLeadershipStrategy';
  readonly priority = 65;

  canHandle(inputLower: string, context: TeddyDialogueContext): boolean {
    const isLeadershipTrack = context.conversationTrack === 'ENGINEERING_LEADERSHIP';

    return (
      inputLower.includes('tech debt') ||
      inputLower.includes('technical debt') ||
      (inputLower.includes('refactor') && (inputLower.includes('product') || inputLower.includes('business') || inputLower.includes('velocity'))) ||
      inputLower.includes('executive') ||
      inputLower.includes('vp of product') ||
      inputLower.includes('stakeholder') ||
      inputLower.includes('incident commander') ||
      inputLower.includes('blameless postmortem') ||
      inputLower.includes('postmortem') ||
      inputLower.includes('squad') ||
      inputLower.includes('autonomy') ||
      inputLower.includes('rfc') ||
      inputLower.includes('underperform') ||
      inputLower.includes('one-on-one') ||
      inputLower.includes('1-on-1') ||
      inputLower.includes('career ladder') ||
      (isLeadershipTrack &&
        (inputLower.includes('team') ||
          inputLower.includes('manage') ||
          inputLower.includes('lead') ||
          inputLower.includes('culture') ||
          inputLower.includes('priority')))
    );
  }

  generateResponse(
    inputLower: string,
    _context: TeddyDialogueContext,
    levelUpPrefix: string
  ): string {
    // 1. Tech Debt vs Product Delivery Velocity
    if (
      inputLower.includes('tech debt') ||
      inputLower.includes('technical debt') ||
      (inputLower.includes('refactor') && (inputLower.includes('product') || inputLower.includes('velocity')))
    ) {
      return `${levelUpPrefix}Balancing technical debt against product shipping velocity is the eternal tightrope of engineering leadership, buddy! The best leaders reframe tech debt into business risk like slower iteration cycles and customer churn rather than purely aesthetic clean code. When product partners push for urgent features, how do you negotiate dedicated capacity for foundational reliability?`;
    }

    // 2. Defending Engineering Roadmaps to Executives & Stakeholders
    if (
      inputLower.includes('executive') ||
      inputLower.includes('vp of product') ||
      inputLower.includes('stakeholder') ||
      inputLower.includes('business')
    ) {
      return `${levelUpPrefix}Translating complex engineering trade-offs into executive language is a superpower, my friend! Senior leaders care about revenue protection, developer efficiency, and system reliability over technical minutiae. How do you tie your team technical roadmap directly to business objectives so executives enthusiastically champion your investments?`;
    }

    // 3. Incident Commander & Blameless Postmortems
    if (
      inputLower.includes('incident commander') ||
      inputLower.includes('blameless postmortem') ||
      inputLower.includes('postmortem') ||
      inputLower.includes('outage')
    ) {
      return `${levelUpPrefix}High-pressure incident command is where organizational trust is forged, buddy! Establishing a calm, single source of truth during an outage protects your engineers from panic, while blameless postmortems turn expensive failures into systemic defenses. What is your playbook for guiding a team through an incident without finger-pointing?`;
    }

    // 4. Team Autonomy vs Cross-Squad Architectural Alignment
    if (
      inputLower.includes('autonomy') ||
      inputLower.includes('squad') ||
      inputLower.includes('rfc') ||
      inputLower.includes('standards')
    ) {
      return `${levelUpPrefix}Giving squads autonomy while preventing architectural fragmentation across the organization is a classic challenge, my friend! Lightweight Request For Comments processes and shared paved roads let teams move fast without accidentally reinventing six different datastores. How do you decide when to mandate a company-wide technical standard versus letting a squad choose their own tools?`;
    }

    // 5. One-on-Ones, Performance Management & Retaining High Performers
    if (
      inputLower.includes('underperform') ||
      inputLower.includes('one-on-one') ||
      inputLower.includes('1-on-1') ||
      inputLower.includes('career ladder') ||
      inputLower.includes('retention')
    ) {
      return `${levelUpPrefix}Nurturing people and keeping them engaged is truly the heart of great engineering leadership, my friend! For underperforming team members, clarity and early compassionate feedback are key, while your top performers thrive on autonomy and career sponsorship. What is your philosophy for running meaningful one-on-ones that unlock long-term growth?`;
    }

    // 6. General Engineering Leadership & Strategy
    return `${levelUpPrefix}True engineering leadership is about multiplying the impact of everyone around you and creating high-trust psychological safety, buddy! It means coaching seniors into staff engineers and aligning everyday commits with strategic company goals. What leadership challenge on your team is top of mind for you today?`;
  }
}
