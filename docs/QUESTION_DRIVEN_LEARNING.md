# Question-Driven Learning (QBL) Architecture & Implementation Guide

> **Intervity v1 Release Core:** Text-first, 100% on-device active-recall coaching engine powered by offline LLM reasoning, adaptive mascot expressions, and zero-data-egress SQLite persistence.

---

## 1. Overview & Pedagogical Philosophy

Traditional learning tools rely heavily on passive content consumption (reading documentation, watching lectures, or skimming articles). **Question-Driven Learning (QBL)** reverses this paradigm by anchoring mastery in **active retrieval practice**, **cognitive dissonance resolution**, and **immediate architectural autopsy**.

Instead of reading about how a database handles write-ahead logs, candidates are placed in an architectural dilemma:
- They must evaluate four concrete trade-offs.
- When an option is chosen, the engine immediately explains *why* the option was flawed or why it succeeded in production environments.
- Sub-topics are strictly gated: candidates must achieve **100% concept mastery** before moving forward.

```
Candidate Chooses Option
          │
          ├──> [Correct]: Validates production mental model + Awards 25 XP + Advances concept counter
          │
          └──> [Incorrect]: Explains failure mode + Reveals correct pattern rationale + Queues targeted reinforcement drill
```

---

## 2. Complete QBL Lifecycle

### Step 1: Session Initialization & Welcome Screen
On app launch, Teddy greets the candidate and evaluates whether an active session exists in SQLite:
- If a session is in progress, Teddy presents a **Continue Where You Left Off** hero banner displaying current skill completion percentage, topic name, and sub-topic count.
- Below the resume banner, candidates can choose from **Featured Masterclass Tracks** or type any custom topic into the search bar.

### Step 2: Autonomous Sub-topic Planning
When a new topic is initiated (e.g. `SQL Indexing & Sharding` or an arbitrary string like `Docker & Kubernetes`):
- `QBLEngine.planSubtopics(...)` queries the offline LLM engine (`MiniCPM5-2B` via `llama.rn` or offline catalog fallback).
- A minimum of **5 structured sub-topics** are synthesized in JSON, covering:
  1. *Core Fundamentals & Mental Models*
  2. *Internal Mechanisms & Engine Architecture*
  3. *Failure Modes, Edge Cases & Bottlenecks*
  4. *High-Scale Production Optimizations*
  5. *Staff-Level Architectural Trade-offs & Leadership*
- Sub-topic 1 is marked `IN_PROGRESS`, while subsequent sub-topics remain `PENDING`.

### Step 3: Progressive Concept Presentation (One-by-One Flow)
Each sub-topic requires mastering **3 core concepts**:
- `QBLEngine.generateQuestion(...)` generates a rigorous multiple-choice challenge with exactly 4 options (`A`, `B`, `C`, `D`).
- Exactly one option is marked `isCorrect = true`.
- Every option contains an architectural explanation detailing *why* that choice is either valid or problematic in production.
- To prevent cognitive fatigue and UI clutter, only **one active question** is presented at a time with smooth vertical clearance.

### Step 4: Instant Diagnostics & Mistake Autopsy
When the candidate selects an option:
- **Correct Selection**:
  - Teddy triggers the `celebrating` emotion (`🎉`).
  - Awards **+25 XP** to candidate progression.
  - Concept mastery increments (+33% per concept).
  - Presents a clear green diagnostic card with the core takeaway and a button to advance to the next concept.
- **Incorrect Selection**:
  - Teddy triggers the `puzzled` emotion (`🤔`).
  - Awards **+5 Learning XP** (reinforcing psychological safety and learning from mistakes).
  - Details exactly why the chosen option failed in practice.
  - Highlights what the correct option is and the architectural rationale behind it.
  - Automatically queues a targeted **reinforcement drill** to re-test the underlying principle from a different angle before permitting advancement.

### Step 5: 100% Mastery Gating
- A sub-topic is only completed when all 3 concepts (plus any needed reinforcement drills) are mastered.
- When 100% is reached:
  - Sub-topic status transitions from `IN_PROGRESS` to `COMPLETED`.
  - The next sub-topic in the roadmap unlocks and transitions to `IN_PROGRESS`.
  - Overall skill mastery percentage updates on the dashboard HUD.

### Step 6: Local SQLite Persistence
- Sessions (`QBLSkillSession`) and every candidate turn (`QBLSessionTurn`) are saved to local SQLite tables (`qbl_skill_sessions` and `qbl_session_turns`).
- Zero data leaves the mobile device. Sessions can be resumed seamlessly at any point.

---

## 3. Animated Companion (Teddy) Orchestration

Teddy provides friendly emotional support and non-intrusive coaching throughout the QBL flow:

| Lifecycle State | Teddy Emotion State | Visual Behavior |
| :--- | :--- | :--- |
| **LLM Output Generating** | `speaking` | Animated talking mouth (`Talk` state) while tokens stream. |
| **Awaiting User Answer** | `neutral` / `idle` | Attentive listening pose (`Mentor Ready` status pill). |
| **Correct Answer Evaluated**| `celebrating` | Excited smile and celebration animation (`🎉 Spot on!`). |
| **Mistake / Trap Evaluated** | `puzzled` | Thoughtful diagnostic head tilt (`🤔 Diagnostics`). |

> **Strict Animation Rule:** Teddy's talking animation is strictly tied to active LLM token generation and audio playback. During question display or static reading, Teddy remains calm and attentive (`Mentor Ready`).

---

## 4. Question Catalog & Zero-Duplicate Guarantee

To guarantee high pedagogical quality in both online and offline/unweighted environments, Intervity includes [`QBLQuestionCatalog.ts`](../src/core/qbl/QBLQuestionCatalog.ts):

### Masterclass Tracks Covered:
1. **SQL Indexing & Sharding**:
   - *Concept 1*: B+Tree vs Heap Access Paths & Sequential Scan Thresholds.
   - *Concept 2*: Write-Ahead Logging (WAL) & Fsync Group Commits.
   - *Concept 3*: Horizontal Sharding Keys & Write Hot-Spotting.
   - *Reinforcement*: Composite Indexes & Leftmost Prefix Rule.
2. **Kafka & Event Streaming**:
   - *Concept 1*: In-Sync Replicas (ISR), `acks=all` & Leader Failover.
   - *Concept 2*: Consumer Group Rebalance & Cooperative Sticky Assignors.
   - *Concept 3*: Exactly-Once Semantics (EOS) & Idempotent Producers.
   - *Reinforcement*: Partition Key Skew & Topic Compaction.
3. **React Native Architecture**:
   - *Concept 1*: Fabric Renderer, C++ Shadow Trees & Synchronous Layout.
   - *Concept 2*: JavaScript Interface (JSI) & Direct Memory Access.
   - *Concept 3*: Hermes Engine, AOT Bytecode & Cold Start TTI.
   - *Reinforcement*: JS Thread Starvation & Reanimated UI Worklets.
4. **High-Scale Distributed Systems**:
   - *Concept 1*: Raft Consensus, Leader Election & Majority Quorums.
   - *Concept 2*: PACELC Theorem (Latency vs Consistency in healthy networks).
   - *Concept 3*: Byzantine Fault Tolerance (BFT) vs Crash Fault Tolerance (CFT).
   - *Reinforcement*: Vector Clocks vs Wall Clocks & Clock Drift.
5. **System Design at Scale**:
   - *Concept 1*: Probabilistic Early Expiration (XFetch) & Cache Stampedes.
   - *Concept 2*: Distributed Idempotency Keys & State Machine Transitions.
   - *Concept 3*: Circuit Breakers, Bulkheads & Cascading Failure Isolation.
   - *Reinforcement*: Token Bucket vs Fixed Window Counter Rate Limiting.

### Procedural Generator for Custom Topics:
When a candidate types an arbitrary topic (e.g. `"GraphQL"`, `"PostgreSQL WAL"`, `"Docker"`), `getCatalogQuestion` dynamically constructs structured multi-choice options with technical depth and targeted explanations.

---

## 5. Relational SQLite Schema

Defined in [`src/database/DatabaseSchema.ts`](../src/database/DatabaseSchema.ts):

```sql
-- Skill Sessions Table
CREATE TABLE IF NOT EXISTS qbl_skill_sessions (
  session_id TEXT PRIMARY KEY,
  topic_name TEXT NOT NULL,
  total_subtopics INTEGER NOT NULL DEFAULT 5,
  completed_subtopics INTEGER NOT NULL DEFAULT 0,
  overall_mastery_percentage REAL NOT NULL DEFAULT 0.0,
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  subtopics_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Session Turns Table
CREATE TABLE IF NOT EXISTS qbl_session_turns (
  turn_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  subtopic_id TEXT NOT NULL,
  concept_index INTEGER NOT NULL,
  is_reinforcement INTEGER NOT NULL DEFAULT 0,
  question_json TEXT NOT NULL,
  user_selected_option_id TEXT NOT NULL,
  is_correct INTEGER NOT NULL,
  feedback_text TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (session_id) REFERENCES qbl_skill_sessions(session_id) ON DELETE CASCADE
);
```

---

## 6. Verification & Automated Tests

QBL is validated with dedicated regression tests in [`tests/questionDrivenLearning.test.ts`](../tests/questionDrivenLearning.test.ts):
- **Sub-topic Planning**: Verifies generation of 5+ structured roadmaps.
- **4-Option Validity**: Confirms exactly 4 options with one correct answer and complete explanations.
- **Mastery Math**: Asserts +33% per concept and transition to `COMPLETED` at 100%.
- **Mistake Diagnostics**: Validates feedback structure, revealed answers, and reinforcement queuing.
- **Session Resumption**: Asserts SQLite persistence and turn restoration.
- **Question Distinctness**: Confirms zero duplicates across Concept 1, Concept 2, Concept 3, and Reinforcement drills.
- **Emotion Lifecycle**: Validates that evaluation never misassigns `speaking` state during evaluation.

---

---

## 8. Deep Technical Optimizations & Zero-Latency Pipeline

To combine LLM-driven generation with real-time mobile UX, Intervity implements three core architectural optimizations:

### Optimization 1: Pipelined Background Pre-generation (0ms Transitions)
Large Language Models running locally on edge hardware (NPU/GPU/CPU) take 1.5–4 seconds to synthesize deep technical questions. However, human candidates spend 20–45 seconds reading, analyzing, and answering each multiple-choice question.

QBL exploits this natural cognitive window with **Pipelined Asynchronous Prefetching** via `QBLEngine.prefetchCache`:
- **Session Start**: When `createNewSession` or `startNewTopic` is called, Concept #1 of Sub-topic 1 is pre-generated immediately.
- **During Question Display**: The moment Concept $N$ is rendered on screen, `QBLEngine.generateQuestion` fires a background promise for Concept $N+1$. When the candidate finishes and taps `Continue to Concept #N+1 →`, the question is served from memory with **0ms latency**.
- **On Incorrect Answers**: As soon as an answer is evaluated as incorrect, `evaluateAnswer` immediately fires a background prefetch for the targeted **reinforcement drill** while the candidate reads the diagnostics autopsy card.
- **On Sub-topic Completion**: When Concept #3 is mastered, `evaluateAnswer` asynchronously pre-fetches Concept #1 of the subsequent subtopic in the roadmap.

```
Candidate Reads Question N (20-45s)
│
├──> UI Thread: Candidate evaluates options
│
└──> Background Thread: QBLEngine.prefetchQuestion(N+1) [completes in ~2s]
                                │
Candidate Taps "Continue" ──────┴──> Question N+1 renders INSTANTLY (0ms)
```

### Optimization 2: Deep Technical Prompt Engineering & Artifact Grounding
Questions are systematically grounded in real production engineering realities rather than trivial textbook definitions:
- **Code & Syntax**: Real snippets in TypeScript, Python, Go, C++, or SQL illustrating concurrency bugs, thread pools, or query filters.
- **Configuration Flags**: Real system knobs (e.g. `max.poll.interval.ms`, `min.insync.replicas`, `shared_buffers`, `wal_sync_method`).
- **Telemetry & Metrics**: Concrete production numbers (e.g. "p99 latency spiked from 12ms to 850ms under 50k RPS", thread dumps, CPU saturation).
- **Sub-topic Diversity**: Zero question repetition across all 5 subtopics. Subtopic 1 (Fundamentals), Subtopic 2 (Engine Architecture), Subtopic 3 (Bottlenecks/Edge Cases), Subtopic 4 (High-Scale Optimizations), and Subtopic 5 (Staff Architecture) each generate distinct, specialized challenges.

### Optimization 3: Token-Level GBNF Grammar Constrained Decoding (`QBL_JSON_GBNF`)
To eliminate JSON parse errors and guarantee schema compliance when running on quantized edge LLMs (`MiniCPM5-2B`), Intervity defines a token-level GBNF grammar in [`OfflineLLMEngine.ts`](../src/core/llm/OfflineLLMEngine.ts):
- Constrains llama.rn sampling to strictly valid JSON keys (`conceptTitle`, `questionText`, `options`, `explanation`, `coachingTip`).
- Enforces exactly 4 option objects (`A`, `B`, `C`, `D`) with required booleans (`isCorrect: true/false`).
- Coupled with a resilient `parseAndValidateQuestionJSON` sanitization layer that strips markdown code blocks (` ```json ... ``` `) and repairs internal unescaped newlines.

---

## 9. Graduated Difficulty Progression (Step-by-Step Learning)

Candidates learn step-by-step rather than being thrust into complex staff-level architecture prematurely:

| Concept Stage | Difficulty Tier | Pedagogical Focus |
| :--- | :--- | :--- |
| **Concept #1** | `[BASIC]` | Foundational mental models, core invariants, primary terminology, and junior/mid misconception traps. |
| **Concept #2** | `[INTERMEDIATE]` | Real code snippets, operational workflows, runtime mechanics, and lifecycle trade-offs. |
| **Concept #3** | `[ADVANCED]` | Production incidents, p99 latency spikes, configuration conflicts, thread contention, and execution plans. |
| **Reinforcement** | `[PRO]` | Edge cases, mission-critical failure modes, split-brain scenarios, CAP dilemmas, and staff-level decisions. |

---

## 10. Interactive Mistake Autopsy & Review Session

Mistakes are treated as the highest-value learning opportunities:
- Every incorrect selection is automatically logged to SQLite (`qbl_session_turns` with `is_correct = 0`).
- A persistent `🔍 Review (N)` badge in the topic HUD highlights total active traps.
- Candidates can tap **Review (N)** at any point during learning or upon 100% topic completion.
- The **Mistake Autopsy Card** provides:
  1. `❌ YOUR TRAP CHOICE`: Highlights the chosen distractor and explains *why* it was a plausible trap and where it fails in production.
  2. `✓ AUTHORITATIVE PATTERN`: Displays the correct engineering approach with deep mental models.
  3. Step-by-step navigation (`← Previous Trap`, `Next Trap →`, `Finish Review 🎉`) allowing candidates to review and solidify their intuition before continuing.

---

## 11. UX Viewport & Auto-Scroll Mechanics

To provide a seamless, non-overlapping mobile layout:
- **Smooth Auto-Scroll to Feedback**: Upon answer evaluation, the scroll view smooth-scrolls to the end (`scrollToEnd({ animated: true })`), bringing Teddy's diagnostics, the autopsy card, and the `Continue →` button cleanly into view without manual swiping.
- **Top Anchor on Progression**: When a new question loads (`currentQuestion.id` changes) or when entering/exiting Review mode, the viewport immediately anchors to `y: 0` (`scrollTo({ y: 0 })`), ensuring the question header, badges, and scenario always display from the beginning with zero mascot overlap.

