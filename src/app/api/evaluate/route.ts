/**
 * POST /api/evaluate
 *
 * 整合 Evaluator + FSRS + mastery 更新的核心接口。
 *
 * 流程:
 * 1. 学生提交答案
 * 2. 调用 Evaluator(Haiku) 判分 + 错因诊断
 * 3. 如果正确 → 返回正向反馈
 * 4. 如果错误第1次 → 返回引导问题 + should_retry=true
 * 5. 如果错误第2次 → 返回完整答案 + should_show_answer=true
 * 6. 如果是最后一题 → 触发 FSRS 调度 + 更新 mastery
 */

import { NextRequest, NextResponse } from 'next/server';
import { evaluateAnswer } from '@/lib/ai/agents';
import {
  getMasteryState,
  upsertMasteryState,
  recordQuizAttempt,
  logEvent,
} from '@/lib/db/queries';
import {
  scheduleNext,
  ratingFromQuizResult,
  masteryDelta,
  type PerformanceRating,
} from '@/lib/fsrs/scheduler';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      nodeId,
      bloomLevel,
      question,
      correctAnswer,
      answerExplanation,
      studentAnswer,
      commonMistakes,
      attemptCount = 1,
      timeSpentSeconds = 30,
      isLastQuestionOfNode = false,
    } = body;

    // 1. 调用 Evaluator (Haiku, 便宜快)
    const evalResult = await evaluateAnswer({
      question,
      correct_answer: correctAnswer,
      answer_explanation: answerExplanation,
      student_answer: studentAnswer,
      common_mistakes: commonMistakes || [],
      attempt_count: attemptCount,
    });

    // 2. 记录答题
    await recordQuizAttempt({
      user_id: userId,
      node_id: nodeId,
      bloom_level: bloomLevel,
      question,
      correct_answer: correctAnswer,
      student_answer: studentAnswer,
      is_correct: evalResult.is_correct,
      error_diagnosis: evalResult.error_diagnosis,
      evaluator_feedback: evalResult.feedback_to_student,
      time_spent_seconds: timeSpentSeconds,
    });

    // 3. 构建返回结果
    const response: any = {
      evaluation: {
        is_correct: evalResult.is_correct,
        is_partially_correct: evalResult.is_partially_correct,
        score: evalResult.score,
        feedback_to_student: evalResult.feedback_to_student,
        should_show_answer: evalResult.should_show_answer,
        should_retry: evalResult.should_retry,
        follow_up_question: evalResult.follow_up_question,
        error_diagnosis: evalResult.error_diagnosis,
      },
    };

    // 4. 如果是最后一题，触发 FSRS 调度
    if (isLastQuestionOfNode) {
      const currentMastery = await getMasteryState(userId, nodeId);

      // 综合 rating (基于这次答题表现 + 之前的掌握度)
      const rating: PerformanceRating = evalResult.is_correct
        ? evalResult.score >= 0.95
          ? 'easy'
          : 'good'
        : evalResult.is_partially_correct
        ? 'hard'
        : 'again';

      // FSRS 算下次复习时间
      const fsrsUpdate = scheduleNext(currentMastery, rating);

      // Mastery 增量
      const oldMastery = currentMastery?.mastery_level
        ? Number(currentMastery.mastery_level)
        : 0;
      const newMastery = masteryDelta(rating, oldMastery);

      await upsertMasteryState(userId, nodeId, {
        ...fsrsUpdate,
        mastery_level: newMastery,
      });

      // 如果首次达 0.85，记录 mastery_achieved 事件
      if (oldMastery < 0.85 && newMastery >= 0.85) {
        await logEvent({
          user_id: userId,
          node_id: nodeId,
          event_type: 'mastery_achieved',
          payload: { mastery_level: newMastery, rating },
        });
      }

      // 记录 quiz_completed 事件
      await logEvent({
        user_id: userId,
        node_id: nodeId,
        event_type: 'quiz_completed',
        payload: { rating, old_mastery: oldMastery, new_mastery: newMastery },
      });

      response.mastery_update = {
        old_mastery: oldMastery,
        new_mastery: newMastery,
        is_mastered: newMastery >= 0.85,
        next_review_at: fsrsUpdate.due_at,
      };
    }

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('/api/evaluate error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
