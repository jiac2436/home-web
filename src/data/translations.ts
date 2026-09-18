export type Language = 'zh' | 'en';

export const TRANSLATIONS = {
  zh: {
    // 顶部导航
    nav: {
      brandSub: '个人主页',
      seeProjects: '浏览全部项目与履历',
      seeProjectsTitle: '向下滑动查看项目与履历',
      letsTalk: '保持联络',
      copied: '已复制邮箱！',
      copyTitle: '点击复制联系邮箱',
      replayTitle: '重新触发跳跃与文字动效',
      menu: '目录',
      backToTop: '点击返回顶部',
    },
    // 主屏 Hero 区域
    hero: {
      titleLines: ['敏锐构想，', '跃然眼前'],
      positioning: [
        '晨 / Chen',
        '全栈工程架构',
        '创意交互与流体模拟',
        '现代高可用数字化体验',
      ],
      scrollHint: '向下滚动 · 绘制流体线条',
    },
    // 故事模式展卷模块大标题副标与人物解说
    modules: {
      information: {
        capsule: '个人信息 · 关于晨',
        targetWordLabel: '目标词',
        mascotSpeech: '这是我的个人信息',
      },
      experience: {
        capsule: '工程履历 · 架构里程碑',
        targetWordLabel: '目标词',
        mascotSpeech: '接下来是工程履历',
      },
      works: {
        capsule: '精选作品 · 创意系统',
        targetWordLabel: '目标词',
        mascotSpeech: '这些是我过往的项目',
      },
      contact: {
        capsule: '保持联络 · 开启合作',
        targetWordLabel: '目标词',
        mascotSpeech: '对我感兴趣的话就联系我吧',
      },
    },
    // 模块详细落地卡片
    cards: {
      information: {
        name: '贾晨 / Chen',
        role: '全栈开发工程师 · AI Agent 架构探索者',
        location: '坐标：北京 · 太原理工大学 计算机本科',
        point1Title: '01 / 十年高并发与分布式架构',
        point1Desc: '10年+ 全链路 Java 后端与分布式微服务架构经验，深耕电商秒杀、生鲜交易与大规模微服务拆分，扛住千万级日活高并发考验。',
        point2Title: '02 / AI Agent 智能体工程化',
        point2Desc: '深度践行 Vibe Coding，主导落地生产级 AI Agent 智能销售 SOP（Memory+Planning+Tools），团队 AGENTS.md 规范制定者，研发效能提升 40%。',
        point3Title: '03 / 企业级中台与工作流深度定制',
        point3Desc: '深度二次开发 Flowable6 工作流引擎并封装 15+ 通用业务组件；主导单体微服务拆分为 12 个独立服务，自动化 CI/CD 使部署效率提升 10 倍。',
      },
      experience: {
        title: '工程演进与架构里程碑',
        subtitle: '从千万级高并发秒杀交易到企业级 AI Agent 生产落地',
        exp1Role: '北京奇梦岛网络科技有限公司 · 高级工程师 / 全栈架构',
        exp1Desc: '主导 CRM 拆分为 12 个独立微服务；自研 AI Agent 智能 SOP 覆盖 80% 销售场景，效率提升 300%；完成潮玩电商秒杀三级缓存优化，QPS 提升 45%。',
        exp1Time: '2022.07 — 至今',
        exp2Role: '上海任意门科技有限公司 · 高级 Java 开发工程师',
        exp2Desc: '负责广告业务线 CRM、财务系统与 Flowable 工作流三大核心模块从 0 到 1 架构；搭建通用广告组件库，连续 3 个季度获得部门 A 绩效。',
        exp2Time: '2021.05 — 2022.05',
        exp3Role: '美菜网（美家优享） · 高级 Java 开发工程师',
        exp3Desc: '核心负责生鲜社区团购价格与秒杀系统，支撑全国 13 万团长、百万级用户限时抢购，保障大促高峰单日 35 万单、千万元流水稳定运行且零超卖。',
        exp3Time: '2018.11 — 2021.05',
      },
      works: {
        title: '精选代表作品与工程系统',
        subtitle: '融合 AI Agent 智能体前沿工程与千万级高并发的工业级落地成果',
        w1Tag: '01 / AI AGENT 智能体系统',
        w1Title: '智能销售 SOP 自动化 Agent 平台',
        w1Desc: '运用 Memory 记忆交互、Planning 任务规划与 Tools 自动调度短信/呼叫/CRM，覆盖 80% 销售场景，销售人效提升 300%，客户转化率提升 15%。',
        w2Tag: '02 / 高并发交易引擎',
        w2Title: '潮玩电商新品秒杀订单系统',
        w2Desc: '设计本地缓存+Redis+DB三级缓存体系，实现库存预扣减与最终补偿机制，日订单 10 万+，秒杀零宕机零超卖，接口 TP99 稳定在 50ms 内。',
        w3Tag: '03 / 企业级中台底座',
        w3Title: '一站式 CRM 架构与 Flowable 工作流引擎',
        w3Desc: '二次开发工作流封装 15+ 业务组件，支撑 20+ 流程可视化配置；单体系统拆分为 12 个微服务，容器化自动化 CI/CD 使部署效率提升 10 倍。',
        w4Tag: '04 / 社区团购高并发',
        w4Title: '美家优享生鲜社区秒杀系统',
        w4Desc: '支撑全国 13 万团长、百万用户高并发抢购，单日最高 35 万单与千万日销，大促数据库请求下降 65%，单接口最高日调用量达 200 万次。',
      },
      contact: {
        title: '开启合作 · 保持联络',
        subtitle: '欢迎全栈开发、AI Agent 智能体研发与系统架构合作交流',
        channel: '直达联络信道',
        desc: '随时欢迎来信探讨 AI Agent 工程化落地与全栈系统演进',
        copyBtn: '点击复制邮箱',
        alertCopied: '邮箱已成功复制：jichi0711@163.com',
      },
    },
    // 翻页蓄力门
    gate: {
      nextPage: '下一篇章',
    },
    // 人物互动
    mascot: {
      interactTip: '点击小男孩聊聊天',
      todayLabel: '今日访客',
      totalLabel: '总访客',
      closeTip: '关闭提示',
      quotes: [
        '💡 听说优秀的架构师，代码里都藏着优雅的物理弹簧～',
        '🚀 别看我个子小，这个网站的流体丝带和物理引擎可是硬核全栈手作！',
        '☕ 写代码累了吗？记得喝杯咖啡，灵感往往在放松的瞬间降临。',
        '📖 向左向右滚动看看，经典计算机科学论文里藏着大词抽取的秘密。',
        '🤝 向下滑动到底部有联系方式，随时欢迎聊聊创意交互与系统架构！',
      ],
      introPattern: '这是我的“{word}”的介绍。',
    },
  },
  en: {
    // Top Navbar
    nav: {
      brandSub: 'PORTFOLIO',
      seeProjects: 'SEE ALL PROJECTS & RESUME',
      seeProjectsTitle: 'Scroll down to explore projects & resume',
      letsTalk: "LET'S TALK",
      copied: 'COPIED!',
      copyTitle: 'Click to copy email address',
      replayTitle: 'Replay mascot jump & hero animation',
      menu: 'MENU',
      backToTop: 'Click to return to top',
    },
    // Hero Section
    hero: {
      titleLines: ['Bold Ideas,', 'Brought to Life'],
      positioning: [
        'Chen',
        'Full-Stack Architecture',
        'Creative Interaction & Fluid Simulation',
        'Modern High-Availability Digital Experience',
      ],
      scrollHint: 'SCROLL DOWN · DRAW FLUID LINE',
    },
    // Story Stage Modules
    modules: {
      information: {
        capsule: 'Personal Profile · About Chen',
        targetWordLabel: 'Target Word',
        mascotSpeech: 'This is my personal profile.',
      },
      experience: {
        capsule: 'Engineering Track · Milestones',
        targetWordLabel: 'Target Word',
        mascotSpeech: 'Next is my work experience.',
      },
      works: {
        capsule: 'Featured Works · Systems',
        targetWordLabel: 'Target Word',
        mascotSpeech: 'These are my past projects.',
      },
      contact: {
        capsule: 'Get in Touch · Collaboration',
        targetWordLabel: 'Target Word',
        mascotSpeech: 'Get in touch if you are interested!',
      },
    },
    // Detail Cards
    cards: {
      information: {
        name: 'Jia Chen / Chen',
        role: 'Full-Stack Engineer & AI Agent Architect',
        location: 'Location: Beijing, China · B.S. in Computer Science',
        point1Title: '01 / Decade of High-Concurrency Architecture',
        point1Desc: '10+ years of full-lifecycle backend & distributed systems experience, architecting flash-sale engines and microservices handling millions of daily active users.',
        point2Title: '02 / AI Agent & Vibe Coding Pioneer',
        point2Desc: 'Deep practitioner of Vibe Coding & Agentic AI; architected production-grade Smart Sales SOP with Memory/Planning/Tools, cutting overall development cycles by 40%.',
        point3Title: '03 / Industrial Platform & Workflow Engine',
        point3Desc: 'Extensively customized Flowable6 workflow engine with 15+ reusable business components; split monolith into 12 microservices, shortening release cycles from 2 days to 2 hours.',
      },
      experience: {
        title: 'Engineering Milestones & Career Evolution',
        subtitle: 'From multi-million daily active e-commerce flash sales to production-grade AI Agent systems',
        exp1Role: 'Beijing Qimengdao Network · Senior Engineer & Full-Stack Architect',
        exp1Desc: 'Split CRM into 12 independent microservices; designed AI Agent Smart SOP boosting sales efficiency by 300%; optimized e-commerce flash-sale QPS by 45%.',
        exp1Time: '2022.07 — Present',
        exp2Role: 'Shanghai Renyimen Tech · Senior Java Engineer',
        exp2Desc: 'Architected Ad-tech CRM, financial ledger, and Flowable workflow from scratch; built shared component libraries, receiving Grade-A performance for 3 quarters.',
        exp2Time: '2021.05 — 2022.05',
        exp3Role: 'Meicai (Meijia Youxiang) · Senior Java Engineer',
        exp3Desc: 'Engineered core pricing and flash-sale systems supporting 130k community group leaders and 1M+ consumers with zero overselling during mega promotion campaigns.',
        exp3Time: '2018.11 — 2021.05',
      },
      works: {
        title: 'Featured Projects & Production Systems',
        subtitle: 'Industrial-grade systems integrating cutting-edge AI Agents with high-concurrency performance',
        w1Tag: '01 / AI AGENT SYSTEM',
        w1Title: 'Smart Sales SOP Automated Agent Platform',
        w1Desc: 'Leveraged Memory, Planning, and Tool-calling to automate customer interactions across SMS, IVR, and CRM, covering 80%+ sales workflows and increasing lead conversion by 15%.',
        w2Tag: '02 / HIGH-CONCURRENCY ENGINE',
        w2Title: 'Trendy Toy Flash-Sale & Order Engine',
        w2Desc: 'Built a 3-tier cache (Local + Redis Cluster + DB) with pre-deduction and compensation, handling 100k+ daily orders with zero downtime and TP99 latency < 50ms.',
        w3Tag: '03 / ENTERPRISE MIDDLEWARE',
        w3Title: 'All-in-One CRM & Flowable Workflow Core',
        w3Desc: 'Encapsulated 15+ business components supporting 20+ visual workflow configurations; split system into 12 microservices with 10x faster CI/CD deployment.',
        w4Tag: '04 / COMMUNITY COMMERCE',
        w4Title: 'Fresh Grocery Group Buying Flash-Sale Core',
        w4Desc: 'Supported 130k community leaders and millions of users with 350k daily peak orders; reduced database load by 65% during peak promotions.',
      },
      contact: {
        title: 'Start Collaboration · Get in Touch',
        subtitle: 'Open for Full-Stack, AI Agent Engineering, and Architecture Consulting',
        channel: 'DIRECT CHANNEL',
        desc: 'Always welcome to discuss AI Agent engineering and full-stack architecture evolution',
        copyBtn: 'COPY EMAIL ADDRESS',
        alertCopied: 'Email copied to clipboard: jichi0711@163.com',
      },
    },
    // Next Page Gate
    gate: {
      nextPage: 'NEXT PAGE',
    },
    // Mascot
    mascot: {
      interactTip: 'Click the boy to chat',
      todayLabel: 'Today',
      totalLabel: 'Total',
      closeTip: 'Close tip',
      quotes: [
        '💡 Great architects always hide elegant physical springs inside their code~',
        '🚀 Though I look small, this site\'s fluid ribbons and physics engine are handcrafted full-stack art!',
        '☕ Tired of coding? Grab a coffee, inspiration often strikes when you unwind.',
        '📖 Scroll left and right—classic CS papers hide the secrets of flying letter-spelling.',
        '🤝 Scroll to the bottom for contact details; always open to discussing creative tech and systems!',
      ],
      introPattern: 'This is an introduction to my "{word}".',
    },
  },
};
