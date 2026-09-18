import React, { useState, useEffect } from 'react';
import { LusionAnimatedTitle } from './LusionAnimatedTitle';
import { useLanguage } from '../context/LanguageContext';

export const LusionHero: React.FC = () => {
  const { lang, toggleLang, t } = useLanguage();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLetsTalk = () => {
    navigator.clipboard.writeText('jichi0711@163.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleReplayMascot = () => {
    window.dispatchEvent(new CustomEvent('replay-mascot-jump'));
  };

  const handleScrollToProjects = () => {
    const el = document.getElementById('story-runway');
    if (el) {
      const rect = el.getBoundingClientRect();
      const targetY = window.scrollY + rect.top + 50;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* 1. 顶部固定导航栏 (Fixed Top Navigation Bar) */}
      <header className="fixed top-0 left-0 right-0 z-30 w-full px-6 sm:px-12 pt-6 sm:pt-10 flex items-center justify-between pointer-events-none select-none">
        
        {/* 左侧大字品牌 Logo (随着首页下滑逐渐消失，与中间按钮效果一致) */}
        <div
          onClick={handleScrollToTop}
          className={`pointer-events-auto flex items-center gap-3 cursor-pointer group transition-all duration-300 ${
            hasScrolled ? 'opacity-0 pointer-events-none -translate-y-2' : 'opacity-100'
          }`}
          title={t.nav.backToTop}
        >
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 font-sans uppercase group-hover:text-cyan-600 transition-colors">
            CHEN
          </span>
          <span className="hidden sm:inline text-xs font-semibold tracking-widest text-slate-400 pl-2 border-l border-slate-300">
            {t.nav.brandSub}
          </span>
        </div>

        {/* 中间悬浮白胶囊按钮 (仅在顶部呈现，滚入项目跑道后优雅隐退让位给模块指示器) */}
        <div className="pointer-events-auto hidden md:block">
          <button
            onClick={handleScrollToProjects}
            className={`group px-6 py-2.5 rounded-full bg-white text-slate-900 text-xs font-bold tracking-wider uppercase shadow-[0_4px_25px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center gap-2.5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
              hasScrolled ? 'opacity-0 pointer-events-none -translate-y-2' : 'opacity-100'
            }`}
            title={t.nav.seeProjectsTitle}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 group-hover:scale-125 transition-transform" />
            <span>{t.nav.seeProjects}</span>
          </button>
        </div>

        {/* 右侧胶囊群 (Action Buttons) */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-2.5">
          {/* 国际化中英文切换高定微胶囊 */}
          <button
            onClick={toggleLang}
            className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white/95 hover:bg-white text-slate-800 text-xs font-bold font-mono tracking-wider shadow-[0_2px_12px_rgba(0,0,0,0.05)] border border-slate-200/90 flex items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            title={lang === 'zh' ? '切换为英文 (Switch to English)' : 'Switch to Chinese (切换为中文)'}
          >
            <span className={`transition-colors ${lang === 'zh' ? 'text-cyan-600 font-extrabold' : 'text-slate-400'}`}>中</span>
            <span className="text-slate-300 text-[10px]">/</span>
            <span className={`transition-colors ${lang === 'en' ? 'text-cyan-600 font-extrabold' : 'text-slate-400'}`}>EN</span>
          </button>

          {/* 微型触控按钮 (点击触发角色跳跃与文字重新动画入场) */}
          <button
            onClick={handleReplayMascot}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm transition-all shadow-sm active:scale-90"
            title={t.nav.replayTitle}
          >
            <span className="block w-2.5 h-[2px] bg-slate-700" />
          </button>

          {/* 暗色高对比胶囊：LET'S TALK */}
          <button
            onClick={handleLetsTalk}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#1e232a] hover:bg-slate-800 text-white text-xs font-bold tracking-wider uppercase shadow-md flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95"
            title={t.nav.copyTitle}
          >
            <span>{copiedEmail ? t.nav.copied : t.nav.letsTalk}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </button>

          {/* 浅灰微胶囊：MENU */}
          <div
            onClick={handleScrollToProjects}
            className="pointer-events-auto cursor-pointer px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-900 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span>{t.nav.menu}</span>
            <span className="text-slate-900 font-extrabold tracking-tighter text-sm">••</span>
          </div>
        </div>
      </header>

      {/* 2. Hero 主屏区域 (100vh 满屏，内容对齐左下角) */}
      <section className="relative z-10 w-full min-h-screen flex flex-col justify-end px-6 sm:px-12 pb-14 sm:pb-20 max-w-6xl pointer-events-none select-none">
        
        {/* 巨幅动态文字区 (复刻 Lusion.co 专属 cubic-bezier 阶梯破土动效) */}
        <div className="pointer-events-auto">
          <LusionAnimatedTitle
            key={lang}
            lines={t.hero.titleLines}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-[6.6rem] font-bold text-slate-950 tracking-[-0.04em] leading-[0.93]"
          />

          {/* 晨的个人简历说明与专业定位条 */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-medium text-slate-500 animate-[fadeIn_0.9s_ease-out_0.5s_both]">
            {t.hero.positioning.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-300">•</span>}
                <span className={idx === 0 ? 'text-slate-950 font-semibold' : ''}>{item}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 底部向下滑动绘制流体线条引导指示器 */}
        <div
          onClick={handleScrollToProjects}
          className={`pointer-events-auto cursor-pointer absolute bottom-6 right-8 sm:right-24 md:right-32 flex items-center gap-3 text-xs font-mono tracking-widest text-slate-400 hover:text-slate-900 transition-all duration-500 ${
            hasScrolled ? 'opacity-0 translate-y-3 pointer-events-none' : 'opacity-100 animate-pulse'
          }`}
        >
          <span className="hidden sm:inline uppercase">{t.hero.scrollHint}</span>
          <span className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 bg-white/60 backdrop-blur-sm shadow-sm">
            ↓
          </span>
        </div>
      </section>
    </>
  );
};
