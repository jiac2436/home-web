// 6 大真实工程战役数据模型（从早到晚：2015 -> 2023 至今）
export interface TimelineProject {
  id: string;
  code: string;
  year: string;
  period: string;
  timelineBadge: string;
  domainTag: string;
  company: string;
  fullName: string;
  title: string;
  role: string;
  location: string;
  slogan: string;
  accentColor: number;
  xPos: number;
  metrics: { val: string; lbl: string; desc: string }[];
  deepChapters: { title: string; desc: string }[];
  techStack: string[];
}

export const TIMELINE_PROJECTS: TimelineProject[] = [
  {
    id: 'piaowutong',
    code: '01',
    year: '2015 - 2017',
    period: '2015.08 — 2017.03',
    timelineBadge: '国家票务基石',
    domainTag: '演出票务秒杀 · SpringMVC+Dubbo 重构 · API 规范',
    company: '中演票务通',
    fullName: '中演票务通文化发展有限公司',
    title: '国家级大型演艺票务票夹与选座中枢',
    role: '初级/中级 Java 工程师 · API 项目负责人',
    location: '北京 · 文化票务平台',
    slogan: '扎实筑牢国家级大剧院与超级演唱会在线选座底座，初步涉分布式锁与高并发票池防超卖攻坚',
    accentColor: 0xef4444, // 现实赤金
    xPos: -115,
    metrics: [
      { val: '100%', lbl: '锁座交易零冲突', desc: 'Redis+DB 状态机互斥' },
      { val: '200+', lbl: '国家级剧场场馆覆盖', desc: '复杂异构座位图模型' },
      { val: '8000', lbl: '开票秒杀并发 TPS', desc: '早期高并发调优实践' },
      { val: '10年', lbl: '工程架构生涯基石', desc: '严谨分布式与事务起步' }
    ],
    deepChapters: [
      {
        title: '1. 剧场复杂拓扑动态选座与锁座算法',
        desc: '设计多边形坐标座位矩阵数据结构，结合 Redis 临时持票锁与分布式倒计时释放机制，彻底杜绝热门演唱会抢座重叠。'
      },
      {
        title: '2. 单体架构向 SpringMVC + Dubbo 微服务化演进',
        desc: '针对热门演唱会开售时大量刷票导致的单体服务假死问题，主导将用户鉴权、演出场次、选座锁座及支付接口按业务拆分为独立 Dubbo 服务，整体吞吐与稳定性提升 40%。'
      }
    ],
    techStack: ['Java', 'SpringMVC', 'Dubbo', 'MySQL', 'Redis', 'Tomcat', 'SVN/Git']
  },
  {
    id: 'huanyu-zhihuishu',
    code: '02',
    year: '2017 - 2018',
    period: '2017.03 — 2018.09',
    timelineBadge: '微服务治理中台',
    domainTag: '智慧树 APP · CMS 内容中台 · Dubbo 微服务治理',
    company: '北京环宇万维科技',
    fullName: '北京环宇万维科技有限公司（智慧树幼教）',
    title: '智慧树 APP 发现中心 (CMS) 与亲子任务微服务治理',
    role: 'Java 开发工程师',
    location: '北京 · 核心产品研发团队',
    slogan: '以敏捷微服务治理与精细缓存设计支撑全国数百万幼教家庭的高频内容互动与任务打卡',
    accentColor: 0xf97316, // 日珥暖橙
    xPos: -77,
    metrics: [
      { val: '-50%', lbl: '接口响应耗时', desc: '慢 SQL 治理与全链路性能调优' },
      { val: '99.9%', lbl: '系统可用性', desc: 'Dubbo 熔断限流与服务解耦' },
      { val: '百万级', lbl: '日均活跃师生', desc: '支撑幼教家庭高频图文视频互动' },
      { val: '0 故障', lbl: '大促开学季保障', desc: '开学季流量激增平稳应对' }
    ],
    deepChapters: [
      {
        title: '1. CMS 内容发布与高频读聚合微服务治理',
        desc: '针对智慧树家长端与教师端高频图文、视频资讯及亲子任务打卡场景，基于 Dubbo 拆解服务边界，引入多级 Redis 缓存避免热点内容穿透，接口平均耗时由 120ms 降至 50ms。'
      }
    ],
    techStack: ['Java 8', 'Dubbo', 'Spring', 'Redis', 'MySQL', 'Maven', 'Linux']
  },
  {
    id: 'meicai-flashsale',
    code: '03',
    year: '2018 - 2021',
    period: '2018.11 — 2021.05',
    timelineBadge: '千万级秒杀价格',
    domainTag: '社区生鲜团购 · 千万级大促秒杀 · 分布式价格',
    company: '美菜网（美家优享）',
    fullName: '美菜网（美家优享社区团购）',
    title: '生鲜社区团购价格体系与大促千万级秒杀系统',
    role: '高级 Java 开发工程师',
    location: '北京 · 电商交易团队',
    slogan: '在全国性千万级下沉流量冲击中，以坚如磐石的分布式缓存与事务一致性捍卫交易底线',
    accentColor: 0xf59e0b, // 琥珀金黄
    xPos: -11,
    metrics: [
      { val: '130k+', lbl: '全国社区团长', desc: '赋能百万级下沉生鲜家庭日常采购' },
      { val: '350k', lbl: '单日大促峰值单', desc: '千万日销平稳履约，零宕机事故' },
      { val: '0', lbl: '重大超卖故障', desc: '多层库存原子预扣与补偿校验' },
      { val: '-65%', lbl: '数据库瞬时压力', desc: '多层缓存拦截高频热点穿透' }
    ],
    deepChapters: [
      {
        title: '1. 准点集中开团瞬间的垂直脉冲防御',
        desc: '每天上午 10 点与晚 8 点开团瞬间，全国 13 万团长拉动百万社群涌入抢购，瞬时下单请求呈陡峭垂直脉冲。设计防抖拦截、Nginx 静态化、Redis Lua 预减库存与 MySQL 行级乐观锁四道防线，阻断 98% 无效写穿透。'
      },
      {
        title: '2. 动态多维分布式价格计算引擎',
        desc: '针对生鲜各城市采购成本各异与团长等级佣金差，构建“城市基础价+团长等级+限时秒杀+优惠券”多维价格计算模型，单接口日调用超 200 万次，接口响应稳定在 35ms 内。'
      }
    ],
    techStack: ['Java 8', 'SpringBoot', 'Dubbo', 'Redis 集群', 'MySQL', 'Lua 脚本', '高并发秒杀', '分布式事务', 'CAT 监控']
  },
  {
    id: 'renyimen-ad',
    code: '04',
    year: '2021 - 2022',
    period: '2021.05 — 2022.05',
    timelineBadge: '广告与结算中台',
    domainTag: '广告中台 · 财务台账结算 · 工作流从 0 到 1',
    company: '上海任意门科技',
    fullName: '上海任意门科技有限公司（Soul App）',
    title: '广告业务线 CRM、财务计费结算与 Flowable 工作流中台',
    role: '高级 Java 开发工程师',
    location: '上海 · 广告业务线核心骨干',
    slogan: '以高精度金融级标准构建广告计费与可视化流程审批底座，实现高吞吐与高可靠交付',
    accentColor: 0xa855f7, // 灵动紫
    xPos: 38,
    metrics: [
      { val: '0 → 1', lbl: '核心系统架构', desc: '广告 CRM、财务台账与工作流中台' },
      { val: '+30%', lbl: '研发效能提升', desc: '沉淀广告组件库与通用脚手架' },
      { val: 'Grade-A', lbl: '连续 3 季度绩效', desc: '因架构严谨与攻坚成果荣获部门顶格评定' },
      { val: '10+ 篇', lbl: '技术沉淀内刊', desc: '主讲内部 JVM 调优与并发实战分享' }
    ],
    deepChapters: [
      {
        title: '1. 广告业务复杂结算与财务严谨对账',
        desc: '广告业务数据流转复杂，涵盖客户合同、投放扣费、阶梯返点结算、发票审计等关键链路，对金额精度与事务隔离级别要求苛刻；通过分布式事务一致性机制与定时对账补偿，保障数千万元投放流水账目零差错。'
      },
      {
        title: '2. Flowable 审批引擎与企业 IM 深度打通',
        desc: '针对企业合同与资金变动的层级审核瓶颈，二次开发 Flowable 流程引擎并打通钉钉/飞书消息网关，审批平均耗时缩短 60% 以上。'
      }
    ],
    techStack: ['Java 8', 'SpringBoot', 'Flowable 6', 'MySQL', 'Redis', 'JUC 并发', 'JVM 调优', '分布式锁']
  },
  {
    id: 'qimengdao-crm-ai',
    code: '05',
    year: '2022 - 2023',
    period: '2022.07 — 2023.12',
    timelineBadge: 'AI 智能体中枢',
    domainTag: 'AI Agent 智能体 · 12 微服务拆分 · Flowable 6',
    company: '北京奇梦岛网络科技',
    fullName: '北京奇梦岛网络科技有限公司',
    title: '财商教育一站式 CRM 架构与生产级 AI Agent 智能体',
    role: '项目技术负责人 · 全栈架构师',
    location: '北京 · 支撑 500+ 销售团队',
    slogan: '以 Memory/Planning/Tools 智能体架构与微服务治理赋能企业级复杂销售交付全流程，打造高人效生产力中枢',
    accentColor: 0x06b6d4, // 蔚蓝
    xPos: 74,
    metrics: [
      { val: '300%', lbl: '销售人效突破', desc: 'AI Agent 自动承接 80% 常见跟进流转' },
      { val: '12 个', lbl: '独立业务微服务', desc: '单体解耦，系统耦合度降低 60%' },
      { val: '10x', lbl: 'CI/CD 部署提速', desc: '容器化流水线，发版周期压缩至 2 小时' },
      { val: '+15%', lbl: '客户付费转化率', desc: '线索精准分发与自动化首触达' }
    ],
    deepChapters: [
      {
        title: '1. AI Agent 核心架构：Memory + Planning + Tools 自动化落地',
        desc: '基于企业私域销售场景设计智能体中枢：利用 Memory 模块记录学员过往沟通喜好与画像标签；Planning 模块根据课程进度智能拆解触达任务计划；Tools 模块调度外部网关自动触发短信、语音呼叫及 CRM 回写，自动化覆盖 80% 机械性跟进工作。'
      },
      {
        title: '2. Flowable 6 工作流深度定制与 15+ 业务组件抽象',
        desc: '针对销售审批、退款审核、助教排课等 20+ 复杂场景，深度扩展 Flowable 引擎，封装动态多级会签、驳回重审、角色绑定等 15+ 开箱即用组件，业务流程开发效率提升 80%。'
      },
      {
        title: '3. 团队《AGENTS.md》规范制定与 Vibe Coding 提效',
        desc: '率先引入 Claude Code、Cursor 等 AI 辅助编程工作流，主导制定团队级《AGENTS.md》协同规范，约定工程约束与测试自验证规则，使团队整体编码与交付效率提升 40%。'
      }
    ],
    techStack: ['Java 8', 'SpringBoot', 'Dubbo', 'Flowable 6', 'AI Agent', 'Docker/K8s', 'Redis', 'MySQL', 'Cursor/Claude Code']
  },
  {
    id: 'qimengdao-ecommerce',
    code: '06',
    year: '2023 - 至今',
    period: '2023.03 — 至今',
    timelineBadge: '潮玩秒杀交易中枢',
    domainTag: '高并发秒杀 · 三级缓存 · 削峰防超卖',
    company: '北京奇梦岛网络科技',
    fullName: '北京奇梦岛网络科技有限公司',
    title: '潮玩电商订单与秒杀系统（高并发核心项目）',
    role: '高级 Java 开发工程师 · 核心架构',
    location: '北京 · 电商交易中枢',
    slogan: '以三级多级缓存与原子预扣减为防线，彻底解决秒杀超卖与数据库瞬时雪崩，保障千万级日销峰值如丝般顺滑',
    accentColor: 0x10b981, // 翠绿
    xPos: 116,
    metrics: [
      { val: '+45%', lbl: '下单 QPS 提升', desc: '从 110 提升至 160，抗住数万脉冲' },
      { val: '10 万+', lbl: '单日新品订单', desc: '秒杀全周期零宕机、零超卖' },
      { val: '-70%', lbl: '数据库回源流量', desc: '热点商品提前预热与本地缓存阻断' },
      { val: '< 50ms', lbl: '接口 TP99 延迟', desc: '全链路压测与关键链路异步化' }
    ],
    deepChapters: [
      {
        title: '1. “本地缓存 + Redis 集群 + DB”三级缓存治理',
        desc: '新品秒杀具有“瞬间高并发爆量、读多写少、热点极度集中”特征。设计在微服务网关层与应用层采用 Caffeine 本地缓存存储商品只读数据，配合 Redis 集群进行热点商品预热，使 70% 的瞬时查询在应用内存层直接返回，避免海量请求击穿 DB。'
      },
      {
        title: '2. 库存预扣减 + 异步确认 + 最终一致性补偿',
        desc: '使用 Lua 脚本在 Redis 内部完成原子库存核验与预扣减；扣减成功后通过 Kafka 异步抛送订单创建事件；若用户超时未支付或异常取消，自动触发异步库存回滚补偿，彻底杜绝并发超卖，并大幅减轻主事务执行时间。'
      },
      {
        title: '3. 订单中台微服务化拆分',
        desc: '针对业务扩张，将原有单体交易拆分为订单中心、库存中心、支付中心、履约售后 4 个独立微服务，各服务拥有独立数据库，服务间通过 Dubbo RPC 敏捷通信，系统横向扩展能力提升 3 倍。'
      }
    ],
    techStack: ['Java 11', 'SpringBoot', 'Dubbo', 'Redis 集群', 'MySQL', 'Kafka', 'JMeter 全链路压测', 'Claude Code']
  }
];
