import React from 'react';
import { Briefcase, MapPin } from 'lucide-react';

interface TimelineItem {
  year: string;
  role: string;
  company: string;
  location: string;
  description: string[];
}

const experiences: TimelineItem[] = [
  {
    year: '2024 - 至今',
    role: '全栈技术专家 & 独立创作者',
    company: 'Studio & Open Source',
    location: 'Remote',
    description: [
      '主导现代毛玻璃交互系统及 Canvas 动力学动效引擎的开源研发，累计收获广泛采用。',
      '为多家全球科技创新公司提供端到端高保真全栈工程方案，兼顾性能指标与人机交互质感。',
      '实践极简软件工程纪律，确保代码零技术债务与严谨的测试覆盖率。',
    ],
  },
  {
    year: '2021 - 2024',
    role: '高级全栈 / 前端架构师',
    company: 'Leading Cloud Tech Inc.',
    location: 'Shanghai, China',
    description: [
      '负责高并发协作云平台的实时架构设计，引入 WebRTC 与 CRDT 算法，协同冲突延迟下降 80%。',
      '主导团队组件库向现代 Glassmorphism 2.0 迁移，制定无障碍与 60fps 渲染性能审计规范。',
      '指导 15+ 位工程师的技术成长与代码规范重构，荣获年度卓越技术贡献奖。',
    ],
  },
  {
    year: '2018 - 2021',
    role: '核心全栈研发工程师',
    company: 'Fintech & Big Data Co.',
    location: 'Beijing, China',
    description: [
      '主导核心金融交易与可视化仪表盘研发，承载日均数千万次高性能数据吞吐。',
      '重构复杂数据管道与实时 WebSocket 推送层，将系统峰值错误率降至 0.001% 以下。',
    ],
  },
];

export const Experience: React.FC = () => {
  return (
    <section id="experience" className="relative py-24 px-4 max-w-5xl mx-auto z-20">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-sky-400 mb-3">
          <Briefcase className="w-3.5 h-3.5" />
          <span>成长旅程</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
          专注与沉淀的足迹
        </h2>
        <p className="max-w-xl text-slate-400 text-sm sm:text-base leading-relaxed">
          在真实的复杂工程考验中磨砺认知，保持对新技术的好奇心与对工程本质的敬畏。
        </p>
      </div>

      <div className="relative border-l border-white/10 ml-4 sm:ml-32 space-y-12">
        {experiences.map((exp, idx) => (
          <div key={idx} className="relative pl-6 sm:pl-8 group">
            {/* Timeline glowing dot */}
            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#070a12] border-2 border-sky-400 group-hover:scale-125 group-hover:border-amber-300 transition-all duration-300 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />

            {/* Left Year Badge (Desktop) */}
            <div className="hidden sm:block absolute -left-36 top-1 text-right w-28">
              <span className="text-xs font-semibold font-mono text-sky-300/90 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full">
                {exp.year}
              </span>
            </div>

            {/* Content Glass Card */}
            <div className="glass-card rounded-2xl p-6 relative">
              <div className="sm:hidden mb-2">
                <span className="text-xs font-semibold font-mono text-sky-300/90 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
                  {exp.year}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="text-lg font-bold text-white group-hover:text-sky-200 transition-colors">
                  {exp.role}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-medium text-slate-300">{exp.company}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {exp.location}
                  </span>
                </div>
              </div>

              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                {exp.description.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2 leading-relaxed font-normal">
                    <span className="text-sky-400 mt-1">▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
