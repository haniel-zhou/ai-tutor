'use client';

import Link from 'next/link';

interface PlanSlot {
  slot: number;
  type: 'review' | 'new' | 'challenge';
  node_id: string;
  node_title: string;
  duration_minutes: number;
  why_this: string;
}

interface DailyPlan {
  today_summary: string;
  motivational_line: string;
  plan: PlanSlot[];
  total_minutes: number;
  warm_up_question: string;
}

interface DailyPlanCardProps {
  plan: DailyPlan;
  dueReviewsCount: number;
}

export default function DailyPlanCard({ plan, dueReviewsCount }: DailyPlanCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* 计划头部 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">今日学习计划</h2>
            <p className="text-blue-100 text-sm">
              {plan.total_minutes} 分钟 · {plan.plan.length} 个任务
            </p>
          </div>
          <div className="text-right">
            {dueReviewsCount > 0 && (
              <div className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {dueReviewsCount} 项复习待完成
              </div>
            )}
          </div>
        </div>

        {/* 一句话总结 */}
        <p className="mt-4 text-lg">{plan.today_summary}</p>

        {/* 激励语 */}
        <p className="mt-2 text-blue-100 text-sm italic">{plan.motivational_line}</p>
      </div>

      {/* 暖身问题 */}
      {plan.warm_up_question && (
        <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-100">
          <div className="flex items-start gap-3">
            <span className="text-xl">🔥</span>
            <div>
              <div className="text-sm font-medium text-yellow-800">暖身题</div>
              <p className="text-yellow-900">{plan.warm_up_question}</p>
            </div>
          </div>
        </div>
      )}

      {/* 任务列表 */}
      <div className="divide-y">
        {plan.plan.map((slot, i) => (
          <div
            key={i}
            className="p-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-4">
              {/* 序号 */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  slot.type === 'review'
                    ? 'bg-green-100 text-green-700'
                    : slot.type === 'new'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {i + 1}
              </div>

              {/* 任务信息 */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{slot.node_title}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
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
                </div>
                <div className="text-sm text-gray-500 mt-1">{slot.why_this}</div>
              </div>

              {/* 时间和操作 */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">{slot.duration_minutes} 分钟</span>
                <Link
                  href={`/learn/${slot.node_id}`}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                >
                  开始
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
