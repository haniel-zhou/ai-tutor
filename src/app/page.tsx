import Link from 'next/link';
import { getCurrentStreak, getDueReviews, getNextLearnableNodes, getRecentPerformance } from '@/lib/db/queries';

async function getDashboardData(userId: string) {
  const [streak, dueReviews, nextNodes, recentPerf] = await Promise.all([
    getCurrentStreak(userId),
    getDueReviews(userId, 10),
    getNextLearnableNodes(userId, 'math', 5),
    getRecentPerformance(userId, 7),
  ]);
  return { streak, dueReviews, nextNodes, recentPerf };
}

export default async function HomePage() {
  const userId = 'mattaniah';
  const { streak, dueReviews, nextNodes, recentPerf } = await getDashboardData(userId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">AI 学习陪跑</h1>
          <p className="text-gray-500">mattaniah · 初一</p>
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

        {/* Today's Plan */}
        <section>
          <h2 className="text-lg font-medium text-gray-700 mb-4">今日计划</h2>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <Link
              href="/api/plan"
              className="block w-full text-center bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
            >
              生成今日学习计划
            </Link>
            {nextNodes.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700 mb-2">推荐学习</h3>
                <div className="space-y-2">
                  {nextNodes.slice(0, 3).map((node) => (
                    <Link
                      key={node.node_id}
                      href={`/learn/${node.node_id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="font-medium">{node.title}</div>
                      <div className="text-sm text-gray-500">
                        预计 {node.estimated_minutes} 分钟 · 难度 {node.difficulty}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Due Reviews */}
        {dueReviews.length > 0 && (
          <section>
            <h2 className="text-lg font-medium text-gray-700 mb-4">复习队列</h2>
            <div className="bg-white rounded-xl shadow-sm divide-y">
              {dueReviews.map((review) => (
                <Link
                  key={review.node_id}
                  href={`/learn/${review.node_id}`}
                  className="block p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{review.title}</div>
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
            </div>
          </section>
        )}

        {/* Progress */}
        <section>
          <h2 className="text-lg font-medium text-gray-700 mb-4">学习进度</h2>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-500">
                  {recentPerf.avg_mastery_first_try.toFixed(1)}%
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

        {/* Quick Links */}
        <section className="grid grid-cols-2 gap-4">
          <Link
            href="/review"
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:bg-gray-50 transition"
          >
            <div className="text-2xl mb-2">📚</div>
            <div className="font-medium">复习中心</div>
          </Link>
          <Link
            href="/progress"
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:bg-gray-50 transition"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">进度地图</div>
          </Link>
        </section>
      </main>
    </div>
  );
}