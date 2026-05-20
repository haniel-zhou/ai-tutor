/**
 * 业务层数据库查询函数
 *
 * 把常用的 DB 操作封装成业务层易用的函数。
 * API routes 直接调用这些,不直接写 supabase 查询。
 */

import { supabaseAdmin } from './supabase';
import type { DbMasteryState } from '@/lib/fsrs/scheduler';

// ============================================================
// 知识节点
// ============================================================
export async function getNode(nodeId: string) {
  const { data, error } = await supabaseAdmin
    .from('knowledge_nodes')
    .select('*')
    .eq('id', nodeId)
    .single();
  if (error) throw error;
  return data;
}

export async function getNodesBySubject(subject: string) {
  const { data, error } = await supabaseAdmin
    .from('knowledge_nodes')
    .select('*')
    .eq('subject', subject)
    .order('chapter')
    .order('id');
  if (error) throw error;
  return data;
}

// ============================================================
// 学生历史(用于 Explainer 上下文)
// ============================================================
export async function getStudentMasteryForPrerequisites(
  userId: string,
  nodeId: string
) {
  // 拿到当前节点的先决条件
  const node = await getNode(nodeId);
  if (!node.prerequisites || node.prerequisites.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from('mastery_states')
    .select('node_id, mastery_level, knowledge_nodes!inner(title)')
    .eq('user_id', userId)
    .in('node_id', node.prerequisites);
  if (error) throw error;

  return (data || []).map((row: any) => ({
    node_id: row.node_id,
    node_title: row.knowledge_nodes.title,
    mastery_level: row.mastery_level,
  }));
}

// ============================================================
// Mastery state
// ============================================================
export async function getMasteryState(
  userId: string,
  nodeId: string
): Promise<DbMasteryState | null> {
  const { data, error } = await supabaseAdmin
    .from('mastery_states')
    .select('*')
    .eq('user_id', userId)
    .eq('node_id', nodeId)
    .maybeSingle();
  if (error) throw error;
  return data as DbMasteryState | null;
}

export async function upsertMasteryState(
  userId: string,
  nodeId: string,
  patch: Partial<DbMasteryState> & { mastery_level?: number; study_minutes?: number }
) {
  const { data: existing } = await supabaseAdmin
    .from('mastery_states')
    .select('*')
    .eq('user_id', userId)
    .eq('node_id', nodeId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabaseAdmin
      .from('mastery_states')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('node_id', nodeId);
    if (error) throw error;
  } else {
    const { error } = await supabaseAdmin.from('mastery_states').insert({
      user_id: userId,
      node_id: nodeId,
      first_studied_at: new Date().toISOString(),
      ...patch,
    });
    if (error) throw error;
  }
}

// ============================================================
// 复习队列
// ============================================================
export async function getDueReviews(userId: string, limit = 20) {
  const { data, error } = await supabaseAdmin
    .from('mastery_states')
    .select('*, knowledge_nodes!inner(id, title, estimated_minutes)')
    .eq('user_id', userId)
    .or(`due_at.lte.${new Date().toISOString()},fsrs_state.eq.new`)
    .order('due_at', { nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map((row: any) => ({
    node_id: row.node_id,
    title: row.knowledge_nodes.title,
    estimated_minutes: row.knowledge_nodes.estimated_minutes || 5,
    fsrs_state: row.fsrs_state,
    due_at: row.due_at,
    mastery_level: row.mastery_level,
  }));
}

// ============================================================
// 下一个可学节点(满足先决条件)
// ============================================================
export async function getNextLearnableNodes(userId: string, subject: string, limit = 5) {
  // 简化逻辑:返回未学过的、且所有 prerequisites 都达 0.85 的节点
  const { data: allNodes, error: e1 } = await supabaseAdmin
    .from('knowledge_nodes')
    .select('*')
    .eq('subject', subject);
  if (e1) throw e1;

  const { data: mastered, error: e2 } = await supabaseAdmin
    .from('mastery_states')
    .select('node_id, mastery_level')
    .eq('user_id', userId);
  if (e2) throw e2;

  const masteryMap = new Map(
    (mastered || []).map((m: any) => [m.node_id, m.mastery_level])
  );

  const next = (allNodes || []).filter((node: any) => {
    const ownMastery = masteryMap.get(node.id) ?? 0;
    if (ownMastery >= 0.85) return false; // 已掌握的不再推荐为"新学"

    const prereqs = node.prerequisites || [];
    return prereqs.every((p: string) => (masteryMap.get(p) ?? 0) >= 0.85);
  });

  return next.slice(0, limit).map((n: any) => ({
    node_id: n.id,
    title: n.title,
    difficulty: n.difficulty,
    estimated_minutes: n.estimated_minutes || 15,
  }));
}

// ============================================================
// 最近表现统计(用于 Planner)
// ============================================================
export async function getRecentPerformance(userId: string, daysBack = 7) {
  const sinceIso = new Date(Date.now() - daysBack * 86400 * 1000).toISOString();

  const { data: quizzes, error } = await supabaseAdmin
    .from('quiz_attempts')
    .select('node_id, is_correct, created_at')
    .eq('user_id', userId)
    .gte('created_at', sinceIso);
  if (error) throw error;

  const list = quizzes || [];
  if (list.length === 0) {
    return {
      avg_mastery_first_try: 0.7,
      wrong_topics: [],
      strong_topics: [],
    };
  }

  // 每节点的正确率
  const byNode = new Map<string, { right: number; total: number }>();
  for (const q of list) {
    const cur = byNode.get(q.node_id) || { right: 0, total: 0 };
    cur.total++;
    if (q.is_correct) cur.right++;
    byNode.set(q.node_id, cur);
  }

  const wrong_topics: string[] = [];
  const strong_topics: string[] = [];
  let sum = 0;
  let count = 0;
  byNode.forEach((v, nodeId) => {
    const acc = v.right / v.total;
    sum += acc;
    count++;
    if (acc < 0.5) wrong_topics.push(nodeId);
    if (acc >= 0.85) strong_topics.push(nodeId);
  });

  return {
    avg_mastery_first_try: count > 0 ? sum / count : 0,
    wrong_topics,
    strong_topics,
  };
}

// ============================================================
// 学习事件日志
// ============================================================
export async function logEvent(args: {
  user_id: string;
  node_id?: string;
  event_type: string;
  payload: any;
  agent?: string;
  tokens_used?: number;
  cost_usd?: number;
}) {
  const { error } = await supabaseAdmin.from('learning_events').insert(args);
  if (error) console.error('logEvent error:', error);
}

// ============================================================
// 当前 streak
// ============================================================
export async function getCurrentStreak(userId: string): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc('get_current_streak', {
    p_user_id: userId,
  });
  if (error) {
    console.error('streak rpc error:', error);
    return 0;
  }
  return data || 0;
}

// ============================================================
// Quiz attempt
// ============================================================
export async function recordQuizAttempt(args: {
  user_id: string;
  node_id: string;
  bloom_level: string;
  question: string;
  correct_answer: string;
  student_answer: string;
  is_correct: boolean;
  error_diagnosis: any;
  evaluator_feedback: string;
  time_spent_seconds: number;
}) {
  const { error } = await supabaseAdmin.from('quiz_attempts').insert(args);
  if (error) throw error;
}
