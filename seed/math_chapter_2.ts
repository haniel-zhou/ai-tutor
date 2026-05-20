/**
 * 数学第 2 章节 - 有理数 (初一上学期)
 *
 * 包含: 正负数、数轴、相反数、绝对值、四则运算、乘方
 * 共 15 个原子节点
 */

export const mathChapter2 = [
  // ============================================================
  // s1-s3: 基础概念
  // ============================================================
  {
    id: 'math.g7.ch2.s1',
    subject: 'math',
    chapter: 'ch2_有理数',
    title: '正数和负数',
    description: '用正负数表示相反意义的量',
    bloom_level: 'understand',
    difficulty: 1,
    estimated_minutes: 10,
    prerequisites: [],
    learning_objectives: {
      understand: ['知道正负数表示相反意义的量', '能举出正负数的实际例子'],
      apply: ['会给一个量正确地标注正负'],
    },
  },
  {
    id: 'math.g7.ch2.s2',
    subject: 'math',
    chapter: 'ch2_有理数',
    title: '有理数的分类',
    description: '整数、分数、正数、负数的分类',
    bloom_level: 'understand',
    difficulty: 2,
    estimated_minutes: 12,
    prerequisites: ['math.g7.ch2.s1'],
    learning_objectives: {
      understand: ['知道有理数包括所有整数和分数', '能区分正整数、负整数、正分数、负分数'],
      apply: ['会把一个有理数正确分类'],
    },
  },
  {
    id: 'math.g7.ch2.s3',
    subject: 'math',
    chapter: 'ch2_有理数',
    title: '数轴',
    description: '用数轴表示有理数，理解数轴的三要素',
    bloom_level: 'understand',
    difficulty: 2,
    estimated_minutes: 12,
    prerequisites: ['math.g7.ch2.s1'],
    learning_objectives: {
      understand: ['知道数轴的三要素：原点、正方向、单位长度', '理解所有有理数都可以用数轴上的点表示'],
      apply: ['能在数轴上标出指定的有理数', '能读出数轴上点的有理数'],
    },
  },

  // ============================================================
  // s4-s5: 相反数和绝对值
  // ============================================================
  {
    id: 'math.g7.ch2.s4',
    subject: 'math',
    chapter: 'ch2_有理数',
    title: '相反数',
    description: '理解相反数的概念，掌握求相反数的方法',
    bloom_level: 'understand',
    difficulty: 2,
    estimated_minutes: 12,
    prerequisites: ['math.g7.ch2.s3'],
    learning_objectives: {
      understand: ['知道相反数的定义：和为 0 的两个数', '理解互为相反数的两个数在数轴上的位置关系'],
      apply: ['会求一个数的相反数', '会化简多重符号'],
    },
  },
  {
    id: 'math.g7.ch2.s5',
    subject: 'math',
    chapter: 'ch2_有理数',
    title: '绝对值',
    description: '理解绝对值的几何意义和代数意义',
    bloom_level: 'understand',
    difficulty: 3,
    estimated_minutes: 15,
    prerequisites: ['math.g7.ch2.s3', 'math.g7.ch2.s4'],
    learning_objectives: {
      understand: ['知道绝对值的几何意义：数轴上点到原点的距离', '知道 $|a| = a$（$a>0$），$|a| = -a$（$a<0$），$|a| = 0$（$a=0$）'],
      apply: ['会求一个有理数的绝对值', '能用绝对值比较负数大小'],
    },
  },

  // ============================================================
  // s6: 有理数大小比较
  // ============================================================
  {
    id: 'math.g7.ch2.s6',
    subject: 'math',
    chapter: 'ch2_有理数',
    title: '有理数的大小比较',
    description: '利用数轴和绝对值比较有理数大小',
    bloom_level: 'apply',
    difficulty: 3,
    estimated_minutes: 15,
    prerequisites: ['math.g7.ch2.s3', 'math.g7.ch2.s5'],
    learning_objectives: {
      understand: ['理解两个负数比较大小：绝对值大的反而小'],
      apply: ['会比较大小的多种方法（数轴法、绝对值法、作差法）'],
      transfer: ['能在实际问题中比较数量大小'],
    },
  },

  // ============================================================
  // s7-s9: 有理数的加法
  // ============================================================
  {
    id: 'math.g7.ch2.s7',
    subject: 'math',
    chapter: 'ch2_有理数',
    title: '有理数的加法法则',
    description: '同号相加、异号相加、与0相加的法则',
    bloom_level: 'understand',
    difficulty: 2,
    estimated_minutes: 15,
    prerequisites: ['math.g7.ch2.s5'],
    learning_objectives: {
      understand: ['理解同号两数相加：取相同符号，把绝对值相加', '理解异号两数相加：取绝对值大的符号，用大绝对值减小绝对值'],
      apply: ['会进行有理数的加法运算'],
    },
  },
  {
    id: 'math.g7.ch2.s8',
    subject: 'math',
    chapter: 'ch2_有理数',
    title: '加法运算律',
    description: '交换律、结合律在有理数中的应用',
    bloom_level: 'apply',
    difficulty: 3,
    estimated_minutes: 15,
    prerequisites: ['math.g7.ch2.s7'],
    learning_objectives: {
      understand: ['理解加法交换律：$a+b=b+a$', '理解加法结合律：$(a+b)+c=a+(b+c)$'],
      apply: ['会用运算律简化计算', '会把互为相反数的两个数凑成 0'],
    },
  },
  {
    id: 'math.g7.ch2.s9',
    subject: 'math',
    chapter: 'ch2_有理数',
    title: '有理数的减法',
    description: '减去一个数等于加上它的相反数',
    bloom_level: 'apply',
    difficulty: 3,
    estimated_minutes: 15,
    prerequisites: ['math.g7.ch2.s7', 'math.g7.ch2.s4'],
    learning_objectives: {
      understand: ['理解减去一个数等于加上它的相反数：$a-b=a+(-b)$'],
      apply: ['会把减法转化为加法来计算', '能处理含有多重括号的减法'],
    },
  },

  // ============================================================
  // s10-s11: 有理数的乘法
  // ============================================================
  {
    id: 'math.g7.ch2.s10',
    subject: 'math',
    chapter: 'ch2_有理数',
    title: '有理数的乘法法则',
    description: '同号得正、异号得负、任何数乘0得0',
    bloom_level: 'understand',
    difficulty: 2,
    estimated_minutes: 15,
    prerequisites: ['math.g7.ch2.s7'],
    learning_objectives: {
      understand: ['理解乘法符号法则：同号得正，异号得负', '记住任何数乘 0 都得 0'],
      apply: ['会进行有理数的乘法运算'],
    },
  },
  {
    id: 'math.g7.ch2.s11',
    subject: 'math',
    chapter: 'ch2_有理数',
    title: '乘法运算律',
    description: '乘法交换律、结合律、分配律',
    bloom_level: 'apply',
    difficulty: 3,
    estimated_minutes: 18,
    prerequisites: ['math.g7.ch2.s10'],
    learning_objectives: {
      understand: ['理解乘法交换律、结合律、分配律'],
      apply: ['会用运算律简化计算', '会用分配律进行简便运算'],
    },
  },

  // ============================================================
  // s12: 有理数的除法
  // ============================================================
  {
    id: 'math.g7.ch2.s12',
    subject: 'math',
    chapter: 'ch2_有理数',
    title: '有理数的除法',
    description: '除以一个数等于乘以它的倒数',
    bloom_level: 'apply',
    difficulty: 3,
    estimated_minutes: 15,
    prerequisites: ['math.g7.ch2.s10', 'math.g7.ch2.s5'],
    learning_objectives: {
      understand: ['理解倒数：乘积为1的两个数互为倒数', '理解除法法则：除以一个数等于乘以它的倒数'],
      apply: ['会求一个有理数的倒数', '会把除法转化为乘法来计算'],
    },
  },

  // ============================================================
  // s13-s14: 乘方和混合运算
  // ============================================================
  {
    id: 'math.g7.ch2.s13',
    subject: 'math',
    chapter: 'ch2_有理数',
    title: '有理数的乘方',
    description: '正整数指数幂的概念和计算',
    bloom_level: 'understand',
    difficulty: 3,
    estimated_minutes: 15,
    prerequisites: ['math.g7.ch2.s10'],
    learning_objectives: {
      understand: ['理解乘方的定义：$a^n$ 表示 n 个 a 相乘', '知道底数、指数、幂的概念'],
      apply: ['会进行乘方运算', '能处理负数的乘方（注意 $(-2)^2$ 和 $-2^2$ 的区别）'],
    },
  },
  {
    id: 'math.g7.ch2.s14',
    subject: 'math',
    chapter: 'ch2_有理数',
    title: '有理数的混合运算',
    description: '先乘方、后乘除、最后加减，有括号先算括号',
    bloom_level: 'apply',
    difficulty: 4,
    estimated_minutes: 20,
    prerequisites: ['math.g7.ch2.s9', 'math.g7.ch2.s11', 'math.g7.ch2.s12', 'math.g7.ch2.s13'],
    learning_objectives: {
      understand: ['记住运算顺序：先乘方，再乘除，最后加减'],
      apply: ['能正确处理含有多重括号的混合运算', '能正确处理多种运算混合'],
      transfer: ['能在实际问题中建立并求解有理数混合运算模型'],
    },
  },

  // ============================================================
  // s15: 科学计数法和近似数（综合应用）
  // ============================================================
  {
    id: 'math.g7.ch2.s15',
    subject: 'math',
    chapter: 'ch2_有理数',
    title: '科学计数法与近似数',
    description: '用科学计数法表示大数，有效数字和精确度',
    bloom_level: 'transfer',
    difficulty: 3,
    estimated_minutes: 18,
    prerequisites: ['math.g7.ch2.s13'],
    learning_objectives: {
      understand: ['理解科学计数法：$a \\times 10^n$（$1 \\le a < 10$）', '知道有效数字的概念'],
      apply: ['会把大数用科学计数法表示', '会判断一个近似数的有效数字'],
      transfer: ['能在实际问题中合理使用科学计数法和近似数'],
    },
  },
];
