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
      inputLower.includes('event loop') ||
      inputLower.includes('libuv') ||
      inputLower.includes('nexttick') ||
      inputLower.includes('backpressure') ||
      inputLower.includes('highwatermark') ||
      inputLower.includes('worker_threads') ||
      inputLower.includes('sharedarraybuffer')
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

    // 5. Node.js Event Loop & libuv (Master Chef & Sous-Chefs Analogy)
    if (
      inputLower.includes('event loop') ||
      inputLower.includes('libuv') ||
      inputLower.includes('nexttick')
    ) {
      return `${levelUpPrefix}Picture the Node.js Event Loop as a single master chef plating dishes at the counter! The chef never waits for water to boil—instead, libuv acts as a team of sous-chefs handling file I/O and DNS in the background, while process.nextTick is a VIP ticket checked between every single dish. How do you guard that main chef from CPU starvation?`;
    }

    // 6. Node.js Streams & Backpressure (Conveyor Belt Valve Analogy)
    if (
      inputLower.includes('backpressure') ||
      inputLower.includes('highwatermark')
    ) {
      return `${levelUpPrefix}Think of Node.js stream backpressure like a smart factory conveyor belt! When a fast source pours items faster than the packer can box them, the buffer hits its highWaterMark and flips a red pause switch until the packer signals drain. Why is stream.pipeline so critical when a downstream socket suddenly closes?`;
    }

    // 7. Node.js Worker Threads & SharedArrayBuffer (Shared Whiteboard Analogy)
    if (
      inputLower.includes('worker_threads') ||
      inputLower.includes('sharedarraybuffer')
    ) {
      return `${levelUpPrefix}Think of Worker Threads like separate workshops each with their own V8 engine! Passing objects over postMessage is like photocopying blueprints, whereas SharedArrayBuffer with Atomics is a single glass whiteboard both workshops update in place with zero copy overhead. Where would you apply Worker Threads in your service?`;
    }

    // 8. Distributed Systems Transit Analogy
    return `${levelUpPrefix}Here is a fun intuition, buddy! Think of complex distributed systems like a bustling city transit network where traffic signals and roundabouts prevent gridlock. What part of your architecture feels like the biggest potential traffic jam right now?`;
  }
}
