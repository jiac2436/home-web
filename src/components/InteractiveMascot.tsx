import React, { useEffect, useRef, useState, useCallback } from 'react';
import spritesheetUrl from '../assets/boy_jump_spritesheet.webp';
import { useLanguage } from '../context/LanguageContext';

interface InteractiveMascotProps {
  onLanding?: () => void;
}

interface VisitorData {
  visit_type: 'first_visit' | 'today_repeat' | 'returning_visit';
  today_uv: number;
  total_uv: number;
  message: string;
  message_en: string;
  bubble_tag: string;
  bubble_tag_en: string;
}

const FRAME_WIDTH = 200;
const FRAME_HEIGHT = 267;
const TOTAL_COLS = 10;
const TOTAL_FRAMES = 76;     // 共 76 帧（0..75）
const FLIGHT_DURATION = 1.2; // 阶段 1：空中跳跃下潜（1.2 秒）
const CROUCH_DURATION = 0.5; // 阶段 2：落地深蹲缓冲吸能（0.5 秒）
const TURN_DURATION = 1.8;   // 阶段 3：转身站立并面对镜头微笑（1.8 秒）
const TOTAL_ANIM_DURATION = FLIGHT_DURATION + CROUCH_DURATION + TURN_DURATION; // 总时长 3.5 秒

export const InteractiveMascot: React.FC<InteractiveMascotProps> = ({ onLanding }) => {
  const { t, lang } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [animState, setAnimState] = useState<'jumping' | 'idle'>('jumping');

  // 访客统计与气泡框状态
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [currentBubbleText, setCurrentBubbleText] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFirstGreeting, setIsFirstGreeting] = useState(true);

  const lastQuoteIndexRef = useRef<number>(-1);

  // 内部动画控制引用
  const spriteRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const landedRef = useRef<boolean>(false);
  const posRef = useRef({ x: 0, y: 0, scale: 0.82 });

  // 1. 请求后端记录访客与获取定制提示语（优先直连 8000 端口避免 Vite proxy 502）
  useEffect(() => {
    let isMounted = true;

    async function fetchVisitorInfo() {
      // 优先直连后端（带 CORS），若失败则回退相对路径
      const apiUrl = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '');
      const primaryEndpoint = `${apiUrl}/api/v1/visitor/track`;

      try {
        let response: Response;
        try {
          response = await fetch(primaryEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
        } catch {
          // 如果直连发生网络异常，尝试相对路径
          response = await fetch('/api/v1/visitor/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
        }

        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const resJson = await response.json();
        if (resJson.code === 200 && isMounted) {
          const data: VisitorData = resJson.data;
          setVisitorData(data);
          const initText = lang === 'en' ? data.message_en : data.message;
          setCurrentBubbleText(initText);
        }
      } catch {
        // 容错降级默认值
        if (isMounted) {
          const defaultText =
            lang === 'en'
              ? "🎉 Welcome! Nice to meet you in Chen's digital garden~"
              : '🎉 欢迎来访！很高兴在晨的数字空间与你相遇～';
          setCurrentBubbleText(defaultText);
        }
      }
    }

    fetchVisitorInfo();

    return () => {
      isMounted = false;
    };
  }, [lang]);

  // 2. 打字机效果：只有当小男孩落地站稳（idle）且气泡框呈现给用户时，才开始逐字打印
  useEffect(() => {
    // 若尚未落地或者气泡不可见，不提前打字
    if (animState !== 'idle' || !bubbleVisible || !currentBubbleText) {
      return;
    }

    let index = 0;
    const intervalTime = 30; // 每 30ms 打印一个字符

    const initTimer = setTimeout(() => {
      setDisplayedText('');
      setIsTyping(true);
    }, 0);

    const timer = setInterval(() => {
      index++;
      setDisplayedText(currentBubbleText.slice(0, index));
      if (index >= currentBubbleText.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, intervalTime);

    return () => {
      clearTimeout(initTimer);
      clearInterval(timer);
    };
  }, [currentBubbleText, animState, bubbleVisible]);

  // 方案 3 机制一：8 秒后自动平滑淡出气泡
  useEffect(() => {
    if (!bubbleVisible || animState !== 'idle') return;

    const autoHideTimer = setTimeout(() => {
      setBubbleVisible(false);
    }, 8000);

    return () => clearTimeout(autoHideTimer);
  }, [bubbleVisible, animState, currentBubbleText]);

  // 方案 3 机制二：向下滚动浏览时立即平滑淡出避让正文
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 40 && Math.abs(currentScrollY - lastScrollY) > 5) {
        setBubbleVisible(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 机制三：每当进入下一篇章（或篇章切换）时，自动平滑收起气泡
  useEffect(() => {
    const handleChapterChange = () => {
      setBubbleVisible(false);
    };

    window.addEventListener('chapter-change', handleChapterChange);
    return () => window.removeEventListener('chapter-change', handleChapterChange);
  }, []);

  // 机制四：每当模块内容加载完成时，人物触发专属介绍话术（如：“这是我的“xxxx”的介绍。”）
  useEffect(() => {
    const handleFlightSpeech = (e: Event) => {
      const customEvent = e as CustomEvent<{ moduleId: string; targetWord: string; text: string }>;
      if (!customEvent.detail?.text) return;

      setIsFirstGreeting(false); // 隐藏首次欢迎数据栏，专注于介绍词
      setCurrentBubbleText(customEvent.detail.text);
      setBubbleVisible(true);
    };

    window.addEventListener('mascot-speak-flight', handleFlightSpeech);
    return () => window.removeEventListener('mascot-speak-flight', handleFlightSpeech);
  }, []);

  // 3. 仅在首次加载时执行一次空中跳跃入场
  const startJumpAnimation = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    setAnimState('jumping');
    landedRef.current = false;
    startTimeRef.current = performance.now();

    const startX = window.innerWidth - 160;
    const startY = -120;
    posRef.current = { x: startX, y: startY, scale: 0.82 };

    const animate = (time: number) => {
      const elapsed = (time - startTimeRef.current) / 1000;
      const sprite = spriteRef.current;
      const canvas = canvasRef.current;

      if (!sprite || !canvas) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayW = FRAME_WIDTH * posRef.current.scale;
      const displayH = FRAME_HEIGHT * posRef.current.scale;

      const isMobile = window.innerWidth < 768;
      const marginX = isMobile ? 16 : 48;
      const targetX = window.innerWidth - displayW - marginX;
      const targetY = window.innerHeight - displayH - 8;

      let currentFrame: number;
      let isComplete = false;

      if (elapsed < FLIGHT_DURATION) {
        const p = elapsed / FLIGHT_DURATION;
        currentFrame = Math.min(Math.floor(p * 35), 34);

        const easeY = Math.pow(p, 1.8);
        const initialX = window.innerWidth - 160;
        const initialY = -120;
        posRef.current.x = initialX + (targetX - initialX) * p;
        posRef.current.y = initialY + (targetY - initialY) * easeY;
      } else if (elapsed < FLIGHT_DURATION + CROUCH_DURATION) {
        posRef.current.x = targetX;
        posRef.current.y = targetY;

        if (!landedRef.current) {
          landedRef.current = true;
          const feetX = targetX + displayW * 0.5;
          const feetY = targetY + displayH * 0.95;

          window.dispatchEvent(
            new CustomEvent('trigger-dandelion-breeze', {
              detail: {
                power: 2.8,
                originX: feetX,
                originY: feetY,
                radius: 280,
              },
            })
          );

          if (onLanding) onLanding();
        }

        const crouchElapsed = elapsed - FLIGHT_DURATION;
        const p = crouchElapsed / CROUCH_DURATION;
        currentFrame = 35 + Math.min(Math.floor(p * 16), 15);
      } else if (elapsed < TOTAL_ANIM_DURATION) {
        posRef.current.x = targetX;
        posRef.current.y = targetY;

        const turnElapsed = elapsed - (FLIGHT_DURATION + CROUCH_DURATION);
        const p = turnElapsed / TURN_DURATION;
        currentFrame = 51 + Math.min(Math.floor(p * 25), 24);
      } else {
        currentFrame = TOTAL_FRAMES - 1;
        posRef.current.x = targetX;
        posRef.current.y = targetY;
        isComplete = true;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const col = currentFrame % TOTAL_COLS;
      const row = Math.floor(currentFrame / TOTAL_COLS);
      const sx = col * FRAME_WIDTH;
      const sy = row * FRAME_HEIGHT;

      ctx.save();
      ctx.drawImage(
        sprite,
        sx,
        sy,
        FRAME_WIDTH,
        FRAME_HEIGHT,
        posRef.current.x * dpr,
        posRef.current.y * dpr,
        displayW * dpr,
        displayH * dpr
      );
      ctx.restore();

      if (isComplete) {
        setAnimState('idle');
        setBubbleVisible(true); // 落地站稳后，气泡框弹出，同时激活打字机动效
        animFrameRef.current = null;
        return;
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [onLanding]);

  // 4. 预加载 Spritesheet 并仅在页面初始加载时跳一次
  useEffect(() => {
    const img = new Image();
    img.src = spritesheetUrl;
    img.onload = () => {
      spriteRef.current = img;
      setLoaded(true);
      startJumpAnimation();
    };
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [startJumpAnimation]);

  // 5. 点击小男孩：不再跳跃，而是在 5 条彩蛋台词中随机切换
  const handleMascotClick = useCallback(() => {
    setBubbleVisible(true);
    setIsFirstGreeting(false); // 点击切换彩蛋后，隐藏底部具体数据栏，仅首次气泡呈现
    const quotes = t.mascot.quotes;
    if (!quotes || quotes.length === 0) return;

    let nextIdx = Math.floor(Math.random() * quotes.length);
    if (quotes.length > 1 && nextIdx === lastQuoteIndexRef.current) {
      nextIdx = (nextIdx + 1) % quotes.length;
    }
    lastQuoteIndexRef.current = nextIdx;

    setCurrentBubbleText(quotes[nextIdx]);
  }, [t.mascot.quotes]);

  // 窗口尺寸自适应
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvasRef.current.width = window.innerWidth * dpr;
      canvasRef.current.height = window.innerHeight * dpr;
      canvasRef.current.style.width = `${window.innerWidth}px`;
      canvasRef.current.style.height = `${window.innerHeight}px`;

      if (spriteRef.current && animState === 'idle') {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const displayW = FRAME_WIDTH * posRef.current.scale;
          const displayH = FRAME_HEIGHT * posRef.current.scale;
          const isMobile = window.innerWidth < 768;
          const marginX = isMobile ? 16 : 48;
          posRef.current.x = window.innerWidth - displayW - marginX;
          posRef.current.y = window.innerHeight - displayH - 8;

          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          const col = (TOTAL_FRAMES - 1) % TOTAL_COLS;
          const row = Math.floor((TOTAL_FRAMES - 1) / TOTAL_COLS);
          ctx.drawImage(
            spriteRef.current,
            col * FRAME_WIDTH,
            row * FRAME_HEIGHT,
            FRAME_WIDTH,
            FRAME_HEIGHT,
            posRef.current.x * dpr,
            posRef.current.y * dpr,
            displayW * dpr,
            displayH * dpr
          );
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [animState]);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {/* 核心全屏动画渲染画布 */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* 小男孩头顶上方的 肥皂泡泡彩虹薄膜微光 打字机气泡框 */}
      {loaded && animState === 'idle' && (
        <div
          className={`pointer-events-auto absolute bottom-[230px] right-4 md:right-12 z-30 w-[280px] sm:w-[320px] select-none transition-all duration-300 ease-out transform origin-bottom-right ${
            bubbleVisible
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
          }`}
        >
          <div className="relative soap-bubble-glass rounded-[24px] p-4 pr-8 text-slate-800">
            {/* iOS 风格半透明圆形关闭按钮 */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBubbleVisible(false);
              }}
              className="absolute top-3 right-3 w-5 h-5 rounded-full bg-slate-300/35 hover:bg-slate-300/60 active:scale-90 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all shadow-2xs"
              title={t.mascot.closeTip}
            >
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* 打字机正文区域 */}
            <div className="text-[14px] sm:text-[14.5px] font-normal text-slate-800 leading-[1.65] tracking-[-0.01em] min-h-[44px]">
              {displayedText}
              {isTyping && (
                <span className="inline-block w-[2px] h-[14px] ml-0.5 bg-cyan-600/80 rounded-full animate-pulse align-middle" />
              )}
            </div>

            {/* 底部访客量统计指标栏：仅在首次欢迎气泡时呈现，点击小男孩聊天后彻底隐藏 */}
            {isFirstGreeting && visitorData && (
              <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-500 font-mono tracking-tight">
                <span>
                  {t.mascot.todayLabel}:{' '}
                  <strong className="text-slate-700 font-semibold">{visitorData.today_uv}</strong>
                </span>
                <span className="text-slate-300">·</span>
                <span>
                  {t.mascot.totalLabel}:{' '}
                  <strong className="text-slate-700 font-semibold">{visitorData.total_uv}</strong>
                </span>
              </div>
            )}

            {/* 朝向人物头顶的 肥皂泡彩虹微指向小尖角 */}
            <div className="absolute -bottom-1.5 right-12 w-3.5 h-3.5 soap-bubble-tip rotate-45" />
          </div>
        </div>
      )}

      {/* 落地后的点击交互热区：覆盖人物，点击切换气泡台词 */}
      {loaded && animState === 'idle' && (
        <div
          onClick={handleMascotClick}
          className="pointer-events-auto absolute cursor-pointer bottom-2 right-4 md:right-12 w-[164px] h-[220px]"
          title={t.mascot.interactTip}
        />
      )}
    </div>
  );
};
