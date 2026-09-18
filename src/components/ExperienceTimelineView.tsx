import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ALL_EXPERIENCE_PROJECTS, type ExperienceProject, type ProjectMetric } from '../data/experienceProjects';

export const ExperienceTimelineView: React.FC = () => {
  const { lang, t } = useLanguage();
  const isZh = lang === 'zh';

  const [activeIdx, setActiveIdx] = useState(0);
  const [modalIdx, setModalIdx] = useState<number | null>(null);
  const [mobileTab, setMobileTab] = useState<'timeline' | 'dashboard'>('timeline');

  const activeData: ExperienceProject = ALL_EXPERIENCE_PROJECTS[activeIdx] || ALL_EXPERIENCE_PROJECTS[0];
  const modalData: ExperienceProject | null = modalIdx !== null ? ALL_EXPERIENCE_PROJECTS[modalIdx] : null;

  // ESC 键退出专题页
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalIdx(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openModal = (idx: number) => {
    setModalIdx(idx);
  };

  const closeModal = () => {
    setModalIdx(null);
  };

  const navigateModal = (delta: number) => {
    if (modalIdx === null) return;
    const len = ALL_EXPERIENCE_PROJECTS.length;
    let next = (modalIdx + delta) % len;
    if (next < 0) next += len;
    setModalIdx(next);
  };

  const getMetricVal = (m: ProjectMetric) => {
    if (typeof m.val === 'object') {
      return m.val[lang] || m.val.zh;
    }
    return m.val;
  };

  return (
    <div className="w-full flex flex-col justify-between select-none">
      
      {/* 1. 紧凑精炼标题栏：高度自适应，杜绝与顶部常驻导航及 Dock 归位大标题冲突 */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 text-slate-900">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-cyan-600 flex-shrink-0" />
          <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-950 truncate">
            {t.cards.experience.title}
          </h3>
          <span className="hidden sm:inline-flex text-[10px] font-mono text-cyan-700 bg-cyan-50 border border-cyan-200/80 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
            {isZh ? '10年+ 架构演进 · 6大工程战役' : '10+ YRS · 6 MILESTONES'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 text-right">
          <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
            {isZh ? '高级全栈架构师' : 'FULL-STACK ARCHITECT'}
          </span>
          <span className="text-[10px] font-mono font-bold text-cyan-800 bg-slate-100 px-2 py-0.5 rounded">
            {activeIdx + 1} / {ALL_EXPERIENCE_PROJECTS.length}
          </span>
        </div>
      </div>

      {/* 移动端视图切换 Tabs (< md 可见，提升小屏兼容性) */}
      <div className="flex md:hidden items-center justify-center p-0.5 bg-slate-100 rounded-xl mb-2.5 border border-slate-200/80 text-xs font-mono font-bold">
        <button
          onClick={() => setMobileTab('timeline')}
          className={`flex-1 py-1 rounded-lg transition-all text-center ${mobileTab === 'timeline' ? 'bg-white text-cyan-800 shadow-xs' : 'text-slate-500'}`}
        >
          {isZh ? '1. 时间线历程' : '1. Timeline'}
        </button>
        <button
          onClick={() => setMobileTab('dashboard')}
          className={`flex-1 py-1 rounded-lg transition-all text-center ${mobileTab === 'dashboard' ? 'bg-white text-cyan-800 shadow-xs' : 'text-slate-500'}`}
        >
          {isZh ? '2. 架构看板' : '2. Dashboard'}
        </button>
      </div>

      {/* 2. 双栏主体区：严格约束纵向高度在 310px-330px，保障笔记本屏幕绝对不超高 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-stretch h-[310px] sm:h-[330px]">
        
        {/* 左侧：全量时间线滑轨 (节点顶部时间标方案，时间外置，圆点对齐) */}
        <div className={`${mobileTab === 'timeline' ? 'flex' : 'hidden'} md:flex md:col-span-5 flex-col justify-between h-full min-w-0`}>
          
          {/* 列表顶部状态 */}
          <div className="flex items-center justify-between pb-1.5 mb-1.5 text-[10px] font-mono border-b border-slate-100 text-slate-400">
            <span className="font-bold text-slate-700">
              {isZh ? '历程索引 (时间外置)' : 'TIMELINE TRACK'}
            </span>
            <span>↕ {isZh ? '滚轮滑动 6 阶段' : 'Scroll 6 stages'}</span>
          </div>

          {/* 可纵向平滑滚动的列表区 (标记 data-timeline-scroll，滚轮保护) */}
          <div 
            data-timeline-scroll="true"
            className="flex-1 overflow-y-auto pr-1.5 space-y-2 custom-scroll"
          >
            {ALL_EXPERIENCE_PROJECTS.map((exp, idx) => {
              const isActive = activeIdx === idx;
              const isLast = idx === ALL_EXPERIENCE_PROJECTS.length - 1;

              return (
                <div
                  key={exp.id}
                  onClick={() => {
                    setActiveIdx(idx);
                    if (window.innerWidth < 768) {
                      setMobileTab('dashboard');
                    }
                  }}
                  className="group cursor-pointer"
                >
                  {/* 节点顶部时间标行 (外置时间，清爽无闪烁) */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-4 flex items-center justify-center flex-shrink-0">
                      {isActive ? (
                        <div className="w-3 h-3 rounded-full bg-cyan-600 ring-3 ring-cyan-100 flex items-center justify-center shadow-xs">
                          <span className="w-1 h-1 rounded-full bg-white"></span>
                        </div>
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors"></div>
                      )}
                    </div>

                    <span className={`text-[11px] font-mono font-extrabold ${isActive ? 'text-cyan-800' : 'text-slate-600'}`}>
                      {exp.period[lang]}
                    </span>

                    <span className={`text-[9px] font-mono ${exp.isCurrent ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-slate-500 bg-slate-100'} px-1 py-0.2 rounded ml-auto flex-shrink-0`}>
                      {exp.timelineBadge[lang]}
                    </span>
                  </div>

                  {/* 下挂卡片行：垂直导轨线 + 紧凑内容卡片 */}
                  <div className="flex items-stretch gap-1.5 pl-1.5">
                    <div className={`w-[2px] ${isLast ? 'bg-transparent' : isActive ? 'bg-cyan-300' : 'bg-slate-200'} mr-2.5 transition-colors flex-shrink-0`}></div>

                    <div className={`flex-1 min-w-0 p-2 rounded-xl border transition-all duration-150 ${isActive ? 'bg-cyan-50/80 border-cyan-400 shadow-xs' : 'bg-white/90 border-slate-200/70 hover:bg-slate-50 hover:border-slate-300'}`}>
                      <h4 className={`text-[11px] font-bold leading-tight truncate ${isActive ? 'text-slate-950 font-black' : 'text-slate-800 group-hover:text-slate-950'}`}>
                        {exp.projectTitle[lang]}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">
                        {exp.company[lang]} · {exp.role[lang]}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右侧：动态高光联动看板 (占 7 列，高信息密度与自适应约束) */}
        <div className={`${mobileTab === 'dashboard' ? 'flex' : 'hidden'} md:flex md:col-span-7 p-3 sm:p-4 rounded-2xl bg-slate-50/95 border border-slate-200/90 flex-col justify-between shadow-xs relative overflow-hidden h-full min-w-0`}>
          <div>
            {/* 顶部横幅：领域标签与地点 */}
            <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-200/70 text-[10px] font-mono">
              <span className="text-cyan-800 font-bold bg-cyan-100/70 px-2 py-0.5 rounded border border-cyan-200/80 truncate">
                {activeData.domainTag[lang]}
              </span>
              <span className="text-slate-400 flex-shrink-0 text-[10px]">{activeData.location[lang]}</span>
            </div>

            {/* 公司全称与项目标题 (支持单行截断，防止英文换行挤占纵向空间) */}
            <div className="mb-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="truncate max-w-[200px]">{activeData.company[lang]}</span>
                <span className="font-extrabold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200/70 flex-shrink-0">
                  {activeData.period[lang]}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-950 leading-snug mt-0.5 truncate">
                {activeData.projectTitle[lang]}
              </h3>
            </div>

            {/* 战役口号标语 (紧凑排版) */}
            <div className="p-2 rounded-lg bg-cyan-50/70 border border-cyan-200/70 text-cyan-950 text-[11px] leading-tight mb-2">
              <span className="font-bold font-mono text-[9px] block text-cyan-700 mb-0.5">
                {isZh ? '【核心工程战役】' : '【KEY MISSION】'}
              </span>
              <p className="line-clamp-2">{activeData.slogan[lang]}</p>
            </div>

            {/* 4 个核心量化指标卡片 (双语规范数字与简要描述) */}
            <div className="grid grid-cols-2 gap-1.5 mb-1.5">
              {activeData.metrics.map((m, mIdx) => (
                <div key={mIdx} className="p-1.5 sm:p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                  <div className="text-sm sm:text-base font-black font-mono text-cyan-700 leading-tight">
                    {getMetricVal(m)}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-800 uppercase truncate">
                    {m.lbl[lang]}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate hidden sm:block">
                    {m.desc[lang]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧底部操作栏：技术栈微芯片 + 专题页入口 */}
          <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1 items-center overflow-hidden max-h-[22px] min-w-0">
              {activeData.techStack.slice(0, 4).map((tech, tIdx) => (
                <span key={tIdx} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-semibold truncate">
                  {tech}
                </span>
              ))}
              {activeData.techStack.length > 4 && (
                <span className="text-[9px] font-mono text-slate-400 flex-shrink-0">
                  +{activeData.techStack.length - 4}
                </span>
              )}
            </div>

            <button
              onClick={() => openModal(activeIdx)}
              className="py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] sm:text-[11px] font-mono font-bold flex items-center gap-1 transition-all shadow cursor-pointer active:scale-95 flex-shrink-0"
            >
              <span>{isZh ? '查看专题' : 'DOSSIER'}</span>
              <span className="font-bold">↗</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. 底部状态提示条：单行紧凑呈现 */}
      <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
          <span className="truncate">
            {isZh ? '提示：在左侧时间线可滚轮滑动查阅全部 6 阶段，点击即时联动' : 'Tip: Scroll left timeline to browse stages; click to inspect details'}
          </span>
        </div>
        <div className="text-slate-400 hidden sm:block flex-shrink-0 ml-2">
          {isZh ? '时间轴外置 · 架构专题' : 'Clean Axis · Dossier'}
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 4. 沉浸式工程专题页 (Case Study Dossier - 完美覆盖在卡片内部) */}
      {/* ======================================================================= */}
      {modalData && (
        <div 
          className="absolute inset-0 z-30 bg-white/98 backdrop-blur-2xl p-4 sm:p-6 flex flex-col translate-y-0 opacity-100 pointer-events-auto transition-all duration-300 overflow-hidden"
        >
          {/* 专题页顶栏 */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <button
              onClick={closeModal}
              className="group px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <svg className="w-3 h-3 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{isZh ? '← 返回工程历程' : '← BACK'}</span>
            </button>

            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              <span className="font-bold">DOSSIER // STAGE {modalData.code}</span>
              <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
                <button
                  onClick={() => navigateModal(-1)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer text-[10px]"
                >
                  PREV
                </button>
                <button
                  onClick={() => navigateModal(1)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer text-[10px]"
                >
                  NEXT
                </button>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              title="关闭 (ESC)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 专题页滚动内容体 (标记 data-modal-scroll，受滚轮保护) */}
          <div 
            data-modal-scroll="true"
            className="flex-1 overflow-y-auto py-4 space-y-4 pr-1.5 custom-scroll"
          >
            {/* 头部大标题 */}
            <div className="pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-700 font-bold mb-1">
                <span>{modalData.domainTag[lang]}</span>
                <span>•</span>
                <span>{modalData.period[lang]}</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-950 mb-1">
                {modalData.projectTitle[lang]}
              </h1>
              <p className="text-[11px] font-mono text-slate-500 mb-2">
                {modalData.fullName[lang]} | {modalData.role[lang]} | {modalData.location[lang]}
              </p>
              <div className="p-2.5 rounded-xl bg-cyan-50/80 border border-cyan-200/80 text-cyan-900 text-xs font-medium leading-relaxed">
                <span className="font-bold font-mono text-[10px] uppercase block text-cyan-700 mb-0.5">
                  {isZh ? '【核心战役使命】' : '【KEY MISSION】'}
                </span>
                {modalData.slogan[lang]}
              </div>
            </div>

            {/* 4 大核心量化成果卡片 */}
            <div>
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                {isZh ? '核心量化战绩看板 / KEY METRICS' : 'KEY METRICS & IMPACT'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {modalData.metrics.map((m, mIdx) => (
                  <div key={mIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xl font-black font-mono text-cyan-700 mb-0.5">{getMetricVal(m)}</div>
                    <div className="text-[10px] font-mono font-bold text-slate-800 uppercase truncate">{m.lbl[lang]}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5 line-clamp-2">{m.desc[lang]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 深度技术攻坚章节拆解 */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                {isZh ? '深度架构拆解 / ARCHITECTURAL DEEP-DIVES' : 'ARCHITECTURAL DEEP-DIVES'}
              </h3>
              {modalData.deepChapters.map((ch, chIdx) => (
                <div key={chIdx} className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                    {ch.title[lang]}
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed pl-3 border-l border-slate-200">
                    {ch.desc[lang]}
                  </p>
                </div>
              ))}
            </div>

            {/* 技术栈芯片 */}
            <div>
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {isZh ? '核心技术栈沉淀 / TECH STACK' : 'TECH STACK MASTERY'}
              </h3>
              <div className="flex flex-wrap gap-1">
                {modalData.techStack.map((tItem, tIdx) => (
                  <span key={tIdx} className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-900 text-white">
                    {tItem}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

