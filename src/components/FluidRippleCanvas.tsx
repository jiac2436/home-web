import React, { useEffect, useRef, useCallback } from 'react';

interface FluidRippleCanvasProps {
  dotSpacing?: number;
  dotRadius?: number;
}

export const FluidRippleCanvas: React.FC<FluidRippleCanvasProps> = ({
  dotSpacing = 24,
  dotRadius = 1.25,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 物理模拟双缓冲（Ping-Pong Buffer）与网格配置
  const simScale = 4; // 模拟分辨率为屏幕 1/4，兼具极致细腻度与 120fps 极速计算
  const simWidthRef = useRef<number>(0);
  const simHeightRef = useRef<number>(0);
  const buffer1Ref = useRef<Float32Array | null>(null);
  const buffer2Ref = useRef<Float32Array | null>(null);
  const isDormantRef = useRef<boolean>(false);
  const energyRef = useRef<number>(0);

  const animFrameIdRef = useRef<number | null>(null);
  const lastMouseRef = useRef<{ x: number; y: number } | null>(null);

  /**
   * 初始化尺寸与波动网格
   */
  const initSimulation = useCallback((width: number, height: number) => {
    const simW = Math.max(32, Math.floor(width / simScale));
    const simH = Math.max(32, Math.floor(height / simScale));
    simWidthRef.current = simW;
    simHeightRef.current = simH;

    const size = simW * simH;
    buffer1Ref.current = new Float32Array(size);
    buffer2Ref.current = new Float32Array(size);
    energyRef.current = 0;
    isDormantRef.current = false;
  }, []);

  /**
   * 向水面注入扰动脉冲（支持插值注入，消除快速滑动断痕）
   */
  const addImpulse = useCallback((screenX: number, screenY: number, radius: number, strength: number) => {
    const simW = simWidthRef.current;
    const simH = simHeightRef.current;
    const buf = buffer1Ref.current;
    if (!buf || simW === 0 || simH === 0) return;

    const cx = Math.floor((screenX / simScale));
    const cy = Math.floor((screenY / simScale));
    const r = Math.max(1, Math.floor(radius / simScale));
    const rSq = r * r;

    const xMin = Math.max(1, cx - r);
    const xMax = Math.min(simW - 2, cx + r);
    const yMin = Math.max(1, cy - r);
    const yMax = Math.min(simH - 2, cy + r);

    for (let y = yMin; y <= yMax; y++) {
      const dySq = (y - cy) * (y - cy);
      const rowOffset = y * simW;
      for (let x = xMin; x <= xMax; x++) {
        const distSq = (x - cx) * (x - cx) + dySq;
        if (distSq <= rSq) {
          // 高斯平滑扩散冲量
          const falloff = Math.exp(-distSq / (rSq * 0.45));
          buf[rowOffset + x] += strength * falloff;
        }
      }
    }

    energyRef.current += Math.abs(strength) * 10;
    isDormantRef.current = false;
  }, []);

  // 沿两点线段插值注入水波脉冲
  const addLineImpulses = useCallback((
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    radius: number,
    strength: number
  ) => {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.hypot(dx, dy);
    const step = Math.max(4, radius * 0.4);
    const count = Math.ceil(dist / step);

    for (let i = 0; i <= count; i++) {
      const t = count === 0 ? 0 : i / count;
      addImpulse(x0 + dx * t, y0 + dy * t, radius, strength);
    }
  }, [addImpulse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
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

      initSimulation(w, h);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // 监听男孩触地激浪事件
    const handleMascotLanding = (e: Event) => {
      const customEvent = e as CustomEvent<{
        originX?: number;
        originY?: number;
        power?: number;
      }>;
      const { originX, originY, power = 2.8 } = customEvent.detail || {};
      if (originX !== undefined && originY !== undefined) {
        // 脚底激荡出同心涟漪波
        addImpulse(originX, originY, 40, power * 2.2);
        // 延后发射次级微波圈
        setTimeout(() => addImpulse(originX, originY, 25, power * 1.4), 80);
      }
    };
    window.addEventListener('trigger-dandelion-breeze', handleMascotLanding);

    // 渲染与物理主循环
    const loop = () => {
      animFrameIdRef.current = requestAnimationFrame(loop);

      const w = window.innerWidth;
      const h = window.innerHeight;
      const simW = simWidthRef.current;
      const simH = simHeightRef.current;
      const b1 = buffer1Ref.current;
      const b2 = buffer2Ref.current;

      if (!b1 || !b2 || simW === 0 || simH === 0) return;

      // 1. 二维浅水波动方程推进
      let currentTotalEnergy = 0;
      const damping = 0.966; // 粘滞阻尼系数（约 1.5 秒自然消散复原）

      for (let y = 1; y < simH - 1; y++) {
        const row = y * simW;
        const rowUp = (y - 1) * simW;
        const rowDown = (y + 1) * simW;

        for (let x = 1; x < simW - 1; x++) {
          const idx = row + x;
          // 经典波动拉普拉斯算子：四周高度均值 - 上一刻高度
          const wave = ((b1[idx - 1] + b1[idx + 1] + b1[rowUp + x] + b1[rowDown + x]) * 0.5) - b2[idx];
          const damped = wave * damping;
          b2[idx] = damped;
          currentTotalEnergy += Math.abs(damped);
        }
      }

      // Ping-Pong 交换双缓冲
      buffer1Ref.current = b2;
      buffer2Ref.current = b1;
      energyRef.current = currentTotalEnergy;

      // 2. 清空画布背景为极简高纯白
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // 3. 光学级点阵折射渲染 (Optical Dot Refraction)
      // 计算每个网格点法线，并将黑色微点根据水波倾角发生物理折射偏折
      const maxDisp = 8.5; // 最大折射位移像素
      const startX = (w % dotSpacing) * 0.5;
      const startY = (h % dotSpacing) * 0.5;

      const activeBuf = buffer1Ref.current;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';

      for (let py = startY; py < h; py += dotSpacing) {
        // 映射到模拟网格坐标
        const sy = Math.min(simH - 2, Math.max(1, Math.floor(py / simScale)));
        const rowOffset = sy * simW;

        for (let px = startX; px < w; px += dotSpacing) {
          const sx = Math.min(simW - 2, Math.max(1, Math.floor(px / simScale)));
          const idx = rowOffset + sx;

          // 计算水面梯度法线 (Gradient / Surface Normal)
          const nx = (activeBuf[idx + 1] - activeBuf[idx - 1]) * 0.5;
          const ny = (activeBuf[idx + simW] - activeBuf[idx - simW]) * 0.5;

          // 透镜物理折射偏折
          const dispX = px + Math.max(-maxDisp, Math.min(maxDisp, nx * 6.5));
          const dispY = py + Math.max(-maxDisp, Math.min(maxDisp, ny * 6.5));

          // 绘制折射后的黑点
          ctx.beginPath();
          ctx.arc(dispX, dispY, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Lusion.co 风格半透明水光高光层（Specular Sheen & Fresnel）
      // 仅在水面有能量起伏时，沿波峰叠加通透极淡的柔光微光
      if (currentTotalEnergy > 10) {
        const step = dotSpacing * 0.75;
        ctx.save();
        for (let py = 12; py < h; py += step) {
          const sy = Math.min(simH - 2, Math.max(1, Math.floor(py / simScale)));
          const rowOffset = sy * simW;

          for (let px = 12; px < w; px += step) {
            const sx = Math.min(simW - 2, Math.max(1, Math.floor(px / simScale)));
            const idx = rowOffset + sx;
            const hVal = activeBuf[idx];

            if (hVal > 0.35) {
              // 波峰高光：模拟来自左上方的柔和环境天光
              const nx = (activeBuf[idx + 1] - activeBuf[idx - 1]) * 0.5;
              const ny = (activeBuf[idx + simW] - activeBuf[idx - simW]) * 0.5;
              const specular = Math.max(0, -0.6 * nx - 0.8 * ny);

              if (specular > 0.05) {
                const alpha = Math.min(0.28, specular * 0.35 * Math.min(hVal, 1.5));
                const glowR = Math.min(step * 0.9, 14);
                const grad = ctx.createRadialGradient(px, py, 0, px, py, glowR);
                grad.addColorStop(0, `rgba(186, 230, 253, ${alpha})`); // 浅天蓝微水光
                grad.addColorStop(0.6, `rgba(224, 242, 254, ${alpha * 0.4})`);
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(px, py, glowR, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }
        ctx.restore();
      }
    };

    loop();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('trigger-dandelion-breeze', handleMascotLanding);
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [dotRadius, dotSpacing, initSimulation, addImpulse]);

  // 鼠标与触控移动交互
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (lastMouseRef.current) {
      const dx = x - lastMouseRef.current.x;
      const dy = y - lastMouseRef.current.y;
      const speed = Math.hypot(dx, dy);

      // 根据移动速度自适应水波强度与波纹半径
      const strength = Math.min(2.8, Math.max(0.45, speed * 0.065));
      const radius = Math.min(32, Math.max(16, speed * 0.35));

      addLineImpulses(lastMouseRef.current.x, lastMouseRef.current.y, x, y, radius, strength);
    } else {
      addImpulse(x, y, 20, 0.8);
    }

    lastMouseRef.current = { x, y };
  };

  const handlePointerLeave = () => {
    lastMouseRef.current = null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    lastMouseRef.current = { x, y };
    // 点击激发一圈强水波
    addImpulse(x, y, 30, 2.5);

    // 点击男孩区域重播起跳
    const isMobile = window.innerWidth < 768;
    const mascotRight = isMobile ? 16 : 48;
    const mascotW = 164;
    const mascotH = 220;
    const mascotX = window.innerWidth - mascotW - mascotRight;
    const mascotY = window.innerHeight - mascotH - 8;

    if (
      x >= mascotX &&
      x <= mascotX + mascotW &&
      y >= mascotY &&
      y <= mascotY + mascotH
    ) {
      window.dispatchEvent(new CustomEvent('replay-mascot-jump'));
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      className="fixed inset-0 z-0 w-full h-full block touch-none select-none cursor-default"
      title="在点阵上划动鼠标，感受如水清波与点阵折射"
    />
  );
};
