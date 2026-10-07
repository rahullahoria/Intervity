/**
 * QBLQuestionCatalog
 * 
 * Comprehensive Question-Driven Learning (QBL) Question Catalog:
 * - Specific, senior/staff-level architectural scenarios across 5 core masterclass tracks
 * - Unique, distinct questions for Concept #1, Concept #2, and Concept #3
 * - Deep diagnostic reinforcement drills when a candidate makes a mistake
 * - Dynamic procedural question synthesis for custom user-entered engineering topics
 */

import { QBLQuestion, QBLOption } from '../../types';

interface QuestionTemplate {
  conceptTitle: string;
  questionText: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  explanation: string;
  coachingTip: string;
}

// 1. Masterclass Track Question Banks (Concept 1, 2, 3 + Reinforcement)
const TRACK_QUESTIONS: Record<string, {
  concepts: Record<number, QuestionTemplate>;
  reinforcement: QuestionTemplate;
}> = {
  // Track 1: SQL Indexing & Sharding
  'sql indexing & sharding': {
    concepts: {
      1: {
        conceptTitle: 'B+Tree vs Heap Access Paths & Sequential Scans',
        questionText: 'When querying an unclustered B+Tree index on a high-cardinality column in PostgreSQL or MySQL, why does the Cost-Based Optimizer (CBO) frequently switch to a full sequential table scan when matching >15% of the total rows?',
        options: [
          {
            id: 'A',
            text: 'B+Tree leaf nodes cannot store ordered physical row pointers on disk.',
            isCorrect: false,
            explanation: 'B+Tree leaf nodes are strictly sorted doubly-linked lists storing physical page/tuple IDs (TIDs/Pointers).',
          },
          {
            id: 'B',
            text: 'The random I/O overhead of fetching table heap pages per index entry exceeds the throughput of sequential page prefetching.',
            isCorrect: true,
            explanation: 'Index scans require random, non-contiguous page seeks on the table heap. When matching many rows, sequential disk scans (fetching contiguous pages into shared buffers) are dramatically faster.',
          },
          {
            id: 'C',
            text: 'Relational database engines disable index scans automatically on any column with integer data types.',
            isCorrect: false,
            explanation: 'Integers are the most efficiently indexed data type; CBO decisions are strictly driven by page cost estimations.',
          },
          {
            id: 'D',
            text: 'Traversing B+Trees requires acquiring an exclusive table-level lock on the root node.',
            isCorrect: false,
            explanation: 'B+Trees use fine-grained latch crabbing (coupling) down nodes, permitting highly concurrent read/write traversals.',
          },
        ],
        explanation: 'Cost-based query optimizers compare random page seek costs against sequential block I/O. When row selectivity exceeds 10–20%, sequential scans beat random index lookups.',
        coachingTip: 'Index scans are not automatically faster. Always consider table heap fetch costs and index-only scan possibilities (covering indexes with INCLUDE).',
      },
      2: {
        conceptTitle: 'Write-Ahead Logging (WAL) & Fsync Group Commits',
        questionText: 'In high-throughput relational databases (PostgreSQL/MySQL InnoDB), how does Write-Ahead Logging (WAL) guarantee ACID durability without forcing synchronous, random flushes of dirty table pages to disk on every commit?',
        options: [
          {
            id: 'A',
            text: 'Writes are retained in volatile RAM without disk writes until a daily checkpoint occurs.',
            isCorrect: false,
            explanation: 'Relying purely on volatile memory without persistent disk logging violates ACID durability and causes data loss on crash.',
          },
          {
            id: 'B',
            text: 'Sequential append-only WAL records are fsync’d to disk before commit ACK, deferring expensive random page flushes to background checkpoints.',
            isCorrect: true,
            explanation: 'Sequential disk appends are orders of magnitude faster than random writes to data files. WAL guarantees crash recovery by replaying changes during restart.',
          },
          {
            id: 'C',
            text: 'The database engine offloads all table heap dirty pages to CPU L3 caches.',
            isCorrect: false,
            explanation: 'CPU caches are volatile and cleared instantaneously during power loss or kernel crashes.',
          },
          {
            id: 'D',
            text: 'The database disables transaction isolation levels to bypass operating system page cache flushes.',
            isCorrect: false,
            explanation: 'Transaction isolation is an ACID concurrency guarantee and is independent of OS page persistence protocols.',
          },
        ],
        explanation: 'WAL transforms random page writes into ultra-fast sequential append logs. As long as the log is safely on disk (fsync), dirty buffer pages can be flushed asynchronously by background writers.',
        coachingTip: 'Group commit batches multiple concurrent transaction WAL flushes into a single fsync, dramatically scaling commit transactions per second (TPS).',
      },
      3: {
        conceptTitle: 'Horizontal Sharding Keys & Write Hot-Spotting',
        questionText: 'When horizontally sharding a high-velocity multi-tenant transactional database across 64 database nodes, which sharding key strategy prevents write hot-spots while maintaining efficient single-tenant query isolation?',
        options: [
          {
            id: 'A',
            text: 'Sharding purely by a monotonic auto-incrementing created_at timestamp.',
            isCorrect: false,
            explanation: 'Monotonic timestamps concentrate 100% of concurrent write traffic onto the single shard storing the current time window, creating a severe bottleneck.',
          },
          {
            id: 'B',
            text: 'A composite sharding key (Hash(tenant_id), entity_id), co-locating tenant records while uniformly distributing tenants across all 64 shards.',
            isCorrect: true,
            explanation: 'Hashing tenant IDs ensures an even statistical distribution of tenants across all 64 nodes, while keeping tenant joins and transactions co-located on a single shard.',
          },
          {
            id: 'C',
            text: 'Distributing individual rows randomly using round-robin distribution across all 64 shards.',
            isCorrect: false,
            explanation: 'Round-robin row distribution destroys data locality, forcing every single read query into a 64-way scatter-gather operation across the network.',
          },
          {
            id: 'D',
            text: 'Routing all write transactions exclusively to Shard 0 and streaming change data capture (CDC) to Shards 1–63.',
            isCorrect: false,
            explanation: 'Routing all writes to Shard 0 leaves the write bottleneck completely un-scaled and creates a catastrophic single point of failure.',
          },
        ],
        explanation: 'Consistent hashing on tenant identifiers distributes tenant workloads evenly across shard instances while avoiding cross-shard distributed transactions for tenant-scoped operations.',
        coachingTip: 'Never shard write-intensive tables by monotonic timestamps alone. Pair high-cardinality entity IDs with tenant hash prefixes to avoid write skew.',
      },
    },
    reinforcement: {
      conceptTitle: 'SQL Reinforcement: Composite Indexes & Leftmost Prefix Rule',
      questionText: 'Given a composite index on (tenant_id, status, created_at), which query CANNOT take advantage of an index range scan effectively under the B+Tree leftmost prefix rule?',
      options: [
        {
          id: 'A',
          text: 'WHERE tenant_id = 42 AND status = \'ACTIVE\' AND created_at > \'2026-01-01\'',
          isCorrect: false,
          explanation: 'This uses all 3 leading index columns in order, allowing an optimal index range scan.',
        },
        {
          id: 'B',
          text: 'WHERE status = \'ACTIVE\' AND created_at > \'2026-01-01\'',
          isCorrect: true,
          explanation: 'Because tenant_id (the leading prefix) is missing from the WHERE clause, the B+Tree root cannot be traversed to a starting leaf, forcing a full table scan or full index scan.',
        },
        {
          id: 'C',
          text: 'WHERE tenant_id = 42 AND status = \'PENDING\'',
          isCorrect: false,
          explanation: 'This matches the first two columns of the composite prefix, enabling an efficient index range scan.',
        },
        {
          id: 'D',
          text: 'WHERE tenant_id = 42',
          isCorrect: false,
          explanation: 'The leading column matches the leftmost prefix rule, allowing a direct B+Tree traversal.',
        },
      ],
      explanation: 'Composite B+Tree indexes are ordered hierarchically starting from the leftmost column. Omitting the leading column prevents binary search navigation through the tree levels.',
      coachingTip: 'Place high-cardinality equality filter columns first in composite indexes, followed by range/inequality filter columns at the end.',
    },
  },

  // Track 2: Kafka & Event Streaming
  'kafka & event streaming': {
    concepts: {
      1: {
        conceptTitle: 'ISR Quorum, Acks=all & Leader Partition Failover',
        questionText: 'When configuring Apache Kafka for zero-data-loss under broker crashes, which producer and topic configuration guarantees strict durability without blocking cluster availability during transient single-node network blips?',
        options: [
          {
            id: 'A',
            text: 'Producer acks=0 with topic replication factor of 1.',
            isCorrect: false,
            explanation: 'acks=0 provides zero delivery guarantees; any broker hiccup or restart causes immediate unrecoverable message loss.',
          },
          {
            id: 'B',
            text: 'Producer acks=all (-1), topic replication factor >= 3, and min.insync.replicas=2.',
            isCorrect: true,
            explanation: 'acks=all ensures the leader and active followers in the In-Sync Replica (ISR) set persist the record. min.insync.replicas=2 ensures at least 2 replicas must commit before ACK, surviving 1 node crash.',
          },
          {
            id: 'C',
            text: 'Producer acks=1 with client-side retry buffers disabled.',
            isCorrect: false,
            explanation: 'acks=1 only waits for the leader broker. If the leader crashes before followers pull the log segment, the committed record is permanently lost.',
          },
          {
            id: 'D',
            text: 'Acquiring a distributed ZooKeeper/KRaft transaction lock on the entire topic before each message send.',
            isCorrect: false,
            explanation: 'Topic-wide distributed locks destroy Kafka streaming throughput and introduce massive latency contention.',
          },
        ],
        explanation: 'The combination of replication factor 3, min.insync.replicas=2, and acks=all is the production industry standard for strict durability and fault tolerance.',
        coachingTip: 'Setting min.insync.replicas equal to the total replication factor (e.g. 3 of 3) causes production outages if even a single broker reboots for maintenance.',
      },
      2: {
        conceptTitle: 'Consumer Group Rebalance & Cooperative Sticky Assignors',
        questionText: 'A high-throughput consumer group experiences massive 30-second processing halts and consumer lag spikes whenever an instance autoscales. What is the root cause and optimal architecture fix?',
        options: [
          {
            id: 'A',
            text: 'The Kafka broker ran out of partition IDs, requiring a cluster schema rebuild.',
            isCorrect: false,
            explanation: 'Brokers do not run out of partition IDs; rebalance latency is entirely a consumer group protocol coordination issue.',
          },
          {
            id: 'B',
            text: 'Eager rebalancing revokes all assigned partitions globally; switching to CooperativeStickyAssignor enables incremental, non-blocking partition handoffs.',
            isCorrect: true,
            explanation: 'The legacy Eager assignor forces all consumers in the group to drop all partitions and stop consuming. Cooperative Sticky Assignor reassigns only partitions that need to migrate.',
          },
          {
            id: 'C',
            text: 'Increase max.poll.interval.ms to 24 hours so rebalance triggers are ignored.',
            isCorrect: false,
            explanation: 'Artificially inflating poll intervals does not prevent scaling rebalances and severely delays failure detection of genuinely dead consumers.',
          },
          {
            id: 'D',
            text: 'Reduce the topic partitions to exactly 1 so rebalancing never occurs.',
            isCorrect: false,
            explanation: 'Having only 1 partition limits consumption to a single thread/instance, destroying horizontal throughput scalability.',
          },
        ],
        explanation: 'Cooperative rebalancing avoids the stop-the-world behavior of eager rebalance by allowing healthy consumers to continue processing unaffected partitions.',
        coachingTip: 'Always configure PartitionAssignor to CooperativeStickyAssignor in modern Kafka consumers (version 2.4+) to eliminate rebalance lag spikes.',
      },
      3: {
        conceptTitle: 'Exactly-Once Semantics (EOS) & Idempotent Producers',
        questionText: 'How does Kafka’s Idempotent Producer protocol prevent duplicate records during network retries without requiring external distributed 2-Phase Commit (2PC)?',
        options: [
          {
            id: 'A',
            text: 'The broker computes a SHA-256 hash of the payload string and discards matches seen in the last 10 seconds.',
            isCorrect: false,
            explanation: 'Payload hashing is computationally prohibitive and cannot differentiate identical valid events sent at different times.',
          },
          {
            id: 'B',
            text: 'The broker assigns each producer an internal Producer ID (PID) and verifies monotonic Sequence Numbers per partition, deduplicating at the log layer.',
            isCorrect: true,
            explanation: 'Each batch contains a PID and sequence number. The broker log verifies sequence numbers sequentially; any retried batch with an existing sequence number is deduplicated atomically.',
          },
          {
            id: 'C',
            text: 'Consumers write event IDs to an external Redis cluster before processing.',
            isCorrect: false,
            explanation: 'While application-level deduplication exists, Kafka’s native producer idempotency is enforced directly within the broker without external stores.',
          },
          {
            id: 'D',
            text: 'The producer disables TCP retries and treats all socket timeouts as fatal errors.',
            isCorrect: false,
            explanation: 'Disabling retries violates delivery guarantees and causes widespread message loss.',
          },
        ],
        explanation: 'PIDs and per-partition sequence numbers enable zero-overhead broker-side deduplication, guaranteeing that network retries never produce duplicate log entries.',
        coachingTip: 'Enable enable.idempotence=true on all producers. In modern Kafka clients, this is enabled by default with zero throughput penalty.',
      },
    },
    reinforcement: {
      conceptTitle: 'Kafka Reinforcement: Partition Key Skew & Compaction',
      questionText: 'Why can partitioning by a low-cardinality key (e.g. user country code like "US") cause severe lag in a consumer group even with 100 partitions?',
      options: [
        {
          id: 'A',
          text: 'Kafka brokers refuse to route messages if the partition key is under 8 characters long.',
          isCorrect: false,
          explanation: 'Key length has no bearing on Kafka murmur2 partition hashing.',
        },
        {
          id: 'B',
          text: 'All messages with the same key hash to the exact same partition, starving other partitions and bottlenecking a single consumer instance.',
          isCorrect: true,
          explanation: 'Kafka guarantees key-to-partition routing via Murmur2 hash. If 90% of traffic shares key "US", 90% of traffic lands on one partition while 99 consumers sit idle.',
        },
        {
          id: 'C',
          text: 'Low-cardinality keys corrupt the leader broker’s in-memory index segment.',
          isCorrect: false,
          explanation: 'Partition keys are byte buffers and cannot corrupt broker segment indexes.',
        },
        {
          id: 'D',
          text: 'Kafka consumer groups only support round-robin assignment when keys are present.',
          isCorrect: false,
          explanation: 'Partition assignment distributes partitions among consumers, but each individual partition is consumed by only one consumer at a time.',
        },
      ],
      explanation: 'Key skew creates hot partitions. A single hot partition can only be read by one consumer thread at a time, creating an insurmountable bottleneck.',
      coachingTip: 'If your natural business key has severe skew, append a random salt suffix (e.g. US_1, US_2) or partition by composite keys like tenantId + userId.',
    },
  },

  // Track 3: React Native Architecture & Performance
  'react native architecture': {
    concepts: {
      1: {
        conceptTitle: 'Fabric Renderer, C++ Shadow Trees & Synchronous Layout',
        questionText: 'How does React Native’s Fabric architecture eliminate the visual "white flash" and blank views that occurred during fast scrolling in the legacy architecture?',
        options: [
          {
            id: 'A',
            text: 'Fabric runs the entire JavaScript runtime directly inside mobile GPU fragment shaders.',
            isCorrect: false,
            explanation: 'JavaScript runs on CPU engine threads (Hermes/JSC); GPUs execute graphics rendering pipelines.',
          },
          {
            id: 'B',
            text: 'Fabric uses immutable C++ Shadow Trees that can be measured and committed synchronously to host platform views, eliminating async JSON layout lag.',
            isCorrect: true,
            explanation: 'In legacy React Native, layout measurement required an asynchronous JSON roundtrip over the bridge. Fabric constructs immutable C++ shadow trees that commit synchronously on UI threads.',
          },
          {
            id: 'C',
            text: 'Fabric converts all React Native native components into pure HTML5 WebViews.',
            isCorrect: false,
            explanation: 'Fabric produces 100% native platform views (UIKit / Android ViewGroups), not WebViews.',
          },
          {
            id: 'D',
            text: 'Fabric freezes application state whenever a scroll gesture is detected.',
            isCorrect: false,
            explanation: 'Freezing application state would cause unresponsive UIs and touch stutter.',
          },
        ],
        explanation: 'Synchronous C++ shadow tree reconciliation and direct host view updates prevent the UI thread from falling behind JavaScript updates during high-velocity scrolling.',
        coachingTip: 'Fabric allows multi-threaded tree mutations: React background threads can prepare new tree commits without blocking active UI touch animations.',
      },
      2: {
        conceptTitle: 'JavaScript Interface (JSI) & HostObject Direct Memory',
        questionText: 'Why does invoking native SQLite or cryptographic operations via JSI (JavaScript Interface) deliver near-native C++ performance compared to legacy React Native Bridge NativeModules?',
        options: [
          {
            id: 'A',
            text: 'JSI converts JavaScript source into native LLVM assembly instructions ahead of time.',
            isCorrect: false,
            explanation: 'JSI is a bridge-less C++ interface, not an ahead-of-time machine code compiler for application code.',
          },
          {
            id: 'B',
            text: 'JSI enables JavaScript to hold direct reference pointers to C++ HostObjects, invoking native functions synchronously without JSON stringification or queue hops.',
            isCorrect: true,
            explanation: 'Legacy NativeModules serialized arguments to JSON strings, queued them onto an asynchronous native queue, and deserialized them. JSI allows synchronous in-process C++ function execution.',
          },
          {
            id: 'C',
            text: 'JSI bypasses the mobile operating system kernel and writes directly to hardware RAM.',
            isCorrect: false,
            explanation: 'All mobile apps operate within OS sandboxes and use standard memory management.',
          },
          {
            id: 'D',
            text: 'JSI executes all native calls on remote cloud serverless workers.',
            isCorrect: false,
            explanation: 'JSI is strictly an on-device, in-process runtime communication layer.',
          },
        ],
        explanation: 'JSI provides zero-copy, synchronous access between JavaScript and C++, completely eliminating the serialization overhead and thread delays of the legacy bridge.',
        coachingTip: 'For high-frequency events (audio samples, 60fps gestures, SQLite queries), always use JSI-backed libraries rather than legacy asynchronous NativeModules.',
      },
      3: {
        conceptTitle: 'Hermes Engine, AOT Bytecode & Cold Start TTI',
        questionText: 'What is the primary architectural mechanism by which the Hermes JavaScript engine drastically improves mobile cold start time (Time to Interactive / TTI)?',
        options: [
          {
            id: 'A',
            text: 'Hermes compiles JavaScript into optimized bytecode ahead-of-time (AOT) during the build, allowing direct memory-mapped (mmap) execution without startup parsing.',
            isCorrect: true,
            explanation: 'Standard engines parse and compile JavaScript text on app boot, consuming heavy CPU and memory. Hermes precompiles to bytecode at build time, so the OS directly mmaps the bytecode file into memory.',
          },
          {
            id: 'B',
            text: 'Hermes includes an aggressive warm JIT compiler that recompiles hot functions to machine code during app launch.',
            isCorrect: false,
            explanation: 'Hermes intentionally has NO JIT compiler. Omitting JIT avoids warmup latency, reduces binary size, and dramatically cuts memory footprint.',
          },
          {
            id: 'C',
            text: 'Hermes stores all application assets in uncompressed VRAM buffers.',
            isCorrect: false,
            explanation: 'Hermes is a JavaScript virtual machine and does not manage asset graphics rendering.',
          },
          {
            id: 'D',
            text: 'Hermes defers loading of all JavaScript modules until the user physically touches the screen.',
            isCorrect: false,
            explanation: 'Hermes executes the entry point bundle immediately, but its bytecode requires near-zero parsing overhead.',
          },
        ],
        explanation: 'Ahead-of-time bytecode compilation shifts JavaScript parsing and lexical analysis from the candidate’s mobile CPU at runtime to the developer’s build server.',
        coachingTip: 'Because Hermes has no JIT, it delivers predictable memory usage without GC spikes, making it ideal for low-end Android and high-end iOS alike.',
      },
    },
    reinforcement: {
      conceptTitle: 'React Native Reinforcement: JS Thread Starvation & Reanimated',
      questionText: 'Why do complex touch gestures driven via standard React useState stutter at 15 FPS under heavy network loading, while React Native Reanimated achieves 60 FPS smoothly?',
      options: [
        {
          id: 'A',
          text: 'useState only updates once every 100 milliseconds due to React core timers.',
          isCorrect: false,
          explanation: 'React batching is microtask-based, not artificially delayed by 100ms.',
        },
        {
          id: 'B',
          text: 'useState runs on the single JavaScript thread and gets blocked by network parsing and state reconciliations; Reanimated runs worklets directly on the dedicated UI thread.',
          isCorrect: true,
          explanation: 'The JavaScript thread is single-threaded. Heavy JSON parsing starves frame updates. Reanimated worklets execute directly on the native platform UI thread, immune to JS thread stalls.',
        },
        {
          id: 'C',
          text: 'Reanimated bypasses the mobile GPU completely and renders via CPU software emulation.',
          isCorrect: false,
          explanation: 'Reanimated manipulates native view properties that are hardware accelerated by the GPU.',
        },
        {
          id: 'D',
          text: 'Reanimated requires phones to have a minimum of 16 CPU cores.',
          isCorrect: false,
          explanation: 'Reanimated runs efficiently even on budget dual-core mobile devices.',
        },
      ],
      explanation: 'Running animation worklets on the native UI thread decouples visual frame rates from business logic computations on the JavaScript thread.',
      coachingTip: 'Keep your JavaScript thread clear for business logic and data transforms. All gestures and animations should run on the UI thread via Reanimated worklets.',
    },
  },

  // Track 4: High-Scale Distributed Systems
  'distributed systems': {
    concepts: {
      1: {
        conceptTitle: 'Raft Consensus, Leader Election & Majority Quorums',
        questionText: 'In a 5-node distributed cluster using Raft consensus, a network partition isolates 2 nodes (including the current leader) from the other 3 nodes. What occurs according to Raft safety rules?',
        options: [
          {
            id: 'A',
            text: 'Both partitions continue committing client writes independently and reconcile conflicts later.',
            isCorrect: false,
            explanation: 'Allowing independent concurrent writes causes split-brain and violates distributed state machine consistency.',
          },
          {
            id: 'B',
            text: 'The 3-node majority partition elects a new leader with a higher term and safely commits writes; the 2-node minority partition rejects or blocks writes.',
            isCorrect: true,
            explanation: 'Raft strictly requires a majority quorum of (N/2) + 1 = 3 votes to elect a leader and commit log entries. The isolated minority cannot reach quorum and cannot commit data.',
          },
          {
            id: 'C',
            text: 'All 5 nodes self-terminate immediately to protect state safety.',
            isCorrect: false,
            explanation: 'Consensus protocols are explicitly designed to remain available on the majority partition despite node isolation.',
          },
          {
            id: 'D',
            text: 'The isolated leader retains cluster authority and commands the majority nodes to pause.',
            isCorrect: false,
            explanation: 'The isolated leader cannot communicate with the majority and will be superseded when terms advance.',
          },
        ],
        explanation: 'Majority quorums guarantee that any two quorums must overlap by at least one node, ensuring that the latest committed log entry is always present in a newly elected leader.',
        coachingTip: 'Always deploy consensus clusters with an odd number of nodes (3, 5, 7). A 4-node cluster still requires 3 nodes for quorum, meaning it has the exact same fault tolerance as a 3-node cluster.',
      },
      2: {
        conceptTitle: 'PACELC Theorem: Consistency vs Latency in Healthy Networks',
        questionText: 'Under the PACELC theorem, what fundamental architectural trade-off must a distributed system make when there is NO network partition (normal healthy operation)?',
        options: [
          {
            id: 'A',
            text: 'Choosing between CPU compute cycles and disk storage capacity.',
            isCorrect: false,
            explanation: 'PACELC addresses distributed consistency and availability trade-offs, not hardware budgeting.',
          },
          {
            id: 'B',
            text: 'Choosing between Latency (L) and Consistency (C): returning cached reads with low latency vs waiting for cross-node synchronous quorum replication.',
            isCorrect: true,
            explanation: 'PACELC states: if Partition (P), choose Availability (A) or Consistency (C); Else (E), choose Latency (L) or Consistency (C). Even in healthy networks, strong consistency costs round-trip latency.',
          },
          {
            id: 'C',
            text: 'Choosing between relational SQL schemas and unstructured JSON documents.',
            isCorrect: false,
            explanation: 'PACELC is an extension of Brewer’s CAP theorem and is independent of data modeling syntax.',
          },
          {
            id: 'D',
            text: 'Choosing between symmetric and asymmetric cryptographic ciphers.',
            isCorrect: false,
            explanation: 'Cryptography is orthogonal to distributed consensus latency models.',
          },
        ],
        explanation: 'Many engineers assume trade-offs only happen during network partitions. PACELC proves that even in 100% healthy networks, guaranteeing immediate consistency requires paying network latency penalties.',
        coachingTip: 'DynamoDB and Cassandra are PA/EL systems (favoring Availability during partitions, and Latency during normal operations). Spanner is PC/EC (favoring Consistency in both).',
      },
      3: {
        conceptTitle: 'Byzantine Fault Tolerance (BFT) vs Crash-Fault Tolerance (CFT)',
        questionText: 'What is the fundamental distinction between Crash-Fault Tolerant systems (CFT like Raft/Paxos) and Byzantine Fault Tolerant systems (BFT like PBFT)?',
        options: [
          {
            id: 'A',
            text: 'CFT handles malicious, corrupted, or forged messages, while BFT only handles clean server reboots.',
            isCorrect: false,
            explanation: 'This is the exact inverse. BFT handles malicious and corrupted behavior.',
          },
          {
            id: 'B',
            text: 'CFT assumes nodes either execute correctly or crash silently; BFT assumes arbitrary, malicious, or deceptive behavior, requiring 3f + 1 total nodes to tolerate f faulty nodes.',
            isCorrect: true,
            explanation: 'CFT assumes honest nodes that fail only by stopping (fail-stop). BFT defends against arbitrary (Byzantine) behavior where nodes may lie, forge signatures, or send conflicting votes to different peers.',
          },
          {
            id: 'C',
            text: 'BFT protocols require zero network communication between replica nodes.',
            isCorrect: false,
            explanation: 'BFT requires multi-round cryptographic voting and message validation among peers.',
          },
          {
            id: 'D',
            text: 'CFT can only be deployed on a single physical machine.',
            isCorrect: false,
            explanation: 'CFT protocols like Raft and Paxos power distributed databases (etcd, CockroachDB, TiKV) across thousands of servers.',
          },
        ],
        explanation: 'CFT solves consensus when participants are trusted internal servers. BFT is required when nodes cannot be trusted (open peer-to-peer networks, multi-organization ledgers).',
        coachingTip: 'Do not use BFT inside private cloud microservices. BFT has O(N²) communication overhead; Raft/Paxos CFT provides optimal performance for trusted environments.',
      },
    },
    reinforcement: {
      conceptTitle: 'Distributed Systems Reinforcement: Vector Clocks vs Wall Clocks',
      questionText: 'Why can relying on NTP (Network Time Protocol) wall-clock timestamps across distributed microservices cause silent data loss under "Last-Write-Wins" (LWW) conflict resolution?',
      options: [
        {
          id: 'A',
          text: 'NTP servers format timestamps in hexadecimal rather than UTC epoch milliseconds.',
          isCorrect: false,
          explanation: 'NTP provides 64-bit UTC timestamps.',
        },
        {
          id: 'B',
          text: 'Clock drift, leap seconds, and network asymmetry cause physical clocks to desynchronize by tens of milliseconds, making later causal events appear to happen earlier in physical time.',
          isCorrect: true,
          explanation: 'Physical server clocks constantly drift. If Server B receives an update causally following Server A, but Server B’s clock is slightly behind, LWW will silently overwrite the newer update with stale data.',
        },
        {
          id: 'C',
          text: 'Microprocessors halt execution completely whenever an NTP synchronization packet arrives.',
          isCorrect: false,
          explanation: 'NTP runs as a non-blocking background OS daemon (chrony/ntpd).',
        },
        {
          id: 'D',
          text: 'Distributed databases automatically reject any timestamp older than 1 millisecond.',
          isCorrect: false,
          explanation: 'Databases accept writes based on storage engine rules, not strict sub-millisecond physical time windows.',
        },
      ],
      explanation: 'Physical clocks cannot guarantee causal ordering across independent servers. True distributed ordering requires logical clocks (Lamport clocks), Vector clocks, or TrueTime (GPS + atomic clocks).',
      coachingTip: 'If your system requires causality without TrueTime hardware, use Vector Clocks or monotonically incrementing generation counters instead of physical system time.',
    },
  },

  // Track 5: System Design & Microservices
  'system design at scale': {
    concepts: {
      1: {
        conceptTitle: 'Probabilistic Early Expiration (XFetch) & Cache Stampedes',
        questionText: 'Under massive traffic spikes to a top-tier viral endpoint, a hot Redis cache key expires simultaneously across all instances, overwhelming the primary database (Cache Stampede / Thundering Herd). What is the optimal architectural pattern to prevent this?',
        options: [
          {
            id: 'A',
            text: 'Set cache TTL to 100 years and completely disable cache invalidation.',
            isCorrect: false,
            explanation: 'Infinite TTL prevents data updates and causes permanent stale state for end users.',
          },
          {
            id: 'B',
            text: 'Implement the XFetch probabilistic early recomputation algorithm or distributed mutex locks with TTL jitter.',
            isCorrect: true,
            explanation: 'Probabilistic early expiration (XFetch) calculates a probability of background refresh as the TTL approaches zero, ensuring exactly one worker refreshes the cache before expiration while others serve warm data.',
          },
          {
            id: 'C',
            text: 'Increase the primary database connection pool limit from 100 to 50,000 connections.',
            isCorrect: false,
            explanation: 'Opening tens of thousands of DB connections causes OS context-switching thrashing, memory exhaustion, and immediate database collapse.',
          },
          {
            id: 'D',
            text: 'Route all incoming read requests through a synchronous single-threaded queue.',
            isCorrect: false,
            explanation: 'A single-threaded queue bottlenecks throughput and skyrockets p99 latency to catastrophic levels.',
          },
        ],
        explanation: 'Probabilistic early refresh (XFetch) and distributed mutexes with TTL jitter eliminate synchronized expiration, protecting downstream databases from thundering herds.',
        coachingTip: 'Always add random jitter (e.g. ±15% of TTL) to cached keys so large batches of items written together never expire at the exact same second.',
      },
      2: {
        conceptTitle: 'Distributed Idempotency Keys & State Machine Transitions',
        questionText: 'A payment microservice receives duplicate credit card checkout requests due to client mobile network timeout retries. What is the production-grade architectural pattern to guarantee strictly once-only payment processing?',
        options: [
          {
            id: 'A',
            text: 'Check if the customer’s user ID was charged within the last 5 seconds.',
            isCorrect: false,
            explanation: 'Time-window heuristic checks are dangerous and can incorrectly block legitimate distinct customer purchases or fail under race conditions.',
          },
          {
            id: 'B',
            text: 'Require a client-generated UUID Idempotency-Key header stored atomically in Redis/DB with state transitions (PENDING -> COMPLETED), returning cached responses on retries.',
            isCorrect: true,
            explanation: 'An atomic conditional insert of the Idempotency-Key with an active state machine ensures that concurrent retries either wait for the in-flight transaction or immediately receive the cached completed result.',
          },
          {
            id: 'C',
            text: 'Rely on TCP sequence numbers to eliminate application-level duplicate HTTP POST requests.',
            isCorrect: false,
            explanation: 'TCP sequence numbers operate at the transport layer for a single connection and do not persist across separate HTTP connection retries.',
          },
          {
            id: 'D',
            text: 'Immediately reject all client retry requests with HTTP 400 Bad Request.',
            isCorrect: false,
            explanation: 'Rejecting retries destroys reliability during poor mobile network conditions when the client genuinely did not receive the server’s response.',
          },
        ],
        explanation: 'Idempotency keys must be atomically committed before executing side-effects. If the key exists in PENDING state, subsequent requests wait or reject; if COMPLETED, the cached response is returned.',
        coachingTip: 'Store the SHA-256 hash of the request body alongside the Idempotency-Key to detect and reject clients that attempt to reuse keys with modified payload parameters.',
      },
      3: {
        conceptTitle: 'Circuit Breakers, Bulkheads & Cascading Failure Isolation',
        questionText: 'A downstream recommendation service begins taking 15 seconds per call due to database contention, causing connection pool exhaustion and cascading HTTP 504 gateway timeouts across the entire upstream checkout service. How do you isolate this failure?',
        options: [
          {
            id: 'A',
            text: 'Increase upstream client HTTP request timeouts from 5 seconds to 60 seconds.',
            isCorrect: false,
            explanation: 'Increasing timeouts holds worker threads and connection pools open 12x longer, dramatically accelerating system-wide thread starvation.',
          },
          {
            id: 'B',
            text: 'Implement a Circuit Breaker (tripping to OPEN on failure thresholds) and Bulkheads (isolated thread pools) with an immediate static or cached fallback.',
            isCorrect: true,
            explanation: 'Circuit breakers fail fast when error or latency thresholds are exceeded, returning a fallback immediately and saving upstream thread pools. Bulkheads isolate dependencies so a slow recommendation service cannot consume checkout threads.',
          },
          {
            id: 'C',
            text: 'Spin up 500 new instances of the checkout service without rate limits.',
            isCorrect: false,
            explanation: 'Adding more upstream instances floods the struggling downstream service with even more traffic, deepening the outage.',
          },
          {
            id: 'D',
            text: 'Route all failing recommendation queries directly to the primary transactional database.',
            isCorrect: false,
            explanation: 'Bypassing services to hammer the primary database spreads the outage to core transactional processing.',
          },
        ],
        explanation: 'Bulkheads isolate thread resources so one degraded dependency cannot exhaust global worker pools. Circuit breakers shed load immediately to allow degraded services to recover.',
        coachingTip: 'Always define strict fallback strategies (e.g. cached popular items or an empty list) so non-critical microservice outages do not block primary revenue funnels.',
      },
    },
    reinforcement: {
      conceptTitle: 'System Design Reinforcement: Rate Limiting Algorithms',
      questionText: 'Under spiky traffic, why does the Token Bucket algorithm handle sudden bursts of legitimate user traffic better than the Fixed Window Counter algorithm?',
      options: [
        {
          id: 'A',
          text: 'Fixed Window counters require distributed quantum clocks to reset.',
          isCorrect: false,
          explanation: 'Fixed window uses standard epoch time division.',
        },
        {
          id: 'B',
          text: 'Fixed Window counters can allow double the allowed rate at window boundaries (boundary burst effect), whereas Token Bucket permits controlled burst capacity up to the bucket depth while enforcing an average fill rate.',
          isCorrect: true,
          explanation: 'If a user sends the full quota in the last 10ms of Window 1 and the first 10ms of Window 2, Fixed Window allows 2x the burst rate. Token Bucket enforces smooth replenishing with strict bucket capacity limits.',
        },
        {
          id: 'C',
          text: 'Token Bucket algorithms delete all user IP addresses from the network after 5 requests.',
          isCorrect: false,
          explanation: 'Token bucket tracks remaining tokens in Redis/memory and does not ban users.',
        },
        {
          id: 'D',
          text: 'Token Bucket can only be implemented inside hardware router ASICs.',
          isCorrect: false,
          explanation: 'Token bucket is commonly implemented in software (Envoy, NGINX, Redis Lua scripts).',
        },
      ],
      explanation: 'Token Bucket smoothly buffers bursts up to the maximum capacity while refilling at a steady rate, avoiding the boundary spike vulnerabilities of fixed time windows.',
      coachingTip: 'Use Token Bucket for APIs that need to allow legitimate bursts (e.g. mobile app sync). Use Leaky Bucket when you need strictly smoothed, constant-rate traffic into a fragile downstream service.',
    },
  },
};

/**
 * Procedural Dynamic Question Generator for any arbitrary topic
 */
function buildProceduralQuestion(
  topicName: string,
  subtopicTitle: string,
  conceptIndex: number,
  isReinforcement: boolean
): QuestionTemplate {
  const cleanTopic = topicName.trim() || 'Software Architecture';
  const cleanSubtopic = subtopicTitle.trim() || 'Core Engineering';

  if (isReinforcement) {
    return {
      conceptTitle: `${cleanSubtopic} - Reinforcement Drill`,
      questionText: `Let's solidify your mental model for "${cleanTopic}": When diagnosing unexpected performance degradation or data anomalies in "${cleanSubtopic}", which diagnostic approach isolates the root cause most reliably?`,
      options: [
        {
          id: 'A',
          text: 'Disabling telemetry and trace logs to reduce CPU overhead.',
          isCorrect: false,
          explanation: 'Disabling telemetry blinds observability and makes post-mortem analysis impossible.',
        },
        {
          id: 'B',
          text: 'Analyzing distributed trace spans, p99 latency distributions, and correlating error rate spikes with release metadata.',
          isCorrect: true,
          explanation: 'Correlating high-percentile latency (p99/p99.9) and trace waterfalls quickly isolates specific service or query bottlenecks.',
        },
        {
          id: 'C',
          text: 'Assuming the network is instantaneous and error-free at all times.',
          isCorrect: false,
          explanation: 'The fallacies of distributed computing explicitly prove that networks are unreliable and subject to latency variance.',
        },
        {
          id: 'D',
          text: 'Permanently increasing timeouts on all services to 10 minutes.',
          isCorrect: false,
          explanation: 'Inflating timeouts ties up connection pools and leads to cascading deadlocks.',
        },
      ],
      explanation: `Robust engineering in ${cleanTopic} relies on high-resolution observability, structured logs, and understanding high-percentile latency distributions.`,
      coachingTip: 'Never optimize based on average (p50) latency alone. The p99 latency tells you what your most active production users are experiencing.',
    };
  }

  // Concept 1: Fundamentals & Primitives
  if (conceptIndex === 1) {
    return {
      conceptTitle: `Concept #1: Core Primitives & Invariants of ${cleanTopic}`,
      questionText: `When architecting systems utilizing "${cleanTopic}", which foundational invariant is most critical to guarantee system stability and deterministic behavior?`,
      options: [
        {
          id: 'A',
          text: `Defining explicit state transitions, strict boundary interfaces, and idempotent operations.`,
          isCorrect: true,
          explanation: `Explicit state transitions and idempotency prevent inconsistent partial states and enable reliable automated retries in ${cleanTopic}.`,
        },
        {
          id: 'B',
          text: `Eliminating all input validation checks to minimize CPU execution cycles.`,
          isCorrect: false,
          explanation: `Bypassing validation causes memory corruption, injection vulnerabilities, and runtime crashes.`,
        },
        {
          id: 'C',
          text: `Executing all concurrent operations on a shared global un-synchronized memory variable.`,
          isCorrect: false,
          explanation: `Un-synchronized shared state causes race conditions, torn reads, and data corruption.`,
        },
        {
          id: 'D',
          text: `Relying on physical machine restart as the primary mechanism for error recovery.`,
          isCorrect: false,
          explanation: `Relying on restarts creates downtime loops and fails to resolve underlying architectural bugs.`,
        },
      ],
      explanation: `Mastering foundational invariants in ${cleanTopic} provides predictability under scale and makes failure recovery deterministic.`,
      coachingTip: `Design each component in ${cleanTopic} with clear pre-conditions, post-conditions, and idempotent retry safety.`,
    };
  }

  // Concept 2: Internal Mechanics & Execution Model
  if (conceptIndex === 2) {
    return {
      conceptTitle: `Concept #2: Execution Lifecycle & Concurrency in ${cleanTopic}`,
      questionText: `Under high concurrent workload in "${cleanSubtopic}", how does the execution engine manage internal state and thread scheduling without deadlock?`,
      options: [
        {
          id: 'A',
          text: `By holding global recursive mutexes across all network I/O calls.`,
          isCorrect: false,
          explanation: `Holding locks during remote network I/O causes catastrophic thread starvation and deadlocks.`,
        },
        {
          id: 'B',
          text: `Utilizing non-blocking event loops, fine-grained latch coupling, or actor-based message passing.`,
          isCorrect: true,
          explanation: `Non-blocking concurrency patterns allow high CPU utilization without thread contention or blocking kernel context switches.`,
        },
        {
          id: 'C',
          text: `Terminating all background threads whenever an asynchronous promise is created.`,
          isCorrect: false,
          explanation: `Premature thread termination abruptly drops in-flight tasks and corrupts state.`,
        },
        {
          id: 'D',
          text: `Using a fixed sleep() delay of 500ms between each internal function call.`,
          isCorrect: false,
          explanation: `Arbitrary sleep calls artificially cripple system throughput and do not solve race conditions.`,
        },
      ],
      explanation: `High-performance concurrency in ${cleanTopic} separates CPU execution from I/O wait states using non-blocking asynchronous patterns.`,
      coachingTip: `Never block worker threads on I/O. Use non-blocking event loops or work-stealing thread pools to maintain 60 FPS or high RPS.`,
    };
  }

  // Concept 3: High-Scale Trade-offs, Failure Modes & Edge Cases
  return {
    conceptTitle: `Concept #3: Production Scale & Failure Modes in ${cleanTopic}`,
    questionText: `When operating "${cleanTopic}" under 100x traffic amplification, which architectural pattern defends against cascading failures and ensures graceful degradation?`,
    options: [
      {
        id: 'A',
        text: `Configuring unlimited retry loops without exponential backoff or jitter.`,
        isCorrect: false,
        explanation: `Tight retry loops without backoff trigger a retry storm (thundering herd), crushing degraded downstream services.`,
      },
      {
        id: 'B',
        text: `Implementing backpressure, token-bucket rate limiting, circuit breakers, and bounded priority queues.`,
        isCorrect: true,
        explanation: `Bounded queues and backpressure communicate capacity limits upstream, dropping non-critical load while preserving core service availability.`,
      },
      {
        id: 'C',
        text: `Disabling all HTTP status codes except 200 OK regardless of backend exceptions.`,
        isCorrect: false,
        explanation: `Masking errors as 200 OK confuses upstream clients and breaks automated failover systems.`,
      },
      {
        id: 'D',
        text: `Routing 100% of incoming production requests to a single standby node.`,
        isCorrect: false,
        explanation: `Routing massive traffic to a single node guarantees immediate exhaustion and service outage.`,
      },
    ],
    explanation: `Resilient systems in ${cleanTopic} implement load shedding, bounded queues, and circuit breakers to guarantee that even under overwhelming traffic, primary business operations succeed.`,
    coachingTip: `Always use exponential backoff with full jitter on retries to de-synchronize retry waves.`,
  };
}

/**
 * Returns a tailored, concept-specific QBL question.
 */
export function getCatalogQuestion(
  topicName: string,
  subtopicTitle: string,
  conceptIndex: number, // 1, 2, or 3
  isReinforcement: boolean,
  previousMistake?: string
): QBLQuestion {
  const normTopic = topicName.toLowerCase();
  let matchedTrackKey: string | null = null;

  for (const trackKey of Object.keys(TRACK_QUESTIONS)) {
    if (normTopic.includes(trackKey) || trackKey.includes(normTopic)) {
      matchedTrackKey = trackKey;
      break;
    }
  }

  let template: QuestionTemplate;

  if (matchedTrackKey) {
    const bank = TRACK_QUESTIONS[matchedTrackKey];
    if (isReinforcement) {
      template = bank.reinforcement;
    } else {
      template = bank.concepts[conceptIndex] || bank.concepts[1];
    }
  } else {
    // Generate high-grade procedural question tailored to this topic & concept
    template = buildProceduralQuestion(topicName, subtopicTitle, conceptIndex, isReinforcement);
  }

  const options: QBLOption[] = template.options.map((opt) => ({
    id: opt.id,
    text: opt.text,
    isCorrect: opt.isCorrect,
    explanation: opt.explanation,
  }));

  return {
    id: `q_${Date.now()}_${conceptIndex}_${isReinforcement ? 'drill' : 'norm'}`,
    conceptTitle: template.conceptTitle,
    conceptIndex,
    questionText: template.questionText,
    options,
    explanation: template.explanation,
    coachingTip: template.coachingTip,
    isReinforcement,
  };
}
