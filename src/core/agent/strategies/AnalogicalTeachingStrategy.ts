import { IDialogueStrategy } from './IDialogueStrategy';
import { TeddyDialogueContext } from '../TeddyDialogueEngine';

export class AnalogicalTeachingStrategy implements IDialogueStrategy {
  readonly name = 'AnalogicalTeachingStrategy';
  readonly priority = 80;

  canHandle(inputLower: string): boolean {
    return (
      inputLower.includes('cache stampede') ||
      inputLower.includes('dog piling') ||
      inputLower.includes('thundering herd') ||
      (inputLower.includes('stampede') && inputLower.includes('discount')) ||
      inputLower.includes('raft') ||
      inputLower.includes('split-brain') ||
      inputLower.includes('split brain') ||
      (inputLower.includes('consensus') && inputLower.includes('leader')) ||
      inputLower.includes('deadlock') ||
      (inputLower.includes('deadlocks') && inputLower.includes('concurrency')) ||
      inputLower.includes('jsi') ||
      (inputLower.includes('react native') && inputLower.includes('bridge')) ||
      inputLower.includes('memory sharing') ||
      inputLower.includes('star') ||
      (inputLower.includes('conflict') && inputLower.includes('leadership')) ||
      inputLower.includes('cross-team') ||
      inputLower.includes('cross team')
    );
  }

  generateResponse(
    inputLower: string,
    _context: TeddyDialogueContext,
    levelUpPrefix: string
  ): string {
    // 1. Cache Stampede (Bakery Rush Analogy)
    if (
      inputLower.includes('cache stampede') ||
      inputLower.includes('dog piling') ||
      inputLower.includes('thundering herd') ||
      (inputLower.includes('stampede') && inputLower.includes('discount'))
    ) {
      return `${levelUpPrefix}I love explaining this one! Picture a thousand hungry people all rushing a bakery the second doors open. That is a cache stampede when a hot discount key expires. To stop it, we use distributed locks or early expiration so one worker refreshes the cache while others read stale data. Does that picture click for you?`;
    }

    // 2. Raft Consensus & Split-Brain (Movie Tickets Analogy)
    if (
      inputLower.includes('raft') ||
      inputLower.includes('split-brain') ||
      inputLower.includes('split brain') ||
      (inputLower.includes('consensus') && inputLower.includes('leader'))
    ) {
      return `${levelUpPrefix}Think of Raft consensus like close friends picking a movie! One friend proposes a film, and a strict majority must agree before buying tickets. Because any majority must overlap, two leaders can never win at once, completely preventing split-brain. Does that intuition make sense?`;
    }

    // 3. Database Deadlocks & Concurrency Standoffs (Doorway Analogy)
    if (
      inputLower.includes('deadlock') ||
      (inputLower.includes('deadlocks') && inputLower.includes('concurrency'))
    ) {
      return `${levelUpPrefix}Think of a deadlock like two polite friends trying to step through a narrow doorway together, both freezing because they are waiting on the other! In code, threads must always acquire locks in a globally defined order to prevent that standoff. Have you ever designed a lock hierarchy to eliminate deadlocks?`;
    }

    // 4. JSI (JavaScript Interface) vs Bridge (Phone Call Analogy)
    if (
      inputLower.includes('jsi') ||
      (inputLower.includes('react native') && inputLower.includes('bridge')) ||
      inputLower.includes('memory sharing')
    ) {
      return `${levelUpPrefix}Here is a super cool intuition! Think of JSI like a direct phone call between JavaScript and C++, instead of sending paper letters across an old bridge. It lets JavaScript hold direct memory pointers to C++ host objects with zero serialization overhead. What kind of native performance gains have you seen with JSI?`;
    }

    // 5. STAR Method & Behavioral Leadership Conflicts (Structured Trade-Offs)
    return `${levelUpPrefix}I love that you are preparing for this, buddy! Frame cross-team conflicts around competing technical trade-offs rather than egos. Dedicate half your answer to your Action driving consensus through benchmarks and SLAs, and twenty percent to measurable business results. How does that structure feel to you?`;
  }
}
