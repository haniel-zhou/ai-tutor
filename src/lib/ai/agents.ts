/**
 * 4 个 Agent 的核心调用函数
 *
 * 设计原则:
 * - 每个 Agent 是纯函数: input → output
 * - System prompt 从 prompts/*.md 读取(单独文件方便调优)
 * - Evaluator/Quizzer/Planner 强制 JSON 输出
 * - Explainer 流式输出
 */

import { generateObject, streamText } from 'ai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { models } from './anthropic';

// ============================================================
// 加载 prompts(只在服务端,且缓存)
// ============================================================
const promptCache: Record<string, string> = {};

function loadPrompt(name: string): string {
  if (promptCache[name]) return promptCache[name];
  const filepath = path.join(process.cwd(), 'prompts', `${name}.md`);
  const content = fs.readFileSync(filepath, 'utf-8');
  promptCache[name] = content;
  return content;
}

// ============================================================
// Zod schemas (Quizzer / Evaluator / Planner 的输出格式)
// ============================================================
export const QuizSchema = z.object({
  questions: z
    .array(
      z.object({
        bloom_level: z.enum(['understand', 'apply', 'transfer']),
        question: z.string(),
        answer: z.string(),
        answer_explanation: z.string(),
        common_mistakes: z.array(
          z.object({
            mistake: z.string(),
            diagnosis: z.string(),
          })
        ),
        hint_if_stuck: z.string(),
      })
    )
    .length(3),
});

export const EvalSchema = z.object({
  is_correct: z.boolean(),
  is_partially_correct: z.boolean(),
  score: z.number().min(0).max(1),
  error_diagnosis: z
    .object({
      category: z.enum([
        'concept_gap',
        'procedure_slip',
        'transfer_failure',
        'careless',
        'partial',
        'misread',
      ]),
      specific_issue: z.string(),
      the_step_he_missed: z.string(),
    })
    .nullable(),
  feedback_to_student: z.string(),
  should_show_answer: z.boolean(),
  should_retry: z.boolean(),
  follow_up_question: z.string().nullable(),
});

export const PlanSchema = z.object({
  today_summary: z.string(),
  motivational_line: z.string(),
  plan: z.array(
    z.object({
      slot: z.number(),
      type: z.enum(['review', 'new', 'challenge']),
      node_id: z.string(),
      node_title: z.string(),
      duration_minutes: z.number(),
      why_this: z.string(),
    })
  ),
  total_minutes: z.number(),
  warm_up_question: z.string(),
});

// ============================================================
// Agent 1: Explainer(流式讲解)
// ============================================================
export type ExplainerInput = {
  node: {
    id: string;
    title: string;
    description?: string;
    learning_objectives?: any;
    difficulty: number;
  };
  studentHistory?: Array<{
    node_title: string;
    mastery_level: number;
  }>;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
};

export function explainerStream(input: ExplainerInput) {
  const systemPrompt = loadPrompt('explainer');

  const contextBlock = `
## 当前节点
- ID: ${input.node.id}
- 标题: ${input.node.title}
- 难度: ${input.node.difficulty}/5
- 学习目标: ${JSON.stringify(input.node.learning_objectives || {})}
${input.node.description ? `- 描述: ${input.node.description}` : ''}

## mattaniah 在前置节点的掌握情况
${
  input.studentHistory && input.studentHistory.length > 0
    ? input.studentHistory
        .map((h) => `- ${h.node_title}: ${(h.mastery_level * 100).toFixed(0)}%`)
        .join('\n')
    : '(还没有前置学习数据)'
}

请开始讲解,记住:苏格拉底式提问优先,不要一上来灌输。
`;

  return streamText({
    model: models.primary,
    system: systemPrompt + '\n\n' + contextBlock,
    messages: input.messages,
    temperature: 0.7,
    maxTokens: 1500,
  });
}

// ============================================================
// Agent 2: Quizzer(出 3 道分层题)
// ============================================================
export type QuizzerInput = {
  node: {
    id: string;
    title: string;
    learning_objectives?: any;
    difficulty: number;
  };
  priorQuizHistory?: Array<{ question: string; is_correct: boolean }>;
};

export async function generateQuiz(input: QuizzerInput) {
  const systemPrompt = loadPrompt('quizzer');

  const userPrompt = JSON.stringify(
    {
      node: input.node,
      prior_quiz_history: input.priorQuizHistory || [],
    },
    null,
    2
  );

  const result = await generateObject({
    model: models.primary,
    system: systemPrompt,
    prompt: userPrompt,
    schema: QuizSchema,
    temperature: 0.6,
  });

  return result.object;
}

// ============================================================
// Agent 3: Evaluator(判分 + 错因诊断,用便宜模型)
// ============================================================
export type EvaluatorInput = {
  question: string;
  correct_answer: string;
  answer_explanation: string;
  student_answer: string;
  common_mistakes: Array<{ mistake: string; diagnosis: string }>;
  attempt_count: number;
};

export async function evaluateAnswer(input: EvaluatorInput) {
  const systemPrompt = loadPrompt('evaluator');

  const userPrompt = JSON.stringify(input, null, 2);

  const result = await generateObject({
    model: models.fast, // 用 Haiku!便宜 5x
    system: systemPrompt,
    prompt: userPrompt,
    schema: EvalSchema,
    temperature: 0.3, // 判分要稳定
  });

  return result.object;
}

// ============================================================
// Agent 4: Planner(每日学习计划)
// ============================================================
export type PlannerInput = {
  user_id: string;
  today: string;
  daily_minutes: number;
  current_streak: number;
  due_reviews: Array<{
    node_id: string;
    title: string;
    estimated_minutes: number;
    fsrs_state: string;
  }>;
  next_nodes: Array<{
    node_id: string;
    title: string;
    difficulty: number;
    estimated_minutes: number;
  }>;
  recent_performance: {
    avg_mastery_first_try: number;
    wrong_topics: string[];
    strong_topics: string[];
  };
  preferences?: { interests?: string[] };
};

export async function generateDailyPlan(input: PlannerInput) {
  const systemPrompt = loadPrompt('planner');

  const result = await generateObject({
    model: models.primary,
    system: systemPrompt,
    prompt: JSON.stringify(input, null, 2),
    schema: PlanSchema,
    temperature: 0.7,
  });

  return result.object;
}
