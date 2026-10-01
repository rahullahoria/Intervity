import { IDialogueStrategy } from './IDialogueStrategy';
import { TeddyDialogueContext } from '../TeddyDialogueEngine';

/**
 * Client Architecture & Mobile Performance Strategy
 * Variety / Track 3: Staff Mobile & Frontend Performance Track
 * 
 * Focuses on:
 * - 60/120 FPS jank-free rendering pipelines and frame drop prevention
 * - React Native JSI memory sharing vs legacy JSON bridge serialization
 * - TurboModules and Fabric C++ rendering architecture
 * - Offline-first SQLite local-first sync and conflict resolution
 * - Hermes engine memory layout, GC pause tuning, and bundle optimization
 */
export class ClientPerformanceStrategy implements IDialogueStrategy {
  readonly name = 'ClientPerformanceStrategy';
  readonly priority = 66;

  canHandle(inputLower: string, context: TeddyDialogueContext): boolean {
    const isClientTrack = context.conversationTrack === 'CLIENT_PERFORMANCE';

    return (
      inputLower.includes('60 fps') ||
      inputLower.includes('120 fps') ||
      inputLower.includes('frame drop') ||
      inputLower.includes('jank') ||
      inputLower.includes('ui thread') ||
      inputLower.includes('reanimated') ||
      inputLower.includes('turbomodule') ||
      inputLower.includes('fabric') ||
      (inputLower.includes('new architecture') && inputLower.includes('react native')) ||
      (inputLower.includes('offline') && (inputLower.includes('sqlite') || inputLower.includes('sync'))) ||
      inputLower.includes('crdt') ||
      inputLower.includes('watermelondb') ||
      inputLower.includes('hermes') ||
      inputLower.includes('garbage collection') ||
      inputLower.includes('gc pause') ||
      inputLower.includes('memory leak') ||
      (isClientTrack &&
        (inputLower.includes('mobile') ||
          inputLower.includes('client') ||
          inputLower.includes('render') ||
          inputLower.includes('react native') ||
          inputLower.includes('performance')))
    );
  }

  generateResponse(
    inputLower: string,
    _context: TeddyDialogueContext,
    levelUpPrefix: string
  ): string {
    // 1. 60/120 FPS Render Pipelines & UI Thread Jank Prevention
    if (
      inputLower.includes('60 fps') ||
      inputLower.includes('120 fps') ||
      inputLower.includes('frame drop') ||
      inputLower.includes('jank') ||
      inputLower.includes('ui thread') ||
      inputLower.includes('reanimated')
    ) {
      return `${levelUpPrefix}Maintaining a butter-smooth 60 or 120 frames per second is the ultimate mark of mobile craftsmanship, buddy! Every dropped frame breaks user immersion, which is why running gestures and layout animations directly on the UI thread without crossing thread boundaries is crucial. When rendering heavy scrolling feeds, what profiling techniques do you use to detect and eliminate main-thread bottlenecks?`;
    }

    // 2. TurboModules & Fabric New Architecture
    if (
      inputLower.includes('turbomodule') ||
      inputLower.includes('fabric') ||
      (inputLower.includes('new architecture') && inputLower.includes('react native'))
    ) {
      return `${levelUpPrefix}The new React Native architecture with Fabric and TurboModules is an incredible leap forward, buddy! By generating native C++ bindings through Codegen, layout computations and component mounting happen synchronously without asynchronous bridge latency. What has been your experience migrating native modules or measuring rendering speedups with Fabric?`;
    }

    // 3. Offline-First SQLite Local Sync & Conflict Resolution
    if (
      (inputLower.includes('offline') && (inputLower.includes('sqlite') || inputLower.includes('sync'))) ||
      inputLower.includes('crdt') ||
      inputLower.includes('watermelondb')
    ) {
      return `${levelUpPrefix}Designing an offline-first architecture with local SQLite storage gives users an instantaneous, dependable app experience, my friend! But merging offline mutations back into the cloud requires careful conflict resolution strategies like CRDTs or deterministic timestamps. How do you handle schema migrations and sync collisions when clients reconnect after being offline for days?`;
    }

    // 4. Hermes Engine GC Pauses & Memory Leaks
    if (
      inputLower.includes('hermes') ||
      inputLower.includes('garbage collection') ||
      inputLower.includes('gc pause') ||
      inputLower.includes('memory leak')
    ) {
      return `${levelUpPrefix}Tuning the Hermes JavaScript engine is pure systems engineering magic, my friend! Hermes is built for rapid startup with bytecode pre-compilation, but frequent small allocations during animations can trigger intrusive garbage collection pauses. How do you track down persistent object retention or memory leaks when profiling Android heap dumps?`;
    }

    // 5. General Client Performance & Mobile Architecture
    return `${levelUpPrefix}On mobile clients, you are constantly balancing CPU cycles, GPU memory, network battery drain, and thermal throttling, buddy! Staff mobile architects design systems that feel instant while conserving device battery and storage. What is the most critical mobile performance bottleneck you are tackling right now?`;
  }
}
