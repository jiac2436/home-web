import React, { useEffect, useRef } from 'react';

interface RibbonPoint {
  baseRelX: number;
  baseRelY: number;
  x: number;
  y: number;
}

export const LusionRibbonCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // 丝带采样轨迹：从右上弧向中上、大幅左旋环绕并收尾于中下方
  const pointsRef = useRef<RibbonPoint[]>([
    { baseRelX: 1.05, baseRelY: 0.16, x: 0, y: 0 },
    { baseRelX: 0.88, baseRelY: 0.08, x: 0, y: 0 },
    { baseRelX: 0.65, baseRelY: 0.05, x: 0, y: 0 },
    { baseRelX: 0.38, baseRelY: 0.11, x: 0, y: 0 },
    { baseRelX: 0.22, baseRelY: 0.32, x: 0, y: 0 },
    { baseRelX: 0.23, baseRelY: 0.56, x: 0, y: 0 },
    { baseRelX: 0.34, baseRelY: 0.76, x: 0, y: 0 },
    { baseRelX: 0.48, baseRelY: 0.86, x: 0, y: 0 },
  ]);

  // 第二条右上辅助小流体丝带（呼应右上角流线）
  const secondaryPointsRef = useRef<RibbonPoint[]>([
    { baseRelX: 0.82, baseRelY: 0.06, x: 0, y: 0 },
    { baseRelX: 0.92, baseRelY: 0.12, x: 0, y: 0 },
    { baseRelX: 1.05, baseRelY: 0.18, x: 0, y: 0 },
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);

      // 固定纯静态质点坐标（无呼吸感起伏，无鼠标扰动）
      for (const p of pointsRef.current) {
        p.x = p.baseRelX * w;
        p.y = p.baseRelY * h;
      }
      for (const p of secondaryPointsRef.current) {
        p.x = p.baseRelX * w;
        p.y = p.baseRelY * h;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const targetProgressRef = { current: 0 };
    const currentProgressRef = { current: 0 };

    // 监听页面向下滚动计算目标绘制进度（滚动约 450px 即可完全绘制成型）
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const SCROLL_THRESHOLD = 450;
      targetProgressRef.current = Math.min(1, Math.max(0, scrollY / SCROLL_THRESHOLD));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 密集采样二次贝塞尔样条以实现精确截取
    interface Point2D {
      x: number;
      y: number;
    }

    const sampleSplineCurve = (pts: RibbonPoint[]): { points: Point2D[]; lengths: number[]; totalLength: number } => {
      if (pts.length < 2) return { points: [], lengths: [], totalLength: 0 };

      const sampled: Point2D[] = [];
      sampled.push({ x: pts[0].x, y: pts[0].y });

      for (let i = 0; i < pts.length - 1; i++) {
        const current = pts[i];
        const next = pts[i + 1];
        const midX = (current.x + next.x) * 0.5;
        const midY = (current.y + next.y) * 0.5;

        const pStart = sampled[sampled.length - 1];
        const STEPS = 16;
        for (let s = 1; s <= STEPS; s++) {
          const t = s / STEPS;
          const invT = 1 - t;
          const px = invT * invT * pStart.x + 2 * invT * t * current.x + t * t * midX;
          const py = invT * invT * pStart.y + 2 * invT * t * current.y + t * t * midY;
          sampled.push({ x: px, y: py });
        }
      }

      const last = pts[pts.length - 1];
      sampled.push({ x: last.x, y: last.y });

      const lengths: number[] = [0];
      let totalLength = 0;
      for (let i = 1; i < sampled.length; i++) {
        const dx = sampled[i].x - sampled[i - 1].x;
        const dy = sampled[i].y - sampled[i - 1].y;
        totalLength += Math.hypot(dx, dy);
        lengths.push(totalLength);
      }

      return { points: sampled, lengths, totalLength };
    };

    const loop = () => {
      animFrameIdRef.current = requestAnimationFrame(loop);

      // 阻尼缓动插值（平滑响应滚动）
      currentProgressRef.current += (targetProgressRef.current - currentProgressRef.current) * 0.085;
      const progress = currentProgressRef.current;

      const w = window.innerWidth;
      const h = window.innerHeight;

      // 1. 清空画布
      ctx.clearRect(0, 0, w, h);

      // 2. 绘制样条函数（根据当前 progress 裁剪截取）
      const drawProgressSpline = (pts: RibbonPoint[], strokeWidth: number, pRatio: number, isMain: boolean) => {
        if (pts.length < 2 || pRatio <= 0.003) return;

        const { points, lengths, totalLength } = sampleSplineCurve(pts);
        if (points.length < 2 || totalLength <= 0) return;

        const targetDist = totalLength * Math.min(1, Math.max(0, pRatio));

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = strokeWidth;

        // 高阶青碧到蔚蓝静态渐变
        const grad = ctx.createLinearGradient(
          w * 0.95, h * 0.15,
          w * 0.4, h * 0.85
        );
        if (isMain) {
          grad.addColorStop(0, '#2fa6dc');     // 右侧清爽天蓝
          grad.addColorStop(0.3, '#4bc6ea');   // 顶部过渡浅蔚蓝
          grad.addColorStop(0.7, '#62e2ef');   // 左侧明澈青碧
          grad.addColorStop(1, '#78f4ee');     // 尾部清新荧光浅青
        } else {
          grad.addColorStop(0, '#2fa6dc');
          grad.addColorStop(1, '#4bc6ea');
        }

        ctx.strokeStyle = grad;

        // 沿样条弧长绘制至目标截断点
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        let drawnEnd = false;
        for (let k = 1; k < points.length; k++) {
          if (lengths[k] >= targetDist) {
            const prevLen = lengths[k - 1];
            const segLen = lengths[k] - prevLen;
            const alpha = segLen > 0 ? (targetDist - prevLen) / segLen : 0;
            const endX = points[k - 1].x + (points[k].x - points[k - 1].x) * alpha;
            const endY = points[k - 1].y + (points[k].y - points[k - 1].y) * alpha;
            ctx.lineTo(endX, endY);
            drawnEnd = true;
            break;
          } else {
            ctx.lineTo(points[k].x, points[k].y);
          }
        }

        if (!drawnEnd) {
          const last = points[points.length - 1];
          ctx.lineTo(last.x, last.y);
        }

        ctx.stroke();
        ctx.restore();
      };

      // 仅当用户向下滚动时平滑绘制线条，完全静态无抖动
      if (progress > 0.003) {
        const isMobile = w < 768;
        const mainWidth = isMobile ? 26 : 46;
        
        // 副丝带稍后介入
        const secProgress = Math.min(1, Math.max(0, (progress - 0.1) / 0.7));
        if (secProgress > 0) {
          drawProgressSpline(secondaryPointsRef.current, mainWidth * 0.85, secProgress, false);
        }
        drawProgressSpline(pointsRef.current, mainWidth, progress, true);
      }
    };

    loop();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 w-full h-full block select-none pointer-events-none"
    />
  );
};
