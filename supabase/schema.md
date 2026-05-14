/**
 * 数据库 Schema 说明
 *
 * 核心表:
 * - profiles: 学习者信息
 * - knowledge_nodes: 知识图谱节点
 * - mastery_states: 掌握度 + FSRS 状态
 * - learning_events: 学习事件日志
 * - messages: 对话历史
 * - quiz_attempts: 答题记录
 * - daily_records: 每日打卡
 *
 * RLS: MVP 阶段不开启(单用户),后续加
 */

-- 执行方法:
-- 1. 打开 Supabase Dashboard -> SQL Editor
-- 2. 粘贴整个文件
-- 3. 点击 Run

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id text PRIMARY KEY,
  display_name text NOT NULL,
  age int,
  grade text,
  daily_study_minutes int DEFAULT 30,
  preferred_study_time time,
  created_at timestamptz DEFAULT now()
);

-- knowledge_nodes
CREATE TABLE IF NOT EXISTS knowledge_nodes (
  id text PRIMARY KEY,
  subject text NOT NULL,
  chapter text,
  title text NOT NULL,
  description text,
  bloom_level text NOT NULL DEFAULT 'understand',
  difficulty int NOT NULL DEFAULT 3,
  estimated_minutes int DEFAULT 15,
  prerequisites text[] DEFAULT '{}',
  learning_objectives jsonb,
  resources jsonb,
  embedding vector(1536),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nodes_subject ON knowledge_nodes(subject);
CREATE INDEX IF NOT EXISTS idx_nodes_chapter ON knowledge_nodes(chapter);

-- mastery_states
CREATE TABLE IF NOT EXISTS mastery_states (
  user_id text NOT NULL REFERENCES profiles(id),
  node_id text NOT NULL REFERENCES knowledge_nodes(id),
  mastery_level numeric NOT NULL DEFAULT 0,
  is_mastered boolean GENERATED ALWAYS AS (mastery_level >= 0.85) STORED,
  first_studied_at timestamptz,
  mastered_at timestamptz,
  study_minutes int DEFAULT 0,
  fsrs_state text DEFAULT 'new',
  fsrs_stability numeric DEFAULT 0,
  fsrs_difficulty numeric DEFAULT 0,
  fsrs_elapsed_days int DEFAULT 0,
  fsrs_scheduled_days int DEFAULT 0,
  fsrs_reps int DEFAULT 0,
  fsrs_lapses int DEFAULT 0,
  due_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, node_id)
);

CREATE INDEX IF NOT EXISTS idx_mastery_due ON mastery_states(user_id, due_at) WHERE due_at IS NOT NULL;

-- learning_events
CREATE TABLE IF NOT EXISTS learning_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL REFERENCES profiles(id),
  node_id text REFERENCES knowledge_nodes(id),
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  agent text,
  tokens_used int,
  cost_usd numeric,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_user_time ON learning_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_node ON learning_events(node_id);

-- messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL REFERENCES profiles(id),
  node_id text REFERENCES knowledge_nodes(id),
  session_id uuid NOT NULL,
  role text NOT NULL,
  agent text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id, created_at);

-- quiz_attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL REFERENCES profiles(id),
  node_id text NOT NULL REFERENCES knowledge_nodes(id),
  bloom_level text NOT NULL,
  question text NOT NULL,
  correct_answer text NOT NULL,
  student_answer text NOT NULL,
  is_correct boolean NOT NULL,
  error_diagnosis jsonb,
  evaluator_feedback text,
  time_spent_seconds int,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_user ON quiz_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_wrong ON quiz_attempts(user_id, node_id) WHERE is_correct = false;

-- daily_records
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

-- Helper: get_current_streak
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

-- Seed: 默认用户
INSERT INTO profiles (id, display_name, age, grade, daily_study_minutes)
VALUES ('mattaniah', 'mattaniah', 14, '初一', 30)
ON CONFLICT (id) DO NOTHING;