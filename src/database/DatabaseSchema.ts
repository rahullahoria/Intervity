/**
 * Relational SQLite Schema for On-Device Skill Mastery Matrix (op-sqlite)
 * Implements all 8 tables defined in Section 10.3 of the spec
 */

export const DATABASE_SCHEMA_SQL = `
-- 1. Candidate Skills Registry
CREATE TABLE IF NOT EXISTS candidate_skills (
    skill_id TEXT PRIMARY KEY,
    skill_name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'framework', 'system_design', 'fundamentals', 'behavioral'
    current_score REAL DEFAULT 50.0,
    mastery_level TEXT DEFAULT 'DEVELOPING', -- 'NOVICE', 'DEVELOPING', 'PROFICIENT', 'SENIOR', 'STAFF'
    total_questions_asked INTEGER DEFAULT 0,
    last_tested_at INTEGER NOT NULL
);

-- 2. Interview Sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
    session_id TEXT PRIMARY KEY,
    target_role TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    completed_at INTEGER,
    duration_seconds INTEGER,
    overall_score REAL,
    audio_path TEXT,
    summary_feedback TEXT
);

-- 3. Turn-by-Turn Evaluations
CREATE TABLE IF NOT EXISTS session_turn_evaluations (
    turn_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES interview_sessions(session_id),
    skill_id TEXT NOT NULL REFERENCES candidate_skills(skill_id),
    turn_index INTEGER NOT NULL,
    interviewer_question TEXT NOT NULL,
    candidate_answer TEXT NOT NULL,
    turn_score REAL NOT NULL,
    question_difficulty REAL DEFAULT 1.0,
    timestamp INTEGER NOT NULL
);

-- 4. Historical Skill Trends (For Progress Graphing)
CREATE TABLE IF NOT EXISTS skill_score_history (
    history_id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    score_before REAL NOT NULL,
    score_after REAL NOT NULL,
    recorded_at INTEGER NOT NULL
);

-- 5. Mistake Diagnostics & Coaching Registry
CREATE TABLE IF NOT EXISTS mistake_diagnostics (
    mistake_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES interview_sessions(session_id),
    skill_id TEXT NOT NULL REFERENCES candidate_skills(skill_id),
    turn_index INTEGER NOT NULL,
    candidate_quote TEXT NOT NULL,
    mistake_category TEXT NOT NULL, -- 'CONCEPTUAL', 'L4_CEILING', 'STRUCTURAL', 'VAGUE'
    critique TEXT NOT NULL,
    missing_concept TEXT NOT NULL,
    golden_response TEXT NOT NULL,
    coaching_rule TEXT NOT NULL,
    is_drilled INTEGER DEFAULT 0,   -- 1 if candidate completed coaching drill
    drilled_score REAL DEFAULT 0.0
);

-- 6. Soft Skills Registry & Scores
CREATE TABLE IF NOT EXISTS candidate_soft_skills (
    soft_skill_id TEXT PRIMARY KEY,
    skill_name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'vocal_delivery', 'communication_structure', 'interpersonal_eq', 'ownership'
    current_score REAL DEFAULT 60.0,
    mastery_level TEXT DEFAULT 'COMPETENT', -- 'DEVELOPING', 'COMPETENT', 'PERSUASIVE', 'EXECUTIVE'
    last_tested_at INTEGER NOT NULL
);

-- 7. Speech Prosody & Acoustic Metrics per Session
CREATE TABLE IF NOT EXISTS session_prosody_metrics (
    metric_id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL REFERENCES interview_sessions(session_id),
    average_wpm REAL NOT NULL,              -- Words Per Minute (ideal: 120-155)
    total_filler_words INTEGER NOT NULL,    -- Count of "um", "uh", "like", "actually", "basically", "ya"
    filler_density_per_100_words REAL NOT NULL,
    turn_latency_avg_ms INTEGER NOT NULL,   -- Time taken to start speaking after question
    monotone_energy_variance REAL NOT NULL  -- RMS dynamic range
);

-- 8. Soft Skill Turn-by-Turn Evaluations
CREATE TABLE IF NOT EXISTS soft_skill_turn_evaluations (
    eval_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    turn_index INTEGER NOT NULL,
    soft_skill_id TEXT NOT NULL,
    score REAL NOT NULL,
    observation TEXT NOT NULL
);

-- 9. Mascot Profile & Personality State
CREATE TABLE IF NOT EXISTS mascot_profile (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Teddy',
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    personality_tier TEXT NOT NULL DEFAULT 'Warm Friend & Coding Buddy',
    relationship_summary TEXT,
    coaching_style TEXT DEFAULT 'Warm, Socratic & Conversational Growth',
    updated_at INTEGER NOT NULL
);

-- 10. Agent Long-Term User Memory & Career Facts
CREATE TABLE IF NOT EXISTS agent_user_memory (
    memory_id TEXT PRIMARY KEY,
    category TEXT NOT NULL, -- 'career_goal', 'current_role', 'strength', 'weakness', 'project', 'preference', 'milestone'
    fact_key TEXT NOT NULL,
    fact_value TEXT NOT NULL,
    confidence REAL DEFAULT 1.0,
    created_at INTEGER NOT NULL,
    last_referenced_at INTEGER NOT NULL
);

-- 11. User Profiles & Voice Biometrics (On-Device Voiceprint)
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    target_role TEXT,
    years_of_experience REAL DEFAULT 0,
    voice_enrolled INTEGER DEFAULT 0, -- 1 if biometric voice profile is enrolled
    voice_embedding_json TEXT,         -- 192-dimensional normalized biometric vector stored as JSON
    sample_text TEXT,                  -- Sentence spoken during calibration
    average_pitch_hz REAL DEFAULT 0,   -- Acoustic baseline pitch
    enrolled_at INTEGER NOT NULL,
    last_verified_at INTEGER
);
`;

