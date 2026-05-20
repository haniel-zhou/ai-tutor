/**
 * Anthropic 客户端封装
 *
 * 设计原则:
 * 1. 区分模型用途(Sonnet 用于讲解/规划,Haiku 用于判分)
 * 2. 统一记录 token 使用和成本
 * 3. 流式输出原生支持
 */

import { createAnthropic } from '@ai-sdk/anthropic';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL,
});

// 模型选择策略
export const models = {
  // 主力模型:讲解、出题、规划。质量优先。
  primary: anthropic('claude-sonnet-4-6'),

  // 副模型:判分、分类、轻量评估。成本/速度优先。
  fast: anthropic('claude-haiku-4-5-20251001'),

  // 顶配:遇到特别难的诊断或元认知反思时再用
  // 注意 4 周 MVP 阶段不建议用,等数据出来再说
  pro: anthropic('claude-opus-4-7'),
};

// 价格表(美元 per 1M tokens),用于成本日志
export const pricing = {
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-haiku-4-5-20251001': { input: 0.8, output: 4 },
  'claude-opus-4-7': { input: 15, output: 75 },
};

export function estimateCost(
  model: keyof typeof pricing,
  inputTokens: number,
  outputTokens: number
): number {
  const p = pricing[model];
  if (!p) return 0;
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
}
