import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface NextPageGateProps {
  visible: boolean;
  progress: number; // 0.0 ~ 1.0
}

export const NextPageGate: React.FC<NextPageGateProps> = ({
  visible,
  progress,
}) => {
  const { t } = useLanguage();

  return (
    <div
      className={`fixed bottom-6 sm:bottom-8 right-[170px] sm:right-[210px] md:right-[230px] z-30 transition-all duration-300 pointer-events-none select-none ${
        visible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}
    >
      {/* 白色微胶囊设计：无缝融入背景，精致极简，完全不可点击 */}
      <div className="flex items-center gap-2.5 sm:gap-3 bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full">
        {/* NEXT PAGE 浅灰底质感小标题 */}
        <span className="font-mono font-bold text-slate-700 text-[10px] sm:text-[11px] tracking-[0.16em] uppercase whitespace-nowrap">
          {t.gate.nextPage}
        </span>

        {/* 蓄力进度条轨道 */}
        <div className="w-16 sm:w-24 h-[3px] sm:h-[3.5px] bg-slate-200/90 rounded-full overflow-hidden relative">
          <div
            className="w-full h-full bg-[#a3e635] rounded-full will-change-transform shadow-[0_0_8px_rgba(163,230,53,0.7)]"
            style={{
              transform: `scaleX(${progress})`,
              transformOrigin: 'left center',
            }}
          />
        </div>

        {/* 右指向极简箭头 */}
        <div className="flex items-center justify-center text-slate-600">
          <svg
            className="w-3 h-3 sm:w-3.5 sm:h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </div>
    </div>
  );
};
