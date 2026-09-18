from typing import Any, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.resume import ResumeProfile
from app.schemas.resume import ResumeProfileResponse

# 基于 docs/贾晨-个人简历.docx 提炼出的真实高价值结构化数据
JIA_CHEN_RESUME_SEED: Dict[str, Any] = {
    "profile_key": "default",
    "zh": {
        "information": {
            "name": "贾晨 / Chen",
            "role": "全栈开发工程师 · AI Agent 架构探索者",
            "location": "坐标：北京 · 太原理工大学 计算机本科",
            "phone": "18310761375",
            "email": "jichi0711@163.com",
            "education": "太原理工大学 · 计算机科学与技术 本科 (2009-2013)",
            "point1Title": "01 / 十年高并发与分布式架构",
            "point1Desc": "10年+ 全链路 Java 后端与微服务架构底座研发经验，深耕电商秒杀、生鲜交易与大规模微服务拆分，扛住千万级日活高并发高可用考验。",
            "point2Title": "02 / AI Agent 智能体工程化实践",
            "point2Desc": "深度践行 Vibe Coding，主导设计落生产级 AI Agent 智能销售 SOP（Memory+Planning+Tools），团队 AGENTS.md 规范制定者，提升研发效能 40%。",
            "point3Title": "03 / 企业级平台与工作流深度定制",
            "point3Desc": "深度二次开发 Flowable6 工作流引擎并封装 15+ 业务组件；主导单体微服务拆分为 12 个独立服务，CI/CD 自动化流水线让发布从 2 天缩短至 2 小时。",
        },
        "experience": {
            "title": "工程演进与架构里程碑",
            "subtitle": "从千万级高并发秒杀交易到企业级 AI Agent 生产实践",
            "exp1Role": "北京奇梦岛网络科技有限公司 · 高级工程师 / 全栈架构",
            "exp1Desc": "主导财商教育 CRM 拆分为 12 个独立微服务；自研 AI Agent 智能 SOP 覆盖 80% 销售场景，效率提升 300%；完成潮玩电商秒杀三级缓存优化，QPS 提升 45%。",
            "exp1Time": "2022.07 — 至今",
            "exp2Role": "上海任意门科技有限公司 · 高级 Java 开发工程师",
            "exp2Desc": "负责广告业务线 CRM、财务系统与 Flowable 工作流三大核心模块从 0 到 1 架构；搭建通用广告组件库，连续 3 个季度获得部门 A 绩效。",
            "exp2Time": "2021.05 — 2022.05",
            "exp3Role": "美菜网（美家优享） · 高级 Java 开发工程师",
            "exp3Desc": "核心负责生鲜社区团购价格与秒杀系统，支撑全国 13 万团长、百万级用户限时抢购，保障大促高峰单日 35 万单、千万元流水稳定运行且零超卖。",
            "exp3Time": "2018.11 — 2021.05",
        },
        "works": {
            "title": "精选代表作品与工程系统",
            "subtitle": "融合 AI Agent 智能体前沿工程与千万级高并发的工业级落地成果",
            "w1Tag": "01 / AI AGENT 智能体系统",
            "w1Title": "智能销售 SOP 自动化 Agent 平台",
            "w1Desc": "运用 Memory 记忆交互、Planning 任务规划与 Tools 自动调度短信/呼叫/CRM，覆盖 80% 销售场景，销售人效提升 300%，客户转化率提升 15%。",
            "w2Tag": "02 / 高并发交易引擎",
            "w2Title": "潮玩电商新品秒杀订单系统",
            "w2Desc": "设计本地缓存+Redis+DB三级缓存体系，实现库存预扣减与最终补偿机制，日订单 10 万+，秒杀零宕机零超卖，接口 TP99 稳定在 50ms 内。",
            "w3Tag": "03 / 企业级中台底座",
            "w3Title": "一站式 CRM 架构与 Flowable 工作流引擎",
            "w3Desc": "二次开发工作流封装 15+ 业务组件，支撑 20+ 流程可视化配置；单体系统拆分为 12 个微服务，容器化自动化 CI/CD 使部署效率提升 10 倍。",
            "w4Tag": "04 / 社区团购高并发",
            "w4Title": "美家优享生鲜社区秒杀系统",
            "w4Desc": "支撑全国 13 万团长、百万用户高并发抢购，单日最高 35 万单与千万日销，大促数据库请求下降 65%，单接口最高日调用量达 200 万次。",
        },
        "contact": {
            "title": "开启合作 · 保持联络",
            "subtitle": "欢迎全栈开发、AI Agent 智能体研发与系统架构合作交流",
            "channel": "直达联络信道",
            "email": "jichi0711@163.com",
            "phone": "18310761375",
            "desc": "随时欢迎来信探讨 AI Agent 工程化落地与全栈系统演进",
        },
    },
    "en": {
        "information": {
            "name": "Jia Chen / Chen",
            "role": "Full-Stack Engineer & AI Agent Architect",
            "location": "Location: Beijing, China · B.S. in Computer Science",
            "phone": "+86 18310761375",
            "email": "jichi0711@163.com",
            "education": "Taiyuan University of Technology · B.S. in Computer Science (2009-2013)",
            "point1Title": "01 / Decade of High-Concurrency Architecture",
            "point1Desc": "10+ years of full-lifecycle backend and distributed systems experience, architecting flash-sale engines and microservices handling millions of daily active users.",
            "point2Title": "02 / AI Agent & Vibe Coding Pioneer",
            "point2Desc": "Deep practitioner of Vibe Coding & Agentic AI; architected production-grade Smart Sales SOP with Memory/Planning/Tools, cutting overall development cycles by 40%.",
            "point3Title": "03 / Industrial Platform & Workflow Engine",
            "point3Desc": "Extensively customized Flowable6 workflow engine with 15+ reusable business components; split monolith into 12 microservices, shortening release cycles from 2 days to 2 hours.",
        },
        "experience": {
            "title": "Engineering Milestones & Career Evolution",
            "subtitle": "From multi-million daily active e-commerce flash sales to production-grade AI Agent systems",
            "exp1Role": "Beijing Qimengdao Network · Senior Engineer & Full-Stack Architect",
            "exp1Desc": "Split CRM into 12 independent microservices; designed AI Agent Smart SOP boosting sales efficiency by 300%; optimized e-commerce flash-sale QPS by 45%.",
            "exp1Time": "2022.07 — Present",
            "exp2Role": "Shanghai Renyimen Tech · Senior Java Engineer",
            "exp2Desc": "Architected Ad-tech CRM, financial ledger, and Flowable workflow from scratch; built shared component libraries, receiving Grade-A performance for 3 quarters.",
            "exp2Time": "2021.05 — 2022.05",
            "exp3Role": "Meicai (Meijia Youxiang) · Senior Java Engineer",
            "exp3Desc": "Engineered core pricing and flash-sale systems supporting 130k community group leaders and 1M+ consumers with zero overselling during mega promotion campaigns.",
            "exp3Time": "2018.11 — 2021.05",
        },
        "works": {
            "title": "Featured Projects & Production Systems",
            "subtitle": "Industrial-grade systems integrating cutting-edge AI Agents with high-concurrency performance",
            "w1Tag": "01 / AI AGENT SYSTEM",
            "w1Title": "Smart Sales SOP Automated Agent Platform",
            "w1Desc": "Leveraged Memory, Planning, and Tool-calling to automate customer interactions across SMS, IVR, and CRM, covering 80%+ sales workflows and increasing lead conversion by 15%.",
            "w2Tag": "02 / HIGH-CONCURRENCY ENGINE",
            "w2Title": "Trendy Toy Flash-Sale & Order Engine",
            "w2Desc": "Built a 3-tier cache (Local + Redis Cluster + DB) with pre-deduction and compensation, handling 100k+ daily orders with zero downtime and TP99 latency < 50ms.",
            "w3Tag": "03 / ENTERPRISE MIDDLEWARE",
            "w3Title": "All-in-One CRM & Flowable Workflow Core",
            "w3Desc": "Encapsulated 15+ business components supporting 20+ visual workflow configurations; split system into 12 microservices with 10x faster CI/CD deployment.",
            "w4Tag": "04 / COMMUNITY COMMERCE",
            "w4Title": "Fresh Grocery Group Buying Flash-Sale Core",
            "w4Desc": "Supported 130k community leaders and millions of users with 350k daily peak orders; reduced database load by 65% during peak promotions.",
        },
        "contact": {
            "title": "Start Collaboration · Get in Touch",
            "subtitle": "Open for Full-Stack, AI Agent Engineering, and Architecture Consulting",
            "channel": "DIRECT CHANNEL",
            "email": "jichi0711@163.com",
            "phone": "+86 18310761375",
            "desc": "Always welcome to discuss AI Agent engineering and full-stack architecture evolution",
        },
    },
}


class ResumeService:
    """简历数据服务"""

    @staticmethod
    async def init_seed(db: AsyncSession) -> None:
        """检查并自动填充贾晨真实简历数据"""
        stmt = select(ResumeProfile).where(ResumeProfile.profile_key == "default")
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()

        if profile is None:
            new_profile = ResumeProfile(
                profile_key="default",
                data=JIA_CHEN_RESUME_SEED,
            )
            db.add(new_profile)
            await db.commit()
            print("Seeded Jia Chen's resume into database successfully.")
        else:
            # 更新为最新简历结构
            profile.data = JIA_CHEN_RESUME_SEED
            await db.commit()
            print("Updated Jia Chen's resume seed in database.")

    @staticmethod
    async def get_profile(db: AsyncSession) -> ResumeProfileResponse:
        """获取结构化简历数据"""
        stmt = select(ResumeProfile).where(ResumeProfile.profile_key == "default")
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()

        if profile is None:
            # 如果数据库暂无数据，实时写入并返回
            await ResumeService.init_seed(db)
            return ResumeProfileResponse(
                profile_key="default",
                zh=JIA_CHEN_RESUME_SEED["zh"],
                en=JIA_CHEN_RESUME_SEED["en"],
            )

        return ResumeProfileResponse(
            profile_key=profile.profile_key,
            zh=profile.data["zh"],
            en=profile.data["en"],
        )
