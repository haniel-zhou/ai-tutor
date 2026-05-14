/**
 * FSRS 间隔重复调度器
 *
 * 基于 ts-fsrs 库,封装为业务层易用的接口。
 * 每次答题完毕,根据表现 rating 决定下次复习时间。
 *
 * 学习理论参考:
 * - SuperMemo / FSRS algorithm
 * - https://github.com/open-spaced-repetition/ts-fsrs
 */

import {
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card,
  type Grade,
  createEmptyCard,
} from 'ts-fsrs';

// 默认参数(已经基于 100 万 + 用户数据预训练)
const params = generatorParameters({
  enable_fuzz: true,           // 在精确日期上加随机扰动,避免大量卡片堆积同一天
  enable_short_term: true,     // 短期记忆建模
  request_retention: 0.9,      // 目标记忆保留率 90%(教育场景常用值)
});

const scheduler = fsrs(params);

// ============================================================
// 数据库状态 ↔ FSRS Card 转换
// ============================================================
export type DbMasteryState = {
  user_id: string;
  node_id: string;
  mastery_level?: number;
  fsrs_state: 'new' | 'learning' | 'review' | 'relearning';
  fsrs_stability: number;
  fsrs_difficulty: number;
  fsrs_elapsed_days: number;
  fsrs_scheduled_days: number;
  fsrs_reps: number;
  fsrs_lapses: number;
  due_at: string | null;
};

function stateFromDb(db: DbMasteryState | null): Card {
  if (!db || !db.due_at) {
    return createEmptyCard();
  }
  return {
    due: new Date(db.due_at),
    stability: db.fsrs_stability,
    difficulty: db.fsrs_difficulty,
    elapsed_days: db.fsrs_elapsed_days,
    scheduled_days: db.fsrs_scheduled_days,
    reps: db.fsrs_reps,
    lapses: db.fsrs_lapses,
    state: {
      new: State.New,
      learning: State.Learning,
      review: State.Review,
      relearning: State.Relearning,
    }[db.fsrs_state],
    last_review: db.fsrs_state === 'new' ? undefined : new Date(),
  };
}

function stateToDb(card: Card): Partial<DbMasteryState> {
  const stateMap = {
    [State.New]: 'new',
    [State.Learning]: 'learning',
    [State.Review]: 'review',
    [State.Relearning]: 'relearning',
  } as const;

  return {
    fsrs_state: stateMap[card.state],
    fsrs_stability: card.stability,
    fsrs_difficulty: card.difficulty,
    fsrs_elapsed_days: card.elapsed_days,
    fsrs_scheduled_days: card.scheduled_days,
    fsrs_reps: card.reps,
    fsrs_lapses: card.lapses,
    due_at: card.due.toISOString(),
  };
}

// ============================================================
// 主接口:基于答题表现,计算下次复习时间
// ============================================================
export type PerformanceRating = 'again' | 'hard' | 'good' | 'easy';

const ratingMap: Record<PerformanceRating, Grade> = {
  again: Rating.Again as Grade,
  hard: Rating.Hard as Grade,
  good: Rating.Good as Grade,
  easy: Rating.Easy as Grade,
};

/**
 * 根据答题结果调度下次复习
 *
 * @param current 当前的 mastery_state(从 DB 读出来),如果是首次学则传 null
 * @param rating 这次的表现评级
 * @returns 更新后的 mastery_state(写回 DB)
 */
export function scheduleNext(
  current: DbMasteryState | null,
  rating: PerformanceRating
): Partial<DbMasteryState> {
  const card = stateFromDb(current);
  const result = scheduler.next(card, new Date(), ratingMap[rating]);
  return stateToDb(result.card);
}

/**
 * 根据评估结果决定 rating
 *
 * 规则:
 * - 全错 → again
 * - 全对且时间短 → easy
 * - 全对但部分卡 → good
 * - 部分对 → hard
 */
export function ratingFromQuizResult(args: {
  correctCount: number;
  totalCount: number;
  avgTimeSeconds: number;
  estimatedTimeSeconds: number;
}): PerformanceRating {
  const accuracy = args.correctCount / args.totalCount;

  if (accuracy === 0) return 'again';
  if (accuracy < 0.5) return 'again';
  if (accuracy < 0.85) return 'hard';

  // 全对的情况下看用时
  const timeRatio = args.avgTimeSeconds / args.estimatedTimeSeconds;
  if (timeRatio < 0.7) return 'easy';
  return 'good';
}

/**
 * 把 FSRS 评级转换为 mastery_level 增量(0-1)
 *
 * 这是 FSRS 之外的一层:mastery 用于 UI 显示进度,
 * FSRS 用于安排复习时间。两者协同。
 */
export function masteryDelta(rating: PerformanceRating, currentMastery: number): number {
  const deltas = {
    again: -0.1,
    hard: 0.05,
    good: 0.15,
    easy: 0.25,
  };
  const newMastery = currentMastery + deltas[rating];
  return Math.max(0, Math.min(1, newMastery));
}
