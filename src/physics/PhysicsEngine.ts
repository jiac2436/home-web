import { DandelionParticle } from './DandelionParticle';
import type { ParticleTheme } from '../types';

/**
 * 蒲公英物理动力学引擎控制器
 * 集中计算流场、页面滚动风阻耦合、环境湍流与多层粒子生命周期
 */
export class PhysicsEngine {
  private particles: DandelionParticle[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private isRunning: boolean = false;
  private theme: ParticleTheme = 'maple';

  // 尺寸
  private width: number = 0;
  private height: number = 0;

  // 滚动风场状态
  private scrollWindY: number = 0;
  private targetScrollWindY: number = 0;
  private lastScrollY: number = 0;
  private lastScrollTime: number = 0;

  // 环境风场与时间
  private globalTime: number = 0;
  private ambientWindX: number = 0;

  // 鼠标交互风场
  private mouseX: number = -9999;
  private mouseY: number = -9999;
  private mouseSpeed: number = 0;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;

  // 粒子总数配置
  private readonly particleCount: number;

  constructor(canvas: HTMLCanvasElement, particleCount = 85) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) {
      throw new Error('Canvas 2D context not supported');
    }
    this.ctx = context;
    this.particleCount = particleCount;

    this.resize();
    this.initParticles();
    this.bindEvents();
  }

  /**
   * 初始化粒子群并分层分布
   */
  private initParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      // 30% 背景层(模糊轻微), 45% 中景层, 25% 前景层(高清微透)
      const layer = i < this.particleCount * 0.3 ? 'bg' : i < this.particleCount * 0.75 ? 'mid' : 'fg';
      const p = new DandelionParticle(this.width, this.height, layer);
      this.particles.push(p);
    }
  }

  /**
   * 视口调整
   */
  public resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
  }

  /**
   * 绑定滚动与交互事件
   */
  private bindEvents = () => {
    this.lastScrollY = window.scrollY || window.pageYOffset || 0;
    this.lastScrollTime = performance.now();

    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('wheel', this.handleWheel, { passive: true });
    window.addEventListener('resize', this.handleResize, { passive: true });
    window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
  };

  /**
   * 唤醒地面休眠的蒲公英起飞
   */
  private triggerLiftoff = (power: number) => {
    const liftoffChance = Math.min(0.35 + power * 0.05, 0.95);
    for (const p of this.particles) {
      if (p.isGrounded && Math.random() < liftoffChance) {
        p.isGrounded = false;
        // 赋予轻盈向上的起飞初速度与自然微风散开量
        p.vy = - (2.5 + Math.random() * 4.5) * Math.min(power / 6, 2.0);
        p.vx += (Math.random() - 0.5) * 2.2;
      }
    }
  };

  /**
   * 捕获鼠标滚轮/触控板滑动（无论在页面何处滑动均能瞬间产生空气流场）
   */
  private handleWheel = (e: WheelEvent) => {
    const rawDelta = e.deltaY;
    if (rawDelta > 0) {
      // 向下滚动页面（产生向上吹拂的强风）
      const lift = -Math.min(Math.abs(rawDelta) * 0.15, 18);
      this.targetScrollWindY = Math.min(this.targetScrollWindY, lift);
      this.triggerLiftoff(Math.abs(lift));
    } else if (rawDelta < 0) {
      // 向上滚动页面（产生向下的回流压制风）
      const downForce = Math.min(Math.abs(rawDelta) * 0.1, 10);
      this.targetScrollWindY = Math.max(this.targetScrollWindY, downForce);
    }
  };

  /**
   * 页面滚动响应：向下滑动引发强烈的向上相对气流，向上滑动产生向下压流
   */
  private handleScroll = () => {
    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    const now = performance.now();
    const dt = Math.max(now - this.lastScrollTime, 16);

    const deltaY = currentScrollY - this.lastScrollY;
    this.lastScrollY = currentScrollY;
    this.lastScrollTime = now;

    if (Math.abs(deltaY) > 0.5) {
      const scrollVelocity = (deltaY / dt) * 16; // 归一化到 60fps 单帧位移

      if (scrollVelocity > 0) {
        // 向下滚动，产生强劲向上气流
        const lift = -Math.min(scrollVelocity * 0.9, 20);
        this.targetScrollWindY = Math.min(this.targetScrollWindY, lift);
        this.triggerLiftoff(Math.abs(lift));
      } else if (scrollVelocity < 0) {
        // 向上滚动页面，气流下压，让浮空种子快速降落
        const downForce = Math.min(-scrollVelocity * 0.6, 12);
        this.targetScrollWindY = Math.max(this.targetScrollWindY, downForce);
      }
    }
  };

  private handleResize = () => {
    this.resize();
    // 保持地面种子始终贴紧新视口底部
    for (const p of this.particles) {
      if (p.isGrounded) {
        p.groundY = this.height - 10 - Math.random() * 50;
        p.y = p.groundY;
      }
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - this.lastMouseX;
    const dy = e.clientY - this.lastMouseY;
    this.mouseSpeed = Math.sqrt(dx * dx + dy * dy);
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    // 鼠标划过时，对周围的蒲公英产生空气扰流拖拽与径向推开
    if (this.mouseSpeed > 1.2) {
      const radius = 135;
      for (const p of this.particles) {
        const distSq = (p.x - this.mouseX) ** 2 + (p.y - this.mouseY) ** 2;
        if (distSq < radius * radius) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / radius);

          // 径向扩散（从光标中心向外推开）
          const nx = (p.x - this.mouseX) / (dist || 1);
          const ny = (p.y - this.mouseY) / (dist || 1);

          // 光标移动产生的流场拖拽（上下左右跟随）
          const speedFactor = Math.min(this.mouseSpeed * 0.08, 3.0);
          const dragVx = (dx / (this.mouseSpeed || 1)) * speedFactor;
          const dragVy = (dy / (this.mouseSpeed || 1)) * speedFactor;

          p.isGrounded = false;
          // 水平方向：径向推开 + 气流随动
          p.vx += nx * 1.5 * force + dragVx * 1.2;
          // 垂直方向：光标向上扬起或向下按压 + 径向推开
          p.vy += ny * 1.2 * force + dragVy * 1.2;

          // 若靠近地面且有向下速度，给予向上扬起的反弹微风，避免陷入地面
          if (p.y > this.height - 80 && p.vy > 0) {
            p.vy = -Math.abs(p.vy) * 0.5 - 1.2 * force;
          }
        }
      }
    }
  };

  /**
   * 切换粒子外观形态 (蒲公英 / 羽毛 / 花瓣)
   */
  public setTheme(theme: ParticleTheme) {
    this.theme = theme;
  }

  /**
   * 手动触发一阵轻风（供 UI 按钮或交互彩蛋使用）
   */
  public triggerBreeze(power = 1.0) {
    this.targetScrollWindY = -12 * power;
    // 为每个种子施加微小随机横向力与抬升力
    for (const p of this.particles) {
      if (Math.random() < 0.85) {
        p.isGrounded = false;
        p.vy = - (3 + Math.random() * 6) * power;
        p.vx += (Math.random() - 0.5) * 4 * power;
      }
    }
  }

  /**
   * 角色落地局部物理冲击：仅激起人物落脚点附近的蒲公英，向四周扩散炸开并升空
   */
  public triggerLandingImpact(originX: number, originY: number, radius = 280, power = 2.6) {
    for (const p of this.particles) {
      const dx = p.x - originX;
      const dy = p.y - originY;
      const distSq = dx * dx + dy * dy;

      if (distSq < radius * radius) {
        const dist = Math.sqrt(distSq);
        const force = Math.pow(1 - dist / radius, 1.3);

        p.isGrounded = false;
        // 水平方向：从脚底向两侧炸开
        const nx = dx / (dist || 1);
        p.vx += nx * (2.8 + Math.random() * 3.5) * power * force;
        // 垂直方向：强劲向上激起
        p.vy = - (4.0 + Math.random() * 5.0) * power * force;
        // 施加轻微转角冲击
        p.angularVelocity += nx * 0.12 * force;
      }
    }
  }

  /**
   * 启动动画循环
   */
  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    let lastFrameTime = performance.now();

    const loop = (currentTime: number) => {
      if (!this.isRunning) return;

      const deltaMs = Math.min(currentTime - lastFrameTime, 40);
      const dt = deltaMs / 16.666; // 归一化为 60fps 步长
      lastFrameTime = currentTime;

      this.step(dt);
      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  /**
   * 停止物理模拟
   */
  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /**
   * 销毁引擎并解绑监听
   */
  public destroy() {
    this.stop();
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('wheel', this.handleWheel);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  /**
   * 核心单步物理与画面渲染
   */
  private step(dt: number) {
    this.globalTime += 0.015 * dt;

    // 1. 风场阻尼过渡计算
    // 气流平滑上升并在停止操作后约 1.5 秒内柔和消散，迅速让位于真实自然重力
    this.scrollWindY += (this.targetScrollWindY - this.scrollWindY) * 0.1 * dt;
    this.targetScrollWindY *= Math.pow(0.952, dt);

    // 环境微风（超低频舒缓横向流场）
    this.ambientWindX = Math.sin(this.globalTime * 0.25) * 0.22 + Math.sin(this.globalTime * 0.55) * 0.12;

    // 2. 清空画布
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 3. 按照景深分批更新并绘制（先画背景层，最后画前景层）
    const totalWindY = this.scrollWindY;
    const totalWindX = this.ambientWindX;
    let airborneCount = 0;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.isGrounded) {
        airborneCount++;
      }

      // 景深视差因子：背景层受风影响更慢更缓，前景层受风响应更直观
      const parallaxFactor = p.depthLayer === 'fg' ? 1.15 : p.depthLayer === 'mid' ? 1.0 : 0.75;
      const effectiveWindY = totalWindY * parallaxFactor;
      const effectiveWindX = totalWindX * parallaxFactor;

      p.update(dt, effectiveWindX, effectiveWindY, this.width, this.height);
      p.render(this.ctx, this.theme);
    }

    // 4. 静止无风状态下的自然重力降落补充机制
    // 当屏幕静止（scrollWindY 接近 0）且空中飘落粒子少于 30% 时，
    // 周期性地唤醒地面种子从屏幕上方重获新生，以真实重力持续向下飘落，确保静止时背景始终有优美沉静的重力下落动态
    if (Math.abs(this.scrollWindY) < 0.25 && airborneCount < this.particleCount * 0.3) {
      if (Math.random() < 0.04 * dt) {
        for (let i = 0; i < this.particles.length; i++) {
          const p = this.particles[i];
          if (p.isGrounded) {
            p.isGrounded = false;
            p.y = -25 - Math.random() * 35;
            p.x = Math.random() * this.width;
            p.vy = (1.0 + Math.random() * 0.4) * p.scale;
            p.vx = (Math.random() - 0.5) * 0.6;
            break;
          }
        }
      }
    }
  }
}
