/**
 * POST /api/plan
 *
 * 生成 mattaniah 今日学习计划。
 * 通常每天早上调一次,结果缓存到 DB 或 client。
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateDailyPlan } from '@/lib/ai/agents';
import {
  getDueReviews,
  getNextLearnableNodes,
  getRecentPerformance,
  getCurrentStreak,
} from '@/lib/db/queries';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId, subject = 'math', dailyMinutes = 30 } = await req.json();

    const today = new Date().toISOString().slice(0, 10);

    // 并行拉取上下文
    const [dueReviews, nextNodes, recentPerformance, streak] = await Promise.all([
      getDueReviews(userId, 10),
      getNextLearnableNodes(userId, subject, 5),
      getRecentPerformance(userId, 7),
      getCurrentStreak(userId),
    ]);

    const plan = await generateDailyPlan({
      user_id: userId,
      today,
      daily_minutes: dailyMinutes,
      current_streak: streak,
      due_reviews: dueReviews,
      next_nodes: nextNodes,
      recent_performance: recentPerformance,
      preferences: {},
    });

    return NextResponse.json({ plan, context: { streak, dueReviewsCount: dueReviews.length } });
  } catch (err: any) {
    console.error('/api/plan error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}