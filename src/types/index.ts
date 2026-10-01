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

