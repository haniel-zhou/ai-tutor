/**
 * POST /api/quiz
 *
 * Quizzer Agent 接口。给定 nodeId,返回 3 道分层题。
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateQuiz } from '@/lib/ai/agents';
import { getNode, logEvent } from '@/lib/db/queries';
import { supabaseAdmin } from '@/lib/db/supabase';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId, nodeId } = await req.json();

    const node = await getNode(nodeId);

    // 拉最近 5 次同 node 的答题历史,避免重复出题
    const { data: prior } = await supabaseAdmin
      .from('quiz_attempts')
      .select('question, is_correct')
      .eq('user_id', userId)
      .eq('node_id', nodeId)
      .order('created_at', { ascending: false })
      .limit(5);

    const quiz = await generateQuiz({
      node: {
        id: node.id,
        title: node.title,
        learning_objectives: node.learning_objectives,
        difficulty: node.difficulty,
      },
      priorQuizHistory: prior || [],
    });

    logEvent({
      user_id: userId,
      node_id: nodeId,
      event_type: 'quiz_generated',
      payload: { question_count: quiz.questions.length },
      agent: 'quizzer',
    }).catch(console.error);

    return NextResponse.json(quiz);
  } catch (err: any) {
    console.error('/api/quiz error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}