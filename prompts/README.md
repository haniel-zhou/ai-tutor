# AI Tutor MVP — 起步代码

mattaniah 4 周 MVP 的起步代码。基于 Next.js 15 + Supabase + Claude API + FSRS。

## 你需要先准备

1. **Anthropic API Key** — https://console.anthropic.com（充值 $20 即可跑完 4 周 MVP）
2. **Supabase 项目** — https://supabase.com（免费 tier 够用）
3. **Node.js 20+** 和 pnpm
4. **Vercel 账号**（部署用，可选）

## 5 分钟跑起来

```bash
# 1. 安装依赖
pnpm install

# 2. 复制环境变量
cp .env.example .env.local

# 编辑 .env.local 填入：
# - ANTHROPIC_API_KEY=sk-ant-...
# - NEXT_PUBLIC_SUPABASE_URL=...
# - NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# - SUPABASE_SERVICE_ROLE_KEY=...

# 3. 在 Supabase Dashboard 的 SQL Editor 里执行
# supabase/migrations/001_initial_schema.sql

# 4. 灌入数学知识图谱 seed
pnpm run seed

# 5. 启动
pnpm dev
# 访问 http://localhost:3000
```

## 目录结构

```
starter-code/
├── prompts/                    # 4 个 Agent 的 system prompts
│   ├── explainer.md           # 讲解者
│   ├── quizzer.md             # 出题者
│   ├── evaluator.md           # 评判者
│   └── planner.md             # 规划者
├── supabase/
│   └── migrations/001_initial_schema.sql  # 数据库 schema
├── seed/
│   └── math_chapter_1.ts      # 数学第一章节知识图谱
├── src/
│   ├── app/
│   │   ├── page.tsx           # 主页：今日计划 + 进度
│   │   ├── learn/[nodeId]/    # 学一个节点（核心页面）
│   │   ├── review/            # 复习队列
│   │   └── api/
│   │       ├── tutor/         # 流式讲解 + 对话
│   │       ├── evaluate/      # 判分 + 错因诊断
│   │       └── plan/          # 生成今日计划
│   ├── lib/
│   │   ├── ai/                # AI 调用封装
│   │   ├── fsrs/              # 间隔重复算法
│   │   └── db/                # Supabase 客户端
│   └── components/
│       ├── ChatTutor.tsx      # 讲解 + 对话 UI
│       ├── QuizCard.tsx       # 答题 UI
│       └── ProgressMap.tsx    # 知识图谱可视化
└── package.json
```

## 4 周开发顺序（对应方案 Part 4）

### 周 1：地基
- [x] 这个 repo 提供：schema、auth、AI 调用框架、UI 骨架
- [ ] 你要做：补完数学第 1 章（10 个节点），跑通 `/learn/[nodeId]` 看到 Claude 流式输出

### 周 2：核心闭环
- [ ] 完善 Quizzer：每节点 3 道分层题
- [ ] 完善 Evaluator：错因诊断不只是判分
- [ ] 加"复述"环节（让学生用自己的话讲）
- [ ] 让 mattaniah 实测

### 周 3：记忆 + 计划
- [ ] 集成 FSRS（lib/fsrs 已实现）
- [ ] 实现 `/review` 页面
- [ ] 实现 `/api/plan` 每日规划 Agent
- [ ] 嵌入 GeoGebra（用 iframe，参考 components/GeoGebraEmbed.tsx）

### 周 4：精修
- [ ] KaTeX 公式渲染
- [ ] 进度条 + 连续天数
- [ ] 用 promptfoo 跑 Evaluator eval
- [ ] 3-5 人试用

## 部署到 Vercel

```bash
vercel deploy
# 在 Vercel Dashboard 添加环境变量
# 完成！
```

## 关键提示

1. **prompts/ 里的 4 个 prompt 是产品质量的 80%**。先不要乱改 UI，先把 prompt 调好。
2. **Evaluator 一定要用 Haiku**（便宜 5x），其他用 Sonnet。
3. **mattaniah 测试时不要在他旁边解释**，让他自己用。卡住的地方才是真正的产品问题。
4. **每周末做一次"用户访谈"**：mattaniah 觉得哪里好、哪里烦。这比你看数据更重要。

## 成本预估（4 周 MVP）

| 项 | 预估 |
|----|------|
| Anthropic API | ~$15（mattaniah 每天 30 分钟，4 周） |
| Supabase | $0（免费 tier） |
| Vercel | $0（免费 tier） |
| **总计** | **< $20** |
