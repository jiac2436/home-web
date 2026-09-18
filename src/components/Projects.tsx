import React from 'react';
import { Layers, ArrowUpRight, Sparkles } from 'lucide-react';
import { GithubIcon } from './Icons';

interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  gradient: string;
  icon: string;
  demoUrl: string;
  githubUrl: string;
  highlight: string;
}

const projects: Project[] = [
  {
    id: 'aeroflow',
    title: 'AeroFlow · 动力学风场实验室',
    subtitle: '基于流体力学 Navier-Stokes 拟真的 WebGL/Canvas 交互引擎',
    description:
      '探索空气动力学在网页人机交互中的边界。支持手势感应、滚动风场耦合、微涡旋气流脱落与 10,000+ 粒子在 60fps 满帧运行。',
    tags: ['Canvas 2D', 'TypeScript', 'Fluid Dynamics', 'Tailwind CSS'],
    gradient: 'from-sky-500/20 via-indigo-500/10 to-transparent',
    icon: '💨',
    demoUrl: '#',
    githubUrl: 'https://github.com',
    highlight: '60 FPS 满帧流体',
  },
  {
    id: 'lumina',
    title: 'Lumina · 极简毛玻璃设计系统',
    subtitle: '遵循 Glassmorphism 2.0 规范的企业级 React 组件体系',
    description:
      '兼顾现代毛玻璃通透感与 WCAG AA 无障碍对比度。内置 40+ 玻璃拟态卡片、高光边框生成器与自适应深浅自发光光晕。',
    tags: ['React 19', 'Design System', 'Accessibility', 'Framer Motion'],
    gradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
    icon: '✨',
    demoUrl: '#',
    githubUrl: 'https://github.com',
    highlight: 'WCAG AA 级对比度',
  },
  {
    id: 'hypersync',
    title: 'HyperSync · 实时协同白板引擎',
    subtitle: '基于 CRDT 与 WebRTC 的毫秒级分布式画布空间',
    description:
      '支持千人同时在线协同编辑，采用去中心化局部状态合并算法，网络断连自动乐观同步，丝滑无卡顿。',
    tags: ['WebRTC', 'CRDT', 'Go', 'WebSocket', 'Tailwind'],
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    icon: '⚡',
    demoUrl: '#',
    githubUrl: 'https://github.com',
    highlight: '<15ms 极低延迟',
  },
  {
    id: 'chronos',
    title: 'Chronos · 极简深度专注工作站',
    subtitle: '回归本质的开发者效率工具与时间流可视化',
    description:
      '无干扰全屏设计，融合双链笔记、微型番茄钟、有机环境白噪音与多平台同步，助力沉浸式工程思考。',
    tags: ['Electron', 'React', 'SQLite', 'Zustand'],
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    icon: '⏳',
    demoUrl: '#',
    githubUrl: 'https://github.com',
    highlight: '离线优先设计',
  },
];

export const Projects: React.FC = () => {
  return (
    <section id="projects" className="relative py-24 px-4 max-w-6xl mx-auto z-20">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-sky-400 mb-3">
          <Layers className="w-3.5 h-3.5" />
          <span>精选作品</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
          将想象力转化为生产力
        </h2>
        <p className="max-w-xl text-slate-400 text-sm sm:text-base leading-relaxed">
          每个作品都注重底层性能、工程鲁棒性与极致用户体验的平衡。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        {projects.map((project) => (
          <div
            key={project.id}
            className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white/20"
          >
            {/* Ambient Corner Glow */}
            <div
              className={`absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br ${project.gradient} blur-3xl pointer-events-none group-hover:scale-125 transition-all duration-500`}
            />

            <div>
              {/* Header: Icon & Highlight Badge */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                  {project.icon}
                </div>
                <span className="text-[11px] font-medium text-sky-300 bg-sky-400/10 border border-sky-400/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  {project.highlight}
                </span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sky-200 transition-colors">
                {project.title}
              </h3>
              <p className="text-xs font-medium text-slate-400 mb-4">{project.subtitle}</p>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed mb-6 font-normal">
                {project.description}
              </p>
            </div>

            <div>
              {/* Tech Tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/8 text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <a
                  href={project.demoUrl}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-sky-300 transition-colors group/link"
                >
                  <span>查看在线预览</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </a>

                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-90"
                  title="查看源代码"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
