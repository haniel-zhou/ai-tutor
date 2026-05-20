/**
 * 数学第 3 章节 - 整式的乘法与乘法公式 (初一上学期)
 *
 * 包含: 幂的运算、整式乘法、乘法公式
 * 共 10 个原子节点
 */

export const mathChapter3 = [
  // ============================================================
  // s1-s3: 幂的运算
  // ============================================================
  {
    id: 'math.g7.ch3.s1',
    subject: 'math',
    chapter: 'ch3_整式的乘法',
    title: '同底数幂的乘法',
    description: '同底数幂相乘，底数不变，指数相加',
    bloom_level: 'understand',
    difficulty: 2,
    estimated_minutes: 12,
    prerequisites: ['math.g7.ch2.s13'], // 需要先学乘方
    learning_objectives: {
      understand: ['理解同底数幂乘法法则：$a^m \\cdot a^n = a^{m+n}$'],
      apply: ['会用法则进行同底数幂的乘法运算'],
    },
  },
  {
    id: 'math.g7.ch3.s2',
    subject: 'math',
    chapter: 'ch3_整式的乘法',
    title: '幂的乘方',
    description: '(a^m)^n = a^(mn)',
    bloom_level: 'understand',
    difficulty: 2,
    estimated_minutes: 12,
    prerequisites: ['math.g7.ch3.s1'],
    learning_objectives: {
      understand: ['理解幂的乘方法则：$(a^m)^n = a^{mn}$'],
      apply: ['会把幂的乘方转化为同底数幂乘法来理解'],
    },
  },
  {
    id: 'math.g7.ch3.s3',
    subject: 'math',
    chapter: 'ch3_整式的乘法',
    title: '积的乘方',
    description: '(ab)^n = a^n * b^n',
    bloom_level: 'understand',
    difficulty: 3,
    estimated_minutes: 15,
    prerequisites: ['math.g7.ch3.s2'],
    learning_objectives: {
      understand: ['理解积的乘方法则：$(ab)^n = a^n b^n$'],
      apply: ['会把积的乘方展开成幂的乘积', '会把复杂的幂运算化简'],
    },
  },

  // ============================================================
  // s4-s5: 整式的乘法
  // ============================================================
  {
    id: 'math.g7.ch3.s4',
    subject: 'math',
    chapter: 'ch3_整式的乘法',
    title: '单项式乘以单项式',
    description: '系数相乘，同底数幂相乘',
    bloom_level: 'apply',
    difficulty: 2,
    estimated_minutes: 15,
    prerequisites: ['math.g7.ch3.s1', 'math.g7.ch1.s3'], // 需要合并同类项基础
    learning_objectives: {
      understand: ['理解单项式乘法法则：系数相乘，同底数幂相乘'],
      apply: ['能正确进行单项式乘以单项式的运算'],
    },
  },
  {
    id: 'math.g7.ch3.s5',
    subject: 'math',
    chapter: 'ch3_整式的乘法',
    title: '单项式乘以多项式',
    description: '用单项式分别乘以多项式的每一项',
    bloom_level: 'apply',
    difficulty: 3,
    estimated_minutes: 15,
    prerequisites: ['math.g7.ch3.s4', 'math.g7.ch1.s4'], // 需要去括号基础
    learning_objectives: {
      understand: ['理解乘法分配律在整式乘法中的应用'],
      apply: ['能用分配律把单项式乘以多项式转化为单项式乘法'],
    },
  },

  // ============================================================
  // s6: 多项式乘以多项式
  // ============================================================
  {
    id: 'math.g7.ch3.s6',
    subject: 'math',
    chapter: 'ch3_整式的乘法',
    title: '多项式乘以多项式',
    description: '一个多项式的每一项乘以另一个多项式的每一项',
    bloom_level: 'apply',
    difficulty: 3,
    estimated_minutes: 18,
    prerequisites: ['math.g7.ch3.s5'],
    learning_objectives: {
      understand: ['理解多项式乘法本质：每个项都要和另一个多项式的每个项相乘'],
      apply: ['能正确展开两项乘两项（$(a+b)(c+d)$）'],
    },
  },

  // ============================================================
  // s7-s9: 乘法公式
  // ============================================================
  {
    id: 'math.g7.ch3.s7',
    subject: 'math',
    chapter: 'ch3_整式的乘法',
    title: '平方差公式',
    description: '(a+b)(a-b) = a² - b²',
    bloom_level: 'apply',
    difficulty: 3,
    estimated_minutes: 18,
    prerequisites: ['math.g7.ch3.s6'],
    learning_objectives: {
      understand: ['理解平方差公式的几何意义（面积差）', '记住公式：$(a+b)(a-b) = a^2 - b^2$'],
      apply: ['能识别可以用平方差公式的结构', '能正向和逆向使用公式'],
      transfer: ['能在复杂表达式中识别和应用平方差公式'],
    },
  },
  {
    id: 'math.g7.ch3.s8',
    subject: 'math',
    chapter: 'ch3_整式的乘法',
    title: '完全平方公式（上）',
    description: '(a+b)² = a² + 2ab + b²',
    bloom_level: 'apply',
    difficulty: 3,
    estimated_minutes: 18,
    prerequisites: ['math.g7.ch3.s6'],
    learning_objectives: {
      understand: ['理解完全平方公式的推导过程', '记住公式：$(a+b)^2 = a^2 + 2ab + b^2$'],
      apply: ['能正确展开$(a+b)^2$'],
    },
  },
  {
    id: 'math.g7.ch3.s9',
    subject: 'math',
    chapter: 'ch3_整式的乘法',
    title: '完全平方公式（下）',
    description: '(a-b)² = a² - 2ab + b²',
    bloom_level: 'apply',
    difficulty: 3,
    estimated_minutes: 18,
    prerequisites: ['math.g7.ch3.s8'],
    learning_objectives: {
      understand: ['理解$(a-b)^2$与$(a+b)^2$的联系', '记住公式：$(a-b)^2 = a^2 - 2ab + b^2$'],
      apply: ['能识别并正确使用完全平方公式的两种形式', '能判断什么时候用哪个公式'],
      transfer: ['能在复杂表达式中识别和应用完全平方公式'],
    },
  },

  // ============================================================
  // s10: 综合应用
  // ============================================================
  {
    id: 'math.g7.ch3.s10',
    subject: 'math',
    chapter: 'ch3_整式的乘法',
    title: '乘法公式的综合应用',
    description: '综合运用平方差公式和完全平方公式',
    bloom_level: 'transfer',
    difficulty: 4,
    estimated_minutes: 20,
    prerequisites: ['math.g7.ch3.s7', 'math.g7.ch3.s9', 'math.g7.ch1.s5'], // 需要整式加减基础
    learning_objectives: {
      understand: ['理解三种乘法公式的区别和联系'],
      apply: ['能在具体问题中选择合适的公式', '能处理需要连续使用多个公式的情况'],
      transfer: ['能在实际问题中建立并化简整式乘法模型'],
    },
  },
];
