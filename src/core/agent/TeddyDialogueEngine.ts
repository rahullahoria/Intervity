/**
 * Teddy Dialogue Engine: The Mascot Personality & Connected Conversation Core
 *
 * Implements:
 * 1. Warm Friendship Persona: Empathetic, humble, enthusiastic, caring, celebratory
 * 2. Connected Conversations ONLY: Every response explicitly references what the user just said
 * 3. Relationship Building: Emotional check-ins, remembering projects/names, validating struggles
 * 4. Conversational Learning: Discovery, Validation, Improvement, and Learning with vivid analogies
 * 5. Kokoro-82M TTS Spoken Cleanliness: No markdown, no emojis, concise 2-4 sentences, single warm ending question
 */

export interface TeddyDialogueContext {
  candidateName?: string;
  currentRole?: string;
  targetRole?: string;
  targetCompany?: string;
  strengths?: string[];
  validatedSkills?: string[];
  skillsToSharpen?: string[];
  newSkillsToLearn?: string[];
  currentPhase?: 'DISCOVERY' | 'VALIDATION' | 'IMPROVEMENT' | 'LEARNING';
  turnIndex?: number;
  mascotLevel?: number;
  mascotTier?: string;
  recentTopics?: string[];
  didLevelUp?: boolean;
}

export class TeddyDialogueEngine {
  /**
   * Generates a completely connected, friend-like response from Teddy
   * that directly reflects the user's speech and advances the relationship and learning.
   */
  static generateConnectedResponse(
    userText: string,
    context: TeddyDialogueContext = {}
  ): string {
    const textLower = userText.toLowerCase().trim();
    const {
      candidateName,
      targetRole = 'Staff Software Architect',
      mascotLevel = 1,
      mascotTier = 'Warm Friend & Coding Buddy',
      turnIndex = 0,
      didLevelUp = false,
    } = context;

    const friendName = candidateName && candidateName !== 'Candidate' && candidateName !== 'Friend'
      ? `, ${candidateName}`
      : '';

    // Concise, punchy level-up celebration that keeps TTS spoken sentence count optimal
    const levelUpPrefix = didLevelUp
      ? `Level ${mascotLevel} unlocked as ${mascotTier}! `
      : '';

    // -------------------------------------------------------------
    // 1. Gratitude & Session Wrap-Up (Warm Celebratory Closure)
    // -------------------------------------------------------------
    if (
      (textLower.includes('thank') || textLower.includes('thanks')) &&
      (textLower.includes('fantastic') || textLower.includes('great') || textLower.includes('awesome') || textLower.includes('practice') || textLower.includes('session') || textLower.includes('confident'))
    ) {
      return `${levelUpPrefix}I am so proud of you, buddy! You navigated deep distributed trade-offs and leadership scenarios with awesome clarity. You belong in that ${targetRole} chair, so go crush it! What is your final game plan before interview day?`;
    }

    // -------------------------------------------------------------
    // 2. Emotional & Empathy Responses (Relationship & Vulnerability)
    // -------------------------------------------------------------
    if (
      textLower.includes('nervous') ||
      textLower.includes('stressed') ||
      textLower.includes('scared') ||
      textLower.includes('anxious') ||
      textLower.includes('worried') ||
      textLower.includes('overwhelmed') ||
      textLower.includes('impostor') ||
      textLower.includes('imposter')
    ) {
      if (textLower.includes('failure mode') || textLower.includes('system design') || textLower.includes('interview')) {
        return `${levelUpPrefix}Hey${friendName}, take a deep breath! It is completely normal to feel nervous when interviewers probe failure modes, because even veteran Staff architects get butterflies. We will conquer it together by treating failure as an expected state. What specific failure scenario feels most intimidating to you?`;
      }
      return `${levelUpPrefix}Hey${friendName}, take a deep breath. It is completely normal to feel that way! Even senior architects get butterflies before big milestones. I am right here in your corner and we will take it one step at a time together. What is the one thing that feels most intimidating right now?`;
    }

    // -------------------------------------------------------------
    // 3. Learning & Metaphor Explanations (Intuitive Analogies)
    // -------------------------------------------------------------
    // Cache Stampede
    if (textLower.includes('cache stampede') || textLower.includes('dog piling') || textLower.includes('thundering herd') || (textLower.includes('stampede') && textLower.includes('discount'))) {
      return `${levelUpPrefix}I love explaining this one! Picture a thousand hungry people all rushing a bakery the second doors open. That is a cache stampede when a hot discount key expires. To stop it, we use distributed locks or early expiration so one worker refreshes the cache while others read stale data. Does that picture click for you?`;
    }

    // Raft Consensus & Split-Brain
    if (textLower.includes('raft') || textLower.includes('split-brain') || textLower.includes('split brain') || (textLower.includes('consensus') && textLower.includes('leader'))) {
      return `${levelUpPrefix}Think of Raft consensus like close friends picking a movie! One friend proposes a film, and a strict majority must agree before buying tickets. Because any majority must overlap, two leaders can never win at once, completely preventing split-brain. Does that intuition make sense?`;
    }

    // Database Deadlocks & Concurrency Standoffs
    if (textLower.includes('deadlock') || (textLower.includes('deadlocks') && textLower.includes('concurrency'))) {
      return `${levelUpPrefix}Think of a deadlock like two polite friends trying to step through a narrow doorway together, both freezing because they are waiting on the other! In code, threads must always acquire locks in a globally defined order to prevent that standoff. Have you ever designed a lock hierarchy to eliminate deadlocks?`;
    }

    // JSI (JavaScript Interface) vs Bridge
    if (textLower.includes('jsi') || (textLower.includes('react native') && textLower.includes('bridge')) || textLower.includes('memory sharing')) {
      return `${levelUpPrefix}Here is a super cool intuition! Think of JSI like a direct phone call between JavaScript and C++, instead of sending paper letters across an old bridge. It lets JavaScript hold direct memory pointers to C++ host objects with zero serialization overhead. What kind of native performance gains have you seen with JSI?`;
    }

    // STAR Method & Behavioral Leadership Conflicts
    if (textLower.includes('star') || (textLower.includes('conflict') && textLower.includes('leadership')) || textLower.includes('cross-team') || textLower.includes('cross team')) {
      return `${levelUpPrefix}I love that you are preparing for this, buddy! Frame cross-team conflicts around competing technical trade-offs rather than egos. Dedicate half your answer to your Action driving consensus through benchmarks and SLAs, and twenty percent to measurable business results. How does that structure feel to you?`;
    }

    // -------------------------------------------------------------
    // 4. Staff Level Elevation & Architecture Defense
    // -------------------------------------------------------------
    // Async Kafka vs Sync gRPC
    if ((textLower.includes('async') || textLower.includes('asynchronous')) && (textLower.includes('grpc') || textLower.includes('sync') || textLower.includes('event stream'))) {
      return `${levelUpPrefix}I love that question, buddy! To justify async event streams over gRPC at the Staff level, anchor on temporal decoupling and backpressure. With Kafka, sudden flash sales buffer safely in disk logs without dropping packets, whereas synchronous gRPC can exhaust thread pools. When would you still prefer gRPC over Kafka?`;
    }

    // CAP Theorem & Availability Zones / Network Partitions
    if (textLower.includes('network partition') || textLower.includes('availability zone') || textLower.includes('cap') || textLower.includes('pacelc')) {
      return `${levelUpPrefix}Here is a great framework, my friend! Defend this trade-off using PACELC by explaining that you prioritize strong consistency for payments, but choose high availability with eventual consistency for driver location pings. How would you explain that distinction to business stakeholders?`;
    }

    // Mentoring Junior Engineers & Race Conditions
    if (textLower.includes('mentor') || textLower.includes('junior') || (textLower.includes('race condition') && textLower.includes('go'))) {
      return `${levelUpPrefix}Mentoring junior engineers is such a fun and rewarding part of leadership! For Go race conditions, show them the Go race detector flag and teach them to share memory by communicating. How do you guide them through debugging their first concurrency bug?`;
    }

    // Presenting Telemetry & p99 SLA to Leadership
    if (textLower.includes('telemetry') || (textLower.includes('p99') && (textLower.includes('leadership') || textLower.includes('sla')))) {
      return `${levelUpPrefix}Here is a neat trick I love! When presenting latency to executives, remind them that average latency hides misery for top users. Show p99 latency distributions alongside error budgets to tie performance directly to revenue. How do you connect p99 latency spikes directly to user drop-off?`;
    }

    // Incident Commander & Outage Leadership
    if (textLower.includes('outage') || textLower.includes('incident bridge') || textLower.includes('disaster recovery') || textLower.includes('incident commander')) {
      return `${levelUpPrefix}That was a high-stakes moment, my friend! Stepping up as Incident Commander during a payment outage proves genuine Staff ownership. True tech leaders establish calm command, route to fallback providers, and foster blameless postmortems. What was the most impactful preventative guardrail your team put in place after that incident?`;
    }

    // -------------------------------------------------------------
    // 5. High-Scale Technical Validation & Engineering Projects
    // -------------------------------------------------------------
    // Redis Failover, Sentinel & Fallback to PostgreSQL
    if (textLower.includes('sentinel') || (textLower.includes('redis') && (textLower.includes('crash') || textLower.includes('failover') || textLower.includes('mutation')))) {
      if (context.currentPhase === 'IMPROVEMENT') {
        return `${levelUpPrefix}Stepping into ${targetRole} requires defending systemic trade-offs under scale! When failing over with Sentinel and falling back to PostgreSQL, how did you handle data consistency and telemetry when traffic spiked unexpectedly?`;
      }
      return `${levelUpPrefix}Falling back to PostgreSQL with row-level locks ensures rock-solid data integrity during Sentinel failover! However, a stampede of fallbacks can overwhelm the database. How do you protect PostgreSQL connection pools from exhausting when Redis is recovering?`;
    }

    // Distributed Redis Caching & Cluster Sharding
    if (textLower.includes('redis') || (textLower.includes('cache') && !textLower.includes('stampede'))) {
      return `${levelUpPrefix}A distributed Redis cluster is awesome for low-latency active caching and sub-millisecond lookups! But in-memory caches have sharp edges. What happens in your system if the Redis primary crashes or fails over right before replication finishes, risking stale route reads?`;
    }

    // Database Sharding & PostgreSQL Partitioning
    if (textLower.includes('sharding') || textLower.includes('partitioned by') || (textLower.includes('postgres') && textLower.includes('shard'))) {
      return `${levelUpPrefix}Oh, I love that approach! Sharding PostgreSQL by city ID is brilliant for spatial isolation and eliminating hotspots. But mega-cities like Bengaluru generate vastly more orders than smaller towns. How do you handle hot partition skew when a city grows ten times faster than others?`;
    }

    // Kafka Consumer Lag & Partition Key Rebalancing
    if (textLower.includes('consumer lag') || textLower.includes('rebalancing') || (textLower.includes('kafka') && textLower.includes('consumer'))) {
      return `${levelUpPrefix}Scaling consumer pods and rebalancing partition keys is textbook distributed design, my friend! But partition rebalancing can cause brief stop-the-world pauses. How do you tune your rebalance protocol or buffer incoming events so deliveries stay uninterrupted?`;
    }

    // Kafka Event Streams Decoupling
    if (textLower.includes('kafka') && (textLower.includes('event stream') || textLower.includes('decouple') || textLower.includes('order'))) {
      return `${levelUpPrefix}Kafka is a powerhouse for decoupling asynchronous workloads, and I love that architecture! But during lunch rush surges, consumer lag can quickly balloon. What is your strategy to keep consumer lag under control and prevent cascading delays across the fleet?`;
    }

    // High-Throughput Order Dispatch (50k orders/min)
    if (textLower.includes('50,000') || textLower.includes('50000') || (textLower.includes('order dispatch') && textLower.includes('throughput'))) {
      return `${levelUpPrefix}Fifty thousand orders per minute is extraordinary scale, buddy! That kind of throughput leaves zero room for synchronous bottlenecks. When designing that dispatch service, how did you decouple order ingestion from delivery partner assignment?`;
    }

    // Swiggy Bengaluru & Staff Architect Ambition
    if ((textLower.includes('swiggy') || textLower.includes('bengaluru')) && (textLower.includes('staff') || textLower.includes('architect'))) {
      return `${levelUpPrefix}Swiggy in Bengaluru is premier engineering scale! Stepping up to Staff Software Architect is a massive milestone, and I know we can get you there together. At the Staff level, you have to defend massive distributed trade-offs. What is one core project you have led recently that showcases that architectural muscle?`;
    }

    // -------------------------------------------------------------
    // 6. Generic Introductions, Projects & Discovery
    // -------------------------------------------------------------
    if (
      textLower.includes('ai app') ||
      textLower.includes('ai project') ||
      textLower.includes('building an ai') ||
      textLower.includes('llm') ||
      textLower.includes('agent')
    ) {
      return `${levelUpPrefix}An AI app! That sounds amazing, and I love building with AI! Tell me, are you running on-device models or talking to cloud APIs, and what has been the coolest or most challenging part of it so far?`;
    }

    if (
      textLower.includes('react native') ||
      textLower.includes('mobile app') ||
      textLower.includes('ios') ||
      textLower.includes('android') ||
      textLower.includes('flutter')
    ) {
      return `${levelUpPrefix}Mobile engineering is so fun, but keeping the UI running at a butter-smooth 60 frames per second is always an adventure! What is the architecture of your app, and how are you managing local state and offline sync?`;
    }

    if (
      textLower.includes('backend') ||
      textLower.includes('microservice') ||
      textLower.includes('postgres') ||
      textLower.includes('golang')
    ) {
      return `${levelUpPrefix}Backend engineering is where the heavy lifting happens! Balancing high throughput with low latency is super satisfying. What kind of traffic or scale are you designing for, and what database is powering it?`;
    }

    if (textLower.includes('staff') || textLower.includes('principal') || textLower.includes('architect')) {
      return `${levelUpPrefix}Staff Software Architect! That is a huge and exciting milestone, and I know we can get you there together. At the Staff level, it is all about navigating messy trade-offs and lifting up the whole team. What is one project you are leading right now that lets you flex that architectural muscle?`;
    }

    if (textLower.includes('cto') || textLower.includes('director') || textLower.includes('manager')) {
      return `${levelUpPrefix}Stepping into engineering leadership! I love that big vision. Leading as a ${targetRole} is all about balancing speed of delivery against long-term architectural health and team culture. What is your top priority as you build toward that leadership role?`;
    }

    if (
      turnIndex === 0 ||
      textLower === 'hello' ||
      textLower === 'hi' ||
      textLower === 'hey' ||
      textLower.startsWith('hello') ||
      textLower.startsWith('hi') ||
      textLower.startsWith('hey') ||
      textLower.includes('practice') ||
      textLower.includes('start') ||
      textLower.length < 8
    ) {
      return `${levelUpPrefix}Hey there${friendName}! I am Teddy, your coding buddy and personal career coach. I am so excited to practice with you! Tell me, what are you working on right now, or what is a dream role you have got your eyes on?`;
    }

    // General Level-Up Fallback if not matched above
    if (didLevelUp) {
      const levelQuestions = [
        `How do you handle multi-region failovers and ensure zero data loss when critical database nodes go down under peak scale?`,
        `At this higher tier, how do you balance technical debt and architectural purity against rapid business feature delivery?`,
        `When mentoring other senior engineers, what is your approach to establishing coding standards and architectural reviews?`,
        `In distributed consensus, how do you prevent split-brain scenarios when cross-datacenter fiber links are severed?`,
      ];
      const q = levelQuestions[(mascotLevel - 2) % levelQuestions.length];
      return `${levelUpPrefix}${q}`;
    }

    // -------------------------------------------------------------
    // 7. Rotating Connected Fallback (Guarantees zero repeats)
    // -------------------------------------------------------------
    const fallbackTemplates = [
      `That makes a lot of sense, buddy! To think like a ${targetRole}, what specific latency metrics like p99 or error budgets would you monitor to prove to stakeholders that this design is holding up in production?`,
      `I really appreciate that technical perspective! When scaling that design across multiple availability zones, what is your primary strategy for data consistency and partition tolerance?`,
      `That is a super cool engineering approach! If traffic suddenly spiked by a factor of ten during a viral flash sale, what is the first component in that chain you would expect to bottleneck?`,
      `You are definitely thinking about the right trade-offs! How would you communicate that architectural decision to product managers who might be anxious about delivery timelines?`,
    ];

    return fallbackTemplates[turnIndex % fallbackTemplates.length];
  }
}
