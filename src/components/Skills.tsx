import React from 'react';
import { Cpu, Terminal, Database, Palette, CheckCircle, Flame } from 'lucide-react';

interface SkillCategory {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  skills: { name: string; level: string; hot?: boolean }[];
}

const skillCategories: SkillCategory[] = [
  {
    title: '现代前端与图形学',
    subtitle: 'Frontend & Creative Tech',
    icon: <Cpu className="w-5 h-5 text-sky-400" />,
    skills: [
      { name: 'React 19 & Next.js', level: '精通', hot: true },
      { name: 'TypeScript (严谨类型设计)', level: '精通' },
      { name: 'Canvas 2D & WebGL 物理粒子', level: '熟练', hot: true },
      { name: 'Tailwind CSS & 样式体系', level: '精通' },
      { name: 'Vite & 现代构建工具链', level: '精通' },
      { name: 'CSS 现代特性 (毛玻璃/网格)', level: '精通' },
    ],
  },
  {
    title: '服务端与分布式架构',
    subtitle: 'Backend & Systems',
    icon: <Terminal className="w-5 h-5 text-emerald-400" />,
    skills: [
      { name: 'Node.js & Bun 运行时', level: '精通' },
      { name: 'Go 并发与微服务', level: '熟练', hot: true },
      { name: 'RESTful & GraphQL API 设计', level: '精通' },
      { name: 'WebSocket & WebRTC 实时流', level: '熟练' },
      { name: 'Docker 容器化与运维部署', level: '熟练' },
      { name: 'CI/CD 自动化流水线', level: '熟练' },
    ],
  },
  {
    title: '数据工程与存储',
    subtitle: 'Data & Persistence',
    icon: <Database className="w-5 h-5 text-amber-400" />,
    skills: [
      { name: 'PostgreSQL 复杂查询与索引', level: '精通' },
      { name: 'Redis 高速缓存与发布订阅', level: '精通', hot: true },
      { name: 'Prisma / Drizzle ORM', level: '精通' },
      { name: 'CRDT 去中心化冲突解决', level: '深入研究' },
      { name: 'SQLite 嵌入式数据流', level: '熟练' },
      { name: '数据迁移与兼容性审计', level: '规范严格' },
    ],
  },
  {
    title: '体验设计与工程化',
    subtitle: 'Design & Interaction',
    icon: <Palette className="w-5 h-5 text-purple-400" />,
    skills: [
      { name: 'Glassmorphism 2.0 材质设计', level: '精通', hot: true },
      { name: '人机工程学与手势微交互', level: '熟练' },
      { name: 'WCAG AA 级无障碍体验', level: '熟练' },
      { name: 'Figma 高保真设计与原型', level: '熟练' },
      { name: '性能监控与 60fps 帧率优化', level: '精通' },
      { name: '高可用容错与降级机制', level: '严谨' },
    ],
  },
];

export const Skills: React.FC = () => {
  return (
    <section id="skills" className="relative py-24 px-4 max-w-6xl mx-auto z-20">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-sky-400 mb-3">
          <Terminal className="w-3.5 h-3.5" />
          <span>技能矩阵</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
          深耕全栈，追求深度与广度
        </h2>
        <p className="max-w-xl text-slate-400 text-sm sm:text-base leading-relaxed">
          坚持“少即是多”的干净代码纪律，注重输入边界、异常捕获与极致渲染性能。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skillCategories.map((cat, idx) => (
          <div
            key={idx}
            className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-white/20 transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                {cat.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{cat.title}</h3>
                <p className="text-xs text-slate-400">{cat.subtitle}</p>
              </div>
            </div>

            {/* Skills List */}
            <div className="space-y-3">
              {cat.skills.map((skill, sIdx) => (
                <div
                  key={sIdx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-sky-400/70" />
                    <span className="text-xs sm:text-sm text-slate-200 font-medium">
                      {skill.name}
                    </span>
                    {skill.hot && (
                      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/25 px-1.5 py-0.2 rounded-full">
                        <Flame className="w-2.5 h-2.5" /> 核心
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-mono bg-white/[0.04] px-2 py-0.5 rounded-md">
                    {skill.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
