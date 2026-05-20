/**
 * /review 页面
 * 展示 FSRS 复习队列，支持按状态筛选
 */

import { getDueReviews } from '@/lib/db/queries';
import ReviewPageClient from './ReviewPageClient';

export default async function ReviewPage() {
  const userId = 'mattaniah';
  const dueReviews = await getDueReviews(userId, 20);

  // 计算统计数据
  const totalStudyMinutes = dueReviews.reduce((sum, r) => sum + r.estimated_minutes, 0);
  const masteredCount = dueReviews.filter((r) => r.mastery_level && r.mastery_level >= 0.85).length;
  const totalCount = dueReviews.length;

  return (
    <ReviewPageClient
      initialReviews={dueReviews}
      totalStudyMinutes={totalStudyMinutes}
      masteredCount={masteredCount}
      totalCount={totalCount}
    />
  );
}
