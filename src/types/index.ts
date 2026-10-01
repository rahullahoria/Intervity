/**
 * Core Domain Types for Offline AI Interview Practice Application
 */

export type InterviewState =
  | 'INITIALIZING'
  | 'READY'
  | 'LISTENING'
  | 'USER_SPEAKING'
  | 'THINKING'
  | 'AI_SPEAKING'
  | 'INTERRUPTED'
  | 'COMPLETED';

export type IndianVoiceProfile =
  | 'hf_alpha'  // Female Bangalore Tech Lead (neutral corporate accent)
  | 'hf_beta'   // Female Dynamic / Direct
  | 'hm_omega'  // Male Senior VP Engineering / Architect
  | 'hm_psi'    // Male Conversational / Problem Solving
  | 'af_bella'; // Global Neutral Female

export type InterviewerPersona =
  | 'bengaluru_tech_lead'
  | 'neutral_staff_eng'
  | 'skeptical_architect';

export type Dialect = 'en-IN' | 'en-US' | 'en-GB';

/**
 * 5 Distinct Conversation Varieties / Tracks
 */
export type ConversationTrack =
  | 'DISTRIBUTED_SYSTEMS'
  | 'ENGINEERING_LEADERSHIP'
  | 'CLIENT_PERFORMANCE'
  | 'AI_DATA_PLATFORM'
  | 'BEHAVIORAL_LEADERSHIP';

export interface ConversationTrackInfo {
  id: ConversationTrack;
  title: string;
  shortTitle: string;
  subtitle: string;
  targetRole: string;
  badgeColor: string;
  accentColor: string;
  iconName: 'ArchitectureIcon' | 'UsersGroupIcon' | 'DeviceMobileIcon' | 'BrainIcon' | 'SparklesIcon';
  suggestedPrompts: string[];
  systemFocus: string;
  starterGreeting: string;
}

export const CONVERSATION_TRACKS: Record<ConversationTrack, ConversationTrackInfo> = {
  DISTRIBUTED_SYSTEMS: {
    id: 'DISTRIBUTED_SYSTEMS',
    title: 'High-Scale Distributed Systems',
    shortTitle: 'Distributed',
    subtitle: 'Staff / Principal Architect',
    targetRole: 'Staff Software Architect',
    badgeColor: '#38BDF8',
    accentColor: '#0284C7',
    iconName: 'ArchitectureIcon',
    suggestedPrompts: [
      "I'm designing a 50k orders/min dispatch service.",
      "How do I prevent cache stampedes during flash sales?",
      "Justify async Kafka event streams over synchronous gRPC.",
    ],
    systemFocus: 'Kafka, Redis clusters, database sharding, PACELC consistency, and p99 SLA defense.',
    starterGreeting: "Welcome to the Distributed Systems track! I'm ready to dive into high-throughput architectures, Kafka partitioning, Redis caching, and Staff-level trade-offs. What scale problem or distributed challenge would you like to explore?",
  },
  ENGINEERING_LEADERSHIP: {
    id: 'ENGINEERING_LEADERSHIP',
    title: 'Engineering Leadership & Management',
    shortTitle: 'Leadership',
    subtitle: 'EM / Director / CTO',
    targetRole: 'Engineering Director / CTO',
    badgeColor: '#F59E0B',
    accentColor: '#D97706',
    iconName: 'UsersGroupIcon',
    suggestedPrompts: [
      "How do I defend technical debt refactoring to business executives?",
      "I'm stepping up as Incident Commander during a critical outage.",
      "How do I balance autonomy with architectural alignment across squads?",
    ],
    systemFocus: 'Tech debt vs feature velocity, executive alignment, incident command, team autonomy, and career mentorship.',
    starterGreeting: "Welcome to the Engineering Leadership track! Great engineering leadership turns technical excellence into organizational impact. Are you looking to discuss defending tech debt to executives, running incident command, or coaching your team?",
  },
  CLIENT_PERFORMANCE: {
    id: 'CLIENT_PERFORMANCE',
    title: 'Client Architecture & Mobile Performance',
    shortTitle: 'Client & Mobile',
    subtitle: 'Staff Mobile / Frontend Architect',
    targetRole: 'Staff Mobile Architect',
    badgeColor: '#10B981',
    accentColor: '#059669',
    iconName: 'DeviceMobileIcon',
    suggestedPrompts: [
      "How do I eliminate frame drops and keep React Native at 60 FPS?",
      "Explain JSI memory sharing versus the legacy bridge.",
      "How should I design an offline-first SQLite sync architecture?",
    ],
    systemFocus: '60/120 FPS render pipelines, JSI memory sharing, TurboModules, offline-first SQLite sync, and Hermes engine memory profiling.',
    starterGreeting: "Welcome to the Client Architecture and Mobile Performance track! Let's talk butter-smooth 60 FPS frame rates, JSI memory sharing, TurboModules, and offline-first local SQLite sync. What client performance frontier are we conquering today?",
  },
  AI_DATA_PLATFORM: {
    id: 'AI_DATA_PLATFORM',
    title: 'AI Platform & Machine Learning Systems',
    shortTitle: 'AI Platform',
    subtitle: 'AI/ML Systems Architect',
    targetRole: 'AI Platform Architect',
    badgeColor: '#8B5CF6',
    accentColor: '#7C3AED',
    iconName: 'BrainIcon',
    suggestedPrompts: [
      "How do on-device 4-bit quantized LLMs optimize memory bandwidth?",
      "Compare HNSW and IVF index structures for vector similarity search.",
      "How do you detect feature drift in streaming ML pipelines?",
    ],
    systemFocus: 'On-device GGUF/ONNX quantization, vector search (HNSW/IVF), streaming feature stores, RAG architectures, and model drift telemetry.',
    starterGreeting: "Welcome to the AI Platform and ML Systems track! From on-device quantized LLM inference to HNSW vector search and streaming feature stores, this is where AI meets high-performance systems. What AI infrastructure challenge should we pressure-test?",
  },
  BEHAVIORAL_LEADERSHIP: {
    id: 'BEHAVIORAL_LEADERSHIP',
    title: 'Behavioral, STAR & Culture Leadership',
    shortTitle: 'Behavioral & STAR',
    subtitle: 'Conflict, Empathy & Growth',
    targetRole: 'Principal Lead / Culture Champion',
    badgeColor: '#EC4899',
    accentColor: '#DB2777',
    iconName: 'SparklesIcon',
    suggestedPrompts: [
      "How do I structure a STAR story about resolving a cross-team conflict?",
      "I'm feeling impostor syndrome stepping into a higher level.",
      "How do I turn around a failing project and rally team morale?",
    ],
    systemFocus: 'STAR storytelling with quantified business impact, cross-team conflict resolution without ego, project turnarounds, and psychological safety.',
    starterGreeting: "Welcome to the Behavioral and Culture Leadership track! Technical brilliance only shines when paired with deep empathy, ownership, and compelling storytelling. Tell me, what high-stakes leadership or team situation would you like to practice today?",
  },
};

export const CONVERSATION_TRACK_LIST: ConversationTrackInfo[] = [
  CONVERSATION_TRACKS.DISTRIBUTED_SYSTEMS,
  CONVERSATION_TRACKS.ENGINEERING_LEADERSHIP,
  CONVERSATION_TRACKS.CLIENT_PERFORMANCE,
  CONVERSATION_TRACKS.AI_DATA_PLATFORM,
  CONVERSATION_TRACKS.BEHAVIORAL_LEADERSHIP,
];

export type SkillCategory =
  | 'framework'
  | 'system_design'
  | 'fundamentals'
  | 'behavioral';

export type MasteryLevel =
  | 'NOVICE'      // 0-39
  | 'DEVELOPING'  // 40-59
  | 'PROFICIENT'  // 60-79
  | 'SENIOR'      // 80-89
  | 'STAFF';      // 90-100

export type SoftSkillMasteryLevel =
  | 'DEVELOPING'   // 0-49
  | 'COMPETENT'    // 50-69
  | 'PERSUASIVE'   // 70-84
  | 'EXECUTIVE';   // 85-100

export type MistakeCategory =
  | 'CONCEPTUAL'
  | 'L4_CEILING'
  | 'STRUCTURAL'
  | 'VAGUE'
  | 'NONE';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface CandidateSkill {
  skill_id: string;
  skill_name: string;
  category: SkillCategory;
  current_score: number;
  mastery_level: MasteryLevel;
  total_questions_asked: number;
  last_tested_at: number;
}

export interface CandidateSoftSkill {
  soft_skill_id: string;
  skill_name: string;
  category: 'vocal_delivery' | 'communication_structure' | 'interpersonal_eq' | 'ownership';
  current_score: number;
  mastery_level: SoftSkillMasteryLevel;
  last_tested_at: number;
}

export interface SpeechProsodyReport {
  wpm: number;
  fillerCount: number;
  fillerDensityPercent: number;
  turnLatencyMs: number;
  fillerWordsFound: string[];
  vocalPacingScore: number;
}

export interface MistakeDiagnostic {
  mistakeId: string;
  sessionId: string;
  skillId: string;
  turnIndex: number;
  candidateQuote: string;
  mistakeCategory: MistakeCategory;
  critique: string;
  missingSeniorConcepts: string[];
  goldenResponse: string;
  coachingMentalModel: string;
  isDrilled: boolean;
  drilledScore: number;
}

export interface TurnEvaluation {
  turnId: string;
  sessionId: string;
  skillId: string;
  turnIndex: number;
  interviewerQuestion: string;
  candidateAnswer: string;
  turnScore: number;
  questionDifficulty: number;
  timestamp: number;
  prosody?: SpeechProsodyReport;
  mistake?: MistakeDiagnostic;
}

export interface InterviewSession {
  sessionId: string;
  targetRole: string;
  startedAt: number;
  completedAt?: number;
  durationSeconds?: number;
  overallScore?: number;
  audioPath?: string;
  summaryFeedback?: string;
  turns: TurnEvaluation[];
}

export interface ParsedResume {
  candidateName: string;
  yearsOfExperience: number;
  skills: string[];
  notableProjects: Array<{
    title: string;
    techStack: string[];
    summary: string;
  }>;
  recommendedInterviewTopics: string[];
  rawText: string;
}

export interface ModelAsset {
  id: 'whisper_turbo' | 'whisper_tiny' | 'minicpm_2b' | 'minicpm5_2b' | 'qwen_05b' | 'kokoro_tts';
  name: string;
  url: string;
  sizeBytes: number;
  md5: string;
  localFileName: string;
  downloadedBytes: number;
  isDownloaded: boolean;
  isDownloading: boolean;
  error?: string;
}

export interface UserVoiceProfile {
  userId: string;
  name: string;
  targetRole?: string;
  yearsOfExperience?: number;
  voiceEnrolled: boolean;
  voiceEmbedding: number[]; // 192-dimensional normalized biometric vector
  sampleText?: string;
  averagePitchHz?: number;
  enrolledAt: number;
  lastVerifiedAt?: number;
}

export interface VoiceEnrollmentState {
  isCalibrating: boolean;
  progressPercent: number;
  candidateName: string;
  statusText: string;
  audioLevel: number;
  isCompleted: boolean;
  error?: string;
}

export interface InterviewOptions {
  resume: ParsedResume;
  targetRole: string;
  dialect?: Dialect;
  voiceProfile?: IndianVoiceProfile;
  interviewerPersona?: InterviewerPersona;
  targetLevel?: string;
}

