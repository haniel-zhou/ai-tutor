import Link from 'next/link';
import { getDueReviews } from '@/lib/db/queries';

export default async function ReviewPage() {
  const userId = 'mattaniah';
  const dueReviews = await getDueReviews(userId, 20);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">复习中心</h1>
          <p className="text-gray-500">{dueReviews.length} 项待复习</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {dueReviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">太棒了！</h2>
            <p className="text-gray-500">当前没有待复习的内容</p>
            <Link
              href="/"
              className="inline-block mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              返回首页
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {dueReviews.map((review) => (
              <Link
                key={review.node_id}
                href={`/learn/${review.node_id}`}
                className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{review.title}</div>
                    <div className="text-sm text-gray-500">
                      预计 {review.estimated_minutes} 分钟
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        review.fsrs_state === 'relearning'
                          ? 'bg-red-100 text-red-700'
                          : review.fsrs_state === 'review'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {review.fsrs_state === 'relearning'
                        ? '错题复习'
                        : review.fsrs_state === 'review'
                        ? '间隔复习'
                        : '学习中'}
                    </span>
                    <span className="text-gray-400">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}