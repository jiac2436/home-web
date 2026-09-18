import React from 'react';
import { Sparkles, Cpu, Feather, Zap, Compass, CheckCircle2 } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <section id="about" className="relative py-24 px-4 max-w-6xl mx-auto z-20">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-sky-400 mb-3">
          <Compass className="w-3.5 h-3.5" />
          <span>关于理念</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
          数字世界中的结构美感与生命力
        </h2>
        <p className="max-w-xl text-slate-400 text-sm sm:text-base leading-relaxed">
          将严谨的全栈系统工程与现代前沿交互美学融为一体，每一次滚动与悬浮，皆是直觉与物理法则的共鸣。
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Main Bio Card (spans 2 columns on md) */}
        <div className="md:col-span-2 glass-panel rounded-3xl p-7 sm:p-9 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/15 transition-all duration-500" />
          
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400/20 to-indigo-500/20 border border-white/10 flex items-center justify-center">
                <Feather className="w-6 h-6 text-sky-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">工程匠心与自然物理</h3>
                <p className="text-xs text-slate-400">Craftsmanship & Physics-First Design</p>
              </div>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
              我坚信优秀的界面不仅是信息的陈列，更是具有触觉记忆的虚拟空间。
              在此次网站中，底部的蒲公英粒子并非简单的预制动画，而是通过流体力学阻力方程、重力加速度与滚动气流抬升实时计算而成。
              当您向下滑动页面时，空气的相对阻滞力自然托起种子，呈现真实世界中蒲公英独有的轻盈失重感。
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 text-left">
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">60 FPS</div>
              <div className="text-xs text-slate-400 mt-0.5">满帧实时粒子物理</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-sky-400 tracking-tight">0 冗余</div>
              <div className="text-xs text-slate-400 mt-0.5">轻量原生 Canvas 渲染</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-2xl font-bold text-amber-300 tracking-tight">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">自适应屏幕与手势</div>
            </div>
          </div>
        </div>

        {/* Card 2: Principles Card */}
        <div className="glass-panel rounded-3xl p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -left-16 -bottom-16 w-52 h-52 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/15 transition-all duration-500" />

          <div>
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-6">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">现代审美三大支柱</h3>
            <p className="text-xs text-slate-400 mb-6">Modern Aesthetic Foundations</p>

            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span><strong>Glassmorphism 2.0</strong>：细致微透与 1px 晶体棱边高光。</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span><strong>流体失重动效</strong>：基于动量与空气阻力的物理衰减。</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span><strong>克制的深色调</strong>：沉浸式 Slate-950 星夜空间层次。</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>遵循人机工程学</span>
            <span className="text-emerald-400 font-mono">Clean & Precise</span>
          </div>
        </div>

        {/* Card 3: Full Stack Capability */}
        <div className="glass-panel rounded-3xl p-7 sm:p-8 relative overflow-hidden group">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-5">
            <Cpu className="w-5 h-5 text-sky-400" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">全栈工程体系</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
            从底层分布式数据流、高并发 API 架构，到现代前端复杂交互与 WebGL/Canvas 图形渲染，拥有完整的工程闭环能力。
          </p>
          <div className="flex flex-wrap gap-1.5">
            {['TypeScript', 'React 19', 'Next.js', 'Node.js', 'PostgreSQL', 'Go', 'Tailwind'].map((tech) => (
              <span key={tech} className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-slate-300">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Card 4: Interactive Philosophy */}
        <div className="md:col-span-2 glass-panel rounded-3xl p-7 sm:p-8 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 group">
          <div className="text-left">
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>交互灵感源泉</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
              为什么是蒲公英？
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
              蒲公英种子是自然界中最优雅的天然降落伞。它的高阻力冠毛与低重心不仅抵御了狂暴下坠，更让每一次微风都成为远航的起点。正如我们做产品的愿景：以极简之形，承载轻盈而深远的价值。
            </p>
          </div>

          <div className="shrink-0 flex items-center justify-center w-28 h-28 rounded-2xl bg-white/[0.03] border border-white/10 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 to-amber-300/10 rounded-2xl animate-pulse-slow"></div>
            <span className="text-4xl select-none">🌱</span>
          </div>
        </div>
      </div>
    </section>
  );
};
