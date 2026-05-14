-- ============================================================
-- AI Tutor MVP — Initial Schema
-- 在 Supabase Dashboard 的 SQL Editor 里执行整段
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";  -- pgvector，用于知识点 embedding

-- ============================================================
-- 1. 学习者
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id text PRIMARY KEY,                     -- e.g. 'mattaniah'
  display_name text NOT NULL,
  age int,
  grade text,
  daily_study_minutes int DEFAULT 30,
  preferred_study_time time,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 2. 知识图谱（核心数据结构）
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_nodes (
  id text PRIMARY KEY,                     -- e.g. 'math.g7.ch1.s1'
  subject text NOT NULL,                   -- 'math' | 'english' | 'japanese' | 'thinking'
  chapter text,
  title text NOT NULL,
  description text,
  bloom_level text NOT NULL DEFAULT 'understand',
    -- 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'
  difficulty int NOT NULL DEFAULT 3,       -- 1-5
  estimated_minutes int DEFAULT 15,
  prerequisites text[] DEFAULT '{}',       -- 前置节点 IDs
  learning_objectives jsonb,               -- {"understand": [...], "apply": [...]}
  resources jsonb,                         -- {"geogebra": "url", "external": [...]}
  embedding vector(1536),                  -- 可选：用于相似题、前置概念检索
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nodes_subject ON knowledge_nodes(subject);
CREATE INDEX IF NOT EXISTS idx_nodes_chapter ON knowledge_nodes(chapter);

-- ============================================================
-- 3. 掌握度状态（FSRS 算法状态 + mastery level）
-- ============================================================
CREATE TABLE IF NOT EXISTS mastery_states (
  user_id text NOT NULL REFERENCES profiles(id),
  node_id text NOT NULL REFERENCES knowledge_nodes(id),

  -- Mastery learning
  mastery_level numeric NOT NULL DEFAULT 0,   -- 0.0 - 1.0
  is_mastered boolean GENERATED ALWAYS AS (mastery_level >= 0.85) STORED,
  first_studied_at timestamptz,
  mastered_at timestamptz,
  study_minutes int DEFAULT 0,

  -- FSRS state (see ts-fsrs)
  fsrs_state text DEFAULT 'new',            -- 'new' | 'learning' | 'review' | 'relearning'
  fsrs_stability numeric DEFAULT 0,
  fsrs_difficulty numeric DEFAULT 0,
  fsrs_elapsed_days int DEFAULT 0,
  fsrs_scheduled_days int DEFAULT 0,
  fsrs_reps int DEFAULT 0,
  fsrs_lapses int DEFAULT 0,
  due_at timestamptz,                       -- 下次复习时间

  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, node_id)
);

CREATE INDEX IF NOT EXISTS idx_mastery_due ON mastery_states(user_id, due_at)
  WHERE due_at IS NOT NULL;

-- ============================================================
-- 4. 学习事件（每次交互一条，是数据金矿）
-- ============================================================
CREATE TABLE IF NOT EXISTS learning_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL REFERENCES profiles(id),
  node_id text REFERENCES knowledge_nodes(id),
  event_type text NOT NULL,
    -- 'session_start' | 'explanation_shown' | 'question_asked' | 'student_answer'
    -- | 'evaluator_feedback' | 'restate' | 'mastery_achieved' | 'review_due'
  payload jsonb NOT NULL,                   -- 见各事件类型的 schema
  agent text,                               -- 'explainer' | 'quizzer' | 'evaluator' | 'planner'
  tokens_used int,
  cost_usd numeric,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_user_time ON learning_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_node ON learning_events(node_id);

-- ============================================================
-- 5. 对话历史（Agent 多轮对话存储）
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL REFERENCES profiles(id),
  node_id text REFERENCES knowledge_nodes(id),
  session_id uuid NOT NULL,                 -- 一次学习会话
  role text NOT NULL,                       -- 'user' | 'assistant' | 'system'
  agent text NOT NULL,                      -- which agent produced this
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id, created_at);

-- ============================================================
-- 6. 答题记录（quiz 单独存，便于错题本）
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL REFERENCES profiles(id),
  node_id text NOT NULL REFERENCES knowledge_nodes(id),
  bloom_level text NOT NULL,                -- 题目对应的 Bloom 等级
  question text NOT NULL,
  correct_answer text NOT NULL,
  student_answer text NOT NULL,
  is_correct boolean NOT NULL,
  error_diagnosis jsonb,                    -- {"category": "concept_gap", "details": "..."}
  evaluator_feedback text,
  time_spent_seconds int,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_user ON quiz_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_wrong ON quiz_attempts(user_id, node_id) WHERE is_correct = false;

-- ============================================================
-- 7. 每日打卡（streak 计算）
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_records (
  user_id text NOT NULL REFERENCES profiles(id),
  date date NOT NULL,
  study_minutes int DEFAULT 0,
  nodes_studied int DEFAULT 0,
  nodes_mastered int DEFAULT 0,
  quizzes_attempted int DEFAULT 0,
  quizzes_correct int DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- ============================================================
-- Helper: 计算当前 streak
-- ============================================================
CREATE OR REPLACE FUNCTION get_current_streak(p_user_id text)
RETURNS int LANGUAGE sql STABLE AS $$
  WITH dates AS (
    SELECT date FROM daily_records
    WHERE user_id = p_user_id AND study_minutes > 0
    ORDER BY date DESC
  ),
  grouped AS (
    SELECT date, date - (row_number() OVER (ORDER BY date DESC))::int AS grp
    FROM dates
  )
  SELECT COALESCE(count(*), 0)::int
  FROM grouped
  WHERE grp = (SELECT grp FROM grouped WHERE date = CURRENT_DATE)
    OR grp = (SELECT grp FROM grouped WHERE date = CURRENT_DATE - 1);
$$;

-- ============================================================
-- Seed: 默认用户
-- ============================================================
INSERT INTO profiles (id, display_name, age, grade, daily_study_minutes)
VALUES ('mattaniah', 'mattaniah', 14, '初一', 30)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS: MVP 阶段不开启（单用户）。对外 v0.1 时再加。
-- ============================================================