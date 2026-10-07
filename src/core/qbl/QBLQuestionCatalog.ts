/**
 * QBLQuestionCatalog
 * 
 * Comprehensive Question-Driven Learning (QBL) Question Catalog:
 * - Step-by-Step Graduated Difficulty: Basic -> Intermediate -> Advanced -> Pro
 * - Specific, senior/staff-level architectural scenarios across 5 core masterclass tracks
 * - Unique, distinct questions for Concept #1 (Basic), Concept #2 (Intermediate), Concept #3 (Advanced), and Reinforcement (Pro)
 * - Deep diagnostic reinforcement drills when a candidate makes a mistake
 * - Dynamic procedural question synthesis for custom user-entered engineering topics
 */

import { QBLQuestion, QBLOption, QBLDifficulty } from '../../types';

interface QuestionTemplate {
  conceptTitle: string;
  questionText: string;
  difficulty: QBLDifficulty;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  explanation: string;
  coachingTip: string;
}

// 1. Masterclass Track Question Banks (Concept 1: Basic, Concept 2: Intermediate, Concept 3: Advanced, Reinforcement: Pro)
const TRACK_QUESTIONS: Record<string, {
  concepts: Record<number, QuestionTemplate>;
  reinforcement: QuestionTemplate;
}> = {
  // Track 1: SQL Indexing & Sharding
  'sql indexing & sharding': {
    concepts: {
      1: {
        conceptTitle: 'Table Scans vs Index Lookups',
        difficulty: 'basic',
        questionText: 'When querying a database table with 10 million rows, why does filtering on a column WITHOUT an index cause high latency and heavy disk I/O?',
        options: [
          {
            id: 'A',
            text: 'The database is forced to perform a full sequential table scan, reading every disk block from start to finish to find matches.',
            isCorrect: true,
            explanation: 'Without an index, the database engine has no sorted lookup path and must read every row sequentially from disk heap pages, resulting in O(N) I/O cost.',
          },
          {
            id: 'B',
            text: 'The query optimizer automatically creates a temporary index in RAM and drops it after the query finishes.',
            isCorrect: false,
            explanation: 'Creating an ad-hoc index on 10 million rows on every query would be prohibitively slow and exhaust server memory.',
          },
          {
            id: 'C',
            text: 'The database returns an error because SQL engines require WHERE clauses to only target indexed columns.',
            isCorrect: false,
            explanation: 'SQL engines will happily scan the entire table if no index exists, though query latency will spike.',
          },
          {
            id: 'D',
            text: 'The database only searches the first 1,000 rows and returns partial results to save CPU cycles.',
            isCorrect: false,
            explanation: 'Relational databases guarantee complete result sets and will inspect every row unless an explicit LIMIT clause is provided.',
          },
        ],
        explanation: 'An index acts like an alphabetical index at the back of a book. Without it, the database must read the entire book from page 1 to the end (a full table scan).',
        coachingTip: 'Think of an unindexed table like an unsorted stack of 10,000 papers. Finding one document requires checking every sheet. An index gives you a fast tree lookup directly to the page!',
      },
      2: {
        conceptTitle: 'B+Tree Leaf Nodes & Doubly-Linked Range Scans',
        difficulty: 'intermediate',
        questionText: 'In a standard B+Tree database index, why are all leaf nodes linked together horizontally in a doubly-linked list, and how does this accelerate range queries (e.g. WHERE price BETWEEN 10 AND 50)?',
        options: [
          {
            id: 'A',
            text: 'The engine uses tree traversal once to locate the start key (10), then scans directly along leaf node pointers without returning to the root node.',
            isCorrect: true,
            explanation: 'B+Trees store all keys sorted at the leaf level. The horizontal linked list turns range queries into an O(log N) initial search followed by a fast sequential scan along leaf blocks.',
          },
          {
            id: 'B',
            text: 'Leaf node pointers allow the database to bypass table row security policies.',
            isCorrect: false,
            explanation: 'Security policies are enforced during query execution and are independent of tree node pointer links.',
          },
          {
            id: 'C',
            text: 'The linked list eliminates the need to store data on physical disk pages.',
            isCorrect: false,
            explanation: 'B+Trees persist directly into fixed-size disk blocks/pages; the linked list connects physical page IDs.',
          },
          {
            id: 'D',
            text: 'It allows concurrent transactions to execute without acquiring any row-level locks.',
            isCorrect: false,
            explanation: 'Concurrency control and row locking are separate transactional mechanisms (e.g. MVCC or 2PL).',
          },
        ],
        explanation: 'B+Trees store all keys in sorted order at leaf nodes. The horizontal linked list allows the database to locate the lower bound and scan horizontally until the upper bound.',
        coachingTip: 'This is why B+Trees outperform binary search trees in databases: disk blocks store hundreds of sorted keys, and sequential leaf traversals minimize random disk head movement.',
      },
      3: {
        conceptTitle: 'B+Tree vs Heap Access Paths & Sequential Scan Thresholds',
        difficulty: 'advanced',
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
    },
    reinforcement: {
      conceptTitle: 'Horizontal Sharding Keys & Write Hot-Spotting',
      difficulty: 'pro',
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

  // Track 2: Kafka & Event Streaming
  'kafka & event streaming': {
    concepts: {
      1: {
        conceptTitle: 'Topic Partitions & Message Ordering Fundamentals',
        difficulty: 'basic',
        questionText: 'In Apache Kafka, what is a partition, and what ordering guarantee does Kafka provide for published messages?',
        options: [
          {
            id: 'A',
            text: 'Messages are strictly ordered in FIFO sequence only within an individual partition, not globally across the entire topic.',
            isCorrect: true,
            explanation: 'Kafka guarantees total FIFO order within a single partition. Global ordering across all partitions is not guaranteed unless the topic has exactly one partition.',
          },
          {
            id: 'B',
            text: 'Messages are globally ordered across all topic partitions using distributed GPS wall clocks.',
            isCorrect: false,
            explanation: 'Kafka does not synchronize clocks across distributed partition leaders for global ordering.',
          },
          {
            id: 'C',
            text: 'Kafka partitions store messages in unordered hash tables on disk.',
            isCorrect: false,
            explanation: 'Kafka partitions are append-only ordered commit logs on disk.',
          },
          {
            id: 'D',
            text: 'Messages in a partition are automatically sorted alphabetically by key.',
            isCorrect: false,
            explanation: 'Messages are appended in arrival order; they are never re-sorted by key.',
          },
        ],
        explanation: 'A Kafka partition is an immutable, ordered commit log. Kafka preserves order strictly within a single partition; routing related events with the same key ensures ordered processing.',
        coachingTip: 'Topic = Category, Partition = Ordered Append-Only Log. If you need strict ordering for a specific user, use user_id as the message key so all their events land in the same partition!',
      },
      2: {
        conceptTitle: 'ISR Quorum, Acks=all & Leader Partition Failover',
        difficulty: 'intermediate',
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
            explanation: 'With acks=all and min.insync.replicas=2 on 3 replicas, writes succeed as long as 2 brokers acknowledge. If 1 node fails, writes continue with zero data loss.',
          },
          {
            id: 'C',
            text: 'Producer acks=1 with min.insync.replicas=3 on a 3-broker cluster.',
            isCorrect: false,
            explanation: 'acks=1 only waits for the leader partition, creating a window where un-replicated messages are lost if the leader crashes before replica sync.',
          },
          {
            id: 'D',
            text: 'Disabling replication entirely and relying on OS filesystem swap memory.',
            isCorrect: false,
            explanation: 'Swap memory does not survive hardware crashes or power loss.',
          },
        ],
        explanation: 'acks=all ensures the message is acknowledged by all in-sync replicas before returning. min.insync.replicas=2 allows one broker failure without blocking availability.',
        coachingTip: 'Never set min.insync.replicas equal to total replication factor; otherwise, a single broker restart halts all producer writes.',
      },
      3: {
        conceptTitle: 'Consumer Group Rebalance & Cooperative Sticky Assignors',
        difficulty: 'advanced',
        questionText: 'When scaling out a high-throughput Kafka consumer group from 8 to 16 consumer instances, how does the CooperativeStickyAssignor eliminate the severe "stop-the-world" latency spikes of the legacy Eager rebalance protocol?',
        options: [
          {
            id: 'A',
            text: 'It revokes and pauses consumption on all partitions across all consumers simultaneously during rebalance.',
            isCorrect: false,
            explanation: 'This describes the legacy Eager protocol (e.g. RangeAssignor / RoundRobin), which causes stop-the-world pauses.',
          },
          {
            id: 'B',
            text: 'It performs incremental reassignment, allowing consumers to continue processing unaffected partitions while migrating only reallocated partitions.',
            isCorrect: true,
            explanation: 'Cooperative rebalancing avoids revoking unassigned partitions. Consumers continue active consumption on their existing partitions through multiple lightweight protocol rounds.',
          },
          {
            id: 'C',
            text: 'It forces all consumers to read directly from replica brokers instead of leaders.',
            isCorrect: false,
            explanation: 'Consumer partition assignment determines partition ownership, not broker replica fetch routing.',
          },
          {
            id: 'D',
            text: 'It stores consumer offsets inside client local browser cookies.',
            isCorrect: false,
            explanation: 'Consumer offsets are persisted in Kafka’s internal __consumer_offsets topic.',
          },
        ],
        explanation: 'CooperativeStickyAssignor rebalances incrementally. Unaffected consumers keep consuming uninterrupted, eliminating stop-the-world partition stalls.',
        coachingTip: 'Upgrade consumer groups to CooperativeStickyAssignor to prevent heartbeat timeouts and consumer drop-outs during deployment rollouts.',
      },
    },
    reinforcement: {
      conceptTitle: 'Exactly-Once Semantics (EOS) & Transactional Coordinators',
      difficulty: 'pro',
      questionText: 'In a stream processing pipeline (consume -> process -> produce), how do Kafka’s Exactly-Once Semantics (EOS) and Transactional Coordinator prevent duplicate downstream messages during network retries or worker crashes?',
      options: [
        {
          id: 'A',
          text: 'Downstream consumers periodically delete the entire topic history.',
          isCorrect: false,
          explanation: 'Deleting topic history causes massive data loss, not exactly-once processing.',
        },
        {
          id: 'B',
          text: 'The producer writes consumer offsets to __consumer_offsets within the same atomic two-phase commit transaction as output messages, using transactional.id and sequence numbers.',
          isCorrect: true,
          explanation: 'Kafka transactions atomically commit output records and consumer offset commits together. If a worker crashes mid-batch, uncommitted messages and offsets are aborted together.',
        },
        {
          id: 'C',
          text: 'The client IP address is hashed to discard duplicate network packets at the router.',
          isCorrect: false,
          explanation: 'Network routers do not inspect Kafka stream payloads or transaction boundaries.',
        },
        {
          id: 'D',
          text: 'Consumers disable commits completely and read from the beginning of the topic on every boot.',
          isCorrect: false,
          explanation: 'Reading from beginning causes complete message replay and duplicate side effects.',
        },
      ],
      explanation: 'Kafka EOS coordinates atomic commits across output topic partitions and consumer offset partitions, guaranteeing atomic state transitions across pipeline stages.',
      coachingTip: 'Consumers reading transactional topics must configure isolation.level=read_committed to filter out aborted transaction batches.',
    },
  },

  // Track 3: React Native Architecture & Performance
  'react native architecture': {
    concepts: {
      1: {
        conceptTitle: 'Core Threading Model: JS Thread vs Native Main Thread',
        difficulty: 'basic',
        questionText: 'In React Native, what is the fundamental separation of responsibilities between the JavaScript Thread and the Native Main (UI) Thread?',
        options: [
          {
            id: 'A',
            text: 'The JavaScript thread executes application logic and state updates, while the Native UI thread handles layout, drawing pixels, and user touch gestures.',
            isCorrect: true,
            explanation: 'React Native decouples business logic (running on the JS thread) from host platform rendering (running on the native main/UI thread), preventing heavy layout calculations from halting the JS event loop.',
          },
          {
            id: 'B',
            text: 'The JavaScript thread renders pixels directly onto the phone screen using OpenGL shaders.',
            isCorrect: false,
            explanation: 'JavaScript runs logic in a JS engine (Hermes/JSC); host platform UI frameworks (UIKit/Android Views) render pixels.',
          },
          {
            id: 'C',
            text: 'The Native UI thread runs all npm packages and parses JSON files.',
            isCorrect: false,
            explanation: 'Npm modules and JSON parsing run on the JavaScript thread.',
          },
          {
            id: 'D',
            text: 'React Native merges the JavaScript engine and the iOS UIKit dispatcher into a single shared thread.',
            isCorrect: false,
            explanation: 'They operate on separate threads to prevent JS computation from freezing the native UI frame rate.',
          },
        ],
        explanation: 'Keeping business logic on the JS thread and rendering on the Native UI thread enables native performance. If the JS thread is blocked, user animations can still run smoothly on the UI thread.',
        coachingTip: 'Always offload gesture animations to the UI thread using useNativeDriver: true or Reanimated worklets to maintain 60/120 FPS.',
      },
      2: {
        conceptTitle: 'Hermes Engine & Precompiled AOT Bytecode Cold Starts',
        difficulty: 'intermediate',
        questionText: 'Why does the Hermes JavaScript engine provide dramatically faster app cold start times (Time-to-Interactive) compared to standard mobile JavaScript engines like JavaScriptCore (JSC)?',
        options: [
          {
            id: 'A',
            text: 'Hermes converts all JavaScript code into C++ source files at runtime inside the mobile app.',
            isCorrect: false,
            explanation: 'Hermes does not compile C++ at runtime on the device; it pre-compiles JS into bytecode at build time.',
          },
          {
            id: 'B',
            text: 'Hermes compiles JavaScript ahead-of-time (AOT) into optimized bytecode during app build, eliminating on-device parsing and compilation overhead at launch.',
            isCorrect: true,
            explanation: 'Standard JS engines spend hundreds of milliseconds parsing and compiling plain text JS at startup. Hermes loads pre-compiled bytecode directly into memory via mmap, dramatically slashing TTI.',
          },
          {
            id: 'C',
            text: 'Hermes downloads pre-rendered UI screenshots from remote servers on startup.',
            isCorrect: false,
            explanation: 'Hermes is an offline-capable JavaScript engine; it does not download UI images.',
          },
          {
            id: 'D',
            text: 'Hermes disables garbage collection completely to avoid pausing the app.',
            isCorrect: false,
            explanation: 'Hermes features a generational, compacting garbage collector designed for mobile memory constraints.',
          },
        ],
        explanation: 'Hermes shifts expensive JavaScript syntax parsing and bytecode compilation from the user’s mobile device to the developer build machine.',
        coachingTip: 'Always verify hermesEnabled: true in build.gradle and Podfile. Bytecode mmap loading ensures background memory pages are evicted cleanly by the OS under memory pressure.',
      },
      3: {
        conceptTitle: 'JavaScript Interface (JSI) vs Legacy Asynchronous JSON Bridge',
        difficulty: 'advanced',
        questionText: 'How does the JavaScript Interface (JSI) in React Native’s New Architecture eliminate the serialization bottlenecks of the legacy bridge?',
        options: [
          {
            id: 'A',
            text: 'JSI encodes all JavaScript objects into base64 strings before transmitting them over WebSockets.',
            isCorrect: false,
            explanation: 'JSI eliminates string serialization completely; it does not use WebSockets.',
          },
          {
            id: 'B',
            text: 'JSI allows JavaScript to hold direct references to C++ HostObjects, enabling synchronous, zero-copy method calls without JSON serialization.',
            isCorrect: true,
            explanation: 'In the legacy architecture, every cross-language call was serialized to a JSON string and queued asynchronously. JSI exposes C++ objects directly to JS via HostObjects, allowing synchronous invocation and shared memory.',
          },
          {
            id: 'C',
            text: 'JSI forces all native iOS and Android code to be written exclusively in TypeScript.',
            isCorrect: false,
            explanation: 'Native platform code continues to be written in Swift/Objective-C/Kotlin/Java, with C++ providing the shared binding layer.',
          },
          {
            id: 'D',
            text: 'JSI restricts applications to running on a single CPU core.',
            isCorrect: false,
            explanation: 'JSI works seamlessly with multi-threaded mobile architectures.',
          },
        ],
        explanation: 'JSI transforms communication from slow asynchronous JSON serialization into direct C++ virtual method invocations, enabling high-performance libraries like react-native-reanimated and op-sqlite.',
        coachingTip: 'Use JSI-based libraries (like op-sqlite) for database access: direct memory pointers are 10-50x faster than legacy asynchronous bridge implementations.',
      },
    },
    reinforcement: {
      conceptTitle: 'Fabric Concurrent Renderer & Synchronous C++ Shadow Trees',
      difficulty: 'pro',
      questionText: 'In React Native’s New Architecture, how does the Fabric renderer eliminate UI "white flashes" and layout jumps during rapid user scrolling and split-screen resizing?',
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
      explanation: 'Fabric unifies layout and host view synchronization via C++ shadow trees, ensuring high-priority user interactions (like typing and scrolling) render without async frame drops.',
      coachingTip: 'With Fabric, layout measurements are synchronous. This enables direct integration with iOS auto-layout and complex gesture transitions.',
    },
  },

  // Track 4: High-Scale Distributed Systems
  'high-scale distributed systems': {
    concepts: {
      1: {
        conceptTitle: 'Horizontal Scaling vs Vertical Scaling Trade-offs',
        difficulty: 'basic',
        questionText: 'What is the fundamental difference between vertical scaling (scale-up) and horizontal scaling (scale-out), and what inherent complexity does horizontal scaling introduce?',
        options: [
          {
            id: 'A',
            text: 'Horizontal scaling adds more independent server nodes to distribute workload, but introduces network partitions, communication latency, and distributed consensus challenges.',
            isCorrect: true,
            explanation: 'Vertical scaling upgrades a single machine (CPU/RAM) but hits hardware ceilings and creates a single point of failure. Horizontal scaling scales indefinitely by adding nodes, but requires managing network unreliability, partial failures, and distributed consistency.',
          },
          {
            id: 'B',
            text: 'Vertical scaling distributes database shards across multiple cloud providers.',
            isCorrect: false,
            explanation: 'Distributing shards across providers is a horizontal multi-cloud pattern, not vertical scaling.',
          },
          {
            id: 'C',
            text: 'Horizontal scaling guarantees zero network latency because servers share the same CPU socket.',
            isCorrect: false,
            explanation: 'Horizontal servers communicate over network interfaces, which have orders of magnitude higher latency than shared CPU buses.',
          },
          {
            id: 'D',
            text: 'Vertical scaling eliminates the need for software operating systems.',
            isCorrect: false,
            explanation: 'Every physical machine requires an operating system or hypervisor.',
          },
        ],
        explanation: 'Vertical scaling is simple but has physical limits and downtime. Horizontal scaling provides fault tolerance and elasticity, but trades off local memory speed for network latency and consistency protocols.',
        coachingTip: 'Always scale vertically first until cost or single-point-of-failure risks dictate horizontal scale-out. Premature horizontal distribution adds immense operational complexity.',
      },
      2: {
        conceptTitle: 'CAP Theorem & PACELC Trade-offs: Latency vs Consistency',
        difficulty: 'intermediate',
        questionText: 'According to the PACELC theorem, during normal network conditions (when there is NO network partition), what fundamental trade-off must a distributed database make?',
        options: [
          {
            id: 'A',
            text: 'Trade off between CPU clock speed and hard disk capacity.',
            isCorrect: false,
            explanation: 'PACELC addresses distributed data consistency and latency, not hardware specs.',
          },
          {
            id: 'B',
            text: 'Trade off between Latency (L) and Consistency (C).',
            isCorrect: true,
            explanation: 'PACELC states: if Partition (P), trade off Availability (A) vs Consistency (C); Else (E), trade off Latency (L) vs Consistency (C). Even in healthy networks, strong consistency requires round-trip cross-node replication, increasing read/write latency.',
          },
          {
            id: 'C',
            text: 'Trade off between Encryption strength and TLS certificate validity.',
            isCorrect: false,
            explanation: 'Security and encryption are independent of distributed data replication trade-offs.',
          },
          {
            id: 'D',
            text: 'There are no trade-offs; modern databases achieve 0ms latency with strict serializability simultaneously.',
            isCorrect: false,
            explanation: 'Physics and the speed of light prevent simultaneous zero latency and cross-node serializability.',
          },
        ],
        explanation: 'PACELC extends CAP by highlighting that even in healthy networks, guaranteeing strong linearizable consistency requires multi-node round-trip coordination that increases user latency.',
        coachingTip: 'Classify your data models: financial ledger balances require PC/EC (strong consistency despite latency), while user likes and view counts thrive on PA/EL (eventual consistency, low latency).',
      },
      3: {
        conceptTitle: 'Raft Consensus, Leader Election & Majority Quorums',
        difficulty: 'advanced',
        questionText: 'In the Raft consensus algorithm, why does a cluster of 5 nodes require a majority quorum of at least 3 nodes to elect a leader and commit log entries?',
        options: [
          {
            id: 'A',
            text: 'Because Raft requires all nodes to agree unanimously before committing any write.',
            isCorrect: false,
            explanation: 'Unanimous consensus would freeze the entire cluster if even 1 node had a network blip.',
          },
          {
            id: 'B',
            text: 'Any two majorities of size 3 in a 5-node cluster overlap by at least 1 node, mathematically guaranteeing that split-brain leaders cannot coexist and committed log entries survive failovers.',
            isCorrect: true,
            explanation: 'By the Pigeonhole Principle, any two quorums of 3 nodes out of 5 must share at least one node. The overlapping node prevents two candidates from being elected leader in the same term and guarantees that a newly elected leader contains all previously committed log entries.',
          },
          {
            id: 'C',
            text: 'To minimize the physical distance electricity travels through fiber-optic cables.',
            isCorrect: false,
            explanation: 'Quorums are algorithmic fault-tolerance constructs, not physical cable routing.',
          },
          {
            id: 'D',
            text: 'Raft only uses odd numbers because CPU threads can only fork into odd numbered child processes.',
            isCorrect: false,
            explanation: 'Hardware threads operate independently of distributed consensus quorum math.',
          },
        ],
        explanation: 'Quorum intersection guarantees that the majority voting for a new leader contains at least one node with the most up-to-date committed log from the previous term.',
        coachingTip: 'Always deploy Raft clusters with odd node counts (3 or 5). Adding a 6th node increases network traffic without improving fault tolerance (both 5 and 6 nodes only tolerate 2 failures).',
      },
    },
    reinforcement: {
      conceptTitle: 'Byzantine Fault Tolerance vs Crash-Fault Tolerance & Vector Clocks',
      difficulty: 'pro',
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

  // Track 5: System Design & Microservices
  'system design at scale': {
    concepts: {
      1: {
        conceptTitle: 'Caching Fundamentals: Read-Through & Cache Invalidation',
        difficulty: 'basic',
        questionText: 'In high-scale web applications, what is the primary role of an in-memory cache (such as Redis or Memcached), and how does a "cache miss" get resolved in a standard read-through pattern?',
        options: [
          {
            id: 'A',
            text: 'The cache stores frequently read keys in RAM for sub-millisecond access; upon a cache miss, the application queries the primary database and writes the result back into the cache with a TTL.',
            isCorrect: true,
            explanation: 'In-memory caches sit between the application and database. When data is not in cache (miss), the app falls back to the database and populates the cache so subsequent requests return at memory speeds.',
          },
          {
            id: 'B',
            text: 'An in-memory cache permanently replaces the primary database so disk storage can be deleted.',
            isCorrect: false,
            explanation: 'Caches are volatile and hold working sets; persistent databases are required for durability and complex relational queries.',
          },
          {
            id: 'C',
            text: 'On a cache miss, the server aborts the request and returns an HTTP 500 error to the client.',
            isCorrect: false,
            explanation: 'A cache miss is a normal operational event that triggers a transparent database lookup.',
          },
          {
            id: 'D',
            text: 'A cache miss indicates that the server memory has suffered hardware corruption.',
            isCorrect: false,
            explanation: 'A cache miss simply means the requested key is not currently cached or has expired.',
          },
        ],
        explanation: 'Caching reduces read latency from tens of milliseconds to microseconds and protects relational databases from connection exhaustion under high traffic.',
        coachingTip: 'Always specify a Time-To-Live (TTL) on cached keys to prevent stale data from lingering indefinitely in memory.',
      },
      2: {
        conceptTitle: 'Distributed Idempotency Keys & State Machine Transitions',
        difficulty: 'intermediate',
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
        conceptTitle: 'Probabilistic Early Expiration (XFetch) & Cache Stampede Defense',
        difficulty: 'advanced',
        questionText: 'Under 100k requests/sec, when a hot Redis cache key expires, thousands of concurrent backend threads simultaneously query the database to regenerate the key, causing database CPU saturation (Cache Stampede / Thundering Herd). How does the XFetch algorithm prevent this?',
        options: [
          {
            id: 'A',
            text: 'It permanently disables TTLs so keys never expire.',
            isCorrect: false,
            explanation: 'Never expiring keys causes memory bloat and delivers stale data permanently.',
          },
          {
            id: 'B',
            text: 'It probabilistically triggers an early background recompute before the key officially expires, with probability increasing as time approaches expiration.',
            isCorrect: true,
            explanation: 'XFetch evaluates -beta * delta * ln(random()) > (expiry - now). As expiration nears, exactly one lucky request triggers an asynchronous database fetch to refresh the cache before the key ever expires.',
          },
          {
            id: 'C',
            text: 'It routes all 100,000 requests directly to the database replica.',
            isCorrect: false,
            explanation: 'Flooding the replica causes replica lag and crash loops.',
          },
          {
            id: 'D',
            text: 'It shuts down the web server cluster whenever an expiration occurs.',
            isCorrect: false,
            explanation: 'Shutting down servers guarantees a total system outage.',
          },
        ],
        explanation: 'XFetch mathematically guarantees that exactly one thread asynchronously re-computes the cache value right before it expires, eliminating lock contention and stampedes.',
        coachingTip: 'Always add random jitter (e.g. ±15% of TTL) to cached keys so large batches of items written together never expire at the exact same second.',
      },
    },
    reinforcement: {
      conceptTitle: 'Circuit Breakers, Bulkheads & Cascading Failure Isolation',
      difficulty: 'pro',
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
      conceptTitle: `Reinforcement Drill: ${cleanSubtopic}`,
      difficulty: 'pro',
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

  // Concept 1: BASIC
  if (conceptIndex === 1) {
    return {
      conceptTitle: `Core Fundamentals & Mental Models of ${cleanTopic}`,
      difficulty: 'basic',
      questionText: `When first learning "${cleanTopic}", what is its primary foundational purpose, and what fundamental problem does it solve in modern software systems?`,
      options: [
        {
          id: 'A',
          text: `Providing a robust, decoupled architecture to manage state, compute, or data flow reliably without unneeded coupling.`,
          isCorrect: true,
          explanation: `At its core, ${cleanTopic} solves scalability, maintainability, or isolation challenges by defining clean architectural boundaries.`,
        },
        {
          id: 'B',
          text: `Replacing all database storage with volatile temporary variables.`,
          isCorrect: false,
          explanation: `Temporary variables are volatile and do not provide persistent guarantees.`,
        },
        {
          id: 'C',
          text: `Executing code exclusively inside mobile device battery firmware.`,
          isCorrect: false,
          explanation: `Battery firmware does not run application engineering logic.`,
        },
        {
          id: 'D',
          text: `Eliminating the need to write unit tests or handle error states.`,
          isCorrect: false,
          explanation: `Testing and resilient error handling remain essential across all software disciplines.`,
        },
      ],
      explanation: `Mastering foundational concepts in ${cleanTopic} establishes clear mental models before tackling production bottlenecks.`,
      coachingTip: 'Always master the "Why" before diving into framework syntax or low-level flags.',
    };
  }

  // Concept 2: INTERMEDIATE
  if (conceptIndex === 2) {
    return {
      conceptTitle: `Operational Mechanics & Standard Patterns in ${cleanTopic}`,
      difficulty: 'intermediate',
      questionText: `In standard production implementations of "${cleanTopic}", which architectural mechanism governs internal execution flow and ensures correct state transitions?`,
      options: [
        {
          id: 'A',
          text: `Allowing arbitrary uncoordinated mutations from background worker threads.`,
          isCorrect: false,
          explanation: `Uncoordinated mutations introduce severe race conditions, memory leaks, and corrupt state.`,
        },
        {
          id: 'B',
          text: `Defining explicit lifecycles, structured state machines, and predictable event dispatchers.`,
          isCorrect: true,
          explanation: `Explicit lifecycles and structured transitions ensure that ${cleanTopic} executes deterministically even under concurrent workloads.`,
        },
        {
          id: 'C',
          text: `Hardcoding IP addresses and bypassing network interfaces.`,
          isCorrect: false,
          explanation: `Hardcoded addresses prevent dynamic scaling, DNS failover, and service discovery.`,
        },
        {
          id: 'D',
          text: `Restarting the server process on every single incoming client request.`,
          isCorrect: false,
          explanation: `Process reboots introduce massive latency and prevent connection pooling.`,
        },
      ],
      explanation: `Standard production implementations of ${cleanTopic} rely on deterministic lifecycle management and decoupled message pipelines.`,
      coachingTip: 'Map out the lifecycle transitions from initialization to teardown to avoid silent memory leaks.',
    };
  }

  // Concept 3: ADVANCED
  return {
    conceptTitle: `Failure Modes, Trade-offs & Bottlenecks in ${cleanTopic}`,
    difficulty: 'advanced',
    questionText: `When operating "${cleanTopic}" under 100x traffic amplification, which architectural pattern defends against cascading failures and ensures graceful degradation?`,
    options: [
      {
        id: 'A',
        text: `Configuring unlimited retry loops without exponential backoff or jitter.`,
        isCorrect: false,
        explanation: `Immediate, tight retry loops amplify traffic and trigger catastrophic self-inflicted Denial of Service (DoS).`,
      },
      {
        id: 'B',
        text: `Implementing backpressure, token-bucket rate limiting, circuit breakers, and bounded priority queues.`,
        isCorrect: true,
        explanation: `Backpressure and bounded queues signal producers to slow down, while circuit breakers shed non-essential load to maintain SLA guarantees.`,
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

  const defaultDifficulty: QBLDifficulty = isReinforcement || conceptIndex >= 4
    ? 'pro'
    : conceptIndex === 3
    ? 'advanced'
    : conceptIndex === 2
    ? 'intermediate'
    : 'basic';

  const difficulty = template.difficulty || defaultDifficulty;

  return {
    id: `q_${Date.now()}_${conceptIndex}_${isReinforcement ? 'drill' : 'norm'}`,
    conceptTitle: template.conceptTitle,
    conceptIndex,
    questionText: template.questionText,
    options,
    explanation: template.explanation,
    coachingTip: template.coachingTip,
    isReinforcement,
    difficulty,
  };
}
