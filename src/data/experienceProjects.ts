export interface ProjectMetric {
  val: string | { zh: string; en: string };
  lbl: { zh: string; en: string };
  desc: { zh: string; en: string };
}

export interface DeepChapter {
  title: { zh: string; en: string };
  desc: { zh: string; en: string };
}

export interface ExperienceProject {
  id: string;
  code: string;
  period: { zh: string; en: string };
  periodStart: string;
  periodEnd: { zh: string; en: string };
  isCurrent: boolean;
  company: { zh: string; en: string };
  fullName: { zh: string; en: string };
  projectTitle: { zh: string; en: string };
  role: { zh: string; en: string };
  domainTag: { zh: string; en: string };
  timelineBadge: { zh: string; en: string };
  location: { zh: string; en: string };
  summary: { zh: string; en: string };
  keyPills: { zh: string[]; en: string[] };
  slogan: { zh: string; en: string };
  metrics: ProjectMetric[];
  deepChapters: DeepChapter[];
  techStack: string[];
}

export const ALL_EXPERIENCE_PROJECTS: ExperienceProject[] = [
  {
    id: 'qimengdao-ecommerce',
    code: '01',
    period: { zh: '2023.03 — 至今', en: '2023.03 — Present' },
    periodStart: '2023.03',
    periodEnd: { zh: '— 至今', en: '— Present' },
    isCurrent: true,
    company: { zh: '北京奇梦岛网络科技', en: 'Beijing Qimengdao Network' },
    fullName: { zh: '北京奇梦岛网络科技有限公司', en: 'Beijing Qimengdao Network Technology Co., Ltd.' },
    projectTitle: { zh: '潮玩电商订单与秒杀系统（高并发核心项目）', en: 'Trending Toy E-Commerce Flash-Sale & Order Engine' },
    role: { zh: '高级 Java 开发工程师 · 核心架构', en: 'Senior Java Software Engineer · Tech Lead' },
    domainTag: { zh: '高并发秒杀 · 三级缓存 · 削峰防超卖', en: 'High-Concurrency Flash-Sale · 3-Tier Cache · Zero-Overselling' },
    timelineBadge: { zh: '秒杀交易', en: 'Flash-Sale' },
    location: { zh: '北京 · 电商交易中枢', en: 'Beijing · Commerce Core' },
    summary: {
      zh: '负责潮玩新品发售秒杀场景全链路架构设计与性能攻坚。设计“本地缓存+Redis集群+DB”三级缓存体系，实现库存预扣减与最终补偿机制，下单峰值 QPS 提升 45%，日订单 10 万+ 零宕机零超卖，接口 TP99 稳定在 50ms 内。',
      en: 'Architected flash-sale order engines for trending toy drops. Engineered a 3-tier caching hierarchy (Caffeine + Redis Cluster + DB) with atomic pre-deduction, elevating peak order QPS by 45% and sustaining 100k+ daily orders with zero downtime, zero overselling, and TP99 < 50ms.'
    },
    keyPills: {
      zh: ['QPS 提升 45%', '单日 10 万+ 订单零超卖', '三级缓存体系', 'TP99 < 50ms'],
      en: ['QPS Surge +45%', '100k+ Orders Zero-Oversold', '3-Tier Cache', 'TP99 < 50ms']
    },
    slogan: {
      zh: '以三级多级缓存与原子预扣减为防线，彻底解决秒杀超卖与数据库瞬时雪崩，保障千万级日销峰值如丝般顺滑',
      en: 'Shielding transactional integrity with 3-tier caching and atomic inventory pre-deduction under massive drops'
    },
    metrics: [
      { val: '+45%', lbl: { zh: '下单 QPS 提升', en: 'Order QPS Boost' }, desc: { zh: '从 110 提升至 160，抗住数万脉冲', en: 'Elevated from 110 to 160 QPS' } },
      { val: { zh: '10 万+', en: '100k+' }, lbl: { zh: '单日新品订单', en: 'Daily Drop Orders' }, desc: { zh: '秒杀全周期零宕机、零超卖', en: 'Zero overselling & zero downtime' } },
      { val: '-70%', lbl: { zh: '数据库回源流量', en: 'DB Read Storm Cut' }, desc: { zh: '热点商品提前预热与本地缓存阻断', en: 'Hot item pre-warming & cache shields' } },
      { val: '< 50ms', lbl: { zh: '接口 TP99 延迟', en: 'TP99 Latency' }, desc: { zh: '全链路压测与关键链路异步化', en: 'Optimized critical checkout path' } }
    ],
    deepChapters: [
      {
        title: { zh: '1. “本地缓存 + Redis 集群 + DB”三级缓存治理', en: '1. 3-Tier Cache Hierarchy (Caffeine + Redis + DB)' },
        desc: {
          zh: '新品秒杀具有“瞬间高并发爆量、读多写少、热点极度集中”特征。设计在微服务网关层与应用层采用 Caffeine 本地缓存存储商品只读数据，配合 Redis 集群进行热点商品预热，使 70% 的瞬时查询在应用内存层直接返回，避免海量请求击穿 DB。',
          en: 'Deployed Caffeine in-memory caches at the gateway/application tier paired with Redis Cluster pre-warming for featured toy releases, intercepting 70% of peak queries before touching persistence.'
        }
      },
      {
        title: { zh: '2. 库存预扣减 + 异步确认 + 最终一致性补偿', en: '2. Stock Pre-Deduction & Eventual Consistency Rollback' },
        desc: {
          zh: '使用 Lua 脚本在 Redis 内部完成原子库存核验与预扣减；扣减成功后通过 Kafka 异步抛送订单创建事件；若用户超时未支付或异常取消，自动触发异步库存回滚补偿，彻底杜绝并发超卖，并大幅减轻主事务执行时间。',
          en: 'Executed atomic inventory verification and pre-deduction via Redis Lua scripts, piping confirmed events asynchronously via Kafka with automatic rollback compensation on payment expiration.'
        }
      },
      {
        title: { zh: '3. 订单中台微服务化拆分', en: '3. Order Domain Microservices Decoupling' },
        desc: {
          zh: '针对业务扩张，将原有单体交易拆分为订单中心、库存中心、支付中心、履约售后 4 个独立微服务，各服务拥有独立数据库，服务间通过 Dubbo RPC 敏捷通信，系统横向扩展能力提升 3 倍。',
          en: 'Split transactional core into 4 domain microservices: Order, Inventory, Payment, and Fulfillment, boosting independent horizontal scalability by 3x.'
        }
      }
    ],
    techStack: ['Java 11', 'SpringBoot', 'Dubbo', 'Redis 集群', 'MySQL', 'Kafka', 'JMeter 全链路压测', 'Claude Code']
  },
  {
    id: 'qimengdao-crm-ai',
    code: '02',
    period: { zh: '2022.07 — 2023.12', en: '2022.07 — 2023.12' },
    periodStart: '2022.07',
    periodEnd: { zh: '— 2023.12', en: '— 2023.12' },
    isCurrent: true,
    company: { zh: '北京奇梦岛网络科技', en: 'Beijing Qimengdao Network' },
    fullName: { zh: '北京奇梦岛网络科技有限公司', en: 'Beijing Qimengdao Network Technology Co., Ltd.' },
    projectTitle: { zh: '财商教育一站式 CRM 架构与生产级 AI Agent 智能体', en: 'Enterprise CRM & Production-Grade AI Agent Smart SOP Platform' },
    role: { zh: '项目技术负责人 · 全栈架构师', en: 'Project Tech Lead & Full-Stack Architect' },
    domainTag: { zh: 'AI Agent 智能体 · 12 微服务拆分 · Flowable 6', en: 'AI Agent · 12 Microservices · Flowable 6' },
    timelineBadge: { zh: 'AI 智能体', en: 'AI Agent' },
    location: { zh: '北京 · 支撑 500+ 销售团队', en: 'Beijing · Supporting 500+ Sales' },
    summary: {
      zh: '技术负责人主导整体架构。主导单体微服务拆分为 12 个独立服务，发布周期从 2 天缩至 2 小时；深度二次开发 Flowable 6 封装 15+ 通用组件；自研落地生产级 AI Agent 智能销售 SOP，销售人效暴增 300%，客户转化率提升 15%。',
      en: 'Tech lead for full-lifecycle CRM architecture. Decoupled monolith into 12 microservices, shortening release cycles from 2 days to 2 hours. Customized Flowable 6 with 15+ visual components. Architected AI Agent Smart SOP, boosting sales efficiency by 300% and lead conversion by 15%.'
    },
    keyPills: {
      zh: ['AI Agent 人效 +300%', '12 个微服务拆分', '流程配置效率 +80%', 'CI/CD 提速 10 倍'],
      en: ['AI Agent SOP +300%', '12 Microservices', 'Process Velocity +80%', '10x Faster CI/CD']
    },
    slogan: {
      zh: '以 Memory/Planning/Tools 智能体架构与微服务治理赋能企业级复杂销售交付全流程，打造高人效生产力中枢',
      en: 'Fusing Agentic AI (Memory/Planning/Tools) with microservices to supercharge enterprise sales workflows'
    },
    metrics: [
      { val: '300%', lbl: { zh: '销售人效突破', en: 'Sales Velocity Growth' }, desc: { zh: 'AI Agent 自动承接 80% 常见跟进流转', en: 'AI SOP covers 80% of sales scenarios' } },
      { val: { zh: '12 个', en: '12' }, lbl: { zh: '独立业务微服务', en: 'Domain Microservices' }, desc: { zh: '单体解耦，系统耦合度降低 60%', en: 'Decoupled monolithic bottlenecks' } },
      { val: '10x', lbl: { zh: 'CI/CD 部署提速', en: 'Deployment Speedup' }, desc: { zh: '容器化流水线，发版周期压缩至 2 小时', en: 'Release cycles reduced from 2d to 2h' } },
      { val: '+15%', lbl: { zh: '客户付费转化率', en: 'Conversion Surge' }, desc: { zh: '线索精准分发与自动化首触达', en: 'Precision routing & timely engagement' } }
    ],
    deepChapters: [
      {
        title: { zh: '1. AI Agent 核心架构：Memory + Planning + Tools 自动化落地', en: '1. AI Agent Architecture: Memory + Planning + Tools' },
        desc: {
          zh: '基于企业私域销售场景设计智能体中枢：利用 Memory 模块记录学员过往沟通喜好与画像标签；Planning 模块根据课程进度智能拆解触达任务计划；Tools 模块调度外部网关自动触发短信、语音呼叫及 CRM 回写，自动化覆盖 80% 机械性跟进工作。',
          en: 'Designed an autonomous Agent: Memory stores user interaction histories; Planning decomposes outreach schedules; Tools triggers SMS, IVR voice calls, and CRM mutations automatically.'
        }
      },
      {
        title: { zh: '2. Flowable 6 工作流深度定制与 15+ 业务组件抽象', en: '2. Flowable 6 Workflow Customization & 15+ Components' },
        desc: {
          zh: '针对销售审批、退款审核、助教排课等 20+ 复杂场景，深度扩展 Flowable 引擎，封装动态多级会签、驳回重审、角色绑定等 15+ 开箱即用组件，业务流程开发效率提升 80%。',
          en: 'Extended Flowable 6 with 15+ reusable enterprise components for multi-level countersigning, dynamic approvals, and automated class scheduling across 20+ business workflows.'
        }
      },
      {
        title: { zh: '3. 团队《AGENTS.md》规范制定与 Vibe Coding 提效', en: '3. Team AGENTS.md Protocol & Vibe Coding Workflow' },
        desc: {
          zh: '率先引入 Claude Code、Cursor 等 AI 辅助编程工作流，主导制定团队级《AGENTS.md》协同规范，约定工程约束与测试自验证规则，使团队整体编码与交付效率提升 40%。',
          en: 'Established the team-wide AGENTS.md standard for Claude Code / Cursor AI pair programming, accelerating engineering output by 40% while preserving strict zero-debt code quality.'
        }
      }
    ],
    techStack: ['Java 8', 'SpringBoot', 'Dubbo', 'Flowable 6', 'AI Agent', 'Docker/K8s', 'Redis', 'MySQL', 'Cursor/Claude Code']
  },
  {
    id: 'renyimen-ad',
    code: '03',
    period: { zh: '2021.05 — 2022.05', en: '2021.05 — 2022.05' },
    periodStart: '2021.05',
    periodEnd: { zh: '— 2022.05', en: '— 2022.05' },
    isCurrent: false,
    company: { zh: '上海任意门科技', en: 'Shanghai Renyimen Tech' },
    fullName: { zh: '上海任意门科技有限公司', en: 'Shanghai Renyimen Technology Co., Ltd.' },
    projectTitle: { zh: '广告业务线 CRM、财务计费结算与 Flowable 工作流中台', en: 'Ad-Tech CRM, Financial Billing Engine & Workflow Middle Platform' },
    role: { zh: '高级 Java 开发工程师', en: 'Senior Java Software Engineer' },
    domainTag: { zh: '广告中台 · 财务台账结算 · 工作流从 0 到 1', en: 'Ad Platform · Financial Ledger · Workflow from 0 to 1' },
    timelineBadge: { zh: '广告中台', en: 'Ad Platform' },
    location: { zh: '上海 · 广告业务线核心骨干', en: 'Shanghai · Core Ad-Tech Backbone' },
    summary: {
      zh: '负责广告业务线 CRM、财务系统、Flowable 工作流三大核心模块从 0 到 1 设计开发。搭建通用广告业务基础组件库，落地全链路日志告警与质量管控，团队研发效能提升 30%，连续 3 个季度获得部门 A 绩效评级。',
      en: 'Architected Ad-tech CRM, financial billing, and Flowable workflow engines from 0 to 1. Created reusable ad component libraries and end-to-end tracing, increasing team velocity by 30% and earning Grade-A rating for 3 consecutive quarters.'
    },
    keyPills: {
      zh: ['三大系统从 0 到 1', '连续 3 季度 A 绩效', '团队效能提升 30%', '沉淀 10+ 篇技术文档'],
      en: ['0-to-1 Architecture', 'Grade-A for 3 Quarters', 'Velocity Boost +30%', '10+ Technical Papers']
    },
    slogan: {
      zh: '以高精度金融级标准构建广告计费与可视化流程审批底座，实现高吞吐与高可靠交付',
      en: 'Engineering enterprise financial settlement & visual workflow infrastructure with institutional rigor'
    },
    metrics: [
      { val: '0 → 1', lbl: { zh: '核心系统架构', en: 'End-to-End Build' }, desc: { zh: '广告 CRM、财务台账与工作流中台', en: 'Ad CRM, Billing Ledger & Flowable' } },
      { val: '+30%', lbl: { zh: '研发效能提升', en: 'Velocity Growth' }, desc: { zh: '沉淀广告组件库与通用脚手架', en: 'Standard ad libraries & scaffolding' } },
      { val: 'Grade-A', lbl: { zh: '连续 3 季度绩效', en: 'Performance Rating' }, desc: { zh: '因架构严谨与攻坚成果荣获部门顶格评定', en: 'Top department performance honors' } },
      { val: { zh: '10+ 篇', en: '10+' }, lbl: { zh: '技术沉淀内刊', en: 'Whitepapers' }, desc: { zh: '主讲内部 JVM 调优与并发实战分享', en: 'Led workshops on JVM & distributed locks' } }
    ],
    deepChapters: [
      {
        title: { zh: '1. 广告业务复杂结算与财务严谨对账', en: '1. Multi-Tier Ad Billing & Audit Reconciliation' },
        desc: {
          zh: '广告业务数据流转复杂，涵盖客户合同、投放扣费、阶梯返点结算、发票审计等关键链路，对金额精度与事务隔离级别要求苛刻；通过分布式事务一致性机制与定时对账补偿，保障数千万元投放流水账目零差错。',
          en: 'Engineered high-precision financial reconciliation across multi-tiered advertiser budgets, dynamic rebates, and billing audits with distributed transaction integrity.'
        }
      },
      {
        title: { zh: '2. Flowable 审批引擎与企业 IM 深度打通', en: '2. Flowable 6 Orchestration & IM Integration' },
        desc: {
          zh: '针对企业合同与资金变动的层级审核瓶颈，二次开发 Flowable 流程引擎并打通钉钉/飞书消息网关，审批平均耗时缩短 60% 以上。',
          en: 'Integrated customized Flowable with DingTalk and Feishu enterprise message gateways, shrinking average approval turnaround by over 60%.'
        }
      }
    ],
    techStack: ['Java 8', 'SpringBoot', 'Flowable 6', 'MySQL', 'Redis', 'JUC 并发', 'JVM 调优', '分布式锁']
  },
  {
    id: 'meicai-flashsale',
    code: '04',
    period: { zh: '2018.11 — 2021.05', en: '2018.11 — 2021.05' },
    periodStart: '2018.11',
    periodEnd: { zh: '— 2021.05', en: '— 2021.05' },
    isCurrent: false,
    company: { zh: '美菜网（美家优享）', en: 'Meicai (Meijia Youxiang)' },
    fullName: { zh: '美菜网（美家优享社区团购）', en: 'Meicai (Meijia Youxiang Community E-Commerce)' },
    projectTitle: { zh: '生鲜社区团购价格体系与大促千万级秒杀系统', en: 'Community E-Commerce Pricing & Flash-Sale Transaction Engine' },
    role: { zh: '高级 Java 开发工程师', en: 'Senior Java Software Engineer' },
    domainTag: { zh: '社区生鲜团购 · 千万级大促秒杀 · 分布式价格', en: 'Community E-Commerce · Flash-Sale · Distributed Pricing' },
    timelineBadge: { zh: '社区电商', en: 'Community Commerce' },
    location: { zh: '北京 · 电商交易团队', en: 'Beijing · Core Commerce' },
    summary: {
      zh: '核心负责生鲜社区团购价格与秒杀系统，支撑全国 13 万团长、百万级用户限时抢购；攻克极端高并发下的库存一致性难题，保障 618、双 11 大促单日 35 万单、千万元流水稳定运行且零超卖，大促数据库请求下降 65%。',
      en: 'Architected pricing and flash-sale backends for community grocery buying. Scaled systems to support 130k group leaders and 1M+ consumers; solved distributed stock overselling during mega promotions, handling 350k daily peak orders with zero overselling.'
    },
    keyPills: {
      zh: ['13 万团长与百万用户', '大促 35 万单/日零超卖', '数据库请求下降 65%', '线上 Bug 率降 25%'],
      en: ['130k Group Leaders', '350k Daily Orders Zero Oversold', '65% DB Load Cut', '25% Bug Reduction']
    },
    slogan: {
      zh: '在全国性千万级下沉流量冲击中，以坚如磐石的分布式缓存与事务一致性捍卫交易底线',
      en: 'Defending transactional integrity under massive consumer traffic with rock-solid distributed caching'
    },
    metrics: [
      { val: '130k+', lbl: { zh: '全国社区团长', en: 'Group Leaders' }, desc: { zh: '赋能百万级下沉生鲜家庭日常采购', en: 'Serving millions of households daily' } },
      { val: '350k', lbl: { zh: '单日大促峰值单', en: 'Peak Daily Orders' }, desc: { zh: '千万日销平稳履约，零宕机事故', en: 'Multi-million daily GMV settlement' } },
      { val: '0', lbl: { zh: '重大超卖故障', en: 'Overselling Incidents' }, desc: { zh: '多层库存原子预扣与补偿校验', en: 'Atomic pre-deduction with reconciliation' } },
      { val: '-65%', lbl: { zh: '数据库瞬时压力', en: 'DB Load Cut' }, desc: { zh: '多层缓存拦截高频热点穿透', en: 'Multi-layer cache shields absorbing traffic' } }
    ],
    deepChapters: [
      {
        title: { zh: '1. 准点集中开团瞬间的垂直脉冲防御', en: '1. Instant Burst Traffic Defense at Fixed Drop Hours' },
        desc: {
          zh: '每天上午 10 点与晚 8 点开团瞬间，全国 13 万团长拉动百万社群涌入抢购，瞬时下单请求呈陡峭垂直脉冲。设计防抖拦截、Nginx 静态化、Redis Lua 预减库存与 MySQL 行级乐观锁四道防线，阻断 98% 无效写穿透。',
          en: 'Engineered 4 defense layers against 10 AM / 8 PM flash drops: client debouncing + Nginx caching + Redis Lua atomic pre-deduction + DB optimistic locking.'
        }
      },
      {
        title: { zh: '2. 动态多维分布式价格计算引擎', en: '2. Dynamic Regional & Promotional Pricing Engine' },
        desc: {
          zh: '针对生鲜各城市采购成本各异与团长等级佣金差，构建“城市基础价+团长等级+限时秒杀+优惠券”多维价格计算模型，单接口日调用超 200 万次，接口响应稳定在 35ms 内。',
          en: 'Built a multi-tiered price engine evaluating city costs, leader commission tiers, and coupons under 35ms across 2M+ daily requests.'
        }
      }
    ],
    techStack: ['Java 8', 'SpringBoot', 'Dubbo', 'Redis 集群', 'MySQL', 'Lua 脚本', '高并发秒杀', '分布式事务', 'CAT 监控']
  },
  {
    id: 'huanyu-zhihuishu',
    code: '05',
    period: { zh: '2017.03 — 2018.09', en: '2017.03 — 2018.09' },
    periodStart: '2017.03',
    periodEnd: { zh: '— 2018.09', en: '— 2018.09' },
    isCurrent: false,
    company: { zh: '北京环宇万维科技', en: 'Beijing Huanyu Wanwei Tech' },
    fullName: { zh: '北京环宇万维科技有限公司', en: 'Beijing Huanyu Wanwei Tech Co., Ltd.' },
    projectTitle: { zh: '智慧树 APP 发现中心 (CMS) 与亲子任务微服务治理', en: 'Zhihuishu APP Discovery CMS & Interactive Task Microservices' },
    role: { zh: 'Java 开发工程师', en: 'Java Software Engineer' },
    domainTag: { zh: '智慧树 APP · CMS 内容中台 · Dubbo 微服务治理', en: 'Zhihuishu APP · CMS Engine · Dubbo Microservices' },
    timelineBadge: { zh: '微服务治理', en: 'CMS & Tasks' },
    location: { zh: '北京 · 核心产品研发团队', en: 'Beijing · Core Product Engineering' },
    summary: {
      zh: '参与国内领先幼教平台智慧树 APP 发现模块（CMS 内容系统）与亲子任务模块后端研发。基于 Dubbo 构建微服务架构，主导核心接口全链路性能优化，核心接口响应时间提升 50% 以上，系统稳定性达 99.9%。',
      en: 'Engineered backends for Zhihuishu APP Discovery CMS and family interaction modules. Deployed Dubbo microservices and optimized core APIs, cutting response latency by 50% with 99.9% uptime.'
    },
    keyPills: {
      zh: ['接口耗时降低 50%', '系统可用性 99.9%', 'Dubbo 微服务', '数百万师生互动'],
      en: ['Latency Cut by 50%', '99.9% Availability', 'Dubbo Microservices', 'Millions of Users']
    },
    slogan: {
      zh: '以敏捷微服务治理与精细缓存设计支撑全国数百万幼教家庭的高频内容互动与任务打卡',
      en: 'Powering high-frequency educational CMS interactions for millions of families with Dubbo'
    },
    metrics: [
      { val: '-50%', lbl: { zh: '接口响应耗时', en: 'Latency Reduction' }, desc: { zh: '慢 SQL 治理与全链路性能调优', en: 'Slow SQL tuning & cache layers' } },
      { val: '99.9%', lbl: { zh: '系统可用性', en: 'System Uptime' }, desc: { zh: 'Dubbo 熔断限流与服务解耦', en: 'Circuit breaking & decoupling' } },
      { val: { zh: '百万级', en: '1M+' }, lbl: { zh: '日均活跃师生', en: 'Active Users' }, desc: { zh: '支撑幼教家庭高频图文视频互动', en: 'Smooth content & task feeds' } },
      { val: { zh: '0 故障', en: '0' }, lbl: { zh: '大促开学季保障', en: 'Zero Incidents' }, desc: { zh: '开学季流量激增平稳应对', en: 'High resilience during seasonal peaks' } }
    ],
    deepChapters: [
      {
        title: { zh: '1. CMS 内容发布与高频读聚合微服务治理', en: '1. Content Feed Aggregation & Dubbo Optimization' },
        desc: {
          zh: '针对智慧树家长端与教师端高频图文、视频资讯及亲子任务打卡场景，基于 Dubbo 拆解服务边界，引入多级 Redis 缓存避免热点内容穿透，接口平均耗时由 120ms 降至 50ms。',
          en: 'Decoupled content publishing from user social feeds with Dubbo RPC and Redis caching, cutting average feed latency from 120ms to 50ms.'
        }
      }
    ],
    techStack: ['Java 8', 'Dubbo', 'Spring', 'Redis', 'MySQL', 'Maven', 'Linux']
  },
  {
    id: 'piaowutong',
    code: '06',
    period: { zh: '2015.08 — 2017.03', en: '2015.08 — 2017.03' },
    periodStart: '2015.08',
    periodEnd: { zh: '— 2017.03', en: '— 2017.03' },
    isCurrent: false,
    company: { zh: '中演票务通', en: 'China Ticket Online' },
    fullName: { zh: '中演票务通（全国演出票务在线）', en: 'China Ticket Online Ticketing Platform' },
    projectTitle: { zh: '票务通主站高可用架构重构与移动 API 中枢', en: 'Ticketing Platform High-Availability Architecture & Mobile API' },
    role: { zh: 'Java 开发工程师 · API 项目负责人', en: 'Java Engineer · API Lead' },
    domainTag: { zh: '演出票务秒杀 · SpringMVC+Dubbo 重构 · API 规范', en: 'Ticketing Flash Sales · SpringMVC+Dubbo · API Protocols' },
    timelineBadge: { zh: '高可用重构', en: 'Ticketing Core' },
    location: { zh: '北京 · 核心售票研发组', en: 'Beijing · Core Ticketing Team' },
    summary: {
      zh: '负责票务通主站、APP 接口与 CRM 后台开发维护。主导核心项目向 SpringMVC + Dubbo 重构，系统稳定性提升 40%；担任 API 项目负责人，协同移动端工程师定义前后端数据交互标准，联调效率提升 35%。',
      en: 'Maintained ticket sales portals and mobile APIs. Spearheaded core system refactoring with SpringMVC + Dubbo (+40% stability); served as API project lead establishing mobile-backend protocols, boosting cross-team integration efficiency by 35%.'
    },
    keyPills: {
      zh: ['核心项目 Dubbo 重构', '系统稳定性提升 40%', '联调效率提升 35%', 'API 负责人'],
      en: ['Dubbo Refactoring', 'Stability Surge +40%', 'Integration Speed +35%', 'API Lead']
    },
    slogan: {
      zh: '在全国热门大型演出开售瞬间，以重构解耦与标准化接口契约筑牢抢票高可用基石',
      en: 'Rebuilding ticketing transaction backends with Dubbo to handle high-demand concert ticket rushes'
    },
    metrics: [
      { val: '+40%', lbl: { zh: '系统稳定性提升', en: 'Stability Increase' }, desc: { zh: 'SpringMVC + Dubbo 架构重构解耦', en: 'SpringMVC + Dubbo refactoring' } },
      { val: '+35%', lbl: { zh: '联调交付效率', en: 'Integration Velocity' }, desc: { zh: '标准化 API 契约与 Mock 规范', en: 'Standardized API contracts' } },
      { val: { zh: '千万级', en: '10M+' }, lbl: { zh: '演出开售吞吐', en: 'Peak Ticket Volume' }, desc: { zh: '支撑全国热门演唱会与赛事平稳放票', en: 'Nationwide concert ticket sales' } },
      { val: { zh: '0 错票', en: '0' }, lbl: { zh: '票务库存一致性', en: 'Zero Ticketing Errors' }, desc: { zh: '排队锁座与支付防重扣款', en: 'Seat reservation & payment checks' } }
    ],
    deepChapters: [
      {
        title: { zh: '1. 单体架构向 SpringMVC + Dubbo 微服务化演进', en: '1. Decoupling Monolithic Ticketing into Distributed RPC' },
        desc: {
          zh: '针对热门演唱会开售时大量刷票导致的单体服务假死问题，主导将用户鉴权、演出场次、选座锁座及支付接口按业务拆分为独立 Dubbo 服务，整体吞吐与稳定性提升 40%。',
          en: 'Decoupled monolithic ticketing into distinct services (auth, seat reservation, checkout) via Dubbo, preventing server stalls during concert ticket release spikes.'
        }
      }
    ],
    techStack: ['Java', 'SpringMVC', 'Dubbo', 'MySQL', 'Redis', 'Tomcat', 'SVN/Git']
  }
];
