# AI Tutor MVP — 深度运营方案 v2.0

> 为 mattaniah（紫静，14岁初一）打造的 AI 学习陪跑平台。
> 原子级知识点设计 × 完整学习闭环 × 可扩展课程体系。

---

## 一、项目重新定位

### 当前 MVP（已实现）
- 数学第1章：10个原子节点（DAG结构）
- 4个Agent：Explainer / Quizzer / Evaluator / Planner
- 技术栈：Next.js + Supabase + Claude API + FSRS
- 核心闭环：讲解 → 测验 → 错因诊断 → FSRS复习

### 目标：从"MVP演示"到"真正可用的学习系统"

MVP的局限：
- 只有数学第一章（不足以支撑长期学习）
- 只有单学科（英语/日语/物理等空白）
- 知识点靠手动seed（无法规模化）
- 没有真正验证用户粘性（mattaniah用了多久？）

---

## 二、原子级知识点设计（Curriculum Architecture）

### 核心原则：一个知识点 = 一次"讲清楚 + 做出来"

每个节点的结构：
```
知识点
├── 元数据（id/title/difficulty/estimated_minutes）
├── 先决条件（prerequisites[]）
├── 学习目标（learning_objectives，按Bloom分层）
├── 讲解策略（prompt提示词里的教学方法）
├── 典型错因（quizzer预判的2+种错误模式）
├── 评估标准（evaluator的判分标准）
└── 资源（GeoGebra/视频/可汗学院链接）
```

### 原子粒度原则

**太粗**：一个章节当一个知识点 → 学生学不透
**太细**：一个定义当一个知识点 → 节奏碎，FSRS调度爆炸
**刚好**：一个"15分钟内能讲清楚+做出一道题"的概念

| 场景 | 建议粒度 |
|------|---------|
| 概念引入 | 一个"什么是X" = 1个节点 |
| 规则/公式 | 一个规则 = 1个节点（含正例+反例） |
| 综合应用 | 组合多个规则 = 1个节点 |
| 跨学科迁移 | 每个新情境 = 1个新节点 |

### 知识点DAG设计规范

```
math.g7.ch1.s1  "什么是代数式"          → prerequisites: []
math.g7.ch1.s2  "同类项"                → prerequisites: [s1]
math.g7.ch1.s3  "合并同类项"            → prerequisites: [s2]
math.g7.ch1.s4  "去括号"                → prerequisites: [s1]
math.g7.ch1.s5  "整式的加减"           → prerequisites: [s3, s4]
math.g7.ch1.s6  "一元一次方程概念"      → prerequisites: [s1]
math.g7.ch1.s7  "等式性质"              → prerequisites: [s6]
math.g7.ch1.s8  "解方程-移项"            → prerequisites: [s7]
math.g7.ch1.s9  "解方程-含括号"         → prerequisites: [s4, s8]
math.g7.ch1.s10 "应用-行程问题"         → prerequisites: [s9]
```

**节点命名规范**：`{subject}.g{grade}.ch{chapter}.s{section}`

---

## 三、完整课程体系扩展计划

### Phase 1：数学体系（2个月）

**初一上学期（已完成第1章）**
```
ch1  代数基础（10节点）✅ MVP种子
ch2  有理数（预计15节点）
ch3  整式乘法（预计10节点）
ch4  相交线与平行线（预计12节点）
ch5  一元二次方程（预计10节点）
ch6  数据收集与整理（预计8节点）
```

**初一下学期**
```
ch7  二元一次方程组
ch8  不等式与不等式组
ch9  因式分解
ch10 分数的运算
```

**预估总节点数**：~80个数学节点

### Phase 2：英语体系（2个月）

原子节点设计思路（与数学不同）：

| 类型 | 节点示例 | 粒度 |
|------|---------|------|
| 词汇 | 一个单词的多义/搭配 | 每词1节点 |
| 语法 | 一个时态/句型 | 每语法点1节点 |
| 阅读策略 | 推断词义/主旨大意 | 每策略1节点 |
| 写作 | 描述观点/连接词 | 每技能1节点 |

**英语第1批节点设计**（初一上学期同步）：
```
english.g7.ch1 音标与发音规则（10节点）
english.g7.ch2 基础词性（名词/动词/形容词）（15节点）
english.g7.ch3 现在时态体系（8节点）
english.g7.ch4 阅读理解入门（8节点）
```

### Phase 3：日语体系（1个月）

针对mattaniah的兴趣（如果有）或拓展需求：

```
japanese.ch1 五十音图（5个元音+10个辅音 = 15节点）
japanese.ch2 基础句型（我是~/我有~/）（10节点）
japanese.ch3 动词变形（て形/ない形）（12节点）
```

### Phase 4：物理/化学（1个月）

初中物理/化学启蒙，与数学进度配合：

```
physics.g7.ch1 机械运动与速度
physics.g7.ch2 力与运动
chemistry.g7.ch1 物质的构成
```

---

## 四、系统架构深化（Atomic Component Design）

### 4.1 Agent设计深化

#### Explainer Agent（讲解）
```
输入：
- node元数据
- student_history（前置节点掌握度）
- prior_attempts（历史错题）
- session_messages（当前对话）
- learning_objectives（这节课要达到的目标）

输出：
- 流式markdown（含KaTeX公式）
- 每段有1个互动问题
- 苏格拉底式提问

质量标准：
- 不能一次输出超过3段（信息控制）
- 必须检测"敷衍信号"（回答变短→出测试题）
- 必须检测"优等生信号"（主动提问→可以推进）
```

#### Quizzer Agent（出题）
```
输入：
- node元数据
- learning_objectives（Bloom分层）
- prior_quiz_history（避免重复出题）
- student_profile（年龄/年级）

输出：
- 严格3道题：understand / apply / transfer
- 每道题预判2+种common_mistakes
- 每道题有hint_if_stuck（不是答案，是引导问题）

质量标准：
- 理解题错率 < 20%
- 应用题错率 < 40%
- 迁移题错率 < 60%（这是真正检验点）
```

#### Evaluator Agent（评判）
```
输入：
- question + correct_answer
- student_answer
- common_mistakes（Quizzer预判）
- attempt_count（第1次还是第2次）

输出：
- is_correct / is_partially_correct
- error_diagnosis（6分类：concept_gap / procedure_slip / transfer_failure / careless / partial / misread）
- feedback_to_student（给mattaniah看，第二人称，温和）
- should_retry / should_show_answer

决策规则：
- 第1次错 → should_retry: true, should_show_answer: false
- 第2次错同类 → should_retry: false, should_show_answer: true
- 答对 → feedback要具体（"你用X方法，这正是Y的关键"）
```

#### Planner Agent（规划）
```
输入：
- current_streak
- due_reviews（FSRS队列）
- next_nodes（满足先决条件的节点）
- recent_performance（最近7天正确率/强弱项）
- daily_minutes（默认30分钟）

输出：
- today_summary（1句话教练式总结）
- motivational_line（引用真实数据，不泛泛）
- plan[]（slot数组，含why_this）
- warm_up_question（5-30秒能答的开场题）

安排原则：
- 复习优先（FSRS不能miss）
- 新学≤2个节点/天
- 难度交替（容易→难→容易）
- 弱项加权但不集中（每周1个，不是3个）
```

### 4.2 学习事件数据模型（Learning Events）

每个交互都是数据点：

```typescript
type LearningEvent =
  | { type: 'session_start'; node_id; timestamp }
  | { type: 'message_sent'; role: 'user'|'assistant'; content_length; tokens }
  | { type: 'question_asked'; bloom_level; difficulty }
  | { type: 'answer_submitted'; is_correct; time_spent; attempt_number }
  | { type: 'evaluator_feedback'; category; feedback_text }
  | { type: 'mastery_achieved'; node_id; mastery_level; time_to_master }
  | { type: 'review_completed'; rating; next_review_days }
```

**数据价值**：
- 哪个节点的quizzer题目出得太难/太简单？（错率统计）
- mattaniah在什么时间学习效率最高？（学习时间分析）
- 哪些prerequisites最容易成为卡点？（DAG瓶颈分析）
- mastery_achieved的时间分布（判断节点粒度是否合适）

### 4.3 FSRS参数调优

当前默认参数：
```typescript
const params = generatorParameters({
  enable_fuzz: true,
  enable_short_term: true,
  request_retention: 0.9,  // 90%记忆保留
});
```

**可优化方向**：
- request_retention：0.9偏保守，0.85可以减少复习频率
- enable_short_term：对于15分钟粒度的节点，短期记忆可能不需要
- 根据mattaniah的实际lapse率动态调整

---

## 五、用户体验深化

### 5.1 学习流程（Learning Flow）

```
[首页]
  ↓
[今日计划]  ← Planner生成，含warm_up_question
  ↓
[学习节点] /learn/{nodeId}
  ├── 阶段1：讲解（ChatTutor流式对话）
  │     ↓ mattaniah说"准备好了"或完成3轮对话
  │     ↓
  ├── 阶段2：测验（QuizCard，3道Bloom分层题）
  │     ├── 答对 → 具体肯定 → 下一题
  │     ├── 答错第1次 → 引导问题 → 重试
  │     └── 答错第2次 → 给出答案+解释 → 下一题
  │     ↓ 完成全部3题
  │     ↓
  └── 阶段3：总结（复述环节，可选）
        ↓
[结果页]  ← mastery更新，FSRS调度，显示下次复习时间
  ↓
[返回首页]  ← 更新后的streak + 进度
```

### 5.2 游戏化设计

| 模块 | 机制 |
|------|------|
| 连续打卡 | 7天=铜/30天=银/100天=金徽章 |
| 章节通关 | 学完一个大章节解锁勋章 |
| 全对通关 | 3题全对额外奖励 |
| 错题清零 | 某节点所有错题都做对后解锁"清道夫"徽章 |
| 连续全对 | 某个节点连续N次全对 → "大师"标记 |

**Streak保护机制**：
- 复习miss = streak断裂
- 但可以设置"复活卡"（每7天1次，补偿miss的复习）

### 5.3 家长/监督者视角

```
[家长端页面] /parent
- 今日学习报告（时长/内容/正确率）
- 本周趋势图
- 薄弱点预警
- 推送通知（WeCom集成）
```

---

## 六、知识图谱扩展机制

### 手动Seed → 半自动生成

当前：手动写math_chapter_1.ts（约160行代码/10节点）

**扩展后需要的机制**：
1. **课程大纲解析**：输入教材目录 → 输出节点列表
2. **节点批量生成**：批量创建节点 + 批量生成prerequisites关系
3. **难度评估**：基于认知科学为每个节点分配difficulty（1-5）

### 知识图谱DAG可视化

```
ProgressMap组件 → 升级为可交互的DAG图
- 点击节点：查看掌握度/复习历史/错题分布
- 箭头：表示prerequisites依赖
- 颜色：已掌握/学习 中/未学习
- 预测：显示如果继续学下去的时间线
```

---

## 七、技术债务与优化

### 当前MVP的已知问题

| 问题 | 优先级 | 解决方向 |
|------|--------|---------|
| 只支持单用户（userId硬编码为'mattaniah'） | P0 | 登录系统 or 路由参数 |
| 没有真正的用户认证 | P1 | Supabase Auth |
| 知识点全靠手动seed，无法规模化 | P2 | 批量生成工具 |
| GeoGebraEmbed只是占位，没有绑定到具体节点 | P2 | 节点resources字段 + iframe渲染 |
| 每日计划是点击生成，不是自动推送 | P2 | Cronjob每日8点推送WeCom |
| promptfoo eval还没跑 | P2 | 建立评估数据集，跑Eval质量测试 |
| 没有移动端UI | P2 | 响应式Tailwind改造 |
| 没有真正的"复述"环节 | P2 | Explainer加入"用你自己的话讲一遍" |

### 成本优化

当前成本：~$15/月（Anthropic API）

**成本节省方向**：
- Evaluator用Haiku（已实现 ✅）
- 缓存相同的quiz题目（避免重复生成）
- 多节点合并请求（减少API调用次数）
- 监控token使用，超阈值报警

---

## 八、运营验证计划

### 验证指标（Metrics）

| 指标 | 目标 | 测量方式 |
|------|------|---------|
| 日活用户（DAU） | mattaniah每天打开 | daily_records.study_minutes > 0 |
| 平均学习时长 | 每天≥20分钟 | daily_records.study_minutes |
| 知识点掌握率 | 每周掌握≥3个新节点 | mastery_states.is_mastered |
| 测验正确率 | 理解题≥80%正确 | quiz_attempts.is_correct by bloom_level |
| Streak持续率 | 连续≥7天 | get_current_streak() |
| 错题重试率 | 错题第2次正确率≥70% | quiz_attempts by attempt_count |

### 验证时间线

```
第1周（2026-05-20~）：跑通MVP，让mattaniah每天用
  ↓
第2周：收集数据，看DAU和streak
  ↓
第3周：根据错题数据调优Quizzer/Evaluator prompt
  ↓
第4周：扩展数学第2章，同时保持第1章复习
  ↓
第5-8周：扩展英语第1章，建立双学科体系
  ↓
第9-12周：加入日语/物理，测试多学科切换
```

---

## 九、商业化路径（从MVP到产品）

### 当前阶段：一人公司内部工具（mattaniah专用）

### 路径A：面向华人家庭的AI家教（B2C）
- 定位：15-18岁中学生，月付199元
- 差异化：真人老师做不到的——24小时无限提问 + 每次都记住你错哪
- 获客：WeCom社群 + 口碑推荐

### 路径B：面向教育机构的B2B工具
- 定位：教培机构/私立学校的AI助教
- 按学生数收费
- 需要多用户/教师后台

### 路径C：知识点库API
- 其他AI教育产品可以接入知识图谱API
- 按调用次数收费

---

## 十、项目文件夹结构（最终态）

```
ai-tutor-mvp/
├── README.md                    # 项目介绍
├── PROJECT_PLAN_v2.md           # 本文档
├── prompts/
│   ├── explainer.md             # 讲解Agent
│   ├── quizzer.md               # 出题Agent
│   ├── evaluator.md             # 评判Agent
│   └── planner.md               # 规划Agent
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── schema.md
├── seed/
│   ├── math_chapter_1.ts        # ✅ 数学第1章（10节点）
│   ├── math_chapter_2.ts        # 📋 数学第2章（待实现）
│   ├── english_chapter_1.ts     # 📋 英语第1章（待实现）
│   └── japanese_chapter_1.ts    # 📋 日语第1章（待实现）
├── src/
│   ├── app/
│   │   ├── page.tsx             # 首页（今日计划+进度）
│   │   ├── learn/[nodeId]/      # 核心学习页
│   │   ├── review/              # 复习队列
│   │   ├── progress/            # 进度地图
│   │   ├── parent/              # 家长端（待实现）
│   │   └── api/
│   │       ├── tutor/           # 流式讲解
│   │       ├── quiz/            # 生成测验
│   │       ├── evaluate/        # 评判+FSRS
│   │       ├── plan/            # 生成计划
│   │       └── nodes/           # 知识节点CRUD
│   ├── components/
│   │   ├── ChatTutor.tsx        # 讲解对话
│   │   ├── QuizCard.tsx         # 答题卡片
│   │   ├── ProgressMap.tsx      # 进度地图
│   │   └── GeoGebraEmbed.tsx    # GeoGebra集成
│   └── lib/
│       ├── ai/
│       │   ├── agents.ts        # 4个Agent调用
│       │   └── anthropic.ts     # 模型配置
│       ├── db/
│       │   ├── queries.ts       # 业务查询
│       │   └── supabase.ts      # 客户端
│       └── fsrs/
│           └── scheduler.ts     # 间隔重复
├── tests/
│   ├── eval_explainer.yaml      # promptfoo评估
│   ├── eval_quizzer.yaml
│   └── eval_evaluator.yaml
├── scripts/
│   ├── seed-all.sh              # 批量seed所有章节
│   └── generate-chapters.ts     # 从教材大纲生成节点
└── docs/
    ├── curriculum-design.md      # 课程设计规范
    └── agent-prompt-guide.md    # Agent调优指南
```

---

## 十一、下一步行动清单

### 立即执行（本周）

- [ ] **运营验证**：让mattaniah每天用MVP，记录DAU和体验反馈
- [ ] **Prompt调优**：根据mattaniah的实际答题数据，调整Quizzer/Evaluator prompt
- [ ] **数学第2章**：扩展到有理数章节（~15个新节点）
- [ ] **WeCom推送**：实现每日8点自动推送学习计划

### 短期（2-4周）

- [ ] **promptfoo eval**：建立评估数据集，跑Agent质量测试
- [ ] **英语第1章**：音标+基础词性（~15节点）
- [ ] **家长端UI**：简单版进度查看页面
- [ ] **GeoGebra绑定**：为数学节点关联具体GeoGebra活动

### 中期（1-2个月）

- [ ] **多用户支持**：Supabase Auth，支持多学生
- [ ] **知识图谱可视化**：升级ProgressMap为交互DAG
- [ ] **数据驱动优化**：分析learning_events数据，动态调整FSRS参数
- [ ] **日语第1章**：五十音图（~15节点）

### 长期（3个月+）

- [ ] **B2C产品化**：独立域名+支付系统
- [ ] **机构版**：多用户+教师后台
- [ ] **UGC知识图谱**：老师可以自己创建节点
- [ ] **知识点API**：对外开放知识图谱能力

---

## 附：YC框架快速过一遍

| YC问题 | 回答 |
|--------|------|
| **Pain** | 初一学生每天30分钟学习，无人陪跑。家长不会教，辅导班太贵，豆包等通用AI没有学习闭环和间隔复习 |
| **Solution** | 原子知识点DAG + 4-Agent系统（讲解/出题/评判/规划）+ FSRS复习 = 真正的AI家教 |
| **Market** | 14-18岁中学生家长，中国约1亿初高中生，月付199元意愿强 |
| **Business Model** | B2C月付199元/生 or B2B按学生数收费 |
| **Team** | Haniel + Agent团队，Kimi写代码，Sojourner运营 |
| **Metrics** | 每日打开率≥80%，streak≥14天，知识点掌握≥3/周 |
| **Defensibility** | 学习数据积累（学生弱项图谱）+ 知识点原子化设计，3年后还在 |

**核心假设验证**：让mattaniah连续用4周，记录DAU和streak。这是最重要的指标。

---

*文档版本：v2.0*
*最后更新：2026-05-20*
*作者：Sojourner（Context Farmer）*
