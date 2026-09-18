import React, { useState } from 'react';

interface ProjectItem {
  number: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
}

const PROJECTS: ProjectItem[] = [
  {
    number: '01',
    title: 'Fluid & Physics Canvas Engine',
    category: '创意交互 · 图形学与流体模拟',
    description: '基于 Canvas2D 与 WebGL 的轻量级高帧率流体与弹性样条引擎，结合物理弹簧动力学与阻尼波动，打造电影级有机质感。',
    tags: ['WebGL', 'Canvas2D', 'Hooke Physics', 'Spring Math'],
  },
  {
    number: '02',
    title: 'Enterprise Micro-Frontend Platform',
    category: '全栈架构 · 超大规模系统',
    description: '服务于百万级日活的企业级微前端与低代码平台架构，具备零依赖隔离沙箱、动态依赖共享与极速秒级构建发布体系。',
    tags: ['Architecture', 'TypeScript', 'Module Federation', 'Docker'],
  },
  {
    number: '03',
    title: 'Autonomous AI Copilot Interface',
    category: '智能交互 · 人机协同体验',
    description: '面向未来工作流的沉浸式智能体交互界面，支持多智能体协同可视化、流式 Markdown/Canvas 渲染与毫秒级反馈。',
    tags: ['Next.js', 'TailwindCSS', 'LLM Agents', 'Reactive UX'],
  },
  {
    number: '04',
    title: 'High-Performance Cloud Services',
    category: '后端架构 · 高并发高可用',
    description: '采用 Rust 与 Go 构建的高吞吐分布式网关与数据流水线，单机轻松承载数万并发，具备毫秒级冷启动与自愈容灾。',
    tags: ['Rust', 'Golang', 'gRPC', 'Distributed Systems'],
  },
];

const SKILLS = [
  { group: '前端与创意工程', items: ['TypeScript', 'React / Next.js', 'WebGL / Three.js', 'Canvas API', 'TailwindCSS', 'GSAP'] },
  { group: '全栈与云原生后端', items: ['Node.js', 'Rust', 'Golang', 'PostgreSQL', 'Redis', 'Docker / K8s'] },
  { group: '架构与工程体系', items: ['微前端架构', '性能极限调优', '高并发系统设计', 'CI/CD 流水线', '自动化测试'] },
];

export const LusionPortfolioContent: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('jichi0711@163.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 pt-24 pb-36 text-slate-950">
      
      {/* 1. 精选项目与技术实践 */}
      <section id="projects" className="max-w-6xl mx-auto mb-36">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-slate-200">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              SELECTED WORKS & PRACTICES
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-950 mt-2">
              精选实践与工程成果
            </h2>
          </div>
          <p className="text-sm text-slate-500 max-w-md mt-4 md:mt-0 leading-relaxed">
            兼具工程严谨性与现代数字化先锋美感，专注于解决复杂系统挑战与打造令人惊叹的微交互体验。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PROJECTS.map((item) => (
            <div
              key={item.number}
              className="group relative p-8 sm:p-10 rounded-3xl bg-white/70 hover:bg-white backdrop-blur-md border border-slate-200/80 shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(47,166,220,0.12)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-2xl font-bold text-slate-300 group-hover:text-[#2fa6dc] transition-colors">
                  {item.number}
                </span>
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase px-3 py-1 rounded-full bg-slate-100 group-hover:bg-cyan-50 group-hover:text-cyan-700 transition-colors">
                  {item.category}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 tracking-tight group-hover:text-slate-950">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {item.description}
              </p>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-md bg-slate-100/80 text-slate-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. 关于晨与技术能力矩阵 */}
      <section id="about" className="max-w-6xl mx-auto mb-36">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-slate-200">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              ABOUT CHEN & EXPERTISE
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-950 mt-2">
              关于晨 · 全栈工程专家
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 p-8 sm:p-10 rounded-3xl bg-white/70 backdrop-blur-md border border-slate-200/80 shadow-sm leading-relaxed text-slate-700">
            <h3 className="text-xl font-bold text-slate-950 mb-4">
              工程哲学：追求极简、健壮与感官愉悦
            </h3>
            <p className="mb-4 text-sm sm:text-base">
              拥有全栈系统设计与前沿创意计算的丰富落地经验，主导过多款高并发分布式云平台及先锋级交互产品的研发。
            </p>
            <p className="text-sm sm:text-base text-slate-600">
              坚信好的工程代码如诗般清晰直接，好的交互界面如自然物理般浑然天成。拒绝无效的堆砌与重构，以手术刀般的精准度交付经得起高负荷考验的工业级作品。
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-950 text-white flex flex-col justify-between shadow-xl">
            <div>
              <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">PHILOSOPHY</span>
              <h4 className="text-2xl font-bold mt-2 tracking-tight">Code as Craft.</h4>
              <p className="text-xs text-slate-300 mt-4 leading-relaxed">
                “代码是逻辑的骨骼，物理是交互的灵魂，美学是体验的归宿。”
              </p>
            </div>
            <div className="pt-6 border-t border-slate-800 text-xs font-mono text-slate-400">
              Chen Portfolio © 2026
            </div>
          </div>
        </div>

        {/* 技能矩阵 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SKILLS.map((sk) => (
            <div
              key={sk.group}
              className="p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-slate-200/60"
            >
              <h4 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                {sk.group}
              </h4>
              <div className="flex flex-wrap gap-2">
                {sk.items.map((i) => (
                  <span
                    key={i}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 底部联络与行动呼吁 */}
      <footer id="contact" className="max-w-6xl mx-auto pt-16 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
            准备好开始合作了吗？
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            欢迎探讨全栈技术挑战、创意交互研发或项目架构咨询。
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleCopyEmail}
            className="px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold tracking-wider uppercase shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span>{copied ? '已复制邮箱：jichi0711@163.com' : '复制邮箱 · 保持联系'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </button>

          <button
            onClick={handleScrollToTop}
            className="px-4 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold tracking-wider uppercase border border-slate-200 shadow-sm transition-all"
            title="回到顶部"
          >
            ↑ 顶部
          </button>
        </div>
      </footer>

    </div>
  );
};
