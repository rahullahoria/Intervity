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
import { getNodeJSQuestion } from './domain/NodeJSDomain';

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
 * Procedural Dynamic Question Generator for any arbitrary topic and subtopic.
 * Synthesizes deep, artifact-rich engineering questions (code snippets, SQL, configs, latency metrics)
 * across graduated difficulty tiers (basic -> intermediate -> advanced -> pro).
 */
function buildProceduralQuestion(
  topicName: string,
  subtopicTitle: string,
  conceptIndex: number,
  isReinforcement: boolean,
  _previousMistake?: string
): QuestionTemplate {
  const cleanTopic = topicName.trim() || 'Software Architecture';
  const cleanSubtopic = subtopicTitle.trim() || 'Core Engineering';
  const subLower = cleanSubtopic.toLowerCase();
  const topLower = cleanTopic.toLowerCase();

  // 1. Kafka Producer / Ingestion / Idempotence Theme
  if (subLower.includes('producer') || subLower.includes('idempotence') || subLower.includes('ack') || subLower.includes('ingest')) {
    if (isReinforcement) {
      return {
        conceptTitle: 'Producer Idempotence Invariants & PID Deduplication',
        difficulty: 'pro',
        questionText: `Under network partition, a Kafka producer with \`enable.idempotence=true\` retries a batch after an \`UNKNOWN_TOPIC_OR_PARTITION\` error. Why does the broker safely discard the duplicate without user-space deduplication?\n\n\`\`\`properties\nenable.idempotence=true\nmax.in.flight.requests.per.connection=5\nretries=2147483647\n\`\`\``,
        options: [
          {
            id: 'A',
            text: 'The broker tracks the monotonic Sequence Number associated with each Producer ID (PID) and drops records where Sequence <= LastCommittedSequence.',
            isCorrect: true,
            explanation: 'Kafka assigns an internal Producer ID (PID) and sequence numbers to every record batch. The partition leader verifies sequence monotonicity and discards duplicates automatically.',
          },
          {
            id: 'B',
            text: 'The producer hashes the message payload in SHA-256 and deletes it from local disk.',
            isCorrect: false,
            explanation: 'Payload hashing is not part of Kafka broker protocol; sequence numbers and PIDs provide deterministic deduplication without payload inspection.',
          },
          {
            id: 'C',
            text: 'The partition leader drops all incoming messages until the network partition heals.',
            isCorrect: false,
            explanation: 'The leader continues processing valid writes that meet quorum requirements.',
          },
          {
            id: 'D',
            text: 'The operating system TCP buffer suppresses retried packets at layer 4.',
            isCorrect: false,
            explanation: 'TCP guarantees segment delivery within a socket session, but application-level retries across reconnects require application-level idempotence tokens.',
          },
        ],
        explanation: 'Idempotent producers assign a monotonic sequence number per PID per partition. The broker rejects any batch with sequence <= current watermark, eliminating duplicate writes on retries.',
        coachingTip: 'Remember: enable.idempotence requires acks=all and retries > 0. The broker handles sequence deduplication in memory for active producer epochs.',
      };
    }

    if (conceptIndex === 1) {
      return {
        conceptTitle: 'Producer acks Semantics & Durability Trade-offs',
        difficulty: 'basic',
        questionText: `In event stream publishing, how does setting \`acks=all\` differ from \`acks=1\` when publishing messages to a clustered broker?\n\n\`\`\`properties\nacks=all\nmin.insync.replicas=2\n\`\`\``,
        options: [
          {
            id: 'A',
            text: 'With acks=all, the producer waits for the partition leader AND all In-Sync Replicas (ISR) to commit the record to their local write-ahead log.',
            isCorrect: true,
            explanation: 'acks=all guarantees that even if the leader crashes immediately after acknowledging, surviving ISR followers hold the committed message, preventing data loss.',
          },
          {
            id: 'B',
            text: 'acks=all broadcasts the message via UDP multicast to all client subscribers directly.',
            isCorrect: false,
            explanation: 'acks is an acknowledgement configuration between producer and broker, not a client subscription mechanism.',
          },
          {
            id: 'C',
            text: 'acks=1 provides zero-data-loss guarantees even if the broker hardware catches fire.',
            isCorrect: false,
            explanation: 'acks=1 only waits for the leader disk write; if the leader dies before replicating to followers, un-replicated records are permanently lost.',
          },
          {
            id: 'D',
            text: 'acks=all disables all producer retries to maximize throughput.',
            isCorrect: false,
            explanation: 'acks=all is typically combined with high or infinite retries to guarantee delivery.',
          },
        ],
        explanation: 'acks=all with min.insync.replicas >= 2 ensures that messages survive the abrupt death of the leader broker without loss.',
        coachingTip: 'Think of acks=1 like a verbal confirmation from one person, while acks=all is a signed notarized contract witnessed by the quorum.',
      };
    }

    if (conceptIndex === 2) {
      return {
        conceptTitle: 'Batching Mechanics: linger.ms vs batch.size',
        difficulty: 'intermediate',
        questionText: `A producer application experiences high CPU overhead and low throughput sending 20,000 small events/sec. Which producer configuration tuning introduces bounded micro-batching without unacceptable latency?\n\n\`\`\`properties\nbatch.size=65536\nlinger.ms=10\ncompression.type=zstd\n\`\`\``,
        options: [
          {
            id: 'A',
            text: 'Setting linger.ms=10 forces the producer to buffer records for up to 10ms (or until batch.size is reached), allowing efficient batch compression and lower I/O syscalls.',
            isCorrect: true,
            explanation: 'By default linger.ms=0 sends immediately. Adding a 5-10ms buffer allows multiple records to coalesce into a single compressed network packet.',
          },
          {
            id: 'B',
            text: 'Setting max.block.ms=0 to drop all incoming messages that cannot be sent immediately.',
            isCorrect: false,
            explanation: 'Dropping messages causes severe data loss and does not optimize batching.',
          },
          {
            id: 'C',
            text: 'Increasing consumer thread count to 1,000 on the publishing server.',
            isCorrect: false,
            explanation: 'Consumers read from brokers; they do not control producer-side batching.',
          },
          {
            id: 'D',
            text: 'Disabling TCP socket buffers entirely.',
            isCorrect: false,
            explanation: 'Disabling socket buffers degrades network performance.',
          },
        ],
        explanation: 'linger.ms gives the producer thread permission to wait up to N milliseconds to fill batch.size, multiplying throughput while keeping latency predictable.',
        coachingTip: 'Think of linger.ms like a bus schedule: waiting 5 minutes for 40 passengers is far more efficient than driving an empty bus for each individual walker.',
      };
    }

    return {
      conceptTitle: 'Poison Pill Retries & max.in.flight.requests.per.connection',
      difficulty: 'advanced',
      questionText: `When operating a high-throughput event producer with \`enable.idempotence=false\`, why does setting \`max.in.flight.requests.per.connection > 1\` with \`retries > 0\` risk message reordering during temporary network jitter?`,
      options: [
        {
          id: 'A',
          text: 'If Batch 1 fails and is retried while Batch 2 succeeds on a parallel connection, Batch 2 is committed before the retried Batch 1.',
          isCorrect: true,
          explanation: 'Without idempotence, non-deterministic network retry arrivals cause out-of-order writes across parallel in-flight TCP requests.',
        },
        {
          id: 'B',
          text: 'The broker will truncate the partition log and reset all consumer offsets to zero.',
          isCorrect: false,
          explanation: 'Log truncation only occurs during replication reconciliation, not producer connection reordering.',
        },
        {
          id: 'C',
          text: 'The operating system drops all TLS encryption keys on retry.',
          isCorrect: false,
          explanation: 'TLS sessions persist across application-layer packet retries.',
        },
        {
          id: 'D',
          text: 'The producer automatically changes the partition key to null.',
          isCorrect: false,
          explanation: 'Partition keys are immutable per record.',
        },
      ],
      explanation: 'In-flight parallel requests without idempotence can arrive and commit out of order if an earlier batch suffers a transient timeout and retries after a subsequent batch.',
      coachingTip: 'To guarantee strict ordering without idempotence, max.in.flight must be 1. With enable.idempotence=true, Kafka safely supports max.in.flight <= 5 while preserving strict order!',
    };
  }

  // 2. Broker Architecture / Replication / ISR Theme
  if (subLower.includes('broker') || subLower.includes('replication') || subLower.includes('isr')) {
    if (isReinforcement) {
      return {
        conceptTitle: 'Leader Epoch Fencing & Log Divergence Prevention',
        difficulty: 'pro',
        questionText: `Let's reinforce your broker replication mental model: Why did Kafka replace simple High Watermark (HW) truncation with "Leader Epochs" (KIP-101) during follower recovery and leader failovers?`,
        options: [
          {
            id: 'A',
            text: 'Relying solely on local High Watermark updates caused data loss or log divergence during rapid consecutive restarts; Leader Epochs deterministically fence stale leaders and reconcile exact truncation offsets.',
            isCorrect: true,
            explanation: 'Because High Watermark updates lag by one fetch round-trip, a follower restarting right before learning the new HW could truncate committed messages. Leader Epochs track exact (epoch, startOffset) boundaries.',
          },
          {
            id: 'B',
            text: 'Leader Epochs compress broker log files into ZIP archives every hour.',
            isCorrect: false,
            explanation: 'Leader Epochs are replication consensus metadata, not file compression utilities.',
          },
          {
            id: 'C',
            text: 'Leader Epochs allow followers to accept direct write requests from producers.',
            isCorrect: false,
            explanation: 'Only the partition leader accepts producer writes in Kafka.',
          },
          {
            id: 'D',
            text: 'Leader Epochs disable all disk fsync operations permanently.',
            isCorrect: false,
            explanation: 'Leader Epochs strengthen durability and log consistency; they do not disable disk persistence.',
          },
        ],
        explanation: 'Leader Epochs map each leadership term to its starting log offset, enabling recovering replicas to query the active leader for the exact end offset of any prior epoch without race conditions.',
        coachingTip: 'Think of Leader Epochs like versioned Git tags on the commit log—every time leadership changes, a new epoch marks the exact offset boundary.',
      };
    }

    if (conceptIndex === 1) {
      return {
        conceptTitle: 'Broker Leader-Follower Replication & High Watermark',
        difficulty: 'basic',
        questionText: `In a partitioned distributed broker architecture, how is the "High Watermark" (HW) defined, and what is its role in consumer isolation?\n\n\`\`\`text\nLeader Log:   [0][1][2][3][4] (LEO=5)\nFollower Log: [0][1][2]       (HW=3)\n\`\`\``,
        options: [
          {
            id: 'A',
            text: 'The High Watermark represents the highest offset replicated across all In-Sync Replicas (ISR); consumers are only allowed to read up to the HW.',
            isCorrect: true,
            explanation: 'High Watermark prevents "dirty reads". Uncommitted messages beyond the HW could be lost if the leader crashes before replication completes.',
          },
          {
            id: 'B',
            text: 'The High Watermark is the maximum number of network sockets open on the broker.',
            isCorrect: false,
            explanation: 'High Watermark is an offset boundary in the partition commit log, not a network socket counter.',
          },
          {
            id: 'C',
            text: 'Consumers read all messages up to the Log End Offset (LEO) immediately, ignoring replication status.',
            isCorrect: false,
            explanation: 'Reading un-replicated records up to LEO would allow dirty reads of messages that might be truncated on leader failover.',
          },
          {
            id: 'D',
            text: 'The High Watermark resets to 0 every 60 seconds.',
            isCorrect: false,
            explanation: 'The High Watermark monotonically advances as followers replicate new segments.',
          },
        ],
        explanation: 'The High Watermark guarantees read isolation: only messages confirmed replicated across the required ISR quorum are visible to consumers.',
        coachingTip: 'High Watermark is the waterline of safety. Above the waterline is uncommitted turbulent water; below it is stone-cold committed truth.',
      };
    }

    if (conceptIndex === 2) {
      return {
        conceptTitle: 'min.insync.replicas vs Replication Factor',
        difficulty: 'intermediate',
        questionText: `A topic has \`replication.factor=3\` and \`min.insync.replicas=2\`. Two broker nodes abruptly suffer hardware failure simultaneously. What happens to producers configured with \`acks=all\`?\n\n\`\`\`properties\nreplication.factor=3\nmin.insync.replicas=2\nacks=all\n\`\`\``,
        options: [
          {
            id: 'A',
            text: 'The sole surviving broker rejects write requests with a `NotEnoughReplicasException` because the active ISR count (1) is less than min.insync.replicas (2).',
            isCorrect: true,
            explanation: 'When active ISR drops below min.insync.replicas, the broker refuses new writes with acks=all to prevent consistency degradation, prioritizing CP over AP.',
          },
          {
            id: 'B',
            text: 'The surviving broker silently converts writes to acks=0 and proceeds without errors.',
            isCorrect: false,
            explanation: 'Brokers never silently downgrade client safety contracts.',
          },
          {
            id: 'C',
            text: 'All consumers connected to the topic immediately crash with out-of-memory errors.',
            isCorrect: false,
            explanation: 'Consumers can still read committed data up to the High Watermark even when writes are blocked.',
          },
          {
            id: 'D',
            text: 'The broker automatically creates two virtual machines in AWS to replace the dead brokers.',
            isCorrect: false,
            explanation: 'Automated infrastructure provisioning is an external orchestrator concern, not an internal broker protocol behavior.',
          },
        ],
        explanation: 'min.insync.replicas defines the minimum quorum required to accept writes when acks=all. If surviving replicas < min.insync.replicas, writes are rejected with NotEnoughReplicasException.',
        coachingTip: 'This is the CAP theorem in action: Kafka chooses Consistency over Availability for writes when quorum is lost.',
      };
    }

    return {
      conceptTitle: 'Unclean Leader Election & Log Truncation Risks',
      difficulty: 'advanced',
      questionText: `Under what circumstance would setting \`unclean.leader.election.enable=true\` cause committed message loss, and why is it disabled by default in production?\n\n\`\`\`properties\nunclean.leader.election.enable=false\n\`\`\``,
      options: [
        {
          id: 'A',
          text: 'If all ISR brokers die, an out-of-sync replica is elected leader, causing it to truncate any offsets it never received and permanently overwriting previously committed messages.',
          isCorrect: true,
          explanation: 'Electing an out-of-sync broker restores availability at the cost of data consistency; un-replicated historic commits are truncated and lost forever.',
        },
        {
          id: 'B',
          text: 'It causes the JVM garbage collector to run continuously in a stop-the-world loop.',
          isCorrect: false,
          explanation: 'Leader election does not directly trigger GC loops.',
        },
        {
          id: 'C',
          text: 'It corrupts the operating system kernel page cache permanently across all nodes.',
          isCorrect: false,
          explanation: 'It causes log offset inconsistency, not OS kernel corruption.',
        },
        {
          id: 'D',
          text: 'It forces producers to re-encrypt all payloads with RSA 4096-bit keys.',
          isCorrect: false,
          explanation: 'Leader election does not reconfigure payload cryptographic algorithms.',
        },
      ],
      explanation: 'Unclean leader election allows a non-ISR follower to become leader during catastrophe. This guarantees data loss and log divergence, which is unacceptable for financial or audit logs.',
      coachingTip: 'Never enable unclean leader election unless service downtime is infinitely more expensive than losing confirmed historical data.',
    };
  }

  // 3. Consumer Rebalancing & Partition Assignment Theme
  if (subLower.includes('consumer') || subLower.includes('rebalanc') || subLower.includes('group') || subLower.includes('offset')) {
    if (isReinforcement) {
      return {
        conceptTitle: 'Static Group Membership (group.instance.id) & Rolling Deployments',
        difficulty: 'pro',
        questionText: `Let's reinforce consumer group coordination: During a Kubernetes rolling restart of 50 Kafka consumer pods, how does configuring Static Group Membership (\`group.instance.id\`) prevent unnecessary partition rebalances?`,
        options: [
          {
            id: 'A',
            text: 'The broker GroupCoordinator recognizes the persistent group.instance.id and holds the member’s partition assignment up to session.timeout.ms without triggering a rebalance on transient restarts.',
            isCorrect: true,
            explanation: 'With static membership, restarting pods rejoin with the same group.instance.id within session.timeout.ms and immediately resume their existing partitions without triggering a group rebalance.',
          },
          {
            id: 'B',
            text: 'It permanently locks partitions to hardware MAC addresses so no failover can ever happen.',
            isCorrect: false,
            explanation: 'If the pod stays down longer than session.timeout.ms, normal failover rebalancing still occurs.',
          },
          {
            id: 'C',
            text: 'It forces consumers to read all partitions from offset 0 on every deployment.',
            isCorrect: false,
            explanation: 'Static membership preserves committed offsets and existing partition assignments.',
          },
          {
            id: 'D',
            text: 'It disables consumer heartbeats completely.',
            isCorrect: false,
            explanation: 'Heartbeats remain active to detect true node failures exceeding session.timeout.ms.',
          },
        ],
        explanation: 'Without static membership, every pod termination sends a LeaveGroup request that triggers two full rebalances (one on leave, one on rejoin). Static membership eliminates rebalance churn during rolling deployments.',
        coachingTip: 'Combine CooperativeStickyAssignor with a deterministic group.instance.id (like StatefulSet pod ordinal) for zero-rebalance rolling deployments!',
      };
    }

    if (conceptIndex === 1) {
      return {
        conceptTitle: 'Consumer Group Partition Allocation & Scale Bounds',
        difficulty: 'basic',
        questionText: `A topic has 12 partitions. A consumer group has 16 active consumer instances running on separate servers. How many consumer instances will actively process messages from this topic?`,
        options: [
          {
            id: 'A',
            text: 'Exactly 12 consumers will each be assigned 1 partition; the remaining 4 consumers will remain idle as hot standbys.',
            isCorrect: true,
            explanation: 'In Kafka, a single partition can only be consumed by at most one consumer instance within the same group to maintain strict message ordering.',
          },
          {
            id: 'B',
            text: 'All 16 consumers will round-robin read every single message, resulting in duplicate processing.',
            isCorrect: false,
            explanation: 'Consumer groups divide partitions, not individual messages, avoiding duplicates across group members.',
          },
          {
            id: 'C',
            text: 'The broker will crash because consumers exceed partition count.',
            isCorrect: false,
            explanation: 'Extra consumers simply sit idle awaiting failover.',
          },
          {
            id: 'D',
            text: 'Each partition is dynamically split into 1.33 sub-partitions.',
            isCorrect: false,
            explanation: 'Partitions cannot be dynamically fractionalized at runtime.',
          },
        ],
        explanation: 'Partition count is the maximum degree of consumer parallelism in a single consumer group. Extra consumers remain idle standby workers.',
        coachingTip: 'If you need 16 parallel workers, your topic must have at least 16 partitions!',
      };
    }

    if (conceptIndex === 2) {
      return {
        conceptTitle: 'max.poll.interval.ms vs session.timeout.ms',
        difficulty: 'intermediate',
        questionText: `A consumer processes heavy ML inference batches taking 8 minutes per batch. Every 5 minutes, the consumer group triggers a rebalance and pauses. What is the root cause?\n\n\`\`\`properties\nsession.timeout.ms=45000\nmax.poll.interval.ms=300000 // 5 minutes\n\`\`\``,
        options: [
          {
            id: 'A',
            text: 'Processing exceeds max.poll.interval.ms (300s); the broker coordinator assumes the consumer thread is dead/stuck and kicks it out of the group.',
            isCorrect: true,
            explanation: 'max.poll.interval.ms is the maximum delay between consecutive poll() calls. Even if the background heartbeat thread is alive, exceeding this window triggers group eviction.',
          },
          {
            id: 'B',
            text: 'The operating system killed the process due to out-of-memory (OOM).',
            isCorrect: false,
            explanation: 'The question states the consumer group triggers a rebalance and pauses, not that the process exited.',
          },
          {
            id: 'C',
            text: 'session.timeout.ms must be set higher than max.poll.interval.ms.',
            isCorrect: false,
            explanation: 'session.timeout.ms is for background heartbeats (typically 10-45s), while max.poll.interval.ms is for application processing logic.',
          },
          {
            id: 'D',
            text: 'The topic has expired and deleted all partition logs.',
            isCorrect: false,
            explanation: 'Topic log retention does not evict consumer instances from group coordination.',
          },
        ],
        explanation: 'Heartbeats happen on a dedicated background thread (session.timeout.ms), but max.poll.interval.ms monitors the main record processing loop. Increase max.poll.interval.ms or reduce max.poll.records!',
        coachingTip: 'Separate heartbeat liveness from processing liveness: heartbeats prove the process is alive; poll() proves the application logic is progressing.',
      };
    }

    return {
      conceptTitle: 'Cooperative Sticky Rebalance vs Eager Rebalancing',
      difficulty: 'advanced',
      questionText: `Why does upgrading consumer groups from the legacy Eager Rebalance Protocol to the \`CooperativeStickyAssignor\` eliminate "stop-the-world" latency spikes during autoscaling events?`,
      options: [
        {
          id: 'A',
          text: 'Under Cooperative rebalancing, consumers only revoke the specific partitions being moved; all other unaffected partition streams continue processing without pausing.',
          isCorrect: true,
          explanation: 'Legacy eager rebalancing revokes 100% of partitions across all nodes. Cooperative rebalance performs incremental handoffs, maintaining data flow on un-reassigned partitions.',
        },
        {
          id: 'B',
          text: 'CooperativeStickyAssignor stores all message payloads in client RAM.',
          isCorrect: false,
          explanation: 'The assignor only computes partition-to-member mappings, not message storage.',
        },
        {
          id: 'C',
          text: 'It bypasses the group coordinator broker and uses peer-to-peer WebRTC connections.',
          isCorrect: false,
          explanation: 'Kafka group coordination still coordinates assignments through the broker group coordinator.',
        },
        {
          id: 'D',
          text: 'It automatically commits offsets every 1 microsecond.',
          isCorrect: false,
          explanation: 'Commit schedules are determined by enable.auto.commit and auto.commit.interval.ms.',
        },
      ],
      explanation: 'Cooperative rebalancing changes partition reassignment from a global stop-the-world pause to two fast incremental phases, keeping unaffected partitions flowing continuously.',
      coachingTip: 'Always switch to CooperativeStickyAssignor in modern Kafka. It turns catastrophic rebalance freezes into imperceptible incremental handoffs.',
    };
  }

  // 4. React Native Architecture & UI Thread Theme
  if (topLower.includes('react') || topLower.includes('mobile')) {
    if (subLower.includes('ui') || subLower.includes('fps') || subLower.includes('render') || subLower.includes('schedul')) {
      if (isReinforcement) {
        return {
          conceptTitle: 'FlashList Cell Recycling vs FlatList Mount Thrashing',
          difficulty: 'pro',
          questionText: `Let's reinforce 60/120 FPS mobile list rendering: Why does Shopify's \`FlashList\` eliminate blank white cells during fast scrolling compared to React Native's standard \`FlatList\`?`,
          options: [
            {
              id: 'A',
              text: 'FlashList recycles existing native view instances and rebinds data props in-place without unmounting/remounting React component trees on every scroll frame.',
              isCorrect: true,
              explanation: 'FlatList destroys off-screen views and mounts brand-new React components on scroll, causing GC churn and frame drops. FlashList reuses native view pools like RecyclerView/UICollectionView.',
            },
            {
              id: 'B',
              text: 'FlashList pre-renders 100,000 list items into a single 4GB bitmap image on startup.',
              isCorrect: false,
              explanation: 'Rendering all items upfront would immediately crash mobile memory.',
            },
            {
              id: 'C',
              text: 'FlashList disables touch scrolling velocity above 100 pixels per second.',
              isCorrect: false,
              explanation: 'FlashList preserves native scroll physics while optimizing cell recycling.',
            },
            {
              id: 'D',
              text: 'FlashList runs exclusively on remote cloud GPUs.',
              isCorrect: false,
              explanation: 'FlashList executes locally on the mobile device.',
            },
          ],
          explanation: 'View recycling eliminates expensive React mount/unmount lifecycles and native view allocation during high-velocity scrolling.',
          coachingTip: 'Specify accurate estimatedItemSize in FlashList and keep cell components memoized without inline object allocations!',
        };
      }

      if (conceptIndex === 1) {
        return {
          conceptTitle: '60 FPS Main Thread Scheduling & Bridge Congestion',
          difficulty: 'basic',
          questionText: `In a React Native application, what causes UI micro-stutters (frame drops below 60 FPS) when scrolling a complex feed with animations running simultaneously?`,
          options: [
            {
              id: 'A',
              text: 'Heavy JS event handlers executing synchronous computational work on the single JavaScript event loop, delaying the serialization and dispatch of layout updates to the native UI thread.',
              isCorrect: true,
              explanation: 'The JavaScript thread must yield within 16.6ms to maintain 60 FPS. Long-running JS operations block touch response and bridge updates.',
            },
            {
              id: 'B',
              text: 'The mobile device GPU has run out of registers to store strings.',
              isCorrect: false,
              explanation: 'GPUs rasterize textures and vertices, not application-level JS strings.',
            },
            {
              id: 'C',
              text: 'React Native automatically limits scrolling to 30 FPS on all Android devices.',
              isCorrect: false,
              explanation: 'React Native targets native 60/120Hz display refresh rates on all supported hardware.',
            },
            {
              id: 'D',
              text: 'The device battery temperature drops below 0 degrees Celsius.',
              isCorrect: false,
              explanation: 'Battery temperature does not explain JS thread scheduling bottlenecks.',
            },
          ],
          explanation: 'Offloading layout transitions to native driver animations or Worklets keeps 60 FPS silky smooth even when the JS thread is momentarily busy.',
          coachingTip: 'Always use useNativeDriver: true or Reanimated Worklets so gesture animations execute directly on the UI thread without crossing threads.',
        };
      }

      if (conceptIndex === 2) {
        return {
          conceptTitle: 'Reanimated UI Thread Worklets vs JS Thread Animations',
          difficulty: 'intermediate',
          questionText: `How do React Native Reanimated Worklets (\`'worklet'\` directive) guarantee zero-latency 120Hz gesture-driven animations even when the main JavaScript thread is blocked parsing a 5MB JSON response?`,
          options: [
            {
              id: 'A',
              text: 'Worklets are extracted and executed inside a dedicated secondary JavaScript VM running synchronously on the Native UI Thread, completely bypassing the main JS thread.',
              isCorrect: true,
              explanation: 'Reanimated spawns a lightweight JS runtime on the UI thread for worklets, allowing gesture frames to compute layout updates within the 8.33ms (120Hz) vsync budget.',
            },
            {
              id: 'B',
              text: 'Worklets terminate the network request whenever the user touches the screen.',
              isCorrect: false,
              explanation: 'Worklets run independently of network I/O on the main JS thread.',
            },
            {
              id: 'C',
              text: 'Worklets lower the screen resolution to 240p during animations.',
              isCorrect: false,
              explanation: 'Display resolution is unaffected by Reanimated worklets.',
            },
            {
              id: 'D',
              text: 'Worklets convert all React components into static HTML tables.',
              isCorrect: false,
              explanation: 'React Native renders native platform views (UIView / android.view.View), not HTML.',
            },
          ],
          explanation: 'By running SharedValues and worklet functions directly on the UI thread, gesture-driven animations never wait for the main JS event loop.',
          coachingTip: 'Use SharedValue instead of React useState for continuous gesture coordinates (x, y, scale) to avoid triggering 60 React re-renders per second!',
        };
      }

      return {
        conceptTitle: 'React 18 Concurrent Renderer & startTransition Priority Lanes',
        difficulty: 'advanced',
        questionText: `When rendering a high-frequency live search input alongside a 500-item filtered result tree in React Native New Architecture (Fabric), how does wrapping the filter state update in \`startTransition\` prevent input lag?`,
        options: [
          {
            id: 'A',
            text: 'Fabric schedules the transition in a low-priority interruptible lane, yielding to urgent keystroke updates so the text input remains immediately responsive.',
            isCorrect: true,
            explanation: 'Concurrent rendering in Fabric allows React to interrupt in-progress non-urgent tree reconciliation whenever a high-priority user input event arrives.',
          },
          {
            id: 'B',
            text: 'startTransition delays all state updates by a hardcoded 10-second timer.',
            isCorrect: false,
            explanation: 'Transitions begin immediately and only yield if urgent updates arrive.',
          },
          {
            id: 'C',
            text: 'startTransition offloads React component rendering to the device camera ISP.',
            isCorrect: false,
            explanation: 'Component reconciliation runs on the CPU via Hermes.',
          },
          {
            id: 'D',
            text: 'startTransition disables diffing and forces a full application restart.',
            isCorrect: false,
            explanation: 'It prioritizes fiber reconciliation lanes without restarting the app.',
          },
        ],
        explanation: 'Fabric unlocks React 18+ concurrent features (startTransition, useDeferredValue, Suspense) by replacing asynchronous batched shadow updates with synchronous C++ shadow tree cloning.',
        coachingTip: 'Keep text input state urgent, and wrap heavy derived list updates in startTransition() or useDeferredValue()!',
      };
    }

    if (subLower.includes('jsi') || subLower.includes('fabric') || subLower.includes('turbo')) {
      if (isReinforcement) {
        return {
          conceptTitle: 'Codegen Static Type Enforcement across JSI & TurboModules',
          difficulty: 'pro',
          questionText: `Let's solidify your New Architecture mental model: What is the architectural purpose of React Native's \`Codegen\` step when building TurboModules and Fabric native components?`,
          options: [
            {
              id: 'A',
              text: 'Codegen parses TypeScript/Flow specs at build time to generate C++, Objective-C++, and Java/JNI interface stubs, ensuring compile-time type safety and eliminating runtime reflection overhead across JSI.',
              isCorrect: true,
              explanation: 'Instead of dynamic runtime reflection over JSON, Codegen generates strongly-typed C++ JSI glue code directly from TypeScript specifications.',
            },
            {
              id: 'B',
              text: 'Codegen minifies PNG and JPEG assets into SVG vectors.',
              isCorrect: false,
              explanation: 'Codegen generates native C++/ObjC/Java binding code, not image assets.',
            },
            {
              id: 'C',
              text: 'Codegen converts JavaScript into Python scripts for iOS devices.',
              isCorrect: false,
              explanation: 'iOS executes Hermes bytecode and native Objective-C++/Swift.',
            },
            {
              id: 'D',
              text: 'Codegen is a runtime debugger that only runs in Chrome DevTools.',
              isCorrect: false,
              explanation: 'Codegen is a build-time static code generator.',
            },
          ],
          explanation: 'Codegen eliminates the runtime type-checking and reflection costs of the old NativeModules system by enforcing contracts at C++ compile time.',
          coachingTip: 'Define strict NativeModule TypeScript specs (`TurboModuleRegistry.getEnforcing`) so Codegen catches boundary mismatches at compile time!',
        };
      }

      if (conceptIndex === 1) {
        return {
          conceptTitle: 'JSI Direct Memory Invocation vs Legacy JSON Bridge',
          difficulty: 'basic',
          questionText: `How does the JavaScript Interface (JSI) in React Native's New Architecture eliminate the serialization bottleneck of the legacy architecture?`,
          options: [
            {
              id: 'A',
              text: 'JSI provides C++ host objects directly to the JavaScript runtime, allowing JS code to invoke native C++ methods synchronously in shared memory without JSON stringification.',
              isCorrect: true,
              explanation: 'The legacy bridge serialized all calls to asynchronous JSON strings across threads. JSI uses direct C++ pointers, eliminating serialization and enabling synchronous native calls.',
            },
            {
              id: 'B',
              text: 'JSI compiles all JavaScript into binary machine code ahead of time at build time only.',
              isCorrect: false,
              explanation: 'JSI is a runtime bridging interface that allows direct memory object references between C++ and Hermes/V8.',
            },
            {
              id: 'C',
              text: 'JSI disables native iOS Objective-C and Android Java layers completely.',
              isCorrect: false,
              explanation: 'Native platform layers remain; TurboModules interact with them via C++ JSI bindings.',
            },
            {
              id: 'D',
              text: 'JSI runs all native modules on a remote cloud server.',
              isCorrect: false,
              explanation: 'JSI is an on-device embedded bridging interface.',
            },
          ],
          explanation: 'JSI exposes C++ host objects to the JS engine via host object references. This unlocks zero-copy synchronous communication without JSON serialization overhead.',
          coachingTip: 'Think of the legacy bridge like two people mailing letters back and forth in JSON. JSI is both people sitting at the same table sharing the same memory notebook!',
        };
      }

      if (conceptIndex === 2) {
        return {
          conceptTitle: 'TurboModules Lazy Initialization vs Legacy Eager NativeModules',
          difficulty: 'intermediate',
          questionText: `How do TurboModules significantly reduce cold-start Time-To-Interactive (TTI) in large React Native applications with 80+ native modules?`,
          options: [
            {
              id: 'A',
              text: 'Legacy NativeModules eagerly instantiated all 80+ modules at app launch before JS could run; TurboModules lazily initialize each native module via JSI only when first invoked by JavaScript.',
              isCorrect: true,
              explanation: 'By deferring native module instantiation until first use, TurboModules shave hundreds of milliseconds off cold-start launch time.',
            },
            {
              id: 'B',
              text: 'TurboModules delete unused native modules from the app binary after installation.',
              isCorrect: false,
              explanation: 'App binaries are immutable on disk; TurboModules optimize runtime instantiation.',
            },
            {
              id: 'C',
              text: 'TurboModules force all native code to run inside a single WebView.',
              isCorrect: false,
              explanation: 'TurboModules invoke native C++/ObjC/Kotlin APIs directly via JSI.',
            },
            {
              id: 'D',
              text: 'TurboModules require the user to manually reboot their phone before launching the app.',
              isCorrect: false,
              explanation: 'Lazy loading happens transparently in milliseconds during runtime execution.',
            },
          ],
          explanation: 'Eager initialization of dozens of native modules (camera, bluetooth, geolocation, payments) on startup blocked legacy app launch. TurboModules load on-demand via JSI lookup.',
          coachingTip: 'Audit your startup path to ensure you do not accidentally import and invoke heavy TurboModules inside root index.js!',
        };
      }

      return {
        conceptTitle: 'Fabric C++ Immutable Shadow Tree & Synchronous Layout',
        difficulty: 'advanced',
        questionText: `Why does the Fabric renderer eliminate the "layout jump / visual flicker" bug that occurred in legacy React Native when measuring view dimensions to position tooltips or popovers?`,
        options: [
          {
            id: 'A',
            text: 'Fabric maintains an immutable C++ Shadow Tree shared across threads and runs Yoga layout synchronously via JSI during `useLayoutEffect`, committing the measured position in the exact same paint frame.',
            isCorrect: true,
            explanation: 'In legacy RN, onLayout was asynchronous across the JSON bridge, causing 1-2 frames of unpositioned flicker. Fabric enables synchronous Yoga layout reads and commits inside useLayoutEffect.',
          },
          {
            id: 'B',
            text: 'Fabric hides the entire screen for 500ms whenever a component mounts.',
            isCorrect: false,
            explanation: 'Hiding the screen would degrade UX; Fabric resolves layout synchronously within a single frame.',
          },
          {
            id: 'C',
            text: 'Fabric replaces Yoga Flexbox with fixed pixel coordinates only.',
            isCorrect: false,
            explanation: 'Fabric still uses the C++ Yoga Flexbox layout engine.',
          },
          {
            id: 'D',
            text: 'Fabric delegates layout measurement to an external HTTP microservice.',
            isCorrect: false,
            explanation: 'Layout calculation runs locally in C++ via Yoga.',
          },
        ],
        explanation: 'By sharing immutable C++ Shadow Nodes across the JS and UI threads, Fabric enables synchronous `useLayoutEffect` measurements without bridge round-trip delays.',
        coachingTip: 'In Fabric (New Architecture), use `useLayoutEffect` with synchronous `ref.current.measure()` for zero-flicker dynamic positioning!',
      };
    }
  }

  // 5. High-Scale Optimization & Performance Theme
  if (subLower.includes('scale') || subLower.includes('optimization') || subLower.includes('throughput') || subLower.includes('performance')) {
    if (isReinforcement) {
      return {
        conceptTitle: `Tail Latency Amplification & Head-of-Line Blocking in ${cleanSubtopic}`,
        difficulty: 'pro',
        questionText: `Let's reinforce high-scale performance engineering for "${cleanSubtopic}" in "${cleanTopic}": Why does a single slow request taking 200ms cause p99 latency across thousands of fast 1ms requests to spike when using a shared FIFO queue without concurrency partitioning?`,
        options: [
          {
            id: 'A',
            text: 'Head-of-Line (HoL) blocking stalls fast requests queued behind the slow operation, and fan-out tail latency amplification compounds p99 probability across downstream calls.',
            isCorrect: true,
            explanation: 'In shared queues or single-threaded loops, one slow task blocks all queued tasks behind it (Head-of-Line blocking). Separating fast/slow lanes and bounding work quanta eliminates HoL stalls.',
          },
          {
            id: 'B',
            text: 'The CPU clock speed permanently drops to 1 MHz after any 200ms request.',
            isCorrect: false,
            explanation: 'Modern CPUs dynamically boost clock frequency under load rather than locking at 1 MHz.',
          },
          {
            id: 'C',
            text: 'Network routers delete TCP packets whenever a response takes longer than 100ms.',
            isCorrect: false,
            explanation: 'Routers forward packets normally; the delay occurs inside application queueing layers.',
          },
          {
            id: 'D',
            text: 'FIFO queues reverse the byte order of all memory pointers.',
            isCorrect: false,
            explanation: 'Queue ordering affects scheduling latency, not memory endianness.',
          },
        ],
        explanation: 'Eliminating Head-of-Line blocking via workload isolation (separate fast/heavy queues), connection multiplexing, and hedged requests keeps p99 tail latencies tight.',
        coachingTip: 'Never mix heavy analytical queries or bulk exports on the same worker queue as real-time interactive user requests!',
      };
    }

    if (conceptIndex === 1) {
      return {
        conceptTitle: `High-Scale Production Optimization in ${cleanSubtopic}`,
        difficulty: 'basic',
        questionText: `When scaling "${cleanTopic}" to sustain 100,000 requests/sec with p99 latency guarantees under 15ms, which optimization delivers the highest reduction in OS context switching and I/O wait?`,
        options: [
          {
            id: 'A',
            text: 'Leveraging non-blocking epoll/kqueue event loops, batch I/O operations, connection pooling, and zero-copy data transfer (e.g. sendfile).',
            isCorrect: true,
            explanation: 'Non-blocking I/O event loops multiplex thousands of connections per worker thread, eliminating thread context-switching overhead and disk-to-socket memory copy cycles.',
          },
          {
            id: 'B',
            text: 'Spawning one dedicated OS thread per incoming network connection without bounds.',
            isCorrect: false,
            explanation: 'Thread-per-connection architectures cause severe thread contention, high memory overhead per thread stack, and catastrophic context-switching churn.',
          },
          {
            id: 'C',
            text: 'Disabling all caching layers and querying spinning hard drives directly.',
            isCorrect: false,
            explanation: 'Disk I/O without caching increases latency by orders of magnitude.',
          },
          {
            id: 'D',
            text: 'Compressing all network payloads with maximum level gzip compression on every micro-packet.',
            isCorrect: false,
            explanation: 'Max level gzip consumes excessive CPU cycles and increases serialization latency for micro-packets.',
          },
        ],
        explanation: 'Modern high-throughput engines rely on non-blocking event loops, kernel zero-copy transfers, and amortizing network and disk syscalls across batched requests.',
        coachingTip: 'The fastest I/O is the I/O you never execute. Use connection pooling, pagecache zero-copy, and smart batching to keep CPU caches hot.',
      };
    }

    if (conceptIndex === 2) {
      return {
        conceptTitle: `Amortizing Syscall Overhead via Adaptive Micro-Batching in ${cleanSubtopic}`,
        difficulty: 'intermediate',
        questionText: `In "${cleanSubtopic}" for "${cleanTopic}", why does coalescing individual writes into bounded micro-batches (e.g. flushing every 5ms or 64KB) increase throughput by 10x–50x over per-record synchronous flushes?`,
        options: [
          {
            id: 'A',
            text: 'It amortizes expensive user-to-kernel syscall transitions, TCP packet headers, and disk fsync commits across hundreds of records while enabling higher compression ratios.',
            isCorrect: true,
            explanation: 'Each individual syscall and fsync incurs hardware interrupt and context-switch overhead. Micro-batching turns 10,000 tiny random I/Os into a single sequential vector write.',
          },
          {
            id: 'B',
            text: 'Micro-batching skips writing data to the network or disk altogether.',
            isCorrect: false,
            explanation: 'All records are still durably transmitted; they are simply grouped into contiguous frames.',
          },
          {
            id: 'C',
            text: 'Micro-batching forces clients to wait 24 hours before receiving any response.',
            isCorrect: false,
            explanation: 'Adaptive micro-batching uses tight bounds (e.g. 2–10ms linger window) that remain imperceptible to clients.',
          },
          {
            id: 'D',
            text: 'Micro-batching disables TCP checksum verification in the NIC hardware.',
            isCorrect: false,
            explanation: 'Transport checksums remain fully intact.',
          },
        ],
        explanation: 'Sequential batched I/O aligns with OS page-cache blocks, NVMe flash pages, and TCP MTU frames, unlocking massive throughput gains.',
        coachingTip: 'Always bound micro-batches by BOTH byte size (e.g. 64KB) AND time window (e.g. 5ms) so low-traffic periods never experience high latency!',
      };
    }

    return {
      conceptTitle: `Lock-Free Partitioning & Cache-Line Contention Elimination in ${cleanSubtopic}`,
      difficulty: 'advanced',
      questionText: `When scaling "${cleanSubtopic}" across a 64-core server in "${cleanTopic}", throughput plateaus at 16 cores due to CPU L1/L2 cache-line bouncing ("false sharing") and mutex contention. What architectural pattern restores linear multi-core scalability?`,
      options: [
        {
          id: 'A',
          text: 'Adopting a shared-nothing, shard-per-core architecture where each CPU core owns partitioned state exclusively and communicates via lock-free ring buffers or cache-line-aligned (64-byte padded) atomics.',
          isCorrect: true,
          explanation: 'Eliminating cross-core mutex locks and padding concurrent counters to 64-byte CPU cache lines prevents MESI cache invalidation storms across cores.',
        },
        {
          id: 'B',
          text: 'Replacing fine-grained locks with a single global process-wide mutex lock.',
          isCorrect: false,
          explanation: 'A global lock serializes all 64 cores into single-threaded execution (Amdahl’s Law bottleneck).',
        },
        {
          id: 'C',
          text: 'Disabling CPU L1, L2, and L3 hardware caches in the BIOS.',
          isCorrect: false,
          explanation: 'Disabling CPU caches degrades instruction execution speed by 100x.',
        },
        {
          id: 'D',
          text: 'Running 10,000 threads per core with continuous spinlocks.',
          isCorrect: false,
          explanation: 'Excessive spinlocking threads saturate CPU cores with wasted cycles and scheduler thrashing.',
        },
      ],
      explanation: 'By Amdahl’s Law and Universal Scalability Law (USL), cross-core coherence chatter causes retrograde throughput at high core counts. Shard-per-core designs achieve near-linear scaling.',
      coachingTip: 'Remember the Universal Scalability Law: Contention flattens throughput, while Coherence delay (cache-line bouncing) actually makes throughput DROP as you add more cores!',
    };
  }

  // 6. Concurrency, Failure Modes & Bottlenecks Theme
  if (subLower.includes('failure') || subLower.includes('bottleneck') || subLower.includes('edge case') || subLower.includes('concurrency')) {
    if (isReinforcement) {
      return {
        conceptTitle: `Exponential Backoff with Full Jitter & Retry Storm Prevention in ${cleanSubtopic}`,
        difficulty: 'pro',
        questionText: `Let's solidify resilience engineering in "${cleanSubtopic}": When a downstream cluster recovers from a 30-second brownout, why do fixed-interval retries (or un-jittered exponential backoff) from 10,000 clients immediately crash the recovering service again?`,
        options: [
          {
            id: 'A',
            text: 'Clients remain synchronized in lockstep waves ("thundering herd"), hammering the recovering node simultaneously; adding Full Jitter (`random(0, min(cap, base * 2^attempt))`) desynchronizes load uniformly over time.',
            isCorrect: true,
            explanation: 'Without randomness (jitter), exponential backoff merely spaces out synchronized traffic spikes (at 1s, 2s, 4s, 8s). Full jitter spreads client retries evenly across the entire backoff interval.',
          },
          {
            id: 'B',
            text: 'Exponential multiplication overflows 64-bit floating-point registers on the first retry.',
            isCorrect: false,
            explanation: 'Capped backoff intervals stay well within standard integer ranges.',
          },
          {
            id: 'C',
            text: 'Fixed retries permanently corrupt TLS certificates on the load balancer.',
            isCorrect: false,
            explanation: 'Retries create traffic volume spikes, not cryptographic certificate corruption.',
          },
          {
            id: 'D',
            text: 'Servers reject any request that arrives on an even-numbered second.',
            isCorrect: false,
            explanation: 'Servers fail due to synchronized concurrency saturation, not timestamp parity.',
          },
        ],
        explanation: 'AWS architecture benchmarks prove that Exponential Backoff with Full Jitter reduces total server work and completion time by over 60% during contention recovery compared to un-jittered backoff.',
        coachingTip: 'Combine Exponential Backoff + Full Jitter with a client-side Retry Budget (e.g. max 10% of requests can be retries) to prevent retry amplification!',
      };
    }

    if (conceptIndex === 1) {
      return {
        conceptTitle: `Failure Modes & Graceful Degradation in ${cleanSubtopic}`,
        difficulty: 'basic',
        questionText: `During a sudden upstream dependency slowdown in "${cleanTopic}", what mechanism prevents downstream thread exhaustion and cascading system collapse?`,
        options: [
          {
            id: 'A',
            text: 'Deploying a Circuit Breaker with bounded concurrency limits, explicit fallback defaults, and aggressive timeout thresholds.',
            isCorrect: true,
            explanation: 'When dependency latencies spike, circuit breakers trip open immediately, rejecting requests fast without occupying thread pools or connection sockets.',
          },
          {
            id: 'B',
            text: 'Extending all network timeouts to infinite so no requests ever fail.',
            isCorrect: false,
            explanation: 'Infinite timeouts tie up threads indefinitely, causing thread pool starvation and bringing down the entire application.',
          },
          {
            id: 'C',
            text: 'Immediately executing 10 tight retry attempts for every failed request without backoff.',
            isCorrect: false,
            explanation: 'Aggressive retries create a thundering herd that amplifies pressure and ensures total dependency failure.',
          },
          {
            id: 'D',
            text: 'Disabling all error logging and health check endpoints.',
            isCorrect: false,
            explanation: 'Hiding errors blinds operations and prevents automated recovery.',
          },
        ],
        explanation: 'Fail fast, shed load, and isolate blast radius. Circuit breakers and bounded queues ensure that degraded dependencies do not drag down healthy upstream services.',
        coachingTip: 'Always fail fast! A quick 503 error is 1,000x better than hanging for 60 seconds and hoarding threads until your server runs out of memory.',
      };
    }

    if (conceptIndex === 2) {
      return {
        conceptTitle: `Bulkhead Isolation & Bounded Queue Load Shedding in ${cleanSubtopic}`,
        difficulty: 'intermediate',
        questionText: `In "${cleanSubtopic}", a microservice calls three downstream dependencies (Auth, Billing, Recommendations). If Recommendations slows down by 50x, how does the Bulkhead Pattern keep Auth and Billing 100% healthy?`,
        options: [
          {
            id: 'A',
            text: 'By partitioning connection pools, worker queues, and semaphores into isolated per-dependency compartments so a saturated Recommendations pool can never consume threads reserved for Auth or Billing.',
            isCorrect: true,
            explanation: 'Like watertight compartments in a ship hull, bulkheads ensure that resource exhaustion in one downstream client is strictly contained to its dedicated pool.',
          },
          {
            id: 'B',
            text: 'By merging all three services into a single shared unbounded thread pool.',
            isCorrect: false,
            explanation: 'A shared pool allows the slowest dependency to monopolize 100% of threads, starving all other dependencies.',
          },
          {
            id: 'C',
            text: 'By shutting down the entire API gateway whenever Recommendations returns an error.',
            isCorrect: false,
            explanation: 'Shutting down the gateway turns a partial non-critical degradation into a total outage.',
          },
          {
            id: 'D',
            text: 'By storing Billing data inside client browser localStorage.',
            isCorrect: false,
            explanation: 'Client storage does not solve server-side thread pool saturation.',
          },
        ],
        explanation: 'Without bulkheads, any single slow dependency will drain the shared HTTP agent or worker pool and take down the entire service. Isolate pools per upstream dependency.',
        coachingTip: 'Pair Bulkheads with LIFO queue shedding and CoDel (Controlled Delay) so stale requests waiting longer than the client timeout are dropped immediately!',
      };
    }

    return {
      conceptTitle: `Deadlock Prevention, Lock Ordering & Split-Brain Recovery in ${cleanSubtopic}`,
      difficulty: 'advanced',
      questionText: `When two concurrent workers in "${cleanSubtopic}" acquire locks on resources $R_1$ and $R_2$ in opposite orders ($T_A: R_1 \\rightarrow R_2$ vs $T_B: R_2 \\rightarrow R_1$), a circular wait deadlock occurs. Which architectural invariant deterministically prevents this deadlock?`,
      options: [
        {
          id: 'A',
          text: 'Enforcing a strict global total ordering on lock acquisition (e.g., always sorting resource IDs lexicographically before locking) combined with bounded lock lease timeouts.',
          isCorrect: true,
          explanation: 'By Coffman’s deadlock conditions, enforcing a strict global acquisition order makes a circular wait cycle mathematically impossible.',
        },
        {
          id: 'B',
          text: 'Increasing thread priority to real-time so locks are acquired faster.',
          isCorrect: false,
          explanation: 'Faster execution actually increases the probability of hitting the race window that triggers the circular wait.',
        },
        {
          id: 'C',
          text: 'Catching exceptions and ignoring failed unlock calls.',
          isCorrect: false,
          explanation: 'Swallowing unlock errors leaves locks permanently orphaned, worsening deadlocks.',
        },
        {
          id: 'D',
          text: 'Adding a 500ms sleep between acquiring R1 and R2.',
          isCorrect: false,
          explanation: 'Sleeping while holding R1 widens the window during which another worker acquires R2, guaranteeing a deadlock.',
        },
      ],
      explanation: 'Deadlocks require four simultaneous Coffman conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait). Deterministic lock ordering eliminates Circular Wait completely.',
      coachingTip: 'Whenever locking multiple entities (e.g. transferring funds between Account A and Account B), always lock `min(idA, idB)` first and `max(idA, idB)` second!',
    };
  }

  // 7. Staff-Level Trade-offs & Architecture Theme
  if (subLower.includes('staff') || subLower.includes('trade-off') || subLower.includes('leadership')) {
    if (isReinforcement) {
      return {
        conceptTitle: `Staff-Level Reliability Governance & Error Budgets: ${cleanSubtopic}`,
        difficulty: 'pro',
        questionText: `Let's reinforce Staff-level architectural governance for "${cleanTopic}": When a service exhausts its monthly 99.95% SLO Error Budget (21.6 minutes of downtime) due to rapid feature deployments, what policy balances innovation velocity with production stability?`,
        options: [
          {
            id: 'A',
            text: 'Enforce an automated Error Budget policy: freeze non-urgent feature rollouts and redirect engineering capacity to resilience, automated canary rollback gates, and P0 postmortem remediation until the rolling SLO recovers.',
            isCorrect: true,
            explanation: 'Error budgets convert reliability conflicts between Product and SRE into an objective data-driven control loop.',
          },
          {
            id: 'B',
            text: 'Delete all monitoring alerts so future outages are not recorded against the SLA.',
            isCorrect: false,
            explanation: 'Hiding metrics violates engineering ethics and causes customer-facing outages to go undetected.',
          },
          {
            id: 'C',
            text: 'Permanently ban all code deployments for the next 5 years.',
            isCorrect: false,
            explanation: 'Freezing all changes indefinitely halts business value and prevents deploying bug fixes.',
          },
          {
            id: 'D',
            text: 'Deploy features directly to production without running unit or integration tests.',
            isCorrect: false,
            explanation: 'Skipping verification accelerates error budget exhaustion.',
          },
        ],
        explanation: 'At the Staff+ level, architecture includes socio-technical feedback loops: SLOs, error budgets, progressive canary rollouts, and blameless postmortems.',
        coachingTip: 'Frame Staff trade-offs around measurable business SLAs (RPO, RTO, p99 latency, and Error Budgets) rather than subjective preferences.',
      };
    }

    if (conceptIndex === 1) {
      return {
        conceptTitle: `Staff-Level Architectural Trade-offs: ${cleanSubtopic}`,
        difficulty: 'basic',
        questionText: `As a Staff Architect evaluating a mission-critical persistence layer for "${cleanTopic}", how do you evaluate the fundamental trade-off between Synchronous Multi-Region Replication vs Asynchronous Replication?`,
        options: [
          {
            id: 'A',
            text: 'Synchronous replication guarantees Recovery Point Objective (RPO) = 0 (zero data loss) across region failures, but forces write latencies to absorb cross-region speed-of-light network round trips (e.g. 50-80ms p99 write penalty).',
            isCorrect: true,
            explanation: 'Physics dictates cross-region packet latency. Synchronous replication guarantees zero data loss (RPO=0) at the expense of write latency, whereas asynchronous replication offers low local latency with the risk of loss during ungraceful failover.',
          },
          {
            id: 'B',
            text: 'Synchronous replication executes faster than local memory cache reads.',
            isCorrect: false,
            explanation: 'Cross-region network transit is limited by the speed of light in fiber and is thousands of times slower than local RAM.',
          },
          {
            id: 'C',
            text: 'Asynchronous replication guarantees zero data loss under any power outage.',
            isCorrect: false,
            explanation: 'If the primary datacenter suffers sudden total failure before replicating pending WAL buffers, those records are lost.',
          },
          {
            id: 'D',
            text: 'Database sharding eliminates all speed-of-light networking constraints.',
            isCorrect: false,
            explanation: 'Sharding distributes data volume across nodes, but cross-region consensus still obeys networking physics.',
          },
        ],
        explanation: 'Staff engineering decisions are defined by navigating fundamental trade-offs: RPO=0 zero data loss requires synchronous quorum at the cost of cross-region latency.',
        coachingTip: 'There are no silver bullets in distributed systems—only carefully chosen trade-offs aligned with real business SLAs and physics.',
      };
    }

    if (conceptIndex === 2) {
      return {
        conceptTitle: `Cell-Based Architecture & Blast Radius Containment: ${cleanSubtopic}`,
        difficulty: 'intermediate',
        questionText: `To prevent a poison-pill request or noisy enterprise tenant from taking down a global multi-tenant deployment of "${cleanTopic}", why do Staff Architects partition infrastructure into independent "Cells" (Cell-Based Architecture)?`,
        options: [
          {
            id: 'A',
            text: 'Each Cell is a self-contained, independently deployable stack serving a bounded subset of tenants (e.g. 5% of traffic) with zero shared state across cells, capping the maximum blast radius of any failure.',
            isCorrect: true,
            explanation: 'In a monolithic global cluster, a control-plane bug or retry storm impacts 100% of customers. Cell isolation caps the worst-case failure to a single cell and enables cell-by-cell canary rollouts.',
          },
          {
            id: 'B',
            text: 'Cell-based architecture puts all customer databases onto a single shared SQLite file.',
            isCorrect: false,
            explanation: 'Sharing a single database file creates a single point of failure with a 100% blast radius.',
          },
          {
            id: 'C',
            text: 'Cell-based architecture requires customers to host their own physical routers.',
            isCorrect: false,
            explanation: 'A thin stateless cell router directs tenant traffic transparently in the cloud.',
          },
          {
            id: 'D',
            text: 'Cells eliminate the need for authentication or authorization.',
            isCorrect: false,
            explanation: 'Security and tenant isolation remain mandatory within every cell.',
          },
        ],
        explanation: 'Cell-based architecture (used by AWS, Slack, and Stripe) bounds maximum scale per cluster and guarantees that even a catastrophic cluster-wide failure only affects a small fraction of tenants.',
        coachingTip: 'Combine Cell-Based Architecture with Shuffle Sharding to reduce noisy-neighbor collision probability by orders of magnitude!',
      };
    }

    return {
      conceptTitle: `Zero-Downtime Expand-and-Contract Migrations: ${cleanSubtopic}`,
      difficulty: 'advanced',
      questionText: `When evolving a critical data schema or RPC contract in "${cleanTopic}" across 200 live production instances without downtime, why must engineers follow the "Expand and Contract" (Parallel Change) pattern?`,
      options: [
        {
          id: 'A',
          text: 'During rolling deployments, old (v1) and new (v2) code versions run concurrently; Expand-and-Contract first adds backward-compatible dual-write/read support before deprecating legacy fields in a later release.',
          isCorrect: true,
          explanation: 'Renaming or dropping a column/field in a single deployment breaks active v1 instances immediately. Expanding first, migrating readers/backfilling, and contracting last guarantees zero-downtime compatibility.',
        },
        {
          id: 'B',
          text: 'Taking a 4-hour maintenance window every afternoon is required by TCP/IP.',
          isCorrect: false,
          explanation: 'Modern cloud systems achieve continuous zero-downtime deployments via backward/forward compatibility.',
        },
        {
          id: 'C',
          text: 'Dropping and recreating production tables on every git commit is safe.',
          isCorrect: false,
          explanation: 'Dropping production tables destroys live customer data.',
        },
        {
          id: 'D',
          text: 'All 200 servers can be updated simultaneously in 0 nanoseconds without network skew.',
          isCorrect: false,
          explanation: 'Distributed deployments always have a mixed-version window where v1 and v2 coexist.',
        },
      ],
      explanation: 'Zero-downtime evolution requires 4 phases: 1) Expand schema (nullable/additive), 2) Dual-write v1 + v2 and backfill historical records, 3) Switch reads to v2, 4) Contract (remove v1 code and columns).',
      coachingTip: 'Never make a breaking schema or API change in a single step—always ensure version N is compatible with version N-1!',
    };
  }

  // 8. General Dynamic Procedural Fallback Tailored to Subtopic & Concept
  if (isReinforcement) {
    return {
      conceptTitle: `Reinforcement Drill: ${cleanSubtopic}`,
      difficulty: 'pro',
      questionText: `Let's solidify your mental model for "${cleanSubtopic}" in "${cleanTopic}": When diagnosing unexpected data inconsistencies or performance regressions under load, which diagnostic strategy reliably isolates the root cause?`,
      options: [
        {
          id: 'A',
          text: 'Analyzing distributed trace spans, correlating p99 latency spikes with thread lock contention, and validating consistency invariants against the commit log.',
          isCorrect: true,
          explanation: `Correlating high-percentile latency (p99/p99.9) and trace waterfalls with atomic commit logs directly exposes where execution stalls occur in ${cleanSubtopic}.`,
        },
        {
          id: 'B',
          text: 'Disabling telemetry, metrics, and trace headers to minimize CPU cycles.',
          isCorrect: false,
          explanation: 'Disabling telemetry blinds observability and makes diagnosis impossible.',
        },
        {
          id: 'C',
          text: 'Assuming all network operations and thread context switches complete with zero latency.',
          isCorrect: false,
          explanation: 'Ignoring real-world latency variance leads to brittle, deadlock-prone systems.',
        },
        {
          id: 'D',
          text: 'Permanently increasing timeouts on all services to 15 minutes.',
          isCorrect: false,
          explanation: 'Excessive timeouts exhaust thread pools and convert isolated slowness into total cascading outages.',
        },
      ],
      explanation: `Robust engineering in ${cleanSubtopic} relies on high-resolution observability, structured correlation IDs, and understanding high-percentile latency distributions.`,
      coachingTip: 'Never optimize based on average (p50) latency alone. The p99 latency tells you what your most active production users are experiencing.',
    };
  }

  if (conceptIndex === 1) {
    return {
      conceptTitle: `Core Primitives & Mental Models of ${cleanSubtopic}`,
      difficulty: 'basic',
      questionText: `When designing or evaluating "${cleanSubtopic}" in "${cleanTopic}", what is its fundamental architectural role and primary invariant guarantee?`,
      options: [
        {
          id: 'A',
          text: `Establishing decoupled, deterministic boundaries for state and execution, preventing unbounded resource consumption while ensuring clear contracts.`,
          isCorrect: true,
          explanation: `At its foundation, ${cleanSubtopic} establishes clear operational contracts and prevents resource contention across decoupled system layers.`,
        },
        {
          id: 'B',
          text: `Replacing all durable persistence with volatile local global variables.`,
          isCorrect: false,
          explanation: `Volatile memory without durable invariants leads to immediate data loss upon process termination.`,
        },
        {
          id: 'C',
          text: `Executing all operational logic synchronously within client browser cookies.`,
          isCorrect: false,
          explanation: `Browser cookies are limited in size (4KB) and cannot execute application architecture logic.`,
        },
        {
          id: 'D',
          text: `Eliminating the need to handle edge cases or concurrent access.`,
          isCorrect: false,
          explanation: `Concurrency control and error resilience are essential across all production architectures.`,
        },
      ],
      explanation: `Mastering foundational primitives in ${cleanSubtopic} establishes the mental framework required to understand higher-level failure modes and production optimizations.`,
      coachingTip: 'Always master the core architectural invariants before optimizing low-level configurations or syntax.',
    };
  }

  if (conceptIndex === 2) {
    return {
      conceptTitle: `Operational Mechanics & Execution Lifecycle in ${cleanSubtopic}`,
      difficulty: 'intermediate',
      questionText: `In production environments, how does "${cleanSubtopic}" coordinate internal execution flow and manage resource transitions safely under concurrent load?`,
      options: [
        {
          id: 'A',
          text: `Through structured state transitions, bounded worker pools, and explicit lifecycle stages that guard against race conditions and resource leaks.`,
          isCorrect: true,
          explanation: `Explicit lifecycle stages and bounded resource pools ensure that ${cleanSubtopic} remains stable and deterministic even under high concurrency.`,
        },
        {
          id: 'B',
          text: `By allowing uncoordinated background threads to mutate shared memory without synchronization.`,
          isCorrect: false,
          explanation: `Uncoordinated mutations cause severe data corruption, race conditions, and memory leaks.`,
        },
        {
          id: 'C',
          text: `By rebooting the physical host server after every client invocation.`,
          isCorrect: false,
          explanation: `Rebooting servers per request destroys performance and makes connection reuse impossible.`,
        },
        {
          id: 'D',
          text: `By completely disabling garbage collection and operating system virtual memory.`,
          isCorrect: false,
          explanation: `Disabling memory management causes immediate hardware exhaustion and kernel panics.`,
        },
      ],
      explanation: `Deterministic execution in ${cleanSubtopic} depends on structured concurrency, bounded buffers, and clean lifecycle management.`,
      coachingTip: 'Always map out the lifecycle from initialization to teardown to avoid silent connection and memory leaks.',
    };
  }

  // Concept 3: ADVANCED
  return {
    conceptTitle: `High-Load Edge Cases & Resilience in ${cleanSubtopic}`,
    difficulty: 'advanced',
    questionText: `When operating "${cleanSubtopic}" under sudden 10x traffic spikes, which pattern defends against cascading failures and ensures continuous service availability?`,
    options: [
      {
        id: 'A',
        text: `Enforcing backpressure, bounded request queues, token-bucket rate limiting, and shedding non-essential background load.`,
        isCorrect: true,
        explanation: `Bounded queues and backpressure signal upstream producers to throttle down, preventing memory exhaustion and preserving critical SLA commitments.`,
      },
      {
        id: 'B',
        text: `Executing tight unthrottled retry loops without jitter on every single transient failure.`,
        isCorrect: false,
        explanation: `Tight retry loops create thundering herd stampedes that amplify downstream outages.`,
      },
      {
        id: 'C',
        text: `Hardcoding all response HTTP codes to 200 OK regardless of backend exceptions.`,
        isCorrect: false,
        explanation: `Faking success codes blinds automated failover systems and confuses clients.`,
      },
      {
        id: 'D',
        text: `Directing all production traffic to an unindexed temporary table.`,
        isCorrect: false,
        explanation: `Unindexed tables cause massive full scans and immediate database saturation.`,
      },
    ],
    explanation: `Resilient architectures in ${cleanSubtopic} enforce backpressure, bounded buffers, and shed load gracefully to ensure core services never collapse.`,
    coachingTip: 'Always implement exponential backoff with full jitter on retries to de-synchronize retry waves and protect recovering systems.',
  };
}

/**
 * Returns a tailored, concept-specific QBL question.
 * Dynamically routes to subtopic-specific synthesis to ensure
 * every concept across all subtopics receives distinct, deep questions.
 */
export function getCatalogQuestion(
  topicName: string,
  subtopicTitle: string,
  conceptIndex: number, // 1, 2, or 3+
  isReinforcement: boolean,
  previousMistake?: string,
  existingQuestions?: string[]
): QBLQuestion {
  const normTopic = topicName.toLowerCase();
  const normSub = subtopicTitle.toLowerCase();

  // Route Node.js subjects directly to the rich NodeJSDomain question bank
  if (
    normTopic.includes('node.js') ||
    normTopic.includes('nodejs') ||
    normTopic.includes('libuv') ||
    normTopic === 'node' ||
    normSub.includes('libuv') ||
    normSub.includes('nexttick') ||
    normSub.includes('worker_threads')
  ) {
    const nodePartial = getNodeJSQuestion(conceptIndex, {
      subjectTitle: topicName,
      subtopicTitle,
      isReinforcement,
      existingQuestions,
    });
    return {
      id: nodePartial.id || `q_node_${Date.now()}_${conceptIndex}`,
      conceptTitle: nodePartial.conceptTitle || subtopicTitle,
      conceptIndex,
      questionText: nodePartial.questionText || '',
      options: nodePartial.options || [],
      explanation: nodePartial.explanation || '',
      coachingTip: nodePartial.coachingTip,
      isReinforcement,
      difficulty: nodePartial.difficulty || (isReinforcement ? 'pro' : conceptIndex === 3 ? 'advanced' : conceptIndex === 2 ? 'intermediate' : 'basic'),
      cognitiveLevel: nodePartial.cognitiveLevel,
      questionType: nodePartial.questionType,
      expectedAnswer: nodePartial.expectedAnswer,
      hints: nodePartial.hints,
      sourceReference: nodePartial.sourceReference,
      subject: nodePartial.subject,
      chapter: nodePartial.chapter,
      topic: nodePartial.topic,
      subtopic: nodePartial.subtopic,
    };
  }

  let matchedTrackKey: string | null = null;

  for (const trackKey of Object.keys(TRACK_QUESTIONS)) {
    if (normTopic.includes(trackKey) || trackKey.includes(normTopic)) {
      matchedTrackKey = trackKey;
      break;
    }
  }

  // Only use the static track question bank if the subtopic is specifically about the track's first subtopic / core concepts!
  const isSubtopic1 =
    normSub.includes('fundamental') ||
    normSub.includes('core') ||
    normSub.includes('primitive') ||
    normSub.includes('topics, partitions') ||
    normSub.includes('table scan') ||
    normSub.includes('new architecture') ||
    normSub.includes('sub_1') ||
    normSub === 'core fundamentals' ||
    normSub.includes('distributed locking');

  let template: QuestionTemplate;

  if (matchedTrackKey && isSubtopic1) {
    const bank = TRACK_QUESTIONS[matchedTrackKey];
    if (isReinforcement) {
      template = bank.reinforcement;
    } else {
      template = bank.concepts[conceptIndex] || bank.concepts[1];
    }
  } else {
    // Generate high-grade procedural question tailored to this specific subtopic & concept
    template = buildProceduralQuestion(topicName, subtopicTitle, conceptIndex, isReinforcement, previousMistake);
  }

  // Ensure zero duplicate questions if existingQuestions is provided
  if (existingQuestions && existingQuestions.length > 0) {
    const existingSet = new Set(existingQuestions.map(q => q.trim()));
    if (existingSet.has(template.questionText.trim())) {
      for (const altConcept of [1, 2, 3]) {
        const candidate = buildProceduralQuestion(topicName, subtopicTitle, altConcept, !isReinforcement, previousMistake);
        if (!existingSet.has(candidate.questionText.trim())) {
          template = candidate;
          break;
        }
      }
    }
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
