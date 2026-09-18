import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import type { CSPaperModule } from '../data/csPapers';
import { useLanguage } from '../context/LanguageContext';
import { useResume } from '../context/ResumeContext';
import { Timeline3DExperience } from './Timeline3DExperience';

export type TypewriterStatus = 'idle' | 'typing' | 'done';

interface HarvestModuleViewProps {
  module: CSPaperModule;
  subProgress: number; // 0.0 ~ 1.0
  isActive: boolean;
  typewriterStatus?: TypewriterStatus;
  onTypewriterDone?: () => void;
  onTimelineWarpComplete?: () => void;
  onTimelineRollback?: () => void;
  onPaperDisappear?: () => void;
  onPaperVisible?: () => void;
}

export const HarvestModuleView: React.FC<HarvestModuleViewProps> = ({
  module,
  subProgress,
  isActive,
  typewriterStatus = 'idle',
  onTypewriterDone,
  onTimelineWarpComplete,
  onTimelineRollback,
  onPaperDisappear,
  onPaperVisible,
}) => {
  const { lang, t } = useLanguage();
  const { currentCards } = useResume();
  const activeData = module[lang] || module.en;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const targetSlotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const benchmarkSlotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const baseOffsetsRef = useRef<{ dx: number; dy: number }[]>([]);
  const paperCardRef = useRef<HTMLDivElement | null>(null);

  const onPaperDisappearRef = useRef(onPaperDisappear);
  useEffect(() => {
    onPaperDisappearRef.current = onPaperDisappear;
  }, [onPaperDisappear]);

  const onPaperVisibleRef = useRef(onPaperVisible);
  useEffect(() => {
    onPaperVisibleRef.current = onPaperVisible;
  }, [onPaperVisible]);

  // 原生 IntersectionObserver 工业级精准监听：监听文章框卡片自身是否在屏幕视口中
  useEffect(() => {
    const cardEl = paperCardRef.current;
    if (!cardEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            console.log(
              `%c[文章框视口监听] 模块: ${module.id} | 🔴 完全离开屏幕视口消失 | 时间戳: ${Date.now()}`,
              'color: #ef4444; font-weight: bold; background: #fef2f2; padding: 2px 6px; border-radius: 4px;'
            );
            onPaperDisappearRef.current?.();
          } else {
            console.log(
              `%c[文章框视口监听] 模块: ${module.id} | 🟢 进入屏幕视口可见 | 时间戳: ${Date.now()}`,
              'color: #10b981; font-weight: bold; background: #ecfdf5; padding: 2px 6px; border-radius: 4px;'
            );
            onPaperVisibleRef.current?.();
          }
        });
      },
      {
        threshold: 0, // 只要有 1px 接触即为可见，0px 离开即为完全消失，无经验误差！
      }
    );

    observer.observe(cardEl);

    return () => {
      observer.disconnect();
    };
  }, [module.id]);

  // 1. 打字机效果：彻底受控于父组件下发的 typewriterStatus ('idle' | 'typing' | 'done')
  const isTypewriterDone = typewriterStatus === 'done';
  const isTyping = typewriterStatus === 'typing';

  const [autoTypedChars, setAutoTypedChars] = useState(0);
  const hasSlidForwardRef = useRef(false);

  const onTypewriterDoneRef = useRef(onTypewriterDone);
  useEffect(() => {
    onTypewriterDoneRef.current = onTypewriterDone;
  }, [onTypewriterDone]);

  // 语言切换时重置基准坐标缓存
  useEffect(() => {
    baseOffsetsRef.current = [];
    setOffsets([]);
  }, [lang]);

  // 记录用户是否推进过动效进度
  useEffect(() => {
    if (subProgress > 0.05) {
      hasSlidForwardRef.current = true;
    }
  }, [subProgress]);

  // 打字机核心驱动：由父组件下发 typewriterStatus === 'typing' 触发，严格在 1.0 秒匀速敲完
  useEffect(() => {
    if (typewriterStatus === 'idle') {
      setAutoTypedChars(0);
      return;
    }

    if (typewriterStatus === 'done') {
      setAutoTypedChars(activeData.text.length);
      return;
    }

    // typewriterStatus === 'typing'：启动严格固定 1.0 秒打字机
    const totalChars = activeData.text.length;
    const DURATION = 1000; // 严格固定 1 秒完成
    let animId: number | null = null;
    const startTime = performance.now();

    console.log(`%c[动画播放 - 打字机启动 (1.0秒)] 模块: ${activeData.targetWord} | 时间戳: ${Date.now()}`, 'color: #06b6d4; font-weight: bold;');

    const step = (now: number) => {
      const elapsed = now - startTime;
      const p = Math.min(1, elapsed / DURATION);
      const nextChars = Math.min(totalChars, Math.floor(p * totalChars));
      setAutoTypedChars(nextChars);

      if (p < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setAutoTypedChars(totalChars);
        console.log(`%c[动画播放 - 打字机完成] 模块: ${activeData.targetWord} | 时间戳: ${Date.now()}`, 'color: #06b6d4; font-weight: bold;');
        onTypewriterDoneRef.current?.();
      }
    };

    animId = requestAnimationFrame(step);

    return () => {
      if (animId !== null) {
        cancelAnimationFrame(animId);
      }
    };
  }, [typewriterStatus, activeData.text.length, activeData.targetWord]);

  // 记录该模块是否曾完成打字：'done' 时锁定全文展示，
  // 'typing' 或 'idle'（文章框消失后被重置）时解锁，让打字机从头再来。
  const [hasCompletedTypingOnce, setHasCompletedTypingOnce] = useState(false);

  useEffect(() => {
    if (typewriterStatus === 'done') {
      setHasCompletedTypingOnce(true);
    } else {
      // 'typing' 和 'idle' 都重置：确保文章框消失后重新进入时内容是空的
      setHasCompletedTypingOnce(false);
    }
  }, [typewriterStatus]);

  useEffect(() => {
    setHasCompletedTypingOnce(false);
  }, [lang]);

  // 严格依据打字机受控状态展示字符：
  // 1. typing 状态：随 1.0 秒时间敲出；
  // 2. done 状态：100% 全文完整展示；
  // 3. idle 状态：若曾打完全文，保持全文展示（随文章框自然滑出或淡出）；若为初次未打字，则显示纯框。
  const visibleCharsCount = isTypewriterDone || (typewriterStatus === 'idle' && hasCompletedTypingOnce)
    ? activeData.text.length
    : typewriterStatus === 'idle'
    ? 0
    : autoTypedChars;

  // 记录每个待提取字母飞向目标单词槽位的位移向量 (dx, dy)
  const [offsets, setOffsets] = useState<{ dx: number; dy: number }[]>([]);
  const dockProgressRef = useRef(0);

  // 核心几何测算：获取源字母与永驻正中央的基准大单词槽位之间的绝对位移向量
  // 【核心修复 3】：使用绝对不随动画移动的 benchmarkSlotRefs，彻底杜绝 dockProgress 移动到左上角时测量受污染！
  const updateOffsets = useCallback(() => {
    if (dockProgressRef.current > 0.005) return;

    const numLetters = activeData.targetWord.length;
    let allValid = true;

    const newOffsets = activeData.charIndices.map((_, i) => {
      const srcEl = charRefs.current[i];
      const targetEl = benchmarkSlotRefs.current[i] || targetSlotRefs.current[i];

      if (srcEl && targetEl) {
        const sRect = srcEl.getBoundingClientRect();
        const tRect = targetEl.getBoundingClientRect();
        if (sRect.width > 0 && tRect.width > 0) {
          return {
            dx: (tRect.left + tRect.width / 2) - (sRect.left + sRect.width / 2),
            dy: (tRect.top + tRect.height / 2) - (sRect.top + sRect.height / 2),
          };
        }
      }

      allValid = false;
      if (baseOffsetsRef.current[i] && (baseOffsetsRef.current[i].dx !== 0 || baseOffsetsRef.current[i].dy !== 0)) {
        return baseOffsetsRef.current[i];
      }

      // 几何兜底
      return {
        dx: (i - numLetters / 2) * 90,
        dy: -210,
      };
    });

    // 只有当所有待提取字母都已在 DOM 中真实排版就绪时，才锁定黄金基准坐标！
    if (allValid) {
      baseOffsetsRef.current = newOffsets;
      setOffsets(newOffsets);
    }
  }, [activeData]);

  useEffect(() => {
    updateOffsets();
    window.addEventListener('resize', updateOffsets);
    const t = setTimeout(updateOffsets, 80);
    return () => {
      window.removeEventListener('resize', updateOffsets);
      clearTimeout(t);
    };
  }, [updateOffsets]);

  useEffect(() => {
    if (isActive) {
      updateOffsets();
    }
  }, [isActive, updateOffsets]);

  // 打字机完成后，所有文本字符均已完全进入 DOM 并就绪，精确重新测量几何位移
  useEffect(() => {
    if (isTypewriterDone) {
      const t = setTimeout(updateOffsets, 40);
      return () => clearTimeout(t);
    }
  }, [isTypewriterDone, updateOffsets]);

  const getOffset = (order: number) => {
    if (baseOffsetsRef.current[order] && (baseOffsetsRef.current[order].dx !== 0 || baseOffsetsRef.current[order].dy !== 0)) {
      return baseOffsetsRef.current[order];
    }
    if (offsets[order] && (offsets[order].dx !== 0 || offsets[order].dy !== 0)) {
      return offsets[order];
    }
    const srcEl = charRefs.current[order];
    const targetEl = benchmarkSlotRefs.current[order] || targetSlotRefs.current[order];
    if (srcEl && targetEl) {
      const sRect = srcEl.getBoundingClientRect();
      const tRect = targetEl.getBoundingClientRect();
      if (sRect.width > 0 && tRect.width > 0) {
        const calculated = {
          dx: (tRect.left + tRect.width / 2) - (sRect.left + sRect.width / 2),
          dy: (tRect.top + tRect.height / 2) - (sRect.top + sRect.height / 2),
        };
        baseOffsetsRef.current[order] = calculated;
        return calculated;
      }
    }
    return { dx: (order - activeData.targetWord.length / 2) * 55, dy: -240 };
  };

  // 针对 experience 模块的并行进度计算：
  const isExp = module.id === 'experience';

  // 阶段 1：字母升起并飞入中央大单词槽位 (experience 模块压缩至 0.00 ~ 0.28，留足开阔空间)
  const flightProgress = isTypewriterDone
    ? Math.min(1, Math.max(0, subProgress / (isExp ? 0.28 : 0.40)))
    : 0;

  // 核心阈值：只有当 flightProgress 真正大于 0.035（subProgress > 0.014）时，字母才脱离原文起飞；
  // 处于起点或滑回起点 (flightProgress <= 0.035) 时，isHarvestStarted 严格为 false，100% 还原原文自然字体大小与排版！
  const isHarvestStarted = isTypewriterDone && flightProgress > 0.035;
  const isHarvestDone = isTypewriterDone && flightProgress >= 1;

  // 阶段 2：大单词在文章正中央完整展示停留 (非 experience: 0.40 ~ 0.45)
  // 阶段 3：大单词平滑移动到左上角并缩小 (非 experience: 0.45 ~ 0.75; experience: 0.28 ~ 0.48)
  const dockProgress = isExp
    ? (isHarvestDone ? Math.min(1, Math.max(0, (subProgress - 0.28) / 0.20)) : 0)
    : (isHarvestDone ? Math.min(1, Math.max(0, (subProgress - 0.45) / 0.30)) : 0);
  dockProgressRef.current = dockProgress;

  // 背景渐黑进度 (0.0 ~ 1.0)：大字开始向左上角移动时 (subProgress >= 0.28) 启动，在 0.48 时 100% 完全变黑！
  const timelineBlackoutProgress = isExp
    ? (isHarvestDone ? Math.min(1, Math.max(0, (subProgress - 0.28) / 0.20)) : 0)
    : 0;

  // 时间线绘制进度 (0.0 ~ 1.0)：【核心需求 2】：画面完全变黑后 (subProgress >= 0.48) 才开始绘制时间线！
  // 绘制跨度延长至 0.48 ~ 0.95，从容展现 6 大战役光河延伸与节点点亮
  const timelineDrawProgress = isExp
    ? (isHarvestDone && subProgress >= 0.48 ? Math.min(1, Math.max(0, (subProgress - 0.48) / 0.47)) : 0)
    : 0;

  // 阶段 4：常规模块详细内容展示卡片无缝衔接升起并稳定展现 (0.58 ~ 0.78 浮现，0.78 ~ 1.00 完整常驻)
  const contentProgress = isHarvestDone
    ? Math.min(1, Math.max(0, (subProgress - 0.58) / 0.20))
    : 0;

  // 模块加载完成判定：
  // 常规模块：详细内容卡片完全浮现就位 (contentProgress >= 0.95，即 subProgress >= 0.77)
  // Experience 模块：全屏 3D 时间线光河与战役 HUD 绘制完成 (timelineDrawProgress >= 0.95，即 subProgress >= 0.95)
  const isModuleLoaded = isExp ? timelineDrawProgress >= 0.95 : contentProgress >= 0.95;

  // 当模块加载完成后，人物触发专属介绍话术：“这是我的个人信息” / “This is my personal profile.”
  const hasSpokenLoadedRef = useRef(false);

  // 离开模块、滑回起点或切换语言时，重置说话触发锁
  useEffect(() => {
    if (!isActive || subProgress <= 0.01) {
      hasSpokenLoadedRef.current = false;
    }
  }, [isActive, subProgress]);

  useEffect(() => {
    hasSpokenLoadedRef.current = false;
  }, [lang]);

  useEffect(() => {
    if (isActive && isModuleLoaded && !hasSpokenLoadedRef.current) {
      hasSpokenLoadedRef.current = true;
      const speechText =
        t.modules[module.id as keyof typeof t.modules]?.mascotSpeech ||
        (t.mascot.introPattern
          ? t.mascot.introPattern.replace('{word}', activeData.targetWord)
          : (lang === 'en' ? `This is my ${activeData.targetWord}.` : `这是我的${activeData.targetWord}`));

      window.dispatchEvent(
        new CustomEvent('mascot-speak-flight', {
          detail: {
            moduleId: module.id,
            targetWord: activeData.targetWord,
            text: speechText,
          },
        })
      );
    }
  }, [isActive, isModuleLoaded, lang, activeData.targetWord, module.id, t.modules, t.mascot.introPattern]);

  // 动态大标题缩放系数与其倒数
  const currentTitleScale = Math.max(0.01, 1 - dockProgress * 0.82);
  const counterScale = 1 / currentTitleScale;

  // 大标题颜色：如果是 experience 模块且背景变黑，字体由深色平滑点亮为亮金色
  const expWordColor = isExp && timelineBlackoutProgress > 0
    ? `rgb(${Math.round(2 + (254 - 2) * timelineBlackoutProgress)}, ${Math.round(6 + (240 - 6) * timelineBlackoutProgress)}, ${Math.round(23 + (138 - 23) * timelineBlackoutProgress)})`
    : undefined;

  const numLetters = activeData.targetWord.length;

  // 预计算每个字母的目标彩虹 RGB 色彩，避免在每一帧动画中重复执行昂贵的 HSL 转换与三角函数运算
  const targetColors = useMemo(() => {
    const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
      s /= 100;
      l /= 100;
      const k = (n: number) => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
    };

    return Array.from({ length: numLetters }, (_, order) => {
      // 各字母的彩虹色相分布 (绿 145° -> 青 180° -> 宝蓝 215° -> 霓紫 265° -> 品红 310° -> 桃粉 340°)
      const hue = Math.round(145 + order * (195 / numLetters)) % 360;
      return hslToRgb(hue, 96, 52);
    });
  }, [numLetters]);

  // 高性能零损耗色彩演化：黑色 -> 柔和过渡彩虹色 -> 黑色
  // 注意：坚决移除动态的大半径 text-shadow 高斯模糊，纯色变换由 GPU 直接着色，杜绝 Retina 屏幕上的强制重绘卡顿
  const getFlightLetterColor = (order: number, p: number) => {
    const [targetR, targetG, targetB] = targetColors[order] || [56, 189, 248];

    // 平滑色彩强度：起飞 p=0 (黑色) -> 飞行中段 p=0.5 (全饱和彩色) -> 汇聚完成 p=1.0 (纯黑)
    const intensity = Math.max(0, Math.sin(p * Math.PI) ** 0.85);

    // 底色基准：起飞点正文黑 (30, 41, 59) -> 降落点大标题黑 (2, 6, 23)
    const baseR = 30 + (2 - 30) * p;
    const baseG = 41 + (6 - 41) * p;
    const baseB = 59 + (23 - 59) * p;

    // 线性插值混合
    const r = Math.round(baseR + (targetR - baseR) * intensity);
    const g = Math.round(baseG + (targetG - baseG) * intensity);
    const b = Math.round(baseB + (targetB - baseB) * intensity);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // 渲染正文：打字机未打出的字符完全隐形，打出后逐字显现并跟随光标
  const renderPaperText = () => {
    const chars = activeData.text.split('');
    return (
      <>
        {/* 刚开始打字、尚未打出任何字符时的初始光标 */}
        {isTyping && visibleCharsCount === 0 && (
          <span className="inline-block w-[3px] h-[1.1em] bg-cyan-500 mr-0.5 animate-pulse align-middle" />
        )}
        {chars.map((char, index) => {
          const isTyped = index < visibleCharsCount;
          const isCursor = isTyping && index === visibleCharsCount - 1;
          const harvestOrder = activeData.charIndices.indexOf(index);
          const isTarget = harvestOrder !== -1;

          if (isTarget) {
            let flyingLetterNode: React.ReactNode = null;

            if (isHarvestStarted && !isHarvestDone) {
              const curColor = getFlightLetterColor(harvestOrder, flightProgress);
              const offset = getOffset(harvestOrder);
              // 将 flightProgress 在 [0.035, 1.0] 区间严格归一化为 [0, 1]，让起飞与降落原点位移绝对为 0
              const normP = Math.max(0, Math.min(1, (flightProgress - 0.035) / 0.965));
              const easeT = normP < 0.5 ? 2 * normP * normP : -1 + (4 - 2 * normP) * normP;
              const curDx = easeT * offset.dx;
              const arcLift = Math.sin(normP * Math.PI) * 55; // 抛物线上扬
              const curDy = easeT * offset.dy - arcLift;
              
              // 彻底解决“飞出去文字模糊”的底层技术瓶颈：
              // 浏览器 GPU 合成层如果在小尺寸 (1em) 下初始化图层，放大 11 倍时只会对 18px 低清位图做双线性拉伸，产生严重模糊。
              // 解决方案：以目标大尺寸 (11.2em) 作为高分辨率基准渲染，初始缩放为 0.089，平滑放大至 1.0。
              // 无论正向飞出还是反向飞回，GPU 始终拥有超清原生矢量纹理，字形边缘永远 100% 锐利如新！
              const baseScaleRatio = 11.2;
              const currentScale = (1 + normP * 10.2) / baseScaleRatio;
              // 字母在起飞刚开始极速平滑淡入，降落回归时平滑淡出，与原地衬线字无缝交接
              const letterOpacity = Math.min(1, normP / 0.06);

              flyingLetterNode = (
                <span
                  className="absolute pointer-events-none z-50 select-none font-sans font-black whitespace-nowrap"
                  style={{
                    left: '50%',
                    top: '50%',
                    fontSize: `${baseScaleRatio}em`,
                    lineHeight: '1',
                    color: curColor,
                    opacity: letterOpacity,
                    transform: `translate3d(${curDx}px, ${curDy}px, 0) scale(${currentScale}) translate(-50%, -50%)`,
                    transformOrigin: '0 0',
                    willChange: 'transform, opacity',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  {char}
                </span>
              );
            }

            return (
              <React.Fragment key={index}>
                <span
                  ref={(el) => {
                    charRefs.current[harvestOrder] = el;
                  }}
                  className="relative inline-block align-baseline"
                >
                  {/* 原文印记：未打出时完全隐形，打出后呈现纯黑文字；起飞后留下半透明浅灰印记 */}
                  <span
                    className={`font-serif transition-opacity duration-200 ${
                      !isTyped
                        ? 'opacity-0 select-none'
                        : isHarvestStarted
                        ? 'opacity-25 text-slate-300'
                        : 'text-slate-800 font-medium opacity-100'
                    }`}
                  >
                    {char}
                  </span>

                  {/* 核心飞行字母：脱离原文、黑->彩->黑平滑过渡、一边升起一边放大 */}
                  {flyingLetterNode}
                </span>
                {isCursor && (
                  <span className="inline-block w-[3px] h-[1.1em] bg-cyan-500 ml-0.5 animate-pulse align-middle" />
                )}
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={index}>
              <span
                className={`transition-opacity duration-100 font-serif ${
                  isTyped ? 'text-slate-800 font-medium opacity-100' : 'opacity-0 select-none'
                }`}
              >
                {char}
              </span>
              {isCursor && (
                <span className="inline-block w-[3px] h-[1.1em] bg-cyan-500 ml-0.5 animate-pulse align-middle" />
              )}
            </React.Fragment>
          );
        })}
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen flex-shrink-0 flex flex-col justify-center items-center px-6 sm:px-16 overflow-hidden select-none"
    >
      {/* 0. experience 模块专属全屏纯黑背景层 (随滑动极速渐入：时间线画到 1/4 时 100% 全黑) */}
      {isExp && (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none bg-[#010103] will-change-opacity z-0 transition-opacity duration-75"
          style={{ opacity: timelineBlackoutProgress }}
        />
      )}

      {/* 0.5 experience 模块专属全屏 3D 时间线画布 (随滑动从左至右延伸画出，支持原生交互) */}
      {isExp && (
        <div
          className="absolute inset-0 w-full h-full z-10 will-change-opacity"
          style={{
            opacity: timelineDrawProgress > 0 ? Math.min(1, timelineDrawProgress * 2.5) : 0,
            pointerEvents: timelineDrawProgress >= 0.95 ? 'auto' : 'none',
            visibility: timelineDrawProgress > 0.005 ? 'visible' : 'hidden',
          }}
        >
          <Timeline3DExperience
            drawProgress={timelineDrawProgress}
            isActive={isActive}
            onWarpComplete={onTimelineWarpComplete}
            onRollback={onTimelineRollback}
          />
        </div>
      )}

      {/* 0.8 绝对基准目标槽位：不受任何 dockProgress 影响，永驻正中央，专门用于精确计算源文字飞向居中单词的物理向量，杜绝左上角污染 */}
      <div
        className="absolute z-[-1] flex items-center pointer-events-none opacity-0 select-none invisible"
        style={{
          top: '29%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          transformOrigin: 'left center',
        }}
        aria-hidden="true"
      >
        <div className="relative flex items-center tracking-tight font-sans font-black text-7xl sm:text-8xl md:text-9xl lg:text-[11rem] xl:text-[13.5rem] 2xl:text-[16rem] leading-none max-w-[96vw]">
          {activeData.targetWord.split('').map((ch, idx) => (
            <span
              key={idx}
              ref={(el) => {
                benchmarkSlotRefs.current[idx] = el;
              }}
              className="inline-block"
            >
              {ch}
            </span>
          ))}
        </div>
      </div>

      {/* 1. 目标单词展示区：
          - 组成标题放大一倍（居中开阔震撼，scale: 1 -> 0.18）
          - 拼好后先在中央开阔区域完整展示，随后再平滑移动缩小归位至左上角
      */}
      <div
        className="absolute z-30 flex items-center pointer-events-none will-change-transform"
        style={{
          top: `${29 - dockProgress * 22}%`,
          left: `${50 - dockProgress * 44}%`,
          transform: `translate(${-50 + dockProgress * 50}%, -50%) scale(${1 - dockProgress * 0.82})`,
          transformOrigin: 'left center',
        }}
      >
        {/* 超大无框单词，自适应屏幕宽度（在 experience 模块黑底时自动呈现发光金色） */}
        <div
          className="relative flex items-center tracking-tight font-sans font-black text-7xl sm:text-8xl md:text-9xl lg:text-[11rem] xl:text-[13.5rem] 2xl:text-[16rem] text-slate-950 select-none leading-none max-w-[96vw]"
          style={expWordColor ? { color: expWordColor, textShadow: timelineBlackoutProgress > 0.4 ? '0 0 24px rgba(245, 158, 11, 0.5)' : undefined } : undefined}
        >
          {activeData.targetWord.split('').map((ch, idx) => (
            <span
              key={idx}
              ref={(el) => {
                targetSlotRefs.current[idx] = el;
              }}
              className={`inline-block transition-opacity duration-200 ${
                isHarvestDone ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {ch}
            </span>
          ))}

          {/* 归位左上角后伴随显现的精致小胶囊副标 */}
          <span
            className={`hidden sm:inline-flex items-center absolute left-full top-1/2 text-xs sm:text-sm font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full whitespace-nowrap shadow-sm pointer-events-auto leading-normal ${
              isExp && timelineBlackoutProgress > 0.5
                ? 'text-amber-300 bg-slate-950/80 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'text-cyan-800 bg-cyan-50/95 border border-cyan-200/90'
            }`}
            style={{
              opacity: dockProgress > 0.6 ? Math.min(1, (dockProgress - 0.6) / 0.25) : 0,
              transform: `scale(${counterScale}) translate3d(24px, -50%, 0)`,
              transformOrigin: '0 0',
            }}
          >
            <span className={`w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0 ${isExp && timelineBlackoutProgress > 0.5 ? 'bg-amber-400 animate-pulse' : 'bg-cyan-500'}`} />
            {activeData.capsule || t.modules[module.id as keyof typeof t.modules]?.capsule || module.chineseTitle}
          </span>
        </div>
      </div>

      {/* 2. 计算机科学论文展卷卡片 - 充分下移，为上方大标题留足开阔居中展示空间 (拼词完成后随背景渐黑平滑淡出) */}
      <div
        ref={paperCardRef}
        className="w-full max-w-3xl p-8 sm:p-10 rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_12px_45px_rgba(0,0,0,0.06)] transition-all duration-300 relative z-10 mt-64 sm:mt-76 md:mt-88"
        style={{
          opacity: isExp
            ? (isHarvestDone ? Math.max(0, 1 - dockProgress * 3.0) : 1)
            : (isHarvestDone && dockProgress > 0.02 ? Math.max(0, 1 - dockProgress * 2.5) : 1),
          transform: `translate3d(0, ${dockProgress * 45}px, 0) scale(${1 - dockProgress * 0.05})`,
          pointerEvents: (isExp ? !isHarvestDone || dockProgress < 0.2 : !isHarvestDone || dockProgress <= 0.3) ? 'auto' : 'none',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-200 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
            <span className="font-bold text-slate-950 text-sm">{activeData.author}</span>
            <span className="text-slate-400">({activeData.year})</span>
          </div>
          <span className="text-slate-500 truncate max-w-sm font-semibold">{activeData.paperTitle}</span>
        </div>

        <p className="text-base sm:text-lg leading-relaxed text-slate-800 min-h-[120px]">
          {renderPaperText()}
        </p>

        <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="truncate max-w-md">{activeData.citation}</span>
        </div>
      </div>

      {/* 3. 模块落地详细内容展示卡片 (仅非 experience 模块展示) */}
      {!isExp && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center px-6 sm:px-16 transition-opacity duration-300"
          style={{
            opacity: contentProgress,
            transform: `translate3d(0, ${(1 - contentProgress) * 35}px, 0)`,
            pointerEvents: contentProgress > 0.4 ? 'auto' : 'none',
          }}
        >
          <div className="w-full max-w-4xl p-8 sm:p-12 mt-12 sm:mt-16 rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_20px_60px_rgba(0,0,0,0.09)] relative overflow-hidden">
            {module.id === 'information' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-950">{currentCards.information.name}</h3>
                    <p className="text-sm text-cyan-600 font-mono mt-1">{currentCards.information.role}</p>
                  </div>
                  <div className="text-right mt-2 sm:mt-0">
                    <span className="text-xs font-mono text-slate-400 block">{currentCards.information.location}</span>
                    {(currentCards.information as Record<string, string | undefined>).education && (
                      <span className="text-xs font-mono text-cyan-700 block mt-0.5">{(currentCards.information as Record<string, string | undefined>).education}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600 leading-relaxed">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-2 font-mono text-xs uppercase text-cyan-700">{currentCards.information.point1Title}</h4>
                    <p>{currentCards.information.point1Desc}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-2 font-mono text-xs uppercase text-cyan-700">{currentCards.information.point2Title}</h4>
                    <p>{currentCards.information.point2Desc}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-2 font-mono text-xs uppercase text-cyan-700">{currentCards.information.point3Title}</h4>
                    <p>{currentCards.information.point3Desc}</p>
                  </div>
                </div>
              </div>
            )}

            {module.id === 'works' && (
              <div>
                <div className="mb-6 pb-4 border-b border-slate-200">
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-950">{currentCards.works.title}</h3>
                  <p className="text-sm text-slate-500 font-mono mt-1">{currentCards.works.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-cyan-300 transition-colors">
                    <span className="font-mono text-xs font-bold text-cyan-600">{currentCards.works.w1Tag}</span>
                    <h4 className="font-bold text-slate-900 mt-1">{currentCards.works.w1Title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{currentCards.works.w1Desc}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-cyan-300 transition-colors">
                    <span className="font-mono text-xs font-bold text-cyan-600">{currentCards.works.w2Tag}</span>
                    <h4 className="font-bold text-slate-900 mt-1">{currentCards.works.w2Title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{currentCards.works.w2Desc}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-cyan-300 transition-colors">
                    <span className="font-mono text-xs font-bold text-cyan-600">{currentCards.works.w3Tag}</span>
                    <h4 className="font-bold text-slate-900 mt-1">{currentCards.works.w3Title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{currentCards.works.w3Desc}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-cyan-300 transition-colors">
                    <span className="font-mono text-xs font-bold text-cyan-600">{currentCards.works.w4Tag}</span>
                    <h4 className="font-bold text-slate-900 mt-1">{currentCards.works.w4Title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{currentCards.works.w4Desc}</p>
                  </div>
                </div>
              </div>
            )}

            {module.id === 'contact' && (
              <div>
                <div className="mb-6 pb-4 border-b border-slate-200">
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-950">{currentCards.contact.title}</h3>
                  <p className="text-sm text-slate-500 font-mono mt-1">{currentCards.contact.subtitle}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-slate-950 text-white">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">{currentCards.contact.channel}</span>
                    <p className="text-xl sm:text-2xl font-mono font-bold mt-1">{(currentCards.contact as Record<string, string | undefined>).email || 'jichi0711@163.com'}</p>
                    {Boolean((currentCards.contact as Record<string, string | undefined>).phone) && (
                      <p className="text-xs font-mono text-cyan-300/90 mt-1">TEL: {(currentCards.contact as Record<string, string | undefined>).phone}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">{currentCards.contact.desc}</p>
                  </div>
                  <button
                    onClick={() => {
                      const email = (currentCards.contact as Record<string, string | undefined>).email || 'jichi0711@163.com';
                      navigator.clipboard.writeText(email);
                      alert(currentCards.contact.alertCopied || `邮箱已复制：${email}`);
                    }}
                    className="px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono tracking-wider uppercase transition-all shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
                  >
                    {currentCards.contact.copyBtn || '点击复制邮箱'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

