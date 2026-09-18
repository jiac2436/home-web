export interface CSPaperModuleLocaleData {
  targetWord: string; // 提取并拼接成的大词，如 "个人信息" 或 "Information"
  capsule: string;    // 大词归位后左上角小胶囊副标
  subtitle: string;
  author: string;
  year: string;
  paperTitle: string;
  citation: string;
  text: string;
  charIndices: number[]; // 严格从左至右按顺序在 text 中的下标
}

export interface CSPaperModule {
  id: string;
  zh: CSPaperModuleLocaleData;
  en: CSPaperModuleLocaleData;
  // 向下兼容字段 (默认英文)
  targetWord: string;
  chineseTitle: string;
  subtitle: string;
  author: string;
  year: string;
  paperTitle: string;
  citation: string;
  text: string;
  charIndices: number[];
}

export const CS_PAPER_MODULES: CSPaperModule[] = [
  {
    id: 'information',
    targetWord: 'Information',
    chineseTitle: '个人信息 · 关于晨',
    subtitle: '全栈架构师 · 创意工程探索者',
    author: 'Claude E. Shannon',
    year: '1948',
    paperTitle: 'A Mathematical Theory of Communication',
    citation: 'Bell System Technical Journal, 27(3), 379–423.',
    text: 'In mathematical communication theory, information can be reproduced across distance. Finite messages transfer structure and meaning through physical signals, enabling computational architecture to process high entropy input with precision.',
    charIndices: [0, 21, 40, 61, 70, 92, 103, 111, 128, 135, 152],
    en: {
      targetWord: 'Information',
      capsule: 'Personal Profile · About Chen',
      subtitle: 'Full-Stack Architect & Creative Computing Specialist',
      author: 'Claude E. Shannon',
      year: '1948',
      paperTitle: 'A Mathematical Theory of Communication',
      citation: 'Bell System Technical Journal, 27(3), 379–423.',
      text: 'In mathematical communication theory, information can be reproduced across distance. Finite messages transfer structure and meaning through physical signals, enabling computational architecture to process high entropy input with precision.',
      charIndices: [0, 21, 40, 61, 70, 92, 103, 111, 128, 135, 152],
    },
    zh: {
      targetWord: '个人信息',
      capsule: '关于晨 · 全栈架构师',
      subtitle: '系统工程底座 · 创意工程探索者',
      author: '钱学森',
      year: '1954',
      paperTitle: '《工程控制论》（Engineering Cybernetics）',
      citation: '麦格劳-希尔出版社 / 科学出版社系统工程经典',
      text: '每一位工程师在技术体系中，个人通过系统架构传递信息。深邃的科学思考跨越时空，将信息转化为高可靠性的工程基石。',
      // 个 (13), 人 (14), 信 (23), 息 (24)
      charIndices: [13, 14, 23, 24],
    },
  },
  {
    id: 'experience',
    targetWord: 'Experience',
    chineseTitle: '工程履历 · 架构里程碑',
    subtitle: '系统演进 · 工业级高可用设计',
    author: 'Donald E. Knuth',
    year: '1974',
    paperTitle: 'Computer Programming as an Art',
    citation: 'Communications of the ACM, 17(12), 667–673. (ACM Turing Award Lecture)',
    text: 'Every computer algorithm provides an exceptional aesthetic experience for those who craft software. The science of programming transforms human knowledge into structured logic through creative discipline and rigorous analysis.',
    charIndices: [0, 38, 61, 78, 85, 106, 149, 155, 163, 186],
    en: {
      targetWord: 'Experience',
      capsule: 'Engineering Track · Milestones',
      subtitle: 'System Evolution · High-Availability Architecture',
      author: 'Donald E. Knuth',
      year: '1974',
      paperTitle: 'Computer Programming as an Art',
      citation: 'Communications of the ACM, 17(12), 667–673. (ACM Turing Award Lecture)',
      text: 'Every computer algorithm provides an exceptional aesthetic experience for those who craft software. The science of programming transforms human knowledge into structured logic through creative discipline and rigorous analysis.',
      charIndices: [0, 38, 61, 78, 85, 106, 149, 155, 163, 186],
    },
    zh: {
      targetWord: '工程履历',
      capsule: '架构里程碑 · 工业级设计',
      subtitle: '从早期跨端技术探索到千万级日活全链路分布式架构',
      author: '夏培肃',
      year: '1958',
      paperTitle: '《电子计算机原理与逻辑设计》（中国第一台通用数字机奠基）',
      citation: '中国科学院计算技术研究所历史文献',
      text: '电子计算机的逻辑体系，是人类智力工程的巅峰实践。探索者以严密规程记录研发履历，奠定中国现代通用数字计算与系统架构之基。',
      // 工 (16), 程 (17), 履 (36), 历 (37)
      charIndices: [16, 17, 36, 37],
    },
  },
  {
    id: 'works',
    targetWord: 'Works',
    chineseTitle: '精选作品 · 创意系统',
    subtitle: '图形学计算 · 分布式平台 · 智能体界面',
    author: 'Douglas C. Engelbart',
    year: '1962',
    paperTitle: 'Augmenting Human Intellect: A Conceptual Framework',
    citation: 'Stanford Research Institute Summary Report AFOSR-3223.',
    text: 'When humans interact with digital systems, collaborative works transcend traditional physical constraints. Augmenting human intellect empowers designers to construct innovative computational solutions.',
    charIndices: [0, 44, 50, 60, 61],
    en: {
      targetWord: 'Works',
      capsule: 'Featured Works · Systems',
      subtitle: 'Creative Systems · Distributed Platforms',
      author: 'Douglas C. Engelbart',
      year: '1962',
      paperTitle: 'Augmenting Human Intellect: A Conceptual Framework',
      citation: 'Stanford Research Institute Summary Report AFOSR-3223.',
      text: 'When humans interact with digital systems, collaborative works transcend traditional physical constraints. Augmenting human intellect empowers designers to construct innovative computational solutions.',
      charIndices: [0, 44, 50, 60, 61],
    },
    zh: {
      targetWord: '精选作品',
      capsule: '创意系统 · 分布式平台',
      subtitle: '图形学计算 · 分布式平台 · 智能体界面',
      author: '王选',
      year: '1981',
      paperTitle: '《汉字信息处理与高倍率压缩算法》（激光照排工程奠基）',
      citation: '北京大学计算机科学技术研究所科研专著',
      text: '用数学点阵与矢量轮廓描述汉字，精密算法选萃出数字时代的传世作品，彻底告别铅与火，开创文明出版工程的光电纪元。',
      // 精 (15), 选 (19), 作 (29), 品 (30)
      charIndices: [15, 19, 29, 30],
    },
  },
  {
    id: 'contact',
    targetWord: 'Contact',
    chineseTitle: '保持联络 · 开启合作',
    subtitle: '全栈技术咨询 · 创意项目孵化',
    author: 'J.C.R. Licklider',
    year: '1960',
    paperTitle: 'Man-Computer Symbiosis',
    citation: 'IRE Transactions on Human Factors in Electronics, HFE-1, 4–11.',
    text: 'Creative contact between human intuition and machine capability will revolutionize how society thinks. Computing machinery and human cognition will form an unprecedented symbiosis for solving complex problems.',
    charIndices: [0, 10, 23, 33, 41, 47, 61],
    en: {
      targetWord: 'Contact',
      capsule: 'Get in Touch · Collaboration',
      subtitle: 'Technical Consulting · Creative Partnerships',
      author: 'J.C.R. Licklider',
      year: '1960',
      paperTitle: 'Man-Computer Symbiosis',
      citation: 'IRE Transactions on Human Factors in Electronics, HFE-1, 4–11.',
      text: 'Creative contact between human intuition and machine capability will revolutionize how society thinks. Computing machinery and human cognition will form an unprecedented symbiosis for solving complex problems.',
      charIndices: [0, 10, 23, 33, 41, 47, 61],
    },
    zh: {
      targetWord: '保持联络',
      capsule: '技术咨询 · 开启合作',
      subtitle: '欢迎技术交流、项目架构顾问与创意研发合作',
      author: '华罗庚',
      year: '1965',
      paperTitle: '《统筹方法平话及补充》（中国应用数学与系统协同典范）',
      citation: '科学出版社·中国运筹学与优选法推广经典',
      text: '统筹方法是为完成宏大工程而保全全局的数学之道。团队保持紧密协作，联通各方智慧，网络协同以实现技术价值的最高汇聚。',
      // 保 (13), 持 (26), 联 (32), 络 (40)
      charIndices: [13, 26, 32, 40],
    },
  },
];

