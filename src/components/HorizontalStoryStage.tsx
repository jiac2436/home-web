import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CS_PAPER_MODULES } from '../data/csPapers';
import { HarvestModuleView, type TypewriterStatus } from './HarvestModuleView';
import { NextPageGate } from './NextPageGate';
import { useLanguage } from '../context/LanguageContext';

export const HorizontalStoryStage: React.FC = () => {
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const { lang } = useLanguage();

  // 核心受控状态：当前模块索引与模块内动效进度
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const currentModuleIdxRef = useRef(0);

  // 核心受控状态：当前模块索引与模块内动效进度（纯机械 1:1 同步驱动）
  const [modSubP, setModSubP] = useState(0);
  const modSubPRef = useRef(0);

  // NEXT PAGE 蓄力进度 (0.0 ~ 1.0)
  const [gateCharge, setGateCharge] = useState(0);
  const gateChargeRef = useRef(0);

  // 状态与手势隔离锁
  const isTransitioningRef = useRef(false);
  const isRunwayActiveRef = useRef(false);
  const [isRunwayActive, setIsRunwayActive] = useState(false);

  // 【方案 1 核心架构】：全局打字机状态调度中心（单一真理源）
  // 记录每个模块的打字机状态 (0: information, 1: experience, 2: works, 3: contact)
  const [typewriterStatuses, setTypewriterStatuses] = useState<Record<number, TypewriterStatus>>({});
  const typewriterStatusesRef = useRef<Record<number, TypewriterStatus>>({});

  // 记录各模块“文章框是否曾经完全在页面中消失”的生命周期状态
  const paperHasDisappearedRef = useRef<Record<number, boolean>>({});

  const handlePaperDisappear = useCallback((idx: number) => {
    paperHasDisappearedRef.current[idx] = true;
    // 文章框已彻底离开视口：立即重置打字机为 idle + 动效进度归零，
    // 确保用户重新滑入时，内容是空的，打字机从头再来！
    typewriterStatusesRef.current[idx] = 'idle';
    setTypewriterStatuses((prev) => ({ ...prev, [idx]: 'idle' }));
    if (currentModuleIdxRef.current === idx) {
      modSubPRef.current = 0;
      setModSubP(0);
    }
  }, []);

  // 文章框重新进入视口：若该模块曾消失过且状态还在 idle，主动重启打字机！
  // 仅靠 isRunwayActive useEffect 不够——当 isRunwayActive 未发生变化时，effect 不会重新触发。
  const handlePaperVisible = useCallback((idx: number) => {
    if (paperHasDisappearedRef.current[idx] && typewriterStatusesRef.current[idx] === 'idle') {
      paperHasDisappearedRef.current[idx] = false;
      typewriterStatusesRef.current[idx] = 'typing';
      setTypewriterStatuses((prev) => ({ ...prev, [idx]: 'typing' }));
    }
  }, []);


  const updateTypewriterStatus = useCallback((idx: number, status: TypewriterStatus) => {
    typewriterStatusesRef.current[idx] = status;
    setTypewriterStatuses((prev) => ({ ...prev, [idx]: status }));
  }, []);

  // 语言切换时，重置所有模块打字机状态与动效进度，重新从 0 体验
  useEffect(() => {
    typewriterStatusesRef.current = {};
    setTypewriterStatuses({});
    paperHasDisappearedRef.current = {};
    modSubPRef.current = 0;
    setModSubP(0);
  }, [lang]);

  // 视口激活或模块切换时的打字机状态驱动
  useEffect(() => {
    if (!isRunwayActive) {
      return;
    }

    // 跑道视口激活：若当前模块尚未处于 'done' 且非 'typing'，立即启动打字机
    const curStatus = typewriterStatusesRef.current[currentModuleIdx];
    if (curStatus !== 'done' && curStatus !== 'typing') {
      updateTypewriterStatus(currentModuleIdx, 'typing');
    }
  }, [isRunwayActive, currentModuleIdx, updateTypewriterStatus]);

  const lastScrollTimeRef = useRef(0);
  // 手势独立性控制：一次滑动只能充能一次，停手超过 60ms 视为独立新动作
  const isGestureActiveRef = useRef(false);
  const canChargeThisGestureRef = useRef(false);
  const canPrevPageThisGestureRef = useRef(false);
  const justNavigatedBackRef = useRef(false);
  const gestureEndTimerRef = useRef<number | null>(null);

  const touchStartRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const numModules = CS_PAPER_MODULES.length; // 4

  const transitionTimerRef = useRef<number | null>(null);

  // 全局白光穿越覆盖度 (0.0 ~ 1.0)
  const [globalWhiteout, setGlobalWhiteout] = useState(0);

  // 切入下一个模块
  const triggerNextModule = useCallback(() => {
    if (isTransitioningRef.current) return;
    if (currentModuleIdxRef.current >= numModules - 1) return;

    isTransitioningRef.current = true;
    canChargeThisGestureRef.current = false;
    canPrevPageThisGestureRef.current = false;
    isGestureActiveRef.current = false;
    justNavigatedBackRef.current = false;

    if (gestureEndTimerRef.current !== null) {
      window.clearTimeout(gestureEndTimerRef.current);
      gestureEndTimerRef.current = null;
    }

    const nextIdx = currentModuleIdxRef.current + 1;
    currentModuleIdxRef.current = nextIdx;
    setCurrentModuleIdx(nextIdx);

    // 分发进入下一篇章事件（通知浮窗气泡等组件自动避让收起）
    window.dispatchEvent(new CustomEvent('chapter-change', { detail: { nextIdx, direction: 'next' } }));

    // 重置新模块进度与蓄力锁（纯机械同步：直接归 0）
    modSubPRef.current = 0;
    setModSubP(0);
    gateChargeRef.current = 0;
    setGateCharge(0);

    // 若新模块尚未完成，且当前视口处于激活态，启动打字机
    if (typewriterStatusesRef.current[nextIdx] !== 'done' && isRunwayActiveRef.current) {
      updateTypewriterStatus(nextIdx, 'typing');
    }

    // 0.8s 切页保护期：完全阻断任何物理飞轮余波
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
    }
    transitionTimerRef.current = window.setTimeout(() => {
      isTransitioningRef.current = false;
      transitionTimerRef.current = null;
    }, 800);
  }, [numModules, updateTypewriterStatus]);

  // 回退至上一个模块
  const triggerPrevModule = useCallback(() => {
    if (isTransitioningRef.current) return;
    if (currentModuleIdxRef.current <= 0) return;

    isTransitioningRef.current = true;
    canChargeThisGestureRef.current = false;
    canPrevPageThisGestureRef.current = false;
    isGestureActiveRef.current = false;
    // 关键：标记刚回退进入，防止滚轮飞轮惯性微弱向下滑动瞬间充满 gateCharge 又弹回下一模块！
    justNavigatedBackRef.current = true;

    if (gestureEndTimerRef.current !== null) {
      window.clearTimeout(gestureEndTimerRef.current);
      gestureEndTimerRef.current = null;
    }

    const prevIdx = currentModuleIdxRef.current - 1;
    currentModuleIdxRef.current = prevIdx;
    setCurrentModuleIdx(prevIdx);

    // 回退进入的模块必定已经完成过，状态保持为 'done'
    updateTypewriterStatus(prevIdx, 'done');

    // 分发篇章切换事件
    window.dispatchEvent(new CustomEvent('chapter-change', { detail: { nextIdx: prevIdx, direction: 'prev' } }));

    modSubPRef.current = 1.0;
    setModSubP(1.0);
    gateChargeRef.current = 0;
    setGateCharge(0);

    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
    }
    transitionTimerRef.current = window.setTimeout(() => {
      isTransitioningRef.current = false;
      transitionTimerRef.current = null;
    }, 800);
  }, [updateTypewriterStatus]);

  // 时空穿越白光完成回调：平滑切入第三模块 (works) 并自然淡出白光
  const handleTimelineWarpComplete = useCallback(() => {
    setGlobalWhiteout(1.0);
    triggerNextModule();

    setTimeout(() => {
      const start = performance.now();
      const duration = 750;
      const fade = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        // 使用三次平滑曲线退去白光
        const easeOut = 1 - Math.pow(1 - (1 - p), 3);
        setGlobalWhiteout(1.0 - easeOut);
        if (p < 1) {
          requestAnimationFrame(fade);
        } else {
          setGlobalWhiteout(0);
        }
      };
      requestAnimationFrame(fade);
    }, 280);
  }, [triggerNextModule]);

  // 时间线回溯回调：用户在第 01 节点向上滚次回退绘制
  const handleTimelineRollback = useCallback(() => {
    if (currentModuleIdxRef.current === 1) {
      modSubPRef.current = 0.96;
      setModSubP(0.96);
      justNavigatedBackRef.current = false;
    }
  }, []);

  // 核心动力学：纯机械 1:1 绝对同步驱动模式，手滚即动，手停即止，0 额外异步插值滑翔
  const handleDelta = useCallback((deltaY: number) => {
    if (isTransitioningRef.current) return;
    lastScrollTimeRef.current = performance.now();

    const isExpModule = currentModuleIdxRef.current === 1;

    if (deltaY > 0) {
      // 1. 向下滚动
      const curStatus = typewriterStatusesRef.current[currentModuleIdxRef.current];
      // 若当前处于 'idle'（曾回退重置或视口初次激活未启动），向下滚动时立即启动打字机
      if (curStatus === 'idle' || !curStatus) {
        updateTypewriterStatus(currentModuleIdxRef.current, 'typing');
        if (modSubPRef.current !== 0) {
          modSubPRef.current = 0;
          setModSubP(0);
        }
        return;
      }

      // 铁律：打字机未 100% 敲完前（status !== 'done'），滚轮绝对拦截，禁止启动飞字动画
      if (curStatus !== 'done') {
        if (modSubPRef.current !== 0) {
          modSubPRef.current = 0;
          setModSubP(0);
        }
        return;
      }

      // 重点：当处于 Experience 模块，且时间线已经绘制完成 (modSubP >= 0.98) 时，
      // 外层绝对不自动切页！外部滚轮交由 Timeline3DExperience 内部原生控制战役切换！
      if (isExpModule && modSubPRef.current >= 0.98) {
        return;
      }

      if (modSubPRef.current < 0.98) {
        // 纯机械 1:1 同步：滚轮推进多少像素直接按固定比例转化，手停即绝对静止，绝不产生 1 帧多余位移！
        const step = Math.min(45, Math.abs(deltaY)) * 0.0010;
        const nextP = Math.min(0.98, modSubPRef.current + step);

        // 判断文章框是否完全在页面中消失（Experience: >= 0.35; 常规模块: >= 0.60）
        const isPaperHiddenThreshold = isExpModule ? 0.35 : 0.60;
        if (nextP >= isPaperHiddenThreshold) {
          paperHasDisappearedRef.current[currentModuleIdxRef.current] = true;
        }

        modSubPRef.current = nextP;
        setModSubP(nextP);
        justNavigatedBackRef.current = false;
      } else if (currentModuleIdxRef.current < numModules - 1 && !isExpModule) {
        // 非 experience 模块使用 NextPageGate 充能
        if (!justNavigatedBackRef.current) {
          const nextCharge = Math.min(1.0, gateChargeRef.current + Math.abs(deltaY) * 0.006);
          gateChargeRef.current = nextCharge;
          setGateCharge(nextCharge);

          if (nextCharge >= 1.0) {
            triggerNextModule();
          }
        }
      }
    } else if (deltaY < 0) {
      // 2. 向上滚动
      if (isExpModule && modSubPRef.current >= 0.98) {
        // 时间线交互态下，外层不主动干预，交由内部 onRollback 处理
        return;
      }

      if (gateChargeRef.current > 0.01) {
        const nextCharge = Math.max(0, gateChargeRef.current - Math.abs(deltaY) * 0.008);
        gateChargeRef.current = nextCharge;
        setGateCharge(nextCharge);
      } else if (modSubPRef.current > 0) {
        // 纯机械 1:1 同步：向上回滚细腻收拢，手停即刻静止，与正向速度完全物理对称
        const step = Math.min(45, Math.abs(deltaY)) * 0.0010;
        const rawNextP = Math.max(0, modSubPRef.current - step);
        // 【核心修复 2】：接近起点 (<= 0.008) 时强制精准吸附为 0，彻底根除浮点残余导致字母无法还原为正常字体！
        const nextP = rawNextP <= 0.008 ? 0 : rawNextP;
        modSubPRef.current = nextP;
        setModSubP(nextP);
        justNavigatedBackRef.current = false;

        // 【核心需求 1】：以“文章框是否完全消失”为条件判断重置！
        // 只有当文章框曾完全消失过，现在用户彻底回退到了起点 (nextP === 0) 时，才重置打字机为 'idle'！
        if (nextP === 0 && paperHasDisappearedRef.current[currentModuleIdxRef.current]) {
          paperHasDisappearedRef.current[currentModuleIdxRef.current] = false;
          updateTypewriterStatus(currentModuleIdxRef.current, 'idle');
        }
      } else if (currentModuleIdxRef.current > 0) {
        // 核心回退上一模块门禁：只有当本次手势发起时页面就已经停在起点 (canPrevPageThisGestureRef)，
        // 才允许触发回退上一模块！杜绝连续向上滑动时连滑带跳直接跳过整页！
        if (canPrevPageThisGestureRef.current) {
          canPrevPageThisGestureRef.current = false;
          triggerPrevModule();
        }
      }
    }
  }, [numModules, triggerNextModule, triggerPrevModule, updateTypewriterStatus]);

  useEffect(() => {
    const handleScroll = () => {
      if (!runwayRef.current) return;
      const rect = runwayRef.current.getBoundingClientRect();
      const active = rect.top <= 10 && rect.bottom >= window.innerHeight * 0.3;
      isRunwayActiveRef.current = active;
      setIsRunwayActive(active);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 维持 NEXT PAGE 停手 0.5s 后的平缓衰减监听循环（完全移除追赶式 LERP）
    const updateLoop = () => {
      animFrameRef.current = requestAnimationFrame(updateLoop);

      // NEXT PAGE 蓄力门停手 0.5s 后平缓衰减
      const now = performance.now();
      const isStopped = now - lastScrollTimeRef.current > 500;

      if (isStopped && gateChargeRef.current > 0 && !isTransitioningRef.current) {
        const nextCharge = Math.max(0, gateChargeRef.current - 0.01);
        gateChargeRef.current = nextCharge;
        setGateCharge(nextCharge);
      }
    };
    updateLoop();

    // 滚轮事件监听
    const handleWheel = (e: WheelEvent) => {
      // 如果不在当前分段跑道活跃区，或者正在执行平滑过渡动画，不拦截
      if (!isRunwayActiveRef.current || isTransitioningRef.current) {
        return;
      }

      // 如果滚轮事件发生在允许内部独立滚动的区域（如时间线列表或专题页模态框），放行原生滚动，不拦截手势
      const targetEl = e.target as HTMLElement | null;
      if (targetEl && targetEl.closest('[data-timeline-scroll="true"], [data-modal-scroll="true"]')) {
        return;
      }

      // 独立手势识别：
      // 当手势尚未激活时（!isGestureActiveRef.current），说明这是一次全新的滑动。
      // 核心判定：
      // 1. 只有当这次全新滑动发起时，当前模块已经完全展示完毕 (modSubPRef.current >= 0.98 且非刚回退)，才具备 NEXT PAGE 充能资格；
      // 2. 只有当这次全新滑动发起时，当前模块已经停在起点 (modSubPRef.current <= 0.005)，才具备 PREV PAGE 回退上一模块资格！
      if (!isGestureActiveRef.current) {
        isGestureActiveRef.current = true;
        canChargeThisGestureRef.current = modSubPRef.current >= 0.98 && !justNavigatedBackRef.current;
        canPrevPageThisGestureRef.current = modSubPRef.current <= 0.005;
      }

      // 重置手势结束计时器（滚轮停止 60ms 视为当前手势物理结束，极速灵敏无卡顿）
      if (gestureEndTimerRef.current !== null) {
        window.clearTimeout(gestureEndTimerRef.current);
      }
      gestureEndTimerRef.current = window.setTimeout(() => {
        isGestureActiveRef.current = false;
        canChargeThisGestureRef.current = false;
        canPrevPageThisGestureRef.current = false;
      }, 60);

      // 在 Module 0 起点（必须精确为 0）且向上滚动时，放行原生滚动回退至顶部 Hero
      if (currentModuleIdxRef.current === 0 && modSubPRef.current === 0 && e.deltaY < 0) {
        return;
      }

      if (e.cancelable) {
        e.preventDefault();
      }
      handleDelta(e.deltaY);
    };

    // 触控滑动支持
    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0].clientY;
      isGestureActiveRef.current = true;
      canChargeThisGestureRef.current = modSubPRef.current >= 0.98 && !justNavigatedBackRef.current;
      canPrevPageThisGestureRef.current = modSubPRef.current <= 0.005;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartRef.current === null || !isRunwayActiveRef.current || isTransitioningRef.current) return;

      // 如果触控滑动事件发生在允许内部独立滚动的区域，放行原生滚动
      const targetEl = e.target as HTMLElement | null;
      if (targetEl && targetEl.closest('[data-timeline-scroll="true"], [data-modal-scroll="true"]')) {
        return;
      }

      const currentY = e.touches[0].clientY;
      const delta = touchStartRef.current - currentY;
      touchStartRef.current = currentY;

      if (currentModuleIdxRef.current === 0 && modSubPRef.current === 0 && delta < 0) {
        return;
      }

      if (e.cancelable) {
        e.preventDefault();
      }
      handleDelta(delta * 2.0);
    };

    const handleTouchEnd = () => {
      touchStartRef.current = null;
      isGestureActiveRef.current = false;
      canChargeThisGestureRef.current = false;
      canPrevPageThisGestureRef.current = false;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (gestureEndTimerRef.current !== null) {
        window.clearTimeout(gestureEndTimerRef.current);
      }
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, [handleDelta]);

  const isGateVisible =
    isRunwayActive &&
    modSubP >= 0.98 &&
    currentModuleIdx < numModules - 1 &&
    currentModuleIdx !== 1; // 仅非 experience 模块显示蓄力门

  // 底部总进度指示条
  const overallProgress = (currentModuleIdx + modSubP * 0.75 + gateCharge * 0.25) / numModules;

  return (
    <div
      ref={runwayRef}
      className="relative w-full h-[600vh] bg-transparent"
    >
      <div className="sticky top-0 left-0 w-screen h-screen overflow-hidden">
        {/* 四大横向滑动篇章轨道 */}
        <div
          className="flex w-[400vw] h-screen will-change-transform"
          style={{
            transform: `translate3d(-${currentModuleIdx * 100}vw, 0, 0)`,
            transition: 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {CS_PAPER_MODULES.map((module, idx) => {
            const activeSubP =
              currentModuleIdx > idx ? 1.0 : currentModuleIdx < idx ? 0.0 : modSubP;

            return (
              <HarvestModuleView
                key={module.id}
                module={module}
                subProgress={activeSubP}
                isActive={currentModuleIdx === idx && isRunwayActive}
                typewriterStatus={typewriterStatuses[idx] || 'idle'}
                onTypewriterDone={() => {
                  updateTypewriterStatus(idx, 'done');
                }}
                onTimelineWarpComplete={handleTimelineWarpComplete}
                onTimelineRollback={handleTimelineRollback}
                onPaperDisappear={() => handlePaperDisappear(idx)}
                onPaperVisible={() => handlePaperVisible(idx)}
              />
            );
          })}
        </div>

        {/* Lusion.co 风格 NEXT PAGE 蓄力过渡门：置于右下角人物左侧，白色磨砂融入背景，不可点击 */}
        <NextPageGate
          visible={isGateVisible}
          progress={gateCharge}
        />

        {/* 全屏时空穿越白光 (Whiteout)：在进入 Works 模块时平滑消散，产生穿梭时空视觉感 */}
        <div
          className="fixed inset-0 z-50 pointer-events-none bg-white will-change-opacity transition-opacity duration-75"
          style={{ opacity: globalWhiteout }}
        />

        {/* 底部横向滑屏总进度条 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/60 z-40">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 via-indigo-500 to-pink-500 transition-all duration-150"
            style={{ width: `${overallProgress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
