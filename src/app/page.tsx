import Link from 'next/link';
import {
  getCurrentStreak,
  getDueReviews,
  getNextLearnableNodes,
  getRecentPerformance,
} from '@/lib/db/queries';
import DailyPlanCard from './DailyPlanCard';
import { generateDailyPlan } from '@/lib/ai/agents';

async function getDashboardData(userId: string) {
  const [streak, dueReviews, nextNodes, recentPerf] = await Promise.all([
    getCurrentStreak(userId),
    getDueReviews(userId, 10),
    getNextLearnableNodes(userId, 'math', 5),
    getRecentPerformance(userId, 7),
  ]);

  // 生成今日计划
  const today = new Date().toISOString().slice(0, 10);
  const plan = await generateDailyPlan({
    user_id: userId,
    today,
    daily_minutes: 30,
    current_streak: streak,
    due_reviews: dueReviews,
    next_nodes: nextNodes,
    recent_performance: recentPerf,
    preferences: {},
  });

  return { streak, dueReviews, nextNodes, recentPerf, plan };
}

export default async function HomePage() {
  const userId = 'mattaniah';
  const { streak, dueReviews, nextNodes, recentPerf, plan } = await getDashboardData(userId);

  const today = new Date();
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日 ${dayNames[today.getDay()]}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">AI 学习陪跑</h1>
          <p className="text-gray-500">mattaniah · 初一 · {dateStr}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Streak Banner */}
        <div className="bg-gradient-to-r from-orange-400 to-yellow-400 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold">{streak}</div>
              <div className="text-orange-100">连续打卡天数</div>
            </div>
            <div className="text-right">
              {streak >= 7 && (
                <div className="text-2xl mb-1">🏆</div>
              )}
              <div className="text-lg">
                {dueReviews.length > 0 ? (
                  <span>今日有 {dueReviews.length} 项复习</span>
                ) : (
                  <span>今日无复习任务</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 今日计划卡片 */}
        {plan && <DailyPlanCard plan={plan} dueReviewsCount={dueReviews.length} />}

        {/* 本周表现 */}
        <section>
          <h2 className="text-lg font-medium text-gray-700 mb-4">本周表现</h2>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-500">
                  {recentPerf.avg_mastery_first_try.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-500">本周正确率</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {recentPerf.strong_topics.length}
                </div>
                <div className="text-sm text-gray-500">强项</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">
                  {recentPerf.wrong_topics.length}
                </div>
                <div className="text-sm text-gray-500">弱项</div>
              </div>
            </div>
          </div>
        </section>

        {/* 推荐学习 */}
        {plan && plan.plan && plan.plan.length > 0 && (
          <section>
            <h2 className="text-lg font-medium text-gray-700 mb-4">今日计划</h2>
            <div className="bg-white rounded-xl shadow-sm divide-y">
              {plan.plan.map((slot, i) => (
                <Link
                  key={i}
                  href={`/learn/${slot.node_id}`}
                  className="block p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          slot.type === 'review'
                            ? 'bg-green-100 text-green-700'
                            : slot.type === 'new'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">{slot.node_title}</div>
                        <div className="text-sm text-gray-500">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs mr-2 ${
                              slot.type === 'review'
                                ? 'bg-green-100 text-green-700'
                                : slot.type === 'new'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {slot.type === 'review'
                              ? '复习'
                              : slot.type === 'new'
                              ? '新学'
                              : '挑战'}
                          </span>
                          {slot.duration_minutes} 分钟
                        </div>
                      </div>
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 复习队列快捷入口 */}
        {dueReviews.length > 0 && (
          <section>
            <h2 className="text-lg font-medium text-gray-700 mb-4">待复习</h2>
            <div className="bg-white rounded-xl shadow-sm divide-y">
              {dueReviews.slice(0, 3).map((review) => (
                <Link
                  key={review.node_id}
                  href={`/learn/${review.node_id}`}
                  className="block p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{review.title}</div>
                      <div className="text-sm text-gray-500">
                        预计 {review.estimated_minutes} 分钟
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">
                      复习
                    </span>
                  </div>
                </Link>
              ))}
              {dueReviews.length > 3 && (
                <Link
                  href="/review"
                  className="block p-4 text-center text-blue-500 hover:bg-gray-50 transition"
                >
                  查看全部 {dueReviews.length} 项复习 →
                </Link>
              )}
            </div>
          </section>
        )}

        {/* Quick Links */}
        <section className="grid grid-cols-2 gap-4">
          <Link
            href="/review"
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:bg-gray-50 transition"
          >
            <div className="text-2xl mb-2">📚</div>
            <div className="font-medium">复习中心</div>
            {dueReviews.length > 0 && (
              <div className="text-sm text-yellow-600">{dueReviews.length} 项待复习</div>
            )}
          </Link>
          <Link
            href="/progress"
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:bg-gray-50 transition"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">进度地图</div>
            <div className="text-sm text-gray-500">查看知识图谱</div>
          </Link>
        </section>
      </main>
    </div>
  );
}
