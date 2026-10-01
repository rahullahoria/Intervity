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
      currentPhase = 'DISCOVERY',
      turnIndex = 0,
      didLevelUp = false,
    } = context;

    const friendName = candidateName && candidateName !== 'Candidate' && candidateName !== 'Friend'
      ? `, ${candidateName}`
      : '';

    // 1. Level-Up Milestone Celebration
    if (didLevelUp) {
      return `Level up! Look at us, we are officially at Level ${mascotLevel} as ${mascotTier}! I am so proud of our growth together. How do you handle failovers and ensure zero data loss in your architecture when nodes fail under high scale?`;
    }

    // 2. Emotional & Empathy Responses (Relationship Building & Validation)
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
      return `Hey${friendName}, take a deep breath. It is completely normal to feel that way! Even senior architects get butterflies before big milestones. I am right here in your corner and we will take it one step at a time together. What is the one thing that feels most intimidating right now?`;
    }

    if (
      textLower.includes('excited') ||
      textLower.includes('pumped') ||
      textLower.includes('happy') ||
      textLower.includes('finally fixed') ||
      textLower.includes('working now')
    ) {
      return `I love that energy! That feeling when you finally crack a tough bug or get code running is the absolute best part of engineering. Celebrate that win! What was the secret that made it all click?`;
    }

    // 3. Learning Inquiries (Analogies & Intuitive Teaching)
    if (
      currentPhase === 'LEARNING' ||
      textLower.includes('teach me') ||
      textLower.includes('don\'t know') ||
      textLower.includes('dont know') ||
      textLower.includes('what is') ||
      textLower.includes('how does') ||
      textLower.includes('explain')
    ) {
      if (textLower.includes('cache stampede') || textLower.includes('dog piling') || textLower.includes('thundering herd')) {
        return `Picture a thousand hungry people all rushing a bakery the exact second the doors open! That is a cache stampede when a hot key expires and everyone hammers your database at once. To stop it, we use a distributed lock so only one worker bakes fresh bread while others wait or read stale data. How does that picture feel to you?`;
      }
      if (textLower.includes('raft') || textLower.includes('consensus') || textLower.includes('split brain')) {
        return `Think of Raft consensus like a group of close friends picking a movie. One person steps up as the organizer, proposes a movie, and the majority must agree before buying tickets. If the organizer loses connection, the friends quickly elect a new one to prevent confusion. Does that intuition make sense?`;
      }
      if (textLower.includes('sharding') || textLower.includes('partition')) {
        return `Think of database sharding like opening multiple checkout lanes at a busy supermarket instead of making everyone wait in one giant line. Each lane handles customers based on their basket category so traffic flows effortlessly. What kind of key would you use to divide your users across those lanes?`;
      }
      if (textLower.includes('concurrency') || textLower.includes('deadlock') || textLower.includes('thread')) {
        return `Think of a deadlock like two polite people trying to walk through a narrow doorway at the exact same moment, both freezing because they are waiting on the other! In code, to prevent that standoff, threads must always acquire locks in a globally defined order. Have you ever run into a tricky lock issue like that?`;
      }
      if (textLower.includes('jsi') || textLower.includes('bridge') || textLower.includes('turbo')) {
        return `Think of JSI like a direct phone call between JavaScript and C++, instead of sending paper letters back and forth across a slow postal bridge! It lets JavaScript hold direct references to host objects with zero serialization overhead. What kind of native features are you looking to speed up?`;
      }
      return `I would love to explore that with you! In distributed engineering, the core secret is that everything eventually fails, so we design with graceful degradation and clear isolation. What is the main part of this topic you want to master first?`;
    }

    // 4. User Working on Projects (Connected Conversation & Curiosity)
    if (
      textLower.includes('ai app') ||
      textLower.includes('ai project') ||
      textLower.includes('building an ai') ||
      textLower.includes('working on ai') ||
      textLower.includes('llm') ||
      textLower.includes('agent')
    ) {
      return `An AI app! That sounds amazing, and I love building with AI! Tell me, are you running on-device models or talking to cloud APIs, and what has been the coolest or most challenging part of it so far?`;
    }

    if (
      textLower.includes('react native') ||
      textLower.includes('mobile app') ||
      textLower.includes('ios') ||
      textLower.includes('android') ||
      textLower.includes('flutter')
    ) {
      return `Mobile engineering is so fun, but keeping the UI running at a butter-smooth 60 frames per second is always an adventure! What is the architecture of your app, and how are you managing local state and offline sync?`;
    }

    if (
      textLower.includes('backend') ||
      textLower.includes('microservice') ||
      textLower.includes('postgres') ||
      textLower.includes('golang')
    ) {
      return `Backend engineering is where the heavy lifting happens! Balancing high throughput with low latency is super satisfying. What kind of traffic or scale are you designing for, and what database is powering it?`;
    }

    // 5. Skill Improvement (Elevating to Staff / Leadership Perspective)
    if (currentPhase === 'IMPROVEMENT') {
      const isLeadership =
        targetRole.includes('Manager') ||
        targetRole.includes('Director') ||
        targetRole.includes('VP') ||
        targetRole.includes('CTO');

      if (isLeadership) {
        return `Leading as a ${targetRole} requires balancing executive technology strategy with hiring and execution. When scaling your engineering org, how do you balance technical debt against speed to market?`;
      }

      return `Stepping into ${targetRole} requires defending systemic trade-offs under scale. In your systems, how did you handle data consistency and telemetry when traffic spiked unexpectedly?`;
    }

    // 6. Technical Skills & Validation (Friendly Exploration)
    if (textLower.includes('redis') || textLower.includes('cache')) {
      return `Caching is a wonderful superpower, but it can be sneaky! What happens in your system if the Redis primary fails right before replication finishes, causing a desync with the database? How would you handle that?`;
    }

    if (textLower.includes('kafka') || textLower.includes('event stream') || textLower.includes('pub sub')) {
      return `Kafka is a beast for throughput! But when consumer workers fall behind during a sudden traffic spike, what is your game plan to keep consumer lag from causing cascading delays?`;
    }

    if (textLower.includes('concurrency') || textLower.includes('mutex') || textLower.includes('lock')) {
      return `Concurrency is tricky business! When multiple threads access shared memory under peak load, what strategy do you use to keep things thread-safe without tanking overall throughput?`;
    }

    // 7. Career Dreams & Next Target Roles (Relationship & Vision)
    if (
      textLower.includes('staff') ||
      textLower.includes('principal') ||
      textLower.includes('architect') ||
      textLower.includes('lead')
    ) {
      return `Staff Software Architect! That is a huge and exciting milestone, and I know we can get you there together. At the Staff level, it is all about navigating messy trade-offs and lifting up the whole team. What is one project you are leading right now that lets you flex that architectural muscle?`;
    }

    if (
      textLower.includes('cto') ||
      textLower.includes('vp') ||
      textLower.includes('director') ||
      textLower.includes('head of') ||
      textLower.includes('manager')
    ) {
      return `Stepping into engineering leadership! I love that big vision. Leading as a ${targetRole} is all about balancing speed of delivery against long-term architectural health and team culture. What is your top priority as you build toward that leadership role?`;
    }

    // 8. Greetings & Warm Welcomes (for short greetings or session starts)
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
      return `Hey there${friendName}! I'm Teddy, your coding buddy and personal career coach. I'm so excited to practice with you! Tell me, what are you working on right now, or what is a dream role you've got your eyes on?`;
    }


    // 9. Connected Default Fallback (Always acknowledges and stays engaged)
    return `That makes a lot of sense! To think like a ${targetRole}, what specific latency metrics like p99 or error budgets would you monitor to prove to stakeholders that this design is holding up in production?`;
  }
}
