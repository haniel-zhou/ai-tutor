'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface ReviewItem {
  node_id: string;
  title: string;
  estimated_minutes: number;
  fsrs_state: string;
  due_at?: string;
  mastery_level?: number;
}

interface ReviewPageClientProps {
  initialReviews: ReviewItem[];
  totalStudyMinutes: number;
  masteredCount: number;
  totalCount: number;
}

export default function ReviewPageClient({
  initialReviews,
  totalStudyMinutes,
  masteredCount,
  totalCount,
}: ReviewPageClientProps) {
  const [filter, setFilter] = useState<'all' | 'review' | 'relearning' | 'learning'>('all');

  const filteredReviews = useMemo(() => {
    if (filter === 'all') return initialReviews;
    return initialReviews.filter((r) => r.fsrs_state === filter);
  }, [filter, initialReviews]);

  // 统计各类复习项
  const stats = useMemo(() => {
    const review = initialReviews.filter((r) => r.fsrs_state === 'review').length;
    const relearning = initialReviews.filter((r) => r.fsrs_state === 'relearning').length;
    const learning = initialReviews.filter((r) => r.fsrs_state === 'learning').length;
    const overdue = initialReviews.filter((r) => {
      if (!r.due_at) return false;
      return new Date(r.due_at) < new Date();
    }).length;
    return { review, relearning, learning, overdue };
  }, [initialReviews]);

  const getStateLabel = (state: string) => {
    switch (state) {
      case 'relearning': return '错题复习';
      case 'review': return '间隔复习';
      case 'learning': return '学习中';
      default: return state;
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'relearning': return 'bg-red-100 text-red-700';
      case 'review': return 'bg-green-100 text-green-700';
      case 'learning': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">复习中心</h1>
              <p className="text-gray-500">
                {initialReviews.length === 0 ? '太棒了，没有待复习！' : `${initialReviews.length} 项待复习 · 约 ${totalStudyMinutes} 分钟`}
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              返回首页
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 复习统计卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="间隔复习" value={stats.review} color="green" />
          <StatCard label="错题复习" value={stats.relearning} color="red" />
          <StatCard label="学习中新" value={stats.learning} color="yellow" />
          <StatCard label="已掌握" value={masteredCount} color="blue" />
        </div>

        {/* 过期警告 */}
        {stats.overdue > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <div className="font-medium text-red-800">有 {stats.overdue} 项复习已过期</div>
                <div className="text-sm text-red-600">请尽快复习以保持记忆</div>
              </div>
            </div>
          </div>
        )}

        {/* 筛选标签 */}
        <div className="flex gap-2 mb-6">
          {(['all', 'review', 'relearning', 'learning'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f === 'all' ? '全部' : getStateLabel(f)}
              {f !== 'all' && ` (${stats[f as keyof typeof stats]})`}
            </button>
          ))}
        </div>

        {/* 复习列表 */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {filter === 'all' ? '太棒了！' : '没有这类复习'}
            </h2>
            <p className="text-gray-500">
              {filter === 'all' ? '当前没有待复习的内容' : `没有"${getStateLabel(filter)}"的复习项`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReviews.map((review) => (
              <Link
                key={review.node_id}
                href={`/learn/${review.node_id}`}
                className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-medium text-gray-900">{review.title}</div>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStateColor(review.fsrs_state)}`}>
                        {getStateLabel(review.fsrs_state)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>预计 {review.estimated_minutes} 分钟</span>
                      {review.due_at && new Date(review.due_at) < new Date() && (
                        <span className="text-red-500 font-medium">已过期</span>
                      )}
                      {review.mastery_level !== undefined && (
                        <span>掌握度 {Math.round(review.mastery_level * 100)}%</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-500 text-white rounded-lg group-hover:bg-blue-600 transition">
                      开始复习 →
                    </span>
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

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'green' | 'red' | 'yellow' | 'blue';
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]} text-center`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm">{label}</div>
    </div>
  );
}
