import React from 'react';
import { ArrowDown, Wind, Sparkles, Compass, Layers } from 'lucide-react';

export const Hero: React.FC = () => {
  const handleTriggerBreeze = () => {
    window.dispatchEvent(new CustomEvent('trigger-dandelion-breeze', { detail: { power: 1.4 } }));
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-24 pb-16 px-4 text-center overflow-hidden">
      {/* Background ambient radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-sky-500/12 via-indigo-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-amber-500/5 blur-[100px] pointer-events-none rounded-full" />

      <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-xs font-medium text-slate-300 mb-8 shadow-sm hover:border-white/20 transition-all cursor-default">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>现代审美设计 · 蒲公英物理流场模拟</span>
          <span className="w-1 h-1 rounded-full bg-slate-500"></span>
          <span className="text-sky-300">自然失重感交互</span>
        </div>

        {/* Main Heading with Modern Gradient */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.12]">
          探寻极简秩序与
          <br />
          <span className="bg-gradient-to-r from-sky-200 via-indigo-200 to-amber-100 bg-clip-text text-transparent">
            流动的物理感数字世界
          </span>
        </h1>

        {/* Subtitle / Pitch */}
        <p className="max-w-2xl text-base sm:text-lg text-slate-400 mb-10 leading-relaxed font-normal">
          你好，我是全栈工程师与交互探索者。专注于构建兼具现代化毛玻璃审美、细腻微交互与高性能流体物理动效的高质感 Web 应用。
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 mb-14">
          <a
            href="#projects"
            className="px-6 py-3 rounded-full bg-white text-slate-950 font-semibold text-sm hover:bg-slate-100 active:scale-95 transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] flex items-center gap-2"
          >
            <span>探索精选作品</span>
            <Layers className="w-4 h-4 text-slate-700" />
          </a>

          <button
            onClick={handleTriggerBreeze}
            className="px-6 py-3 rounded-full bg-sky-500/10 hover:bg-sky-500/20 text-sky-200 border border-sky-500/25 hover:border-sky-500/45 font-semibold text-sm active:scale-95 transition-all backdrop-blur-md flex items-center gap-2 group shadow-[0_0_20px_rgba(56,189,248,0.12)]"
          >
            <Wind className="w-4 h-4 text-sky-400 group-hover:rotate-45 transition-transform duration-300" />
            <span>吹起蒲公英 (Breeze)</span>
          </button>

          <a
            href="#about"
            className="px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 font-medium text-sm active:scale-95 transition-all backdrop-blur-md flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-slate-400" />
            <span>关于我</span>
          </a>
        </div>

        {/* Micro-Interaction Scroll Indicator */}
        <div className="flex flex-col items-center gap-2 text-xs text-slate-500 animate-bounce">
          <span className="tracking-widest uppercase text-[11px] font-medium text-slate-400">
            向下滑动页面 · 感受自下而上的真实升力与失重飘絮
          </span>
          <ArrowDown className="w-4 h-4 text-sky-400/80" />
        </div>
      </div>
    </section>
  );
};
