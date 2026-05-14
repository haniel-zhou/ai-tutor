# AI Tutor MVP

mattaniah（14岁，初一）的 AI 学习陪跑平台。

## 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入 ANTHROPIC_API_KEY 和 Supabase 配置

# 3. 初始化数据库
# 在 Supabase Dashboard -> SQL Editor 执行 supabase/migrations/001_initial_schema.sql

# 4. 灌入种子数据
pnpm run seed

# 5. 启动开发服务器
pnpm dev
```

访问 http://localhost:3000

## 技术栈

- **前端**: Next.js 15 + React 19 + Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **AI**: Claude API (Sonnet/Haiku)
- **间隔重复**: ts-fsrs

## 核心功能

1. **AI 讲解** (`/learn/[nodeId]`) — 流式对话，苏格拉底式提问
2. **测验系统** — Bloom 三层出题（理解/应用/迁移）
3. **错因诊断** — 6 类错因分类，不直接给答案
4. **FSRS 复习** — 科学间隔重复算法
5. **每日计划** — 基于复习队列 + 弱项加权

## 4 周开发计划

| 周 | 目标 | 状态 |
|----|------|------|
| 1 | 跑通流式讲解 + 基础 UI | 🔨 进行中 |
| 2 | 完善测验闭环 + 错因诊断 | ⬜ |
| 3 | FSRS 集成 + 每日计划 | ⬜ |
| 4 | 精修 + GeoGebra + promptfoo eval | ⬜ |

## 成本预估

| 项 | 金额 |
|----|------|
| Anthropic API | ~$15 |
| Supabase | $0 (免费) |
| Vercel | $0 (免费) |
| **总计** | **< $20** |