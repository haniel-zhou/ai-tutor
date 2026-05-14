/**
 * 数学第 1 章节 - 代数基础 (初一上学期)
 *
 * 这是一个示例。MVP 阶段你需要把 mattaniah 的实际教材
 * 第 1 章手动梳理成这样的 DAG。
 *
 * 关键设计:
 * - 每个节点是一个原子知识点(15 分钟内能讲清)
 * - prerequisites 决定先决条件,影响"下一节点"推荐
 * - learning_objectives 给 Quizzer 出题做参考
 */

export const mathChapter1 = [
  {
    id: 'math.g7.ch1.s1',
    subject: 'math',
    chapter: 'ch1_代数基础',
    title: '什么是代数式',
    description: '用字母表示数,理解代数式的意义',
    bloom_level: 'understand',
    difficulty: 2,
    estimated_minutes: 12,
    prerequisites: [],
    learning_objectives: {
      understand: ['知道字母可以表示任意数', '能识别什么是代数式'],
      apply: ['会写出简单的代数式表示数量关系'],
    },
  },
  {
    id: 'math.g7.ch1.s2',
    subject: 'math',
    chapter: 'ch1_代数基础',
    title: '同类项',
    description: '识别同类项,理解合并的前提条件',
    bloom_level: 'understand',
    difficulty: 2,
    estimated_minutes: 15,
    prerequisites: ['math.g7.ch1.s1'],
    learning_objectives: {
      understand: ['知道什么是同类项', '能从一堆项中找出同类项'],
      apply: ['判断给定的两项是不是同类项'],
    },
  },
  {
    id: 'math.g7.ch1.s3',
    subject: 'math',
    chapter: 'ch1_代数基础',
    title: '合并同类项',
    description: '把多个同类项合并为一项',
    bloom_level: 'apply',
    difficulty: 3,
    estimated_minutes: 18,
    prerequisites: ['math.g7.ch1.s2'],
    learning_objectives: {
      apply: ['正确合并同类项,系数相加,字母部分不变'],
      transfer: ['在多项式化简中识别并合并同类项'],
    },
  },
  {
    id: 'math.g7.ch1.s4',
    subject: 'math',
    chapter: 'ch1_代数基础',
    title: '去括号',
    description: '前面是加号 / 减号时,去括号规则',
    bloom_level: 'apply',
    difficulty: 3,
    estimated_minutes: 18,
    prerequisites: ['math.g7.ch1.s1'],
    learning_objectives: {
      understand: ['理解去括号的本质是乘法分配律'],
      apply: ['正确处理括号前的 +/- 符号'],
    },
  },
  {
    id: 'math.g7.ch1.s5',
    subject: 'math',
    chapter: 'ch1_代数基础',
    title: '整式的加减',
    description: '综合运用去括号 + 合并同类项',
    bloom_level: 'apply',
    difficulty: 4,
    estimated_minutes: 20,
    prerequisites: ['math.g7.ch1.s3', 'math.g7.ch1.s4'],
    learning_objectives: {
      apply: ['熟练化简整式加减表达式'],
      transfer: ['用整式表达实际问题的数量关系'],
    },
  },
  {
    id: 'math.g7.ch1.s6',
    subject: 'math',
    chapter: 'ch1_代数基础',
    title: '一元一次方程的概念',
    description: '什么是方程,什么是一元一次方程',
    bloom_level: 'understand',
    difficulty: 2,
    estimated_minutes: 12,
    prerequisites: ['math.g7.ch1.s1'],
    learning_objectives: {
      understand: ['知道方程是含未知数的等式', '识别一元一次方程的特征'],
    },
  },
  {
    id: 'math.g7.ch1.s7',
    subject: 'math',
    chapter: 'ch1_代数基础',
    title: '等式的性质',
    description: '等式两边同时进行某种运算',
    bloom_level: 'understand',
    difficulty: 2,
    estimated_minutes: 15,
    prerequisites: ['math.g7.ch1.s6'],
    learning_objectives: {
      understand: ['知道等式两边同加同减、同乘同除'],
      apply: ['用等式性质做简单变形'],
    },
  },
  {
    id: 'math.g7.ch1.s8',
    subject: 'math',
    chapter: 'ch1_代数基础',
    title: '解一元一次方程 - 移项',
    description: '移项的本质是等式性质,变号',
    bloom_level: 'apply',
    difficulty: 3,
    estimated_minutes: 20,
    prerequisites: ['math.g7.ch1.s7'],
    learning_objectives: {
      apply: ['正确移项求解 ax + b = c 类方程'],
    },
  },
  {
    id: 'math.g7.ch1.s9',
    subject: 'math',
    chapter: 'ch1_代数基础',
    title: '解一元一次方程 - 含括号',
    description: '先去括号再移项',
    bloom_level: 'apply',
    difficulty: 4,
    estimated_minutes: 20,
    prerequisites: ['math.g7.ch1.s4', 'math.g7.ch1.s8'],
    learning_objectives: {
      apply: ['综合应用去括号 + 移项求解方程'],
    },
  },
  {
    id: 'math.g7.ch1.s10',
    subject: 'math',
    chapter: 'ch1_代数基础',
    title: '一元一次方程的应用 - 行程问题',
    description: '用方程解决路程速度时间问题',
    bloom_level: 'transfer',
    difficulty: 4,
    estimated_minutes: 25,
    prerequisites: ['math.g7.ch1.s9'],
    learning_objectives: {
      transfer: ['从实际问题中抽出方程模型', '能解决经典的相遇 / 追及问题'],
    },
  },
];
