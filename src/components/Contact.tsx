import React, { useState } from 'react';
import { Mail, Send, Check, Wind } from 'lucide-react';
import { GithubIcon, TwitterIcon } from './Icons';

export const Contact: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const email = 'alex.dev@example.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleBurstWind = () => {
    window.dispatchEvent(new CustomEvent('trigger-dandelion-breeze', { detail: { power: 1.8 } }));
  };

  return (
    <footer id="contact" className="relative pt-20 pb-16 px-4 max-w-6xl mx-auto z-20">
      {/* Contact Glass Panel */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 relative overflow-hidden text-center mb-16">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[250px] bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-amber-500/10 blur-[90px] pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-medium text-sky-400 mb-4">
            <Mail className="w-3.5 h-3.5" />
            <span>保持联络</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            期待与您探讨新的想法与合作
          </h2>

          <p className="text-sm sm:text-base text-slate-400 mb-8 leading-relaxed">
            无论是一个富有挑战性的全栈架构工程、高保真交互产品孵化，还是仅仅想聊聊技术与设计，欢迎随时来信。
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {/* Copy Email Button */}
            <button
              onClick={handleCopyEmail}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-950 font-semibold text-xs sm:text-sm hover:bg-slate-100 active:scale-95 transition-all shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>邮箱已复制到剪贴板！</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 text-slate-800" />
                  <span>{email} (点击复制)</span>
                </>
              )}
            </button>

            {/* Dandelion Burst Button */}
            <button
              onClick={handleBurstWind}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 border border-sky-500/30 hover:border-sky-500/50 font-medium text-xs sm:text-sm active:scale-95 transition-all group"
            >
              <Wind className="w-4 h-4 text-sky-400 group-hover:rotate-90 transition-transform duration-500" />
              <span>吹起满天蒲公英 💨</span>
            </button>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-90"
              title="GitHub"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-90"
              title="Twitter / X"
            >
              <TwitterIcon className="w-4 h-4" />
            </a>
            <a
              href={`mailto:${email}`}
              className="w-10 h-10 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-90"
              title="直接写信"
            >
              <Send className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 border-t border-white/5 pt-8 px-2">
        <div className="flex items-center gap-2">
          <span>© {new Date().getFullYear()} Alex. 保留所有权利。</span>
          <span>•</span>
          <span className="text-slate-400">基于物理空气动力学驱动</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span>React 19</span>
          <span>•</span>
          <span>TypeScript</span>
          <span>•</span>
          <span>Canvas 2D Physics</span>
          <span>•</span>
          <span>Tailwind CSS</span>
        </div>
      </div>
    </footer>
  );
};
