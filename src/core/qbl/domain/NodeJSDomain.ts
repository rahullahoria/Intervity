/**
 * NodeJSDomain
 * 
 * Comprehensive Node.js domain knowledge base for QBL Curriculum Generator.
 * Implements authoritative 5-chapter curriculum hierarchy and 25+ deep architectural
 * questions covering all 6 cognitive levels of Bloom's Taxonomy.
 */

import {
  QBLChapter,
  QBLCognitiveLevel,
  QBLDifficulty,
  QBLOption,
  QBLQuestion,
  QBLQuestionType,
} from '../../../types';
import { QuestionGenerationOptions } from '../QBLCurriculumGenerator';

export interface DomainChapterDef {
  title: string;
  description: string;
  learningObjectives: string[];
  topics: {
    title: string;
    description: string;
    learningObjectives: string[];
    subtopics: {
      title: string;
      description: string;
      difficulty: QBLDifficulty;
    }[];
  }[];
}

export const NODE_JS_CURRICULUM_CHAPTERS: DomainChapterDef[] = [
  {
    title: 'Chapter 1: Node.js Runtime Architecture, libuv & The Event Loop',
    description: 'Internal architecture of the libuv event loop, non-blocking asynchronous demultiplexing, and microtask vs macrotask execution boundaries.',
    learningObjectives: [
      'Master the 6 distinct phases of the libuv event loop and phase transition triggers',
      'Analyze microtask queues (process.nextTick, Promise.then) to eliminate event loop starvation and latency spikes',
      'Differentiate kernel event demultiplexing (epoll/kqueue) from the libuv worker thread pool',
    ],
    topics: [
      {
        title: 'Event Loop Phase Transitions & Callbacks',
        description: 'Detailed mechanics of Timers, Pending Callbacks, Poll, Check, and Close phases in libuv.',
        learningObjectives: [
          'Trace execution order across Timers, Pending, Poll, Check, and Close phases',
          'Evaluate scheduling semantics of setImmediate vs setTimeout(fn, 0) inside I/O cycles',
        ],
        subtopics: [
          {
            title: 'Timers, Pending Callbacks, Poll, Check & Close Phases',
            description: 'Execution sequence of the six libuv phases and scheduling guarantees of setTimeout vs setImmediate.',
            difficulty: 'basic',
          },
          {
            title: 'Microtask Processing: process.nextTick vs Promise.then',
            description: 'Microtask queue draining between macrotasks, priority queues, and starvation risks.',
            difficulty: 'intermediate',
          },
        ],
      },
      {
        title: 'libuv Thread Pool & Asynchronous I/O',
        description: 'Kernel event demultiplexing (epoll/kqueue) vs worker thread pool offloading.',
        learningObjectives: [
          'Identify APIs offloaded to UV_THREADPOOL_SIZE vs non-blocking OS socket operations',
          'Diagnose thread pool starvation caused by synchronous getaddrinfo and heavy crypto operations',
        ],
        subtopics: [
          {
            title: 'Thread Pool Offloading: UV_THREADPOOL_SIZE, fs, crypto & dns',
            description: 'Thread pool constraints, synchronous getaddrinfo blocking, and CPU crypto offloading.',
            difficulty: 'intermediate',
          },
          {
            title: 'Reactor Pattern, Epoll/Kqueue Demultiplexing & Non-Blocking Sockets',
            description: 'OS-level non-blocking network socket polling and event-driven multiplexing.',
            difficulty: 'advanced',
          },
        ],
      },
    ],
  },
  {
    title: 'Chapter 2: V8 Engine Internals, Memory Management & GC',
    description: 'V8 memory spaces, Scavenger vs Mark-Sweep-Compact garbage collection, memory leak patterns, and binary Buffer allocations.',
    learningObjectives: [
      'Master V8 generational garbage collection (New Space vs Old Space)',
      'Diagnose closure retainment leaks and heap allocation spikes with heap snapshots',
      'Optimize binary memory throughput using the Node.js Buffer slab allocator and zero-copy transfers',
    ],
    topics: [
      {
        title: 'V8 Memory Architecture & Generational GC',
        description: 'Generational hypothesis, Scavenge semi-spaces, Mark-Sweep compaction, and heap snapshot analysis.',
        learningObjectives: [
          'Explain New Space Scavenge copying and tenuring thresholds into Old Space',
          'Detect and fix closure retainment leaks and uncleaned EventEmitter subscriptions',
        ],
        subtopics: [
          {
            title: 'New Space Scavenge vs Old Space Mark-Sweep-Compact',
            description: 'Semi-space pointer swapping, object tenuring, and stop-the-world GC pauses.',
            difficulty: 'intermediate',
          },
          {
            title: 'Memory Leak Detection, Closure Retainment & Heap Profiling',
            description: 'Meteor closure leaks, uncleaned event emitters, and heap snapshot comparison.',
            difficulty: 'advanced',
          },
        ],
      },
      {
        title: 'Buffer Management & Binary Memory Allocations',
        description: 'Node.js Buffer memory allocation outside the V8 heap and zero-copy data transfer.',
        learningObjectives: [
          'Differentiate Buffer.alloc, Buffer.allocUnsafe, and the 8KB FastBuffer slab allocator',
          'Leverage TypedArrays and SharedArrayBuffer for zero-copy binary communication',
        ],
        subtopics: [
          {
            title: 'Buffer.alloc vs Buffer.allocUnsafe & 8KB Slab Allocator',
            description: 'Uninitialized memory security risks and fast allocation via the 8KB Buffer slab pool.',
            difficulty: 'basic',
          },
          {
            title: 'TypedArrays, SharedArrayBuffer & Zero-Copy Memory Transfers',
            description: 'Direct memory mapping and zero-copy binary serialization across native addons.',
            difficulty: 'pro',
          },
        ],
      },
    ],
  },
  {
    title: 'Chapter 3: Streams, Backpressure & High-Throughput I/O',
    description: 'Streaming primitives, internal buffer watermarks, backpressure flow control, and memory-safe stream pipelines.',
    learningObjectives: [
      'Implement production-grade backpressure handling using the drain event and highWaterMark tuning',
      'Compose fault-tolerant streaming pipelines with stream.pipeline and async iterators',
      'Prevent file descriptor leaks and memory accumulation in high-concurrency streaming',
    ],
    topics: [
      {
        title: 'Stream Flow Control & Internal Queuing',
        description: 'Readable, Writable, Duplex, and Transform stream internals and highWaterMark configuration.',
        learningObjectives: [
          'Tune highWaterMark for byte streams vs objectMode streams',
          'Implement backpressure flow control when write() returns false',
        ],
        subtopics: [
          {
            title: 'Readable, Writable, Duplex & Transform Streams (highWaterMark)',
            description: 'Stream modes (flowing vs paused), chunk buffering, and highWaterMark tuning.',
            difficulty: 'basic',
          },
          {
            title: 'Backpressure Signaling: Handling write() === false & drain Event',
            description: 'Flow control invariants, mitigating producer-consumer speed mismatches, and memory bloat prevention.',
            difficulty: 'intermediate',
          },
        ],
      },
      {
        title: 'Stream Composition & Async Iterators',
        description: 'Robust error propagation and consumption using modern stream utilities.',
        learningObjectives: [
          'Replace unhandled pipe() leak hazards with stream.pipeline for safe teardown',
          'Consume objectMode streams using async generators and for await...of loops',
        ],
        subtopics: [
          {
            title: 'Safe Composition with stream.pipeline vs Memory Leaks in pipe()',
            description: 'Automatic stream destruction, error forwarding, and avoiding dangling file descriptors.',
            difficulty: 'intermediate',
          },
          {
            title: 'Async Iterators (for await...of) for High-Velocity Stream Ingestion',
            description: 'Consuming objectMode streams with async generators and backpressure-preserving iterations.',
            difficulty: 'advanced',
          },
        ],
      },
    ],
  },
  {
    title: 'Chapter 4: Concurrency, Clustering & Worker Threads',
    description: 'Scaling across CPU cores with the cluster module, process IPC, and true multi-threading with worker_threads.',
    learningObjectives: [
      'Scale Node.js services horizontally on multi-core servers using cluster and socket handover',
      'Leverage worker_threads with SharedArrayBuffer and Atomics for CPU-bound computation',
      'Evaluate process isolation vs thread concurrency trade-offs under high request rates',
    ],
    topics: [
      {
        title: 'Multi-Core Scaling with Cluster',
        description: 'Primary-worker process architecture, IPC channels, and port sharing.',
        learningObjectives: [
          'Configure zero-downtime rolling restarts and primary-worker IPC messaging',
          'Compare OS socket handover with SO_REUSEPORT kernel load balancing',
        ],
        subtopics: [
          {
            title: 'Cluster Module, Primary/Worker Forking & IPC Channel Messaging',
            description: 'Forking worker processes, zero-downtime restarts, and inter-process message passing.',
            difficulty: 'intermediate',
          },
          {
            title: 'OS Socket Handover vs SO_REUSEPORT Kernel Load Balancing',
            description: 'Passing socket handles over IPC vs OS-level connection distribution.',
            difficulty: 'advanced',
          },
        ],
      },
      {
        title: 'Multi-Threading with worker_threads',
        description: 'Isolated V8 instances within a single OS process and lock-free shared memory.',
        learningObjectives: [
          'Contrast worker_threads V8 Isolates with OS child processes regarding RSS and startup latency',
          'Implement lock-free thread synchronization using SharedArrayBuffer and Atomics',
        ],
        subtopics: [
          {
            title: 'worker_threads Execution Model vs OS Child Processes (V8 Isolates)',
            description: 'Memory footprint comparison, thread lifecycle, and Transferable objects.',
            difficulty: 'advanced',
          },
          {
            title: 'Shared Memory Concurrency with SharedArrayBuffer & Atomics',
            description: 'Lock-free synchronization, atomic memory operations, and thread notification.',
            difficulty: 'pro',
          },
        ],
      },
    ],
  },
  {
    title: 'Chapter 5: Enterprise Diagnostics, Observability & Production Hardening',
    description: 'Distributed tracing with AsyncLocalStorage, event loop latency profiling, graceful shutdowns, and security defense.',
    learningObjectives: [
      'Trace requests across asynchronous boundaries with AsyncLocalStorage without context loss',
      'Profile event loop lag using perf_hooks.monitorEventLoopDelay and continuous flamegraphs',
      'Enforce production graceful shutdown protocols and defend against ReDoS and prototype pollution',
    ],
    topics: [
      {
        title: 'Execution Contexts & Latency Diagnostics',
        description: 'Continuous profiling, event loop delay histograms, and asynchronous execution context tracking.',
        learningObjectives: [
          'Propagate correlation IDs through Promise chains using AsyncLocalStorage',
          'Measure event loop delay histograms with perf_hooks.monitorEventLoopDelay without timer skew',
        ],
        subtopics: [
          {
            title: 'AsyncLocalStorage for Distributed Request Tracing & Correlation IDs',
            description: 'Maintaining context across Promise chains, overhead benchmarks, and async_hooks mechanics.',
            difficulty: 'advanced',
          },
          {
            title: 'Event Loop Lag Monitoring (monitorEventLoopDelay) & Flamegraphs',
            description: 'Libuv latency histograms, identifying synchronous CPU blocking, and flamegraph interpretation.',
            difficulty: 'advanced',
          },
        ],
      },
      {
        title: 'Production Resilience & Security Hardening',
        description: 'Handling process termination signals, uncaught exceptions, and regex denial-of-service.',
        learningObjectives: [
          'Architect graceful SIGTERM/SIGINT shutdown with in-flight connection draining',
          'Prevent catastrophic ReDoS freezes and prototype pollution vulnerabilities',
        ],
        subtopics: [
          {
            title: 'Graceful Shutdown Protocols: In-Flight Connection Draining & Signal Trapping',
            description: 'Handling SIGTERM/SIGINT, closing listening servers, bounded draining, and clean exit.',
            difficulty: 'intermediate',
          },
          {
            title: 'Prototype Pollution Defense, ReDoS Mitigation & Memory Cap Flags',
            description: 'V8 Irregexp backtracking vulnerabilities, Object.freeze defenses, and max-old-space-size tuning.',
            difficulty: 'pro',
          },
        ],
      },
    ],
  },
];

export interface NodeQuestionDef {
  conceptTitle: string;
  questionText: string;
  difficulty: QBLDifficulty;
  cognitiveLevel: QBLCognitiveLevel;
  questionType: QBLQuestionType;
  expectedAnswer: string;
  hints: string[];
  options: QBLOption[];
  explanation: string;
  coachingTip: string;
}

export const NODE_JS_QUESTIONS: NodeQuestionDef[] = [
  // 1. Remember / Basic / MCQ
  {
    conceptTitle: 'libuv Event Loop Phase Execution Order',
    questionText: 'In a single iteration of the Node.js libuv event loop, what is the exact execution order of the primary phases?',
    difficulty: 'basic',
    cognitiveLevel: 'remember',
    questionType: 'mcq',
    expectedAnswer: 'Timers ➔ Pending Callbacks ➔ Idle/Prepare ➔ Poll ➔ Check ➔ Close Callbacks',
    hints: [
      '💡 Hint 1 (Mental Model): The loop begins by checking expired setTimeout/setInterval timers before retrieving network and filesystem events.',
      '🔍 Hint 2 (Mechanism Clue): setImmediate callbacks run in the Check phase, which occurs immediately after the Poll phase.',
      '🎯 Hint 3 (Trade-off Insight): The full sequence is: Timers ➔ Pending Callbacks ➔ Idle/Prepare ➔ Poll ➔ Check ➔ Close Callbacks.',
    ],
    options: [
      {
        id: 'A',
        text: 'Timers ➔ Pending Callbacks ➔ Idle/Prepare ➔ Poll ➔ Check ➔ Close Callbacks',
        isCorrect: true,
        explanation: 'Correct: libuv begins with timers (setTimeout), processes pending I/O callbacks, executes internal idle/prepare, polls for incoming I/O events, runs check callbacks (setImmediate), and finally executes close callbacks.',
      },
      {
        id: 'B',
        text: 'Poll ➔ Timers ➔ Check ➔ Pending Callbacks ➔ Close Callbacks',
        isCorrect: false,
        explanation: 'Incorrect: The event loop iteration starts at Timers, not Poll.',
      },
      {
        id: 'C',
        text: 'Microtasks ➔ Timers ➔ Poll ➔ Macrotasks ➔ Close Callbacks',
        isCorrect: false,
        explanation: 'Incorrect: Microtasks are not a standalone libuv phase; they execute in V8 between individual operations and phase transitions.',
      },
      {
        id: 'D',
        text: 'Check (setImmediate) ➔ Timers (setTimeout) ➔ Poll ➔ Close Callbacks',
        isCorrect: false,
        explanation: 'Incorrect: Check phase executes after Poll, not before Timers.',
      },
    ],
    explanation: 'The libuv event loop has 6 distinct phases in strict order: Timers -> Pending -> Idle/Prepare -> Poll -> Check -> Close. Understanding this order is vital to predicting asynchronous callback execution.',
    coachingTip: 'Memorize the phase acronym: T-P-I-P-C-C (Timers, Pending, Idle/Prepare, Poll, Check, Close). Notice that Check (setImmediate) sits immediately after Poll!',
  },

  // 2. Remember / Basic / Short Answer
  {
    conceptTitle: 'Microtask Queue Priority: process.nextTick vs Promise.then',
    questionText: 'In Node.js, what is the execution priority between the `process.nextTick` queue and the Promise microtask queue when both are scheduled concurrently?',
    difficulty: 'basic',
    cognitiveLevel: 'remember',
    questionType: 'short_answer',
    expectedAnswer: 'The process.nextTick queue is drained completely before the Promise microtask queue is inspected.',
    hints: [
      '💡 Hint 1 (Mental Model): Both run before the event loop advances to the next phase, but Node.js gives special priority to its native process queue.',
      '🔍 Hint 2 (Mechanism Clue): Node.js maintains a dedicated nextTickQueue and a separate microtaskQueue (Promises).',
      '🎯 Hint 3 (Trade-off Insight): nextTickQueue runs first until empty, then the microtaskQueue executes.',
    ],
    options: [
      {
        id: 'A',
        text: 'The process.nextTick queue is drained completely before the Promise microtask queue is processed.',
        isCorrect: true,
        explanation: 'Correct: Node.js processes the nextTickQueue first to completion, and only then processes Promise microtasks.',
      },
      {
        id: 'B',
        text: 'Promise.then callbacks take precedence and execute before any process.nextTick callbacks.',
        isCorrect: false,
        explanation: 'Incorrect: Promise microtasks run after nextTickQueue is completely exhausted.',
      },
      {
        id: 'C',
        text: 'They execute in round-robin alternating order one-by-one.',
        isCorrect: false,
        explanation: 'Incorrect: Node.js does not interleave nextTick and Promise queues; nextTick has strict priority.',
      },
      {
        id: 'D',
        text: 'Both queues are deferred until the end of the entire event loop iteration.',
        isCorrect: false,
        explanation: 'Incorrect: Microtasks run immediately after the current JavaScript operation, not at the end of the loop.',
      },
    ],
    explanation: 'Node.js maintains two separate microtask queues: nextTickQueue and the standard V8 microtaskQueue. The nextTickQueue always drains first, meaning recursive nextTick calls will starve Promise resolutions.',
    coachingTip: 'Think of process.nextTick as a VIP express lane that jumps in front of standard Promise microtasks every single time.',
  },

  // 3. Remember / Basic / MCQ
  {
    conceptTitle: 'Default libuv Worker Thread Pool Size',
    questionText: 'What is the default size of the libuv worker thread pool (`UV_THREADPOOL_SIZE`), and which core Node.js operations execute on it?',
    difficulty: 'basic',
    cognitiveLevel: 'remember',
    questionType: 'mcq',
    expectedAnswer: '4 worker threads; used for fs filesystem operations, crypto (asymmetric & pbkdf2), zlib compression, and dns.lookup.',
    hints: [
      '💡 Hint 1 (Mental Model): Network I/O (TCP/HTTP) does not use this thread pool—it uses OS epoll/kqueue directly.',
      '🔍 Hint 2 (Mechanism Clue): Blocking OS syscalls that cannot be demultiplexed non-blockingly are offloaded to this pool.',
      '🎯 Hint 3 (Trade-off Insight): The default thread count is 4, shared across fs, crypto, zlib, and dns.lookup.',
    ],
    options: [
      {
        id: 'A',
        text: '4 threads; used for fs filesystem operations, crypto (pbkdf2/scrypt), zlib compression, and dns.lookup.',
        isCorrect: true,
        explanation: 'Correct: By default UV_THREADPOOL_SIZE is 4. It handles operations that lack universal non-blocking OS APIs: filesystem I/O, CPU-intensive crypto, compression, and synchronous getaddrinfo calls.',
      },
      {
        id: 'B',
        text: '4 threads; used for all incoming TCP socket connections and HTTP request parsing.',
        isCorrect: false,
        explanation: 'Incorrect: Network sockets are handled non-blockingly on the main thread via epoll/kqueue, not the thread pool.',
      },
      {
        id: 'C',
        text: '1 thread per CPU core; used to execute all JavaScript async/await functions.',
        isCorrect: false,
        explanation: 'Incorrect: JavaScript application code executes on a single main thread, not on libuv pool threads.',
      },
      {
        id: 'D',
        text: '16 threads; used strictly for database connections.',
        isCorrect: false,
        explanation: 'Incorrect: Database drivers manage their own connection pools, independent of libuv defaults.',
      },
    ],
    explanation: 'libuv provides a thread pool of 4 worker threads by default. It is exclusively used for blocking filesystem calls, intensive crypto hashing, zlib compression, and dns.lookup (which invokes synchronous getaddrinfo).',
    coachingTip: 'Remember: Network I/O is non-blocking on the event loop (epoll/kqueue). The libuv thread pool is for fs, crypto, zlib, and dns.lookup!',
  },

  // 4. Understand / Basic / Scenario
  {
    conceptTitle: 'setImmediate vs setTimeout(fn, 0) inside I/O Callbacks',
    questionText: `When executing inside an asynchronous I/O callback (e.g., \`fs.readFile\`), why is \`setImmediate()\` guaranteed to execute BEFORE \`setTimeout(fn, 0)\`?

\`\`\`javascript
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});
\`\`\``,
    difficulty: 'basic',
    cognitiveLevel: 'understand',
    questionType: 'scenario',
    expectedAnswer: 'The I/O callback executes in the Poll phase; libuv advances directly to the Check phase where setImmediate callbacks run, before cycling back to Timers on the next loop turn.',
    hints: [
      '💡 Hint 1 (Mental Model): Trace the event loop phase at the exact moment the fs.readFile callback is running.',
      '🔍 Hint 2 (Mechanism Clue): The Poll phase executes I/O callbacks, and the next sequential phase in the loop is Check.',
      '🎯 Hint 3 (Trade-off Insight): To execute setTimeout, the event loop must finish the current turn and loop all the way back around to Timers.',
    ],
    options: [
      {
        id: 'A',
        text: 'The I/O callback executes in the Poll phase; libuv immediately advances to the Check phase where setImmediate callbacks run, before cycling back to Timers on the next turn.',
        isCorrect: true,
        explanation: 'Correct: Inside an I/O callback (Poll phase), libuv proceeds directly to the Check phase where setImmediate callbacks execute. setTimeout is only reached after the loop completes the cycle and starts a new turn at Timers.',
      },
      {
        id: 'B',
        text: 'setImmediate is a V8 microtask and executes synchronously before the Poll phase finishes.',
        isCorrect: false,
        explanation: 'Incorrect: setImmediate is a macrotask executed in the Check phase, not a microtask.',
      },
      {
        id: 'C',
        text: 'Node.js deliberately imposes a mandatory 50ms delay on all setTimeout calls inside filesystem functions.',
        isCorrect: false,
        explanation: 'Incorrect: setTimeout delay is clamped to 1ms, but phase ordering is what causes setImmediate to run first.',
      },
      {
        id: 'D',
        text: 'fs.readFile disables timer processing until the process exits.',
        isCorrect: false,
        explanation: 'Incorrect: Timers remain fully functional throughout process execution.',
      },
    ],
    explanation: 'When inside an I/O callback, you are in the Poll phase. The very next phase is the Check phase where setImmediate callbacks live. Therefore, setImmediate is guaranteed to run before setTimeout(fn, 0) inside I/O cycles.',
    coachingTip: 'Outside of I/O, the order of setTimeout(0) vs setImmediate is non-deterministic (bound by process timer resolution). Inside I/O, setImmediate ALWAYS wins!',
  },

  // 5. Understand / Intermediate / MCQ
  {
    conceptTitle: 'process.nextTick Recursion & Event Loop Starvation',
    questionText: 'Why does recursively calling `process.nextTick()` completely freeze a Node.js server and starve all incoming network I/O, whereas recursive `setImmediate()` does not?',
    difficulty: 'intermediate',
    cognitiveLevel: 'understand',
    questionType: 'mcq',
    expectedAnswer: 'process.nextTick callbacks are stored in a microtask queue that must be completely drained before the event loop advances to any subsequent phase, preventing the Poll phase from ever accepting incoming connections.',
    hints: [
      '💡 Hint 1 (Mental Model): Microtasks run between phases, whereas setImmediate runs during a specific phase of the event loop.',
      '🔍 Hint 2 (Mechanism Clue): libuv cannot advance to the next phase as long as there are pending microtasks in the nextTick queue.',
      '🎯 Hint 3 (Trade-off Insight): setImmediate schedules work for the NEXT turn Check phase, allowing the loop to cycle through Poll.',
    ],
    options: [
      {
        id: 'A',
        text: 'process.nextTick callbacks form a microtask queue that must be completely drained before libuv can advance to any subsequent phase, blocking the Poll phase indefinitely.',
        isCorrect: true,
        explanation: 'Correct: Node.js drains the entire nextTickQueue before transitioning phases. Recursive nextTick calls keep adding items, trapping V8 in an infinite microtask loop and starving I/O polling.',
      },
      {
        id: 'B',
        text: 'process.nextTick executes directly on the OS kernel thread, triggering a kernel panic.',
        isCorrect: false,
        explanation: 'Incorrect: process.nextTick is a purely user-space Node.js JavaScript queue.',
      },
      {
        id: 'C',
        text: 'setImmediate spawns a new OS thread for each invocation, isolating the workload.',
        isCorrect: false,
        explanation: 'Incorrect: setImmediate does not spawn OS threads; it queues callbacks in libuv Check phase.',
      },
      {
        id: 'D',
        text: 'V8 garbage collects all active network sockets when process.nextTick is called recursively.',
        isCorrect: false,
        explanation: 'Incorrect: Sockets are not garbage collected; they simply never receive CPU time to be polled.',
      },
    ],
    explanation: 'Because the nextTickQueue must be completely drained before libuv proceeds to the next event loop phase, recursive nextTick calls cause complete I/O starvation. Recursive setImmediate calls yield after each Check phase, allowing the loop to continue cycling.',
    coachingTip: 'Never use recursive process.nextTick for continuous loops or chunk processing. Use setImmediate or streams to yield control back to the event loop between chunks!',
  },

  // 6. Understand / Intermediate / Scenario
  {
    conceptTitle: 'V8 Generational Garbage Collection & Object Tenuring',
    questionText: 'How does V8’s Scavenger garbage collector operate in the Young Generation (New Space), and under what specific condition is an allocated object tenured (promoted) into Old Space?',
    difficulty: 'intermediate',
    cognitiveLevel: 'understand',
    questionType: 'scenario',
    expectedAnswer: 'New Space is split into two semi-spaces (From and To); surviving live objects are copied to the To space during Scavenge, and if an object has already survived one GC cycle or the To space fills beyond 25%, it is promoted to Old Space.',
    hints: [
      '💡 Hint 1 (Mental Model): The Generational Hypothesis states that most objects die young. Scavenger optimizes copying only the small fraction of survivors.',
      '🔍 Hint 2 (Mechanism Clue): New Space uses Cheneys copying algorithm with two semi-spaces: From-Space and To-Space.',
      '🎯 Hint 3 (Trade-off Insight): An object is tenured to Old Space if it survives a second scavenge cycle or if To-space allocation exceeds 25%.',
    ],
    options: [
      {
        id: 'A',
        text: 'New Space is split into From and To semi-spaces; surviving objects are copied to To-space and tenured to Old Space if they survive a second scavenge cycle or To-space exceeds 25% capacity.',
        isCorrect: true,
        explanation: 'Correct: V8 uses Cheney’s copying algorithm for the Young Generation. Objects surviving one scavenge are tagged; on the next scavenge, they are copied into Old Space (tenuring) to prevent New Space saturation.',
      },
      {
        id: 'B',
        text: 'All objects are allocated directly into Old Space, and Scavenger deletes them after 60 seconds.',
        isCorrect: false,
        explanation: 'Incorrect: Objects are allocated in New Space (Nursery) first; only large objects (>256KB) bypass New Space into Large Object Space.',
      },
      {
        id: 'C',
        text: 'Scavenger writes dead objects to disk and compresses the remaining memory with gzip.',
        isCorrect: false,
        explanation: 'Incorrect: V8 garbage collection occurs entirely in RAM; it does not write heap objects to disk.',
      },
      {
        id: 'D',
        text: 'Objects are promoted to Old Space strictly when they are referenced by more than 100 functions.',
        isCorrect: false,
        explanation: 'Incorrect: Promotion is based on age (survival of GC cycles) and semi-space fullness, not caller reference counts.',
      },
    ],
    explanation: 'V8 exploits the generational hypothesis. New Space uses fast pointer bumping in semi-spaces (From/To). Live objects surviving a collection cycle are promoted (tenured) to Old Space, which is governed by the Mark-Sweep-Compact collector.',
    coachingTip: 'Keep short-lived objects short-lived! If temporary objects survive into Old Space due to high allocation churn, they trigger expensive Mark-Sweep GC pauses instead of lightweight Scavenges.',
  },

  // 7. Apply / Intermediate / Practical Exercise
  {
    conceptTitle: 'Predicting Execution Order: Microtasks vs Macrotasks',
    questionText: `What is the exact console output order of the following Node.js snippet?

\`\`\`javascript
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
console.log('synchronous');
\`\`\``,
    difficulty: 'intermediate',
    cognitiveLevel: 'apply',
    questionType: 'practical_exercise',
    expectedAnswer: 'synchronous ➔ nextTick ➔ promise ➔ timeout ➔ immediate',
    hints: [
      '💡 Hint 1 (Mental Model): Synchronous code always finishes first. Then microtasks drain before the event loop starts.',
      '🔍 Hint 2 (Mechanism Clue): Between nextTick and Promise microtasks, nextTick drains first.',
      '🎯 Hint 3 (Trade-off Insight): At startup from top-level script, Timers phase runs before Check phase for setTimeout(0).',
    ],
    options: [
      {
        id: 'A',
        text: 'synchronous ➔ nextTick ➔ promise ➔ timeout ➔ immediate',
        isCorrect: true,
        explanation: 'Correct: 1) Synchronous code runs first ("synchronous"). 2) nextTickQueue drains ("nextTick"). 3) Promise microtask queue drains ("promise"). 4) Event loop starts at Timers ("timeout"). 5) Event loop advances to Check ("immediate").',
      },
      {
        id: 'B',
        text: 'synchronous ➔ promise ➔ nextTick ➔ immediate ➔ timeout',
        isCorrect: false,
        explanation: 'Incorrect: nextTick always runs before Promise microtasks, and Timers runs before Check from script startup.',
      },
      {
        id: 'C',
        text: 'synchronous ➔ timeout ➔ immediate ➔ nextTick ➔ promise',
        isCorrect: false,
        explanation: 'Incorrect: Microtasks run immediately when the synchronous call stack empties, before entering event loop phases.',
      },
      {
        id: 'D',
        text: 'nextTick ➔ promise ➔ synchronous ➔ timeout ➔ immediate',
        isCorrect: false,
        explanation: 'Incorrect: Synchronous statements execute immediately on the call stack before any queued callbacks.',
      },
    ],
    explanation: 'The call stack executes synchronous code first. When the stack empties, Node.js exhausts nextTickQueue, then microtaskQueue (Promises). Next, the event loop begins at the Timers phase (setTimeout), and finally the Check phase (setImmediate).',
    coachingTip: 'Rule of thumb: Call stack > process.nextTick > Promise.then > Event Loop Phases (Timers -> Poll -> Check).',
  },

  // 8. Apply / Intermediate / Scenario
  {
    conceptTitle: 'Stream Backpressure & write() Return Handling',
    questionText: `When streaming large video chunks to an HTTP client in Node.js, \`writable.write(chunk)\` returns \`false\`. How must the stream pipeline respond to prevent memory exhaustion?

\`\`\`javascript
const canWrite = res.write(chunk);
if (!canWrite) {
  // What must be done here?
}
\`\`\``,
    difficulty: 'intermediate',
    cognitiveLevel: 'apply',
    questionType: 'scenario',
    expectedAnswer: 'Pause the readable stream (readable.pause()) and resume reading only when the writable stream emits the "drain" event.',
    hints: [
      '💡 Hint 1 (Mental Model): When write() returns false, the internal buffer has reached or exceeded highWaterMark.',
      '🔍 Hint 2 (Mechanism Clue): If you keep calling write(), Node.js buffers chunks in RAM, leading to Out-Of-Memory crashes.',
      '🎯 Hint 3 (Trade-off Insight): readable.pause() halts chunk flow until the writable emits "drain".',
    ],
    options: [
      {
        id: 'A',
        text: 'Pause the readable stream (readable.pause()) and resume reading only when the writable emits the "drain" event.',
        isCorrect: true,
        explanation: 'Correct: When write() returns false, the internal buffer is full. Pausing the readable stream halts incoming data until the writable flushes to the underlying kernel socket and emits "drain".',
      },
      {
        id: 'B',
        text: 'Immediately call res.end() and abort the video streaming connection.',
        isCorrect: false,
        explanation: 'Incorrect: Aborting closes the stream prematurely on every normal network congestion blip.',
      },
      {
        id: 'C',
        text: 'Allocate a larger Buffer and retry writing synchronously in a while(true) loop.',
        isCorrect: false,
        explanation: 'Incorrect: A synchronous busy-wait loop freezes the entire single-threaded event loop and accelerates memory exhaustion.',
      },
      {
        id: 'D',
        text: 'Spawn a new worker thread to force the write into the operating system TCP buffer.',
        isCorrect: false,
        explanation: 'Incorrect: The TCP socket buffer is full; worker threads cannot force the OS to accept more data than socket buffers can hold.',
      },
    ],
    explanation: 'Backpressure occurs when the consumer is slower than the producer. write() returning false signals that highWaterMark is exceeded. You must pause the source readable and wait for the "drain" event before resuming.',
    coachingTip: 'Better yet: use stream.pipeline() or readable.pipe(), which automatically handle pause() and drain for you behind the scenes!',
  },

  // 9. Apply / Intermediate / Practical Exercise
  {
    conceptTitle: 'Safe Stream Composition with stream.pipeline',
    questionText: 'Why does the Node.js runtime team strongly advise using `stream.pipeline` instead of chaining streams with `readable.pipe(transform).pipe(writable)` in production servers?',
    difficulty: 'intermediate',
    cognitiveLevel: 'apply',
    questionType: 'practical_exercise',
    expectedAnswer: 'pipe() does not automatically close or destroy intermediate streams when an error occurs or the destination closes prematurely, causing severe memory leaks and hung file descriptors.',
    hints: [
      '💡 Hint 1 (Mental Model): What happens to the transform stream if the client abruptly disconnects during pipe()?',
      '🔍 Hint 2 (Mechanism Clue): pipe() only forwards errors if you attach explicit error handlers to every single stream in the chain.',
      '🎯 Hint 3 (Trade-off Insight): stream.pipeline automatically calls destroy() on all streams in the pipeline when any error or close occurs.',
    ],
    options: [
      {
        id: 'A',
        text: 'pipe() does not automatically destroy intermediate streams when an error occurs or destination closes, leading to memory leaks and hung file descriptors; stream.pipeline properly tears down all streams.',
        isCorrect: true,
        explanation: 'Correct: In legacy pipe() chains, an error or premature close in the middle stream leaves the remaining streams open in memory forever. stream.pipeline guarantees that all streams in the chain are cleanly destroyed on error.',
      },
      {
        id: 'B',
        text: 'pipe() limits data transfer throughput to a maximum of 64 KB/sec.',
        isCorrect: false,
        explanation: 'Incorrect: pipe() throughput is bounded by memory and CPU, not an arbitrary 64 KB/sec limit.',
      },
      {
        id: 'C',
        text: 'stream.pipeline compiles stream transformations into GPU compute shaders.',
        isCorrect: false,
        explanation: 'Incorrect: stream.pipeline is pure JavaScript stream orchestration running on the CPU.',
      },
      {
        id: 'D',
        text: 'pipe() was completely deprecated and throws an exception in Node.js 18+.',
        isCorrect: false,
        explanation: 'Incorrect: pipe() remains backward-compatible, though stream.pipeline is the recommended standard.',
      },
    ],
    explanation: 'In pipe(a).pipe(b).pipe(c), if b errors, a continues pushing and c stays open. stream.pipeline listens to error and close events on all streams, ensuring complete cleanup and error propagation.',
    coachingTip: 'Always use stream.pipeline or stream/promises pipeline. Never use .pipe() in enterprise web services handling client connections.',
  },

  // 10. Apply / Intermediate / Scenario
  {
    conceptTitle: 'Node.js Cluster IPC & Port Sharing',
    questionText: 'When scaling an HTTP server across 8 CPU cores using the `cluster` module, how do 8 worker processes accept connections on the exact same port (e.g. 3000) without `EADDRINUSE` errors?',
    difficulty: 'intermediate',
    cognitiveLevel: 'apply',
    questionType: 'scenario',
    expectedAnswer: 'The primary process creates the listen socket and passes connection handles directly to worker processes over an IPC channel (or workers share the socket via SO_REUSEPORT).',
    hints: [
      '💡 Hint 1 (Mental Model): Only one process can bind a TCP port in standard OS socket semantics unless specific flags are shared.',
      '🔍 Hint 2 (Mechanism Clue): The master/primary process listens on the port and distributes sockets to workers using round-robin scheduling.',
      '🎯 Hint 3 (Trade-off Insight): Socket file descriptors are passed across internal IPC unix domain sockets / named pipes.',
    ],
    options: [
      {
        id: 'A',
        text: 'The primary process binds the listening socket and passes the connection handle directly to worker processes over an internal IPC channel (or uses kernel SO_REUSEPORT).',
        isCorrect: true,
        explanation: 'Correct: By default on POSIX, the primary process binds the port and hands incoming socket file descriptors to child workers over IPC using round-robin distribution, avoiding EADDRINUSE conflicts.',
      },
      {
        id: 'B',
        text: 'Each worker binds to a random internal port and Node.js automatically edits the local hosts file.',
        isCorrect: false,
        explanation: 'Incorrect: Workers do not bind random ports or mutate OS hosts files.',
      },
      {
        id: 'C',
        text: 'The operating system merges all 8 process IDs into a single virtual CPU thread.',
        isCorrect: false,
        explanation: 'Incorrect: Operating systems schedule processes independently across available hardware cores.',
      },
      {
        id: 'D',
        text: 'Only worker 1 receives connections; other workers only handle timer events.',
        isCorrect: false,
        explanation: 'Incorrect: The cluster module distributes traffic across all active worker instances.',
      },
    ],
    explanation: 'The primary process opens the TCP server and accepts connections, then transmits the socket file descriptor to a chosen worker process via internal IPC. On Linux, SO_REUSEPORT can also allow workers to bind directly.',
    coachingTip: 'Cluster round-robin scheduling is managed by Node.js. If you want kernel-level round-robin without primary IPC overhead, investigate SO_REUSEPORT or Nginx load balancers.',
  },

  // 11. Analyze / Advanced / Real-World Problem
  {
    conceptTitle: 'Diagnosing Thread Pool Starvation & DNS Lookup Spikes',
    questionText: `A Node.js microservice handling 10,000 req/sec experiences 800ms p99 latency spikes and high event loop lag. CPU utilization is only 18%. Heap memory is stable at 250MB. Profiling reveals millions of outgoing HTTP requests calling external APIs using default \`http.get('https://api.domain.com')\`. What is the root cause?`,
    difficulty: 'advanced',
    cognitiveLevel: 'analyze',
    questionType: 'real_world_problem',
    expectedAnswer: 'dns.lookup uses the synchronous getaddrinfo(3) system call offloaded to libuv\'s 4-thread pool; the 4 threads are completely saturated by DNS queries, stalling all fs, crypto, and DNS operations across the entire server.',
    hints: [
      '💡 Hint 1 (Mental Model): Notice that CPU is very low (18%), yet latency is huge (800ms). This indicates severe thread pool queueing or lock contention.',
      '🔍 Hint 2 (Mechanism Clue): Node.js http.get uses dns.lookup by default, which relies on the OS getaddrinfo(3) C function.',
      '🎯 Hint 3 (Trade-off Insight): getaddrinfo runs on the libuv thread pool (UV_THREADPOOL_SIZE=4). Saturating 4 threads blocks all subsequent threadpool tasks.',
    ],
    options: [
      {
        id: 'A',
        text: 'dns.lookup uses synchronous getaddrinfo(3) offloaded to libuv\'s 4-thread pool; high request volume saturated the 4 threads, queueing all subsequent DNS, crypto, and filesystem calls.',
        isCorrect: true,
        explanation: 'Correct: dns.lookup uses the synchronous getaddrinfo(3) syscall, running on the 4-thread libuv pool. At high outgoing request rates, all 4 threads block on DNS network resolution, creating severe queueing delays. Fix by using dns.resolve* (c-ares) or increasing UV_THREADPOOL_SIZE.',
      },
      {
        id: 'B',
        text: 'The operating system has exhausted all available TCP port numbers (ephemeral port exhaustion).',
        isCorrect: false,
        explanation: 'Incorrect: Ephemeral port exhaustion causes immediate ECONNRESET or EADDRNOTAVAIL errors, not 800ms queueing lag with 18% CPU.',
      },
      {
        id: 'C',
        text: 'V8 garbage collector is running in full stop-the-world compaction every 10 milliseconds.',
        isCorrect: false,
        explanation: 'Incorrect: Heap memory is stable at 250MB and CPU is low (18%), ruling out GC thrashing.',
      },
      {
        id: 'D',
        text: 'Node.js runtime imposes a strict hardcoded limit of 10 outgoing HTTP requests per minute.',
        isCorrect: false,
        explanation: 'Incorrect: Node.js has no such artificial limit; throughput is bounded only by network and system resources.',
      },
    ],
    explanation: 'dns.lookup is a common production trap. It delegates to the synchronous C library getaddrinfo on libuv’s 4 worker threads. When calling external APIs frequently, all 4 threads get saturated. Switch to dns.resolve (which uses c-ares non-blocking epoll) or configure an HTTP agent with keep-alive.',
    coachingTip: 'Always use keepAlive: true in http.Agent, or switch to dns.resolve() to bypass the 4-thread pool when making high-volume external API calls!',
  },

  // 12. Analyze / Advanced / Scenario
  {
    conceptTitle: 'Meteor Closure Memory Leak Pattern',
    questionText: `In a production Node.js service, RSS memory grows steadily by 150MB per hour. A heap snapshot reveals that large Buffer objects created inside an HTTP handler are retained indefinitely, even though the handler finished. What causes this closure retainment leak?

\`\`\`javascript
let theThing = null;
function replaceThing() {
  const priorThing = theThing;
  const unused = function () { if (priorThing) console.log('hi'); };
  theThing = { largeStr: new Array(1000000).join('*'), someMethod: function () {} };
}
setInterval(replaceThing, 1000);
\`\`\``,
    difficulty: 'advanced',
    cognitiveLevel: 'analyze',
    questionType: 'scenario',
    expectedAnswer: 'Closures declared in the same lexical scope share a single V8 Context object; because someMethod is retained by theThing, it keeps the shared context alive, which retains priorThing via unused, creating an infinite retention chain.',
    hints: [
      '💡 Hint 1 (Mental Model): How does V8 allocate lexical environments when multiple functions are declared within the same scope?',
      '🔍 Hint 2 (Mechanism Clue): V8 allocates a single shared Context for the scope containing both unused and someMethod.',
      '🎯 Hint 3 (Trade-off Insight): someMethod is referenced globally, so its Context is retained. That Context references priorThing, creating an unbreakable chain of old scopes.',
    ],
    options: [
      {
        id: 'A',
        text: 'Closures in the same lexical scope share a single V8 Context object; because someMethod is retained globally, it keeps the context alive, retaining priorThing via unused in an unbounded linked chain.',
        isCorrect: true,
        explanation: 'Correct: In V8, all closures within the same scope share one lexical context. Even though unused is never called, someMethod retains the context. Since the context references priorThing, every replacement keeps the previous object alive forever.',
      },
      {
        id: 'B',
        text: 'setInterval permanently prevents V8 garbage collection from inspecting any heap variables.',
        isCorrect: false,
        explanation: 'Incorrect: setInterval does not disable garbage collection.',
      },
      {
        id: 'C',
        text: 'Array.join("*") allocates memory outside of the V8 heap in non-reclaimable OS swap space.',
        isCorrect: false,
        explanation: 'Incorrect: Strings created by join() reside inside the standard V8 heap.',
      },
      {
        id: 'D',
        text: 'Variables declared with let are never garbage collected until process termination.',
        isCorrect: false,
        explanation: 'Incorrect: let variables follow standard block-scoped garbage collection lifecycles.',
      },
    ],
    explanation: 'This is the infamous Meteor closure memory leak. V8 creates one shared lexical Context per scope. If any closure from that scope survives, the entire Context (including all variables referenced by other closures in that scope) survives.',
    coachingTip: 'Beware of outer scope variables referenced by sibling closures! If you retain a closure, set unused references (e.g. priorThing = null) before exiting the function.',
  },

  // 13. Analyze / Advanced / Real-World Problem
  {
    conceptTitle: 'Dangerous Error Handling: uncaughtException Without Exit',
    questionText: 'Why does the official Node.js documentation explicitly state that running an application after catching an `uncaughtException` event without calling `process.exit(1)` is dangerous and unsupported?',
    difficulty: 'advanced',
    cognitiveLevel: 'analyze',
    questionType: 'real_world_problem',
    expectedAnswer: 'An uncaught exception indicates that the program is in an undefined state where references are corrupted, mutexes/locks may be orphaned, and resources leaked; continuing can cause silent database corruption.',
    hints: [
      '💡 Hint 1 (Mental Model): What happens to the internal state of third-party libraries and database drivers when an unexpected exception escapes?',
      '🔍 Hint 2 (Mechanism Clue): When an exception is thrown mid-execution, locks, transactions, and object invariants are broken.',
      '🎯 Hint 3 (Trade-off Insight): Continuing to process new HTTP requests with corrupted heap state leads to data corruption and deadlocks.',
    ],
    options: [
      {
        id: 'A',
        text: 'An uncaught exception means the program is in an undefined state where references are corrupted, locks are orphaned, and resources are leaked; continuing can cause silent database corruption.',
        isCorrect: true,
        explanation: 'Correct: By definition, uncaughtException means something completely unanticipated occurred. State invariants are violated, database transaction rollbacks may not have fired, and continuing to serve requests risks silent data corruption.',
      },
      {
        id: 'B',
        text: 'The operating system kernel forcibly terminates all physical CPU cores if process.exit(1) is omitted.',
        isCorrect: false,
        explanation: 'Incorrect: The OS kernel does not terminate CPU cores due to a user-space exception.',
      },
      {
        id: 'C',
        text: 'JavaScript engines permanently freeze execution and throw a SyntaxError on the next line of code.',
        isCorrect: false,
        explanation: 'Incorrect: The JavaScript engine could theoretically continue, but the application state is untrustworthy.',
      },
      {
        id: 'D',
        text: 'uncaughtException automatically deletes the package.json file from disk.',
        isCorrect: false,
        explanation: 'Incorrect: No files are deleted by default error handlers.',
      },
    ],
    explanation: 'When an exception is uncaught, the call stack unwound abruptly. Resources are in an inconsistent state. The only safe action is to log the stack trace, close listening sockets to drain active connections, and exit with a non-zero code.',
    coachingTip: 'Use process.on("uncaughtException") ONLY for last-resort crash telemetry and graceful process exit. Let process supervisors (Kubernetes, PM2) restart a clean container!',
  },

  // 14. Analyze / Advanced / Scenario
  {
    conceptTitle: 'High-Resolution Event Loop Lag Monitoring with monitorEventLoopDelay',
    questionText: 'Why is `perf_hooks.monitorEventLoopDelay({ resolution: 20 })` vastly superior to running a naive `setInterval(() => { ... }, 100)` timer to measure event loop delay in production?',
    difficulty: 'advanced',
    cognitiveLevel: 'analyze',
    questionType: 'scenario',
    expectedAnswer: 'monitorEventLoopDelay uses a native libuv C++ timer that continuously samples event loop delay into a high-dynamic-range (HDR) histogram without allocating JS objects or competing on the JS call stack.',
    hints: [
      '💡 Hint 1 (Mental Model): What happens when a naive setInterval timer attempts to measure delay during a heavy CPU freeze?',
      '🔍 Hint 2 (Mechanism Clue): setInterval allocates a JS timer object and requires the JS thread to execute its callback.',
      '🎯 Hint 3 (Trade-off Insight): monitorEventLoopDelay runs at the C++ libuv level and records percentiles (p50, p99, max) with microsecond precision.',
    ],
    options: [
      {
        id: 'A',
        text: 'monitorEventLoopDelay uses a native libuv C++ timer recording delays into a high-dynamic-range (HDR) histogram without allocating JS objects or skewing call stack execution.',
        isCorrect: true,
        explanation: 'Correct: monitorEventLoopDelay runs in C++ within libuv. It samples loop delay continuously and aggregates into an HDR histogram, providing microsecond-level p50, p99, and max statistics without JavaScript overhead.',
      },
      {
        id: 'B',
        text: 'setInterval consumes 100% of CPU core 0 on multi-core servers.',
        isCorrect: false,
        explanation: 'Incorrect: setInterval does not peg CPU at 100%, but its accuracy degrades under load.',
      },
      {
        id: 'C',
        text: 'monitorEventLoopDelay pauses the Node.js server to take microsecond memory measurements.',
        isCorrect: false,
        explanation: 'Incorrect: monitorEventLoopDelay is completely non-blocking and introduces virtually zero overhead.',
      },
      {
        id: 'D',
        text: 'setInterval cannot measure time intervals smaller than 1,000 milliseconds.',
        isCorrect: false,
        explanation: 'Incorrect: setInterval supports 1ms minimum intervals, but suffers from timer drift and scheduling jitter.',
      },
    ],
    explanation: 'Naive setInterval timers only check delay at coarse intervals and allocate JS objects that perturb the very event loop you are trying to observe. monitorEventLoopDelay records accurate latency histograms at the native C++ level.',
    coachingTip: 'Use const histogram = perf_hooks.monitorEventLoopDelay({ resolution: 10 }); histogram.enable(); and expose histogram.percentile(99) to Prometheus!',
  },

  // 15. Evaluate / Advanced / Open Ended
  {
    conceptTitle: 'worker_threads vs child_process.fork for CPU-Intensive Tasks',
    questionText: 'You are designing a high-throughput image thumbnailing service in Node.js that processes 2,000 images/sec. What is the primary architectural advantage of `worker_threads` over `child_process.fork()`?',
    difficulty: 'advanced',
    cognitiveLevel: 'evaluate',
    questionType: 'open_ended',
    expectedAnswer: 'Worker threads share the same OS process and can share raw memory buffers zero-copy via SharedArrayBuffer and transferList, avoiding multi-megabyte process RSS overhead and IPC serialization costs.',
    hints: [
      '💡 Hint 1 (Mental Model): How does data move between two separate operating system processes vs two threads in the same process?',
      '🔍 Hint 2 (Mechanism Clue): child_process.fork requires serializing data into JSON/buffers and transmitting over IPC sockets.',
      '🎯 Hint 3 (Trade-off Insight): worker_threads allow true shared memory via SharedArrayBuffer and zero-copy pointer transfer via ArrayBuffer transferList.',
    ],
    options: [
      {
        id: 'A',
        text: 'Worker threads share the same OS process and allow zero-copy memory transfers via SharedArrayBuffer and transferList, eliminating OS process creation overhead and IPC serialization lag.',
        isCorrect: true,
        explanation: 'Correct: child_process.fork() creates a separate 30–50MB OS process and requires cross-process IPC serialization. worker_threads run isolated V8 environments within the same process and support zero-copy buffer transfers.',
      },
      {
        id: 'B',
        text: 'Worker threads bypass JavaScript syntax rules and execute compiled assembly directly.',
        isCorrect: false,
        explanation: 'Incorrect: Worker threads execute standard JavaScript in a separate V8 Isolate.',
      },
      {
        id: 'C',
        text: 'Child processes cannot communicate over TCP sockets.',
        isCorrect: false,
        explanation: 'Incorrect: Child processes can communicate over TCP and IPC sockets.',
      },
      {
        id: 'D',
        text: 'Worker threads automatically disable CPU throttling in cloud environments.',
        isCorrect: false,
        explanation: 'Incorrect: Cloud CPU throttling operates at the cgroup/VM level, unaffected by thread configurations.',
      },
    ],
    explanation: 'For passing large binary payloads (like image buffers or audio chunks), worker_threads allows transferring ArrayBuffer ownership instantly with zero copying via postMessage(buffer, [buffer.buffer]), avoiding expensive IPC serialization.',
    coachingTip: 'For heavy binary computation: worker_threads with transferList. For untrusted code execution or complete fault isolation: child_process.fork() or isolated-vm.',
  },

  // 16. Evaluate / Advanced / Scenario
  {
    conceptTitle: 'AsyncLocalStorage Context Propagation vs Performance',
    questionText: 'When using `AsyncLocalStorage` from `node:async_hooks` to propagate correlation IDs across microservices, what is the primary operational trade-off to consider?',
    difficulty: 'advanced',
    cognitiveLevel: 'evaluate',
    questionType: 'scenario',
    expectedAnswer: 'It provides clean, transparent context propagation without polluting function signatures, but introduces a 2–5% throughput overhead due to hooking into every Promise and asynchronous boundary.',
    hints: [
      '💡 Hint 1 (Mental Model): How does AsyncLocalStorage track state across await boundaries without passing parameters?',
      '🔍 Hint 2 (Mechanism Clue): It hooks into V8 Promise lifecycle hooks (init, before, after, destroy).',
      '🎯 Hint 3 (Trade-off Insight): In ultra-low-latency, high-throughput microservices, the additional hook allocations create measurable CPU overhead.',
    ],
    options: [
      {
        id: 'A',
        text: 'It provides clean, transparent context propagation across asynchronous hops without parameter threading, but introduces a 2–5% throughput penalty due to V8 Promise hook invocations.',
        isCorrect: true,
        explanation: 'Correct: AsyncLocalStorage relies on V8 promise hooks to bind execution context across async hops. While modern V8 has heavily optimized this, tracking every Promise still incurs ~2-5% throughput overhead compared to manual argument passing.',
      },
      {
        id: 'B',
        text: 'It causes all HTTP requests to be processed sequentially one-by-one.',
        isCorrect: false,
        explanation: 'Incorrect: Requests remain completely concurrent.',
      },
      {
        id: 'C',
        text: 'It requires disabling TypeScript strict mode and Hermes.',
        isCorrect: false,
        explanation: 'Incorrect: AsyncLocalStorage is a standard Node.js API with full TypeScript support.',
      },
      {
        id: 'D',
        text: 'It stores correlation IDs in plain text in the root filesystem.',
        isCorrect: false,
        explanation: 'Incorrect: AsyncLocalStorage stores context in process memory, never on the filesystem.',
      },
    ],
    explanation: 'AsyncLocalStorage provides a thread-local storage equivalent for Node.js async operations. It eliminates parameter drilling for request tracing, but developers must balance this developer velocity gain against slight V8 async hook overhead.',
    coachingTip: 'Use AsyncLocalStorage for request ID tracing and tenant context in microservices. Only avoid it on hot paths performing millions of raw micro-promises per second.',
  },

  // 17. Evaluate / Advanced / Open Ended
  {
    conceptTitle: 'Production Graceful Shutdown Protocol',
    questionText: 'What is the proper sequence of operations when a Node.js web service receives a `SIGTERM` signal during a rolling deployment in Kubernetes?',
    difficulty: 'advanced',
    cognitiveLevel: 'evaluate',
    questionType: 'open_ended',
    expectedAnswer: '1) Stop accepting new connections with server.close(), 2) Fail the readiness probe, 3) Wait for active in-flight requests to complete (with a bounded timeout), 4) Close database and cache pools, 5) process.exit(0).',
    hints: [
      '💡 Hint 1 (Mental Model): What happens to users mid-checkout if you immediately terminate the process or close DB pools?',
      '🔍 Hint 2 (Mechanism Clue): The load balancer needs time to stop routing new traffic, and existing requests must finish.',
      '🎯 Hint 3 (Trade-off Insight): Always enforce a bounded timeout (e.g. 10s) before calling process.exit(1) if requests hang.',
    ],
    options: [
      {
        id: 'A',
        text: '1) Stop accepting new requests via server.close(), 2) Fail readiness check, 3) Wait for in-flight requests with bounded timeout, 4) Close database/cache pools, 5) Exit process cleanly.',
        isCorrect: true,
        explanation: 'Correct: The production standard: stop accepting traffic (server.close()), fail readiness so Kubernetes ingress sheds traffic, drain existing connections with a timeout, gracefully close DB connection pools, and exit 0.',
      },
      {
        id: 'B',
        text: 'Immediately call process.exit(0) to terminate the container in 0 milliseconds.',
        isCorrect: false,
        explanation: 'Incorrect: Immediate exit abruptly drops all active client connections, resulting in HTTP 502/504 errors.',
      },
      {
        id: 'C',
        text: 'Drop all open database connections immediately, then let HTTP requests timeout.',
        isCorrect: false,
        explanation: 'Incorrect: Dropping database connections causes in-flight transactions to fail with unhandled errors.',
      },
      {
        id: 'D',
        text: 'Reboot the physical Kubernetes worker node using child_process.exec.',
        isCorrect: false,
        explanation: 'Incorrect: Containers should never reboot host nodes.',
      },
    ],
    explanation: 'A resilient shutdown protocol stops accepting new traffic, gives active transactions a window to finish, shuts down stateful database pools cleanly, and enforces a hard timeout to prevent hanging pods.',
    coachingTip: 'Always combine graceful draining with a safety fallback: setTimeout(() => process.exit(1), 15000).unref() so a stuck database query cannot prevent container shutdown!',
  },

  // 18. Evaluate / Advanced / Scenario
  {
    conceptTitle: 'ReDoS Mitigation in V8 Regular Expression Engine',
    questionText: 'Why can a regular expression like `/(a+)+$/` matched against an input string of 30 "a"s followed by a "!" freeze an entire Node.js single-threaded server, and how should it be mitigated?',
    difficulty: 'advanced',
    cognitiveLevel: 'evaluate',
    questionType: 'scenario',
    expectedAnswer: 'V8’s Irregexp engine uses backtracking with O(2^N) exponential time complexity on catastrophic non-matching inputs; because JavaScript runs on a single thread, backtracking blocks the event loop entirely. Mitigate using re2 (linear time DFA) or input length validation.',
    hints: [
      '💡 Hint 1 (Mental Model): What happens when nested quantifiers fail to match the terminal character?',
      '🔍 Hint 2 (Mechanism Clue): The regex engine attempts every possible permutation of splitting the characters among the nested groups.',
      '🎯 Hint 3 (Trade-off Insight): For 30 characters, 2^30 permutations require billions of CPU cycles on the single main thread.',
    ],
    options: [
      {
        id: 'A',
        text: 'Catastrophic backtracking in nested quantifiers has O(2^N) complexity on non-matches, blocking the single event loop thread; use re2 (linear time DFA) or non-backtracking patterns.',
        isCorrect: true,
        explanation: 'Correct: V8 uses a backtracking NFA regex engine. Nested quantifiers /(a+)+$/ cause exponential permutations when the suffix fails to match, freezing the single JS thread for minutes. Mitigate using linear-time DFA engines like re2 or safe-regex audits.',
      },
      {
        id: 'B',
        text: 'V8 crashes because the "+" operator is reserved for mathematical addition only.',
        isCorrect: false,
        explanation: 'Incorrect: "+" is standard regex syntax for one or more repetitions.',
      },
      {
        id: 'C',
        text: 'The input string overflows the 64-bit integer pointer range in C++.',
        isCorrect: false,
        explanation: 'Incorrect: 30 characters is negligible memory; the issue is algorithmic time complexity.',
      },
      {
        id: 'D',
        text: 'Node.js does not support regular expressions longer than 5 characters.',
        isCorrect: false,
        explanation: 'Incorrect: Node.js supports arbitrary regex patterns.',
      },
    ],
    explanation: 'Regular Expression Denial of Service (ReDoS) is one of the most common high-severity vulnerabilities in Node.js. Because of single-threaded execution, an algorithmic CPU freeze halts the entire server for all concurrent users.',
    coachingTip: 'Never match untrusted user input against regexes with nested quantifiers (a+)+. Use google/re2 bindings for user-supplied regexes to guarantee O(N) linear time!',
  },

  // 19. Create / Pro / Real-World Problem
  {
    conceptTitle: 'Architecting a 100k RPS High-Throughput Stream Gateway',
    questionText: 'How would you architect a Node.js ingestion gateway to ingest 100,000 JSON telemetry events per second into Kafka while strictly enforcing a 512MB V8 memory limit?',
    difficulty: 'pro',
    cognitiveLevel: 'create',
    questionType: 'real_world_problem',
    expectedAnswer: 'Utilize cluster multi-core scaling, non-blocking HTTP parsing via fastify/uWebSockets, streaming pipeline parsing, backpressure propagation to incoming TCP sockets, and bounded batch producer flushes.',
    hints: [
      '💡 Hint 1 (Mental Model): Under 100k RPS, you cannot buffer uncommitted requests in memory, or the 512MB heap will crash in seconds.',
      '🔍 Hint 2 (Mechanism Clue): Scale across all CPU cores and stream raw incoming request bodies directly into batch queues.',
      '🎯 Hint 3 (Trade-off Insight): If Kafka producer queues fill up, propagate backpressure by pausing client sockets, never accepting more than the queue threshold.',
    ],
    options: [
      {
        id: 'A',
        text: 'Scale across cores via cluster, stream bodies with stream.pipeline, enforce socket backpressure when Kafka write buffers reach highWaterMark, and flush compressed micro-batches with linger.ms.',
        isCorrect: true,
        explanation: 'Correct: The architecturally optimal pattern: 1) Scale across cores using cluster/SO_REUSEPORT, 2) Stream request bodies without buffering entire payloads in JS heap, 3) Enforce socket backpressure (pause sockets when producer buffer fills), 4) Micro-batch events to Kafka with zstd compression.',
      },
      {
        id: 'B',
        text: 'Buffer all 100,000 events in a global JavaScript array in memory and flush once per minute.',
        isCorrect: false,
        explanation: 'Incorrect: Buffering 100k events/sec in memory for 1 minute creates millions of objects, causing immediate V8 heap Out-Of-Memory crashes.',
      },
      {
        id: 'C',
        text: 'Spawn 100,000 OS child processes using child_process.exec() per request.',
        isCorrect: false,
        explanation: 'Incorrect: Spawning 100k OS processes causes instant kernel fork exhaustion and server crash.',
      },
      {
        id: 'D',
        text: 'Disable TCP ACKs on all incoming sockets to avoid waiting for acknowledgements.',
        isCorrect: false,
        explanation: 'Incorrect: Disabling TCP ACKs violates the TCP transport protocol and breaks network reliability.',
      },
    ],
    explanation: 'High-throughput Node.js architectures require zero-copy streaming, backpressure propagation to client TCP sockets, and micro-batching. If downstream brokers slow down, socket backpressure automatically throttles upstream clients, keeping memory within 512MB.',
    coachingTip: 'In high-velocity systems: backpressure is your lifejacket. Never accumulate uncommitted data in unbound JavaScript arrays!',
  },

  // 20. Create / Pro / Practical Exercise
  {
    conceptTitle: 'Lock-Free SPSC Ring Buffer with worker_threads & Atomics',
    questionText: 'How can you implement a high-performance lock-free Single Producer Single Consumer (SPSC) ring buffer between a main Node.js thread and a `worker_thread`?',
    difficulty: 'pro',
    cognitiveLevel: 'create',
    questionType: 'practical_exercise',
    expectedAnswer: 'Allocate a SharedArrayBuffer containing a typed array data buffer and an Int32Array storing head and tail indices, using Atomics.load, Atomics.store, and Atomics.wait/notify for non-blocking thread coordination.',
    hints: [
      '💡 Hint 1 (Mental Model): Passing messages with postMessage() incurs serialization and event loop queuing overhead.',
      '🔍 Hint 2 (Mechanism Clue): SharedArrayBuffer allows both threads to map the exact same physical memory address space.',
      '🎯 Hint 3 (Trade-off Insight): Int32Array with Atomics guarantees memory visibility and atomic index updates without mutex locks.',
    ],
    options: [
      {
        id: 'A',
        text: 'Allocate a SharedArrayBuffer with an Int32Array storing head/tail indices, using Atomics.load/store for memory barriers and Atomics.wait/notify for zero-copy coordination without mutex locks.',
        isCorrect: true,
        explanation: 'Correct: A lock-free SPSC ring buffer uses SharedArrayBuffer mapped into both threads. An Int32Array holds head and tail pointers. Atomics.load and Atomics.store provide sequential consistency and memory barriers without mutex contention.',
      },
      {
        id: 'B',
        text: 'Pass JSON strings back and forth across postMessage() without transfer lists.',
        isCorrect: false,
        explanation: 'Incorrect: JSON string serialization over postMessage is slow and not lock-free shared memory.',
      },
      {
        id: 'C',
        text: 'Use filesystem temporary files (/tmp/buffer.dat) with flock file locks.',
        isCorrect: false,
        explanation: 'Incorrect: Disk I/O introduces millisecond latencies, defeating high-speed inter-thread communication.',
      },
      {
        id: 'D',
        text: 'Have the worker thread mutate the global window object.',
        isCorrect: false,
        explanation: 'Incorrect: Node.js worker threads do not share global scopes or have a window object.',
      },
    ],
    explanation: 'SharedArrayBuffer combined with the Atomics API enables lock-free shared-memory concurrency in Node.js. The producer advances the tail index with Atomics.store, while the consumer advances the head index, achieving sub-microsecond inter-thread throughput.',
    coachingTip: 'Use Atomics.wait() only on worker threads (it throws an exception on the main Node.js thread to prevent event loop locking)!',
  },

  // 21. Create / Pro / Real-World Problem
  {
    conceptTitle: 'Secure Multi-Tenant Untrusted Code Execution with V8 Isolates',
    questionText: 'How do you architect a secure serverless platform inside Node.js that executes untrusted user JavaScript code while strictly enforcing 50ms CPU execution limits and a 64MB memory cap?',
    difficulty: 'pro',
    cognitiveLevel: 'create',
    questionType: 'real_world_problem',
    expectedAnswer: 'Use isolated V8 environments (such as isolated-vm) providing distinct V8 Isolates with separate memory heaps, CPU microsecond deadline timers, and complete exclusion of Node.js native bindings (no process, fs, or network access).',
    hints: [
      '💡 Hint 1 (Mental Model): Node.js built-in vm module is explicitly not a security sandbox (callers can break out via this.constructor.constructor).',
      '🔍 Hint 2 (Mechanism Clue): A true V8 Isolate has its own independent garbage-collected heap and execution context.',
      '🎯 Hint 3 (Trade-off Insight): isolated-vm provides strict CPU microsecond timeouts and memory limits enforced at the C++ V8 engine level.',
    ],
    options: [
      {
        id: 'A',
        text: 'Use isolated V8 Isolates (e.g. isolated-vm) providing distinct memory heaps, strict CPU microsecond deadline timers, and zero exposure to Node.js host globals, fs, or network bindings.',
        isCorrect: true,
        explanation: 'Correct: Node.js `vm` is not a secure sandbox. Secure serverless execution requires distinct V8 Isolates (like isolated-vm or Cloudflare Workers) with isolated memory heaps, CPU timeouts, and no access to process/require.',
      },
      {
        id: 'B',
        text: 'Run user scripts using the built-in eval() function inside a try/catch block.',
        isCorrect: false,
        explanation: 'Incorrect: eval() runs directly in the host process with full permissions and zero resource limits.',
      },
      {
        id: 'C',
        text: 'Run user scripts inside Node.js vm.runInContext() without external libraries.',
        isCorrect: false,
        explanation: 'Incorrect: The official Node.js docs state: "The node:vm module is not a security mechanism. Do not use it to run untrusted code."',
      },
      {
        id: 'D',
        text: 'Pass user scripts directly to the Linux bash shell via child_process.execSync.',
        isCorrect: false,
        explanation: 'Incorrect: Passing untrusted input to execSync grants full root shell remote code execution (RCE).',
      },
    ],
    explanation: 'The built-in vm module shares the host V8 Isolate and can be trivially escaped via prototype access. Secure multi-tenant sandboxing requires isolated V8 Isolates that have separate heaps, C++ enforced CPU execution timers, and zero host globals.',
    coachingTip: 'Remember: Node.js vm is for context isolation, NOT security. For untrusted code: use isolated-vm, WebAssembly (Wasm), or gVisor/Firecracker microVMs!',
  },

  // 22. Create / Pro / Scenario
  {
    conceptTitle: 'HTTP/2 Multiplexed Streaming Reverse Proxy Architecture',
    questionText: 'When designing an HTTP/2 streaming gateway in Node.js multiplexing 1,000 concurrent client streams over a single backend TCP socket, what mechanism prevents slow consumer streams from stalling fast consumer streams?',
    difficulty: 'pro',
    cognitiveLevel: 'create',
    questionType: 'scenario',
    expectedAnswer: 'HTTP/2 stream-level flow control (WINDOW_UPDATE frames) combined with per-stream backpressure buffers, ensuring window exhaustion on one stream does not consume connection-level window credit.',
    hints: [
      '💡 Hint 1 (Mental Model): HTTP/2 has two tiers of flow control: connection-level and stream-level.',
      '🔍 Hint 2 (Mechanism Clue): If a client stops reading Stream 5, Stream 5 window reaches 0 while other streams continue receiving WINDOW_UPDATE.',
      '🎯 Hint 3 (Trade-off Insight): Node.js http2Stream.pause() stops reading frame data for that stream without pausing the http2Session.',
    ],
    options: [
      {
        id: 'A',
        text: 'Independent HTTP/2 stream-level flow control (WINDOW_UPDATE frames) paired with per-stream backpressure, preventing a stalled stream from exhausting the shared session-level window.',
        isCorrect: true,
        explanation: 'Correct: HTTP/2 enforces independent flow control windows for both individual streams and the entire session. By managing per-stream WINDOW_UPDATE frames and pausing lagging streams, fast streams continue multiplexing uninterrupted.',
      },
      {
        id: 'B',
        text: 'Closing the backend TCP socket and re-opening 1,000 independent HTTP/1.1 connections.',
        isCorrect: false,
        explanation: 'Incorrect: Falling back to 1,000 TCP sockets destroys connection multiplexing efficiency.',
      },
      {
        id: 'C',
        text: 'Dropping all incoming data frames for any client whose round-trip latency exceeds 10ms.',
        isCorrect: false,
        explanation: 'Incorrect: Dropping frames corrupts the HTTP/2 framing layer and causes protocol errors.',
      },
      {
        id: 'D',
        text: 'Converting all binary stream chunks into base64 strings.',
        isCorrect: false,
        explanation: 'Incorrect: Base64 encoding inflates memory by 33% without solving stream flow control.',
      },
    ],
    explanation: 'HTTP/2 multiplexing requires careful management of stream-level vs session-level flow control windows. Stalled consumers must be bounded at the stream level so that WINDOW_UPDATE frames for healthy streams continue to flow.',
    coachingTip: 'Always monitor stream-level window credits in HTTP/2 proxies. Never let a single stalled consumer saturate the shared session window!',
  },

  // 23. Analyze / Advanced / Real-World Problem
  {
    conceptTitle: 'V8 External Memory Bloat: Buffer.from vs Slab Allocation',
    questionText: 'A high-throughput API gateway handles 20MB file uploads. Process RSS memory grows to 1.8GB while `process.memoryUsage().heapUsed` reports only 120MB. What explains this discrepancy?',
    difficulty: 'advanced',
    cognitiveLevel: 'analyze',
    questionType: 'real_world_problem',
    expectedAnswer: 'Large Buffers (>8KB) are allocated directly in C++ memory outside the V8 heap using external ArrayBuffers; V8 garbage collection is not triggered by external memory pressure until explicit heap limits are approached.',
    hints: [
      '💡 Hint 1 (Mental Model): Notice that heapUsed is tiny (120MB) while process RSS is massive (1.8GB). Where does Buffer memory live?',
      '🔍 Hint 2 (Mechanism Clue): Node.js Buffers are backed by C++ ArrayBuffer memory allocated via malloc outside V8 JavaScript heap.',
      '🎯 Hint 3 (Trade-off Insight): V8 GC heuristics are primarily tuned to heapUsed, not external RSS, delaying GC cycles while C++ buffers accumulate.',
    ],
    options: [
      {
        id: 'A',
        text: 'Buffers larger than 8KB are allocated outside the V8 JavaScript heap in C++ external memory; V8 GC heuristics may not trigger scavenge cycles promptly based on external RSS bloat.',
        isCorrect: true,
        explanation: 'Correct: Node.js Buffers allocate raw binary memory outside the V8 heap (reflected in external and arrayBuffers metrics). Because heapUsed remains low, V8 does not prioritize GC, allowing external C++ allocations to climb until memory limits are breached.',
      },
      {
        id: 'B',
        text: 'The operating system kernel has leaked TCP socket descriptors.',
        isCorrect: false,
        explanation: 'Incorrect: Socket descriptor leaks appear as file descriptor leaks, not multi-gigabyte process RSS memory.',
      },
      {
        id: 'C',
        text: 'JavaScript arrays cannot hold more than 1,000 elements.',
        isCorrect: false,
        explanation: 'Incorrect: JavaScript arrays easily support millions of elements.',
      },
      {
        id: 'D',
        text: 'The application is running inside a 32-bit CPU emulator.',
        isCorrect: false,
        explanation: 'Incorrect: 32-bit processes are capped at 2GB total address space, which would crash with OOM.',
      },
    ],
    explanation: 'process.memoryUsage() reports heapUsed, heapTotal, external, and rss. Large buffers live in "external" memory. If JavaScript heap is empty, V8 might defer GC while external memory consumes hundreds of megabytes.',
    coachingTip: 'Monitor process.memoryUsage().external and process.memoryUsage().rss alongside heapUsed! Set --max-old-space-size and tune Buffer pooling when handling heavy binary uploads.',
  },

  // 24. Evaluate / Advanced / Open Ended
  {
    conceptTitle: 'Benchmarking Node-API (N-API) vs WebAssembly vs worker_threads',
    questionText: 'When offloading a computationally intensive image convolution matrix filter in Node.js, which architectural approach provides the fastest execution speed with zero V8 compilation overhead?',
    difficulty: 'advanced',
    cognitiveLevel: 'evaluate',
    questionType: 'open_ended',
    expectedAnswer: 'Native C++ addons using Node-API (N-API) with SIMD compiler optimizations, executed either on worker threads or libuv thread pool.',
    hints: [
      '💡 Hint 1 (Mental Model): WebAssembly runs in a sandboxed Wasm VM inside V8; Node-API compiles directly to native machine code.',
      '🔍 Hint 2 (Mechanism Clue): Native C++ can leverage AVX2/AVX-512 SIMD vector instructions and direct memory pointers.',
      '🎯 Hint 3 (Trade-off Insight): Node-API provides ABI stability across Node.js versions while executing native CPU instructions.',
    ],
    options: [
      {
        id: 'A',
        text: 'Node-API (N-API) native C++ addon leveraging compiler SIMD vectorization, offloaded to worker_threads to prevent main event loop stalls.',
        isCorrect: true,
        explanation: 'Correct: Node-API compiles to native machine code with full SIMD (AVX/NEON) vectorization. Offloading it to worker_threads or the libuv thread pool achieves maximum computational throughput without blocking the event loop.',
      },
      {
        id: 'B',
        text: 'Writing the matrix filter in synchronous JavaScript using nested for-loops on the main thread.',
        isCorrect: false,
        explanation: 'Incorrect: A synchronous nested loop blocks the entire event loop, freezing all concurrent requests.',
      },
      {
        id: 'C',
        text: 'Serializing image pixels to JSON and posting them to a local Redis cache.',
        isCorrect: false,
        explanation: 'Incorrect: JSON serialization of image pixels adds massive CPU and memory overhead.',
      },
      {
        id: 'D',
        text: 'Using process.nextTick to process one pixel per loop iteration.',
        isCorrect: false,
        explanation: 'Incorrect: Per-pixel nextTick scheduling introduces catastrophic function call overhead and starves I/O.',
      },
    ],
    explanation: 'Node-API provides ABI stability and direct access to CPU hardware capabilities (SIMD, multithreading) with zero-copy Buffer access. Offloaded to worker threads, it delivers peak numerical computation speed.',
    coachingTip: 'Use Node-API (C/C++) or Rust (via napi-rs) for raw vector math and compression. Use WebAssembly when cross-platform portability is needed without native compilation.',
  },

  // 25. Create / Pro / Real-World Problem
  {
    conceptTitle: 'Architecting Zero-Data-Loss Outbox Pattern with WAL Tailing',
    questionText: 'How do you design an enterprise-grade transactional event publishing architecture in Node.js that guarantees zero message loss and exactly-once publishing when updating a database and emitting domain events?',
    difficulty: 'pro',
    cognitiveLevel: 'create',
    questionType: 'real_world_problem',
    expectedAnswer: 'Implement the Transactional Outbox pattern: write business data and outbox events in the same atomic database transaction, then use a dedicated Change Data Capture (CDC) worker tailing the database WAL to publish to Kafka with idempotent producers.',
    hints: [
      '💡 Hint 1 (Mental Model): What happens if the database write succeeds but the Kafka publish network call fails?',
      '🔍 Hint 2 (Mechanism Clue): Two separate distributed systems (DB and Kafka) cannot share an atomic transaction without 2PC.',
      '🎯 Hint 3 (Trade-off Insight): The Outbox pattern writes events to an outbox table in the same DB transaction. A CDC tailer (e.g. Debezium) streams the WAL into Kafka.',
    ],
    options: [
      {
        id: 'A',
        text: 'The Transactional Outbox pattern: atomically commit the entity update and an outbox record within the same DB transaction, followed by a CDC WAL-tailing process streaming events to Kafka with idempotent producer acks=all.',
        isCorrect: true,
        explanation: 'Correct: Dual writes (DB update + Kafka publish) inevitably lead to inconsistency during crashes. The Transactional Outbox guarantees that events are committed atomically with data. A WAL-tailing process (or Debezium) guarantees at-least-once delivery to Kafka.',
      },
      {
        id: 'B',
        text: 'Publish to Kafka first; if Kafka succeeds, write to the database in a setTimeout callback.',
        isCorrect: false,
        explanation: 'Incorrect: If the database write fails or process crashes, the published Kafka event represents phantom uncommitted data.',
      },
      {
        id: 'C',
        text: 'Store events in a local CSV file on the server disk and delete it every hour.',
        isCorrect: false,
        explanation: 'Incorrect: Local CSV files do not provide transactional guarantees or crash durability.',
      },
      {
        id: 'D',
        text: 'Rely on Node.js EventEmitter across server clusters.',
        isCorrect: false,
        explanation: 'Incorrect: EventEmitter is an in-memory, single-process construct with zero persistence or cross-server capabilities.',
      },
    ],
    explanation: 'Dual writes in microservices are an anti-pattern. The Transactional Outbox pattern solves the dual-write problem by leveraging the database ACID transaction for both state and event records, guaranteeing resilience.',
    coachingTip: 'Never do: await db.save(); await kafka.send();! If the node crashes in between, data is corrupt. Use the Transactional Outbox pattern with CDC for mission-critical architectures.',
  },
];

/**
 * Returns a high-grade Node.js question for the specified concept index (1 to 25+).
 */
export function getNodeJSQuestion(
  index: number,
  options: QuestionGenerationOptions
): Partial<QBLQuestion> {
  const normalizedIndex = Math.max(1, index);
  const qDef = NODE_JS_QUESTIONS[(normalizedIndex - 1) % NODE_JS_QUESTIONS.length];

  return {
    id: `q_node_${normalizedIndex}_${Date.now().toString(36)}`,
    conceptTitle: qDef.conceptTitle,
    conceptIndex: normalizedIndex,
    questionText: qDef.questionText,
    difficulty: options.difficulty || qDef.difficulty,
    cognitiveLevel: options.cognitiveLevel || qDef.cognitiveLevel,
    questionType: options.questionType || qDef.questionType,
    expectedAnswer: qDef.expectedAnswer,
    hints: qDef.hints,
    sourceReference: "Node.js Official Documentation & Architecture Specs, Bert Belder et al. - 'libuv Design Architecture', & Mario Casciaro - 'Node.js Design Patterns' (Packt)",
    options: qDef.options,
    explanation: qDef.explanation,
    coachingTip: qDef.coachingTip,
    subject: 'Node.js',
    chapter: options.chapterTitle,
    topic: options.topicTitle,
    subtopic: options.subtopicTitle,
  };
}
