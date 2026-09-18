import React, { useState } from 'react';
import { ArrowUpRight, Mail, Sparkles } from 'lucide-react';
import { GithubIcon } from './Icons';

export const CleanHome: React.FC = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('jichi0711@163.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="relative z-10 w-full h-full min-h-screen flex flex-col items-center justify-center px-6 pointer-events-none select-none">
      <div className="max-w-2xl w-full mx-auto text-center flex flex-col items-center pointer-events-auto">
        
        {/* 顶部微徽章 (Status Badge) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-8 transition-all hover:border-slate-300 hover:shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-slate-600 tracking-wide">
            全栈工程师 · 创意交互探索者
          </span>
        </div>

        {/* 核心名字大标题 (Main Title) */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight text-slate-900 mb-6 flex items-baseline justify-center gap-3">
          <span className="font-serif sm:font-sans font-bold">晨</span>
          <span className="text-2xl sm:text-3xl font-light text-slate-400 tracking-normal font-sans">
            / Chen
          </span>
        </h1>

        {/* 个人简历小说明文字 (Biography & Statement) */}
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal mb-8 text-balance">
          专注于构建高性能全栈架构、物理流体交互系统与现代数字化体验。
          <br className="hidden sm:inline" />
          追求工程克制、代码洁癖与直觉美学的平衡。
        </p>

        {/* 核心技术与专长小标签 (Specialty Tags) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 text-xs font-medium text-slate-500">
          <span className="px-3 py-1 rounded-lg bg-slate-100/90 border border-slate-200/70 text-slate-700">
            全栈工程架构
          </span>
          <span className="px-3 py-1 rounded-lg bg-slate-100/90 border border-slate-200/70 text-slate-700">
            创意代码与图形学
          </span>
          <span className="px-3 py-1 rounded-lg bg-slate-100/90 border border-slate-200/70 text-slate-700">
            物理流体模拟
          </span>
          <span className="px-3 py-1 rounded-lg bg-slate-100/90 border border-slate-200/70 text-slate-700">
            极致性能调优
          </span>
        </div>

        {/* 极简动作按钮与联系微链接 (Action Links) */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* 简历主按钮 */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('replay-mascot-jump'));
            }}
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            title="点击与男孩互动并重播起跳"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 transition-transform group-hover:rotate-12" />
            <span>个人经历概览</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

          {/* GitHub 链接 */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/90 hover:border-slate-300 text-xs font-medium transition-all shadow-sm active:scale-95"
          >
            <GithubIcon className="w-3.5 h-3.5 text-slate-600" />
            <span>GitHub</span>
          </a>

          {/* 邮箱联系 */}
          <button
            onClick={handleCopyEmail}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/90 hover:border-slate-300 text-xs font-medium transition-all shadow-sm active:scale-95"
            title="点击复制联系邮箱"
          >
            <Mail className="w-3.5 h-3.5 text-slate-600" />
            <span>{copiedEmail ? '已复制邮箱!' : '联系我'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
