import { IDialogueStrategy } from './IDialogueStrategy';
import { TeddyDialogueContext } from '../TeddyDialogueEngine';

export class ProjectDiscoveryStrategy implements IDialogueStrategy {
  readonly name = 'ProjectDiscoveryStrategy';
  readonly priority = 50;

  canHandle(inputLower: string): boolean {
    return (
      inputLower.includes('ai app') ||
      inputLower.includes('ai project') ||
      inputLower.includes('building an ai') ||
      inputLower.includes('llm') ||
      inputLower.includes('agent') ||
      inputLower.includes('react native') ||
      inputLower.includes('mobile app') ||
      inputLower.includes('ios') ||
      inputLower.includes('android') ||
      inputLower.includes('flutter') ||
      inputLower.includes('backend') ||
      inputLower.includes('microservice') ||
      inputLower.includes('postgres') ||
      inputLower.includes('golang') ||
      inputLower.includes('staff') ||
      inputLower.includes('principal') ||
      inputLower.includes('architect') ||
      inputLower.includes('cto') ||
      inputLower.includes('director') ||
      inputLower.includes('manager')
    );
  }

  generateResponse(
    inputLower: string,
    context: TeddyDialogueContext,
    levelUpPrefix: string
  ): string {
    const targetRole = context.targetRole || 'Staff Software Architect';

    // 1. AI Apps & Agentic Systems
    if (
      inputLower.includes('ai app') ||
      inputLower.includes('ai project') ||
      inputLower.includes('building an ai') ||
      inputLower.includes('llm') ||
      inputLower.includes('agent')
    ) {
      return `${levelUpPrefix}An AI app! That sounds amazing, and I love building with AI! Tell me, are you running on-device models or talking to cloud APIs, and what has been the coolest or most challenging part of it so far?`;
    }

    // 2. React Native & Mobile Client Performance
    if (
      inputLower.includes('react native') ||
      inputLower.includes('mobile app') ||
      inputLower.includes('ios') ||
      inputLower.includes('android') ||
      inputLower.includes('flutter')
    ) {
      return `${levelUpPrefix}Mobile engineering is so fun, but keeping the UI running at a butter-smooth 60 frames per second is always an adventure! What is the architecture of your app, and how are you managing local state and offline sync?`;
    }

    // 3. Backend & Microservices Architecture
    if (
      inputLower.includes('backend') ||
      inputLower.includes('microservice') ||
      inputLower.includes('postgres') ||
      inputLower.includes('golang')
    ) {
      return `${levelUpPrefix}Backend engineering is where the heavy lifting happens! Balancing high throughput with low latency is super satisfying. What kind of traffic or scale are you designing for, and what database is powering it?`;
    }

    // 4. Staff IC Ambitions
    if (
      inputLower.includes('staff') ||
      inputLower.includes('principal') ||
      inputLower.includes('architect')
    ) {
      return `${levelUpPrefix}Staff Software Architect! That is a huge and exciting milestone, and I know we can get you there together. At the Staff level, it is all about navigating messy trade-offs and lifting up the whole team. What is one project you are leading right now that lets you flex that architectural muscle?`;
    }

    // 5. Engineering Leadership Ambitions
    return `${levelUpPrefix}Stepping into engineering leadership! I love that big vision. Leading as a ${targetRole} is all about balancing speed of delivery against long-term architectural health and team culture. What is your top priority as you build toward that leadership role?`;
  }
}
