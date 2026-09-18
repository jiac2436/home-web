import type { ParticleTheme } from '../types';

/**
 * 高级空气动力学粒子模型
 * 支持「高保真羽状蒲公英」、「轻盈柔光羽毛」和「琉璃花瓣」三种自然失重物理形态
 */
export class DandelionParticle {
  // 空间与运动状态
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public angle: number = 0; // 弧度，主轴倾角
  public angularVelocity: number = 0;
  public rollPhase: number = 0; // 模拟三维翻滚自转的投影相位

  // 物理与几何属性
  public scale: number;
  public mass: number;
  public dragCoeff: number;
  public groundY: number;
  public isGrounded: boolean = true;
  public restingWobbleOffset: number;

  // 视觉参数
  public stemLength: number;
  public pappusRadius: number;
  public seedLength: number;
  public seedWidth: number;
  public alpha: number;
  public depthLayer: 'bg' | 'mid' | 'fg';

  // 摆动相位与自然周期（双谐波黄金分割，消除机械感）
  public swayPhase1: number;
  public swayPhase2: number;
  public swaySpeed1: number;
  public swaySpeed2: number;
  public swayAmplitude: number;
  public stalkBend: number = 0;
  public rollSpeed: number;
  public colorVariant: number;

  constructor(width: number, height: number, depthLayer?: 'bg' | 'mid' | 'fg') {
    this.colorVariant = Math.random();

    // 随机景深层级（营造 3D 纵深感）
    this.depthLayer = depthLayer || (Math.random() < 0.25 ? 'fg' : Math.random() < 0.65 ? 'mid' : 'bg');

    // 尺寸在当前基础上放大 50%（即原基准的 45%），同时保留前景/中景/远景三层纵深与随机浮动（依然保持有大有小）
    if (this.depthLayer === 'fg') {
      this.scale = (0.95 + Math.random() * 0.35) * 0.45; // 约 0.43 ~ 0.58（大号前景）
      this.alpha = 0.90 + Math.random() * 0.10;
      this.mass = 1.05 + Math.random() * 0.25;
      this.dragCoeff = 0.04;
    } else if (this.depthLayer === 'mid') {
      this.scale = (0.68 + Math.random() * 0.28) * 0.45; // 约 0.31 ~ 0.43（中号中景）
      this.alpha = 0.72 + Math.random() * 0.18;
      this.mass = 0.85 + Math.random() * 0.2;
      this.dragCoeff = 0.044;
    } else {
      this.scale = (0.42 + Math.random() * 0.25) * 0.45; // 约 0.19 ~ 0.30（小号远景）
      this.alpha = 0.45 + Math.random() * 0.25;
      this.mass = 0.65 + Math.random() * 0.15;
      this.dragCoeff = 0.048;
    }

    // 尺寸比例
    this.stemLength = (26 + Math.random() * 10) * this.scale;
    this.pappusRadius = (20 + Math.random() * 8) * this.scale;
    this.seedLength = (7 + Math.random() * 3) * this.scale;
    this.seedWidth = 1.8 * this.scale;

    // 初始位置：65% 散落沉睡在视口底部，35% 处于空中随重力沉降优雅飘零
    this.x = Math.random() * width;
    const groundBase = height - 12 - Math.random() * 50;
    this.groundY = groundBase;

    const depthSpeedFactor = this.depthLayer === 'fg' ? 1.3 : this.depthLayer === 'mid' ? 1.05 : 0.82;
    if (Math.random() < 0.65) {
      this.y = groundBase;
      this.isGrounded = true;
    } else {
      this.y = Math.random() * (height * 0.8);
      this.isGrounded = false;
      this.vy = (0.9 + Math.random() * 0.3) * depthSpeedFactor;
      this.vx = (Math.random() - 0.5) * 0.6;
    }

    this.restingWobbleOffset = Math.random() * Math.PI * 2;
    // 双频黄金分割波（周期在 3.5s ~ 6s，极其舒缓自然）
    this.swayPhase1 = Math.random() * Math.PI * 2;
    this.swayPhase2 = Math.random() * Math.PI * 2;
    this.swaySpeed1 = 0.012 + Math.random() * 0.008;
    this.swaySpeed2 = this.swaySpeed1 * 1.618;
    this.swayAmplitude = 0.16 + Math.random() * 0.08; // 约 9° ~ 14° 的优雅微倾

    this.rollPhase = Math.random() * Math.PI * 2;
    this.rollSpeed = 0.012 + Math.random() * 0.018;

    this.angle = (Math.random() - 0.5) * 0.2;
  }

  public resetToBottom(width: number, height: number, randomX = true) {
    if (randomX) {
      this.x = Math.random() * width;
    }
    this.groundY = height - 10 - Math.random() * 50;
    this.y = this.groundY;
    this.vx = 0;
    this.vy = 0;
    this.isGrounded = true;
    this.angle = (Math.random() - 0.5) * 0.2;
    this.angularVelocity = 0;
    this.stalkBend = 0;
  }

  public update(dt: number, windX: number, windY: number, width: number, height: number) {
    this.swayPhase1 += this.swaySpeed1 * dt;
    this.swayPhase2 += this.swaySpeed2 * dt;
    this.rollPhase += this.rollSpeed * dt;

    // 1. 地面状态处理与起飞判定
    const liftThreshold = -0.22 * (this.mass / 0.9);
    if (this.isGrounded) {
      if (windY < liftThreshold) {
        this.isGrounded = false;
        // 起飞：获得向上冲量，伴随微小水平出航速度
        this.vy = windY * (0.65 + Math.random() * 0.25);
        this.vx += windX * 0.5 + (Math.random() - 0.5) * 0.8;
      } else {
        // 在地面随微风极其轻微地休眠呼吸
        const groundBreeze = Math.sin(this.swayPhase1 + this.restingWobbleOffset) * 0.08;
        this.angle = groundBreeze + windX * 0.03;
        this.x += groundBreeze * 0.15;
        if (this.x < -20) this.x = width + 20;
        if (this.x > width + 20) this.x = -20;
        return;
      }
    }

    // 2. 空中轻盈失重与重力沉降动力学（Gravity & Aerodynamic Descent Mechanics）
    // 自然重力沉降终端速度（静止时的重力下落速度）：
    // 根据景深分层设定（前景 ~90px/s，中景 ~75px/s，远景 ~60px/s），保持优雅沉降手感
    const depthSpeedFactor = this.depthLayer === 'fg' ? 1.3 : this.depthLayer === 'mid' ? 1.05 : 0.82;
    const naturalTerminalVy = (0.95 + 0.25 * (this.mass / 1.0)) * depthSpeedFactor;

    // 当 windY < -0.15（页面向下滑动引发强烈相对上升气流）：
    // 克服重力，迅速升空
    if (windY < -0.15) {
      const liftDamping = 0.1 * dt;
      const targetVy = windY * 0.95;
      this.vy += (targetVy - this.vy) * liftDamping;
    } else if (windY > 0.15) {
      // 当 windY > 0.15（页面向上滑动引发相对下压气流）：
      // 重力与下压风叠加，更快下沉
      const downDamping = 0.08 * dt;
      const targetVy = naturalTerminalVy + windY * 0.75;
      this.vy += (targetVy - this.vy) * downDamping;
    } else {
      // 当静止无风（windY 接近 0）：
      // 重力恒定主导！平缓过渡到自然重力沉降速度 naturalTerminalVy
      const gravityDamping = 0.055 * dt;
      this.vy += (naturalTerminalVy - this.vy) * gravityDamping;
    }

    // 3. 左右空气动力学滑翔（Aerodynamic Gliding）
    // 自然界中，落体倾斜时空气对伞面产生侧向滑翔力，使落体沿着倾角方向优雅滑移
    const naturalTilt = (Math.sin(this.swayPhase1) * 0.72 + Math.sin(this.swayPhase2) * 0.28) * this.swayAmplitude;
    // 目标角度：结合自正倾角与水平速度迎风角，平滑过渡
    const targetAngle = naturalTilt + (windX * 0.15);
    this.angle += (targetAngle - this.angle) * 0.045 * dt;

    // 倾角驱动的平滑水平滑翔速度（下落速度带来真实的左右滑翔）
    const glideVx = Math.sin(this.angle) * (1.1 + Math.abs(this.vy) * 0.6);
    const targetVx = glideVx + windX;
    this.vx += (targetVx - this.vx) * 0.04 * dt;

    // 4. 垂直位移计算：
    // - 上升阶段（vy < 0）：自由向上攀升
    // - 下落阶段（vy > 0）：横向滑翔带来轻柔空气浮力微缓冲，但始终保持清晰的重力下落感
    let effectiveVy = this.vy;
    if (this.vy > 0) {
      const glideLift = Math.min(Math.abs(this.vx) * 0.12, this.vy * 0.25);
      effectiveVy = Math.max(0.55 * depthSpeedFactor, this.vy - glideLift);
    }

    // 5. 更新坐标
    this.x += this.vx * dt;
    this.y += effectiveVy * dt;

    // 6. 果梗惯性滞后（随运动柔韧微弯，而非生硬振荡）
    const targetBend = -this.vx * 3.5 * this.scale;
    this.stalkBend += (targetBend - this.stalkBend) * 0.08 * dt;

    // 7. 循环与地面降落
    if (this.y < -this.stemLength - this.pappusRadius - 40) {
      if (windY < -0.5) {
        // 向上强风持续时，从底部重新循环补充，形成连绵不绝的升空效果
        this.y = height + 10 + Math.random() * 30;
        this.x = Math.random() * width;
        this.vy = windY * (0.45 + Math.random() * 0.35);
        this.vx = (Math.random() - 0.5) * 1.5;
        this.isGrounded = false;
      } else {
        // 气流平息后，从屏幕上方以重力沉降速度优雅飘落回视口
        this.y = -20 - Math.random() * 30;
        this.x = Math.random() * width;
        this.vy = naturalTerminalVy * 0.85;
        this.isGrounded = false;
      }
    }

    if (this.y >= this.groundY && this.vy >= 0) {
      this.y = this.groundY;
      this.vy = 0;
      this.vx *= 0.6;
      this.angle *= 0.5;
      if (Math.abs(windY) < 0.15) {
        this.isGrounded = true;
      }
    }

    if (this.x < -50) {
      this.x = width + 50;
    } else if (this.x > width + 50) {
      this.x = -50;
    }
  }

  /**
   * 粒子主渲染入口：根据当前主题模式渲染具体造型
   */
  public render(ctx: CanvasRenderingContext2D, theme: ParticleTheme = 'maple') {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (theme === 'maple') {
      this.renderMapleLeaf(ctx);
    } else if (theme === 'feather') {
      this.renderFeather(ctx);
    } else if (theme === 'petal') {
      this.renderPetal(ctx);
    } else {
      this.renderDandelion(ctx);
    }

    ctx.restore();
  }

  /**
   * 0. 金色枫叶 (Golden Autumn Maple Leaf)
   * 掌状五裂经典轮廓、秋日金灿渐变材质、微光透光质感、柔和投影与立体叶脉
   */
  private renderMapleLeaf(ctx: CanvasRenderingContext2D) {
    const alpha = this.alpha;
    const R = 44 * this.scale;
    // 3D 翻滚投影透视缩放（模拟树叶空中自然翻转）
    const rollScale = Math.cos(this.rollPhase) * 0.82 + 0.18;

    ctx.save();
    ctx.scale(rollScale, 1);

    // 根据粒子个性化色彩倾向分配金秋渐变层次
    const variant = this.colorVariant;
    let baseColor: string;
    let midColor: string;
    let tipColor: string;
    let outlineColor: string;
    let veinColor: string;
    let stemColor: string;

    if (variant < 0.35) {
      // 亮蜜金 (Radiant Honey Gold)
      baseColor = `rgba(254, 240, 138, ${alpha * 0.95})`;
      midColor = `rgba(251, 191, 36, ${alpha * 0.92})`;
      tipColor = `rgba(245, 158, 11, ${alpha * 0.88})`;
      outlineColor = `rgba(180, 83, 9, ${alpha * 0.75})`;
      veinColor = `rgba(161, 98, 7, ${alpha * 0.65})`;
      stemColor = `rgba(146, 64, 14, ${alpha * 0.9})`;
    } else if (variant < 0.75) {
      // 经典琥珀金 (Classic Amber Gold)
      baseColor = `rgba(253, 230, 138, ${alpha * 0.95})`;
      midColor = `rgba(245, 158, 11, ${alpha * 0.92})`;
      tipColor = `rgba(217, 119, 6, ${alpha * 0.9})`;
      outlineColor = `rgba(180, 83, 9, ${alpha * 0.8})`;
      veinColor = `rgba(146, 64, 14, ${alpha * 0.7})`;
      stemColor = `rgba(120, 53, 15, ${alpha * 0.95})`;
    } else {
      // 暖霞金橙 (Sunset Autumn Gold)
      baseColor = `rgba(254, 215, 170, ${alpha * 0.95})`;
      midColor = `rgba(249, 115, 22, ${alpha * 0.92})`;
      tipColor = `rgba(234, 88, 12, ${alpha * 0.88})`;
      outlineColor = `rgba(154, 52, 18, ${alpha * 0.8})`;
      veinColor = `rgba(154, 52, 18, ${alpha * 0.7})`;
      stemColor = `rgba(124, 45, 18, ${alpha * 0.95})`;
    }

    // 纯白背景上的柔和微投影，营造凌空漂浮的层次立体感
    ctx.shadowColor = 'rgba(217, 119, 6, 0.22)';
    ctx.shadowBlur = 5 * this.scale;
    ctx.shadowOffsetY = 2.5 * this.scale;

    // 叶片主材质放射渐变
    const leafGrad = ctx.createRadialGradient(0, -R * 0.4, 0, 0, -R * 0.4, R * 1.3);
    leafGrad.addColorStop(0, baseColor);
    leafGrad.addColorStop(0.5, midColor);
    leafGrad.addColorStop(1, tipColor);

    // 经典掌状五裂枫叶轮廓基准点（右半部分）
    const landmarksRight: [number, number][] = [
      [0.0, 0.0],
      [0.35, 0.18],
      [0.24, -0.06],
      [0.48, -0.08],
      [0.28, -0.22],
      [0.85, -0.35],
      [0.55, -0.52],
      [0.68, -0.62],
      [0.26, -0.54],
      [0.40, -0.80],
      [0.18, -0.88],
      [0.0, -1.25],
    ];

    ctx.fillStyle = leafGrad;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = Math.max(0.35, 0.9 * this.scale);

    ctx.beginPath();
    ctx.moveTo(0, 0);

    // 绘制右半侧叶缘（内收凹曲弧线）
    for (let i = 0; i < landmarksRight.length - 1; i++) {
      const p0 = landmarksRight[i];
      const p1 = landmarksRight[i + 1];
      const midX = (p0[0] + p1[0]) * 0.5 * 0.75;
      const midY = (-0.3 + ((p0[1] + p1[1]) * 0.5 - (-0.3)) * 0.75);
      ctx.quadraticCurveTo(midX * R, midY * R, p1[0] * R, p1[1] * R);
    }

    // 绘制左半侧叶缘（对称镜像反向）
    for (let i = landmarksRight.length - 1; i > 0; i--) {
      const p0 = landmarksRight[i];
      const p1 = landmarksRight[i - 1];
      const midX = - (p0[0] + p1[0]) * 0.5 * 0.75;
      const midY = (-0.3 + ((p0[1] + p1[1]) * 0.5 - (-0.3)) * 0.75);
      ctx.quadraticCurveTo(midX * R, midY * R, -p1[0] * R, p1[1] * R);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 取消阴影避免影响叶脉与叶柄的清晰度
    ctx.shadowColor = 'transparent';

    // 绘制叶柄 (Petiole)
    const stemLen = 0.42 * R;
    ctx.strokeStyle = stemColor;
    ctx.lineWidth = Math.max(0.6, 1.4 * this.scale);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(this.stalkBend * 0.4, stemLen * 0.5, 0, stemLen);
    ctx.stroke();

    // 绘制五条掌状主叶脉 (Palmate Primary Veins)
    ctx.strokeStyle = veinColor;
    ctx.lineWidth = Math.max(0.35, 0.9 * this.scale);

    // 主脉：中央、左右侧主脉、左右基部主脉
    const mainVeinTips: [number, number][] = [
      [0.0, -1.25],
      [0.85, -0.35],
      [-0.85, -0.35],
      [0.35, 0.18],
      [-0.35, 0.18],
    ];

    for (const [vx, vy] of mainVeinTips) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(vx * R * 0.92, vy * R * 0.92);
      ctx.stroke();
    }

    // 前景与中景粒子绘制精细次级叶脉
    if (this.depthLayer !== 'bg') {
      ctx.lineWidth = Math.max(0.25, 0.5 * this.scale);
      // 中央主脉两侧小侧脉
      const centerBranches = [
        [-0.15, -0.55], [0.15, -0.55],
        [-0.18, -0.85], [0.18, -0.85],
      ];
      for (const [bx, by] of centerBranches) {
        ctx.beginPath();
        ctx.moveTo(0, by * R * 0.7);
        ctx.lineTo(bx * R, by * R);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  /**
   * 1. 现代化写实 UI 蒲公英种子
   * 特征：羽状微纤毛分支（毛茸茸质感）、核心透光漫射光晕、微弧果喙与立体瘦果
   */
  private renderDandelion(ctx: CanvasRenderingContext2D) {
    const alpha = this.alpha;
    const stemL = this.stemLength;
    const papR = this.pappusRadius;
    const plumeCenterY = -stemL;

    // 1.1 冠毛核心透光柔白光晕 (Plume Base Ambient Glow)
    const haloRadius = papR * 0.45;
    const halo = ctx.createRadialGradient(0, plumeCenterY, 0, 0, plumeCenterY, haloRadius);
    halo.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.45})`);
    halo.addColorStop(0.5, `rgba(240, 248, 255, ${alpha * 0.15})`);
    halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, plumeCenterY, haloRadius, 0, Math.PI * 2);
    ctx.fill();

    // 1.2 果梗（Connecting Stalk / Beak）：细若游丝的半透明微白茎，带自然受力微弯
    ctx.strokeStyle = `rgba(240, 240, 235, ${alpha * 0.7})`;
    ctx.lineWidth = Math.max(0.45, 1.2 * this.scale);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const stalkBend = this.stalkBend;
    ctx.quadraticCurveTo(stalkBend, -stemL * 0.5, 0, plumeCenterY);
    ctx.stroke();

    // 1.3 核心小结（Node）
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
    ctx.beginPath();
    ctx.arc(0, plumeCenterY, Math.max(0.4, 1.4 * this.scale), 0, Math.PI * 2);
    ctx.fill();

    // 1.4 毛茸茸的羽状冠毛（Plumose Pappus）
    // 采用前后双层羽冠结构，每根主丝附带 3~5 根侧纤毛，彻底告别直辐条抽象感
    const rayCount = this.depthLayer === 'fg' ? 24 : this.depthLayer === 'mid' ? 18 : 14;
    const spread = Math.PI * 0.72; // ~130度向上伞形展开
    const startA = -Math.PI * 0.5 - spread * 0.5;
    const stepA = spread / (rayCount - 1);

    for (let i = 0; i < rayCount; i++) {
      const angle = startA + i * stepA;
      // 伞冠起伏自然变化
      const len = papR * (0.85 + 0.28 * Math.sin(i * 1.5 + this.swayPhase1 * 0.3));
      const endX = Math.cos(angle) * len;
      const endY = plumeCenterY + Math.sin(angle) * len;

      // 主羽枝
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.75})`;
      ctx.lineWidth = Math.max(0.35, 0.9 * this.scale);
      ctx.beginPath();
      ctx.moveTo(0, plumeCenterY);
      // 微弧度主干，显得柔韧
      const midX = endX * 0.5 + Math.sin(i) * 1.2 * this.scale;
      const midY = plumeCenterY + (endY - plumeCenterY) * 0.5;
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();

      // 关键写实特征：每根主枝两侧向外散生微小羽状绒毛（Plumose Barbs）
      if (this.depthLayer !== 'bg') {
        const barbCount = 3;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.42})`;
        ctx.lineWidth = Math.max(0.25, 0.5 * this.scale);

        for (let b = 1; b <= barbCount; b++) {
          const t = 0.35 + (b / (barbCount + 1)) * 0.55; // 分布在中上段
          const bx = endX * t;
          const by = plumeCenterY + (endY - plumeCenterY) * t;
          const barbLen = 3.5 * this.scale;

          // 侧枝朝斜上方展开
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + Math.cos(angle - 0.4) * barbLen, by + Math.sin(angle - 0.4) * barbLen);
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + Math.cos(angle + 0.4) * barbLen, by + Math.sin(angle + 0.4) * barbLen);
          ctx.stroke();
        }

        // 顶端微绒小聚球
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
        ctx.beginPath();
        ctx.arc(endX, endY, Math.max(0.3, 0.7 * this.scale), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 1.5 底部瘦果种子（Achene）：立体纺锤体、暖米金到深褐色渐变
    ctx.save();
    const sl = this.seedLength;
    const sw = this.seedWidth;

    // 种子渐变材质
    const seedGrad = ctx.createLinearGradient(-sw, 0, sw, sl);
    seedGrad.addColorStop(0, `rgba(212, 175, 122, ${alpha * 0.95})`); // 顶部浅暖金
    seedGrad.addColorStop(0.7, `rgba(146, 98, 57, ${alpha * 0.95})`);  // 中部暖褐
    seedGrad.addColorStop(1, `rgba(88, 53, 26, ${alpha * 0.95})`);    // 底部尖梢深褐

    ctx.fillStyle = seedGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    // 顶部小颈部
    ctx.lineTo(sw * 0.4, 0.8 * this.scale);
    // 纺锤膨胀并收尖
    ctx.quadraticCurveTo(sw * 1.1, sl * 0.45, 0, sl);
    ctx.quadraticCurveTo(-sw * 1.1, sl * 0.45, -sw * 0.4, 0.8 * this.scale);
    ctx.closePath();
    ctx.fill();

    // 种子微光高光线
    if (this.depthLayer === 'fg') {
      ctx.strokeStyle = `rgba(255, 235, 190, ${alpha * 0.65})`;
      ctx.lineWidth = 0.6 * this.scale;
      ctx.beginPath();
      ctx.moveTo(sw * 0.3, sl * 0.2);
      ctx.lineTo(sw * 0.1, sl * 0.65);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * 2. 轻盈微光羽毛 (Floating Luminous Feather)
   * 优雅流线、带羽轴微弯与羽片半透明微光，极强失重翻转感
   */
  private renderFeather(ctx: CanvasRenderingContext2D) {
    const alpha = this.alpha;
    const fLen = (this.stemLength + this.pappusRadius) * 1.25;
    const fWidth = 9 * this.scale;

    // 模拟沿主轴的 3D 翻转投影（视觉上呈现立体羽毛的自转）
    const rollScale = Math.cos(this.rollPhase) * 0.85 + 0.15;

    ctx.save();
    ctx.scale(rollScale, 1);

    // 2.1 羽毛微光背景晕
    const featherGlow = ctx.createRadialGradient(0, -fLen * 0.5, 0, 0, -fLen * 0.5, fWidth * 2);
    featherGlow.addColorStop(0, `rgba(224, 242, 254, ${alpha * 0.3})`);
    featherGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = featherGlow;
    ctx.beginPath();
    ctx.ellipse(0, -fLen * 0.5, fWidth * 2, fLen * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2.2 两侧羽片（Vanes）：半透明优美月牙羽弧
    const featherGrad = ctx.createLinearGradient(-fWidth, -fLen, fWidth, 0);
    featherGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.85})`);
    featherGrad.addColorStop(0.5, `rgba(220, 238, 255, ${alpha * 0.7})`);
    featherGrad.addColorStop(1, `rgba(186, 215, 245, ${alpha * 0.5})`);

    ctx.fillStyle = featherGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    // 左侧羽片（较宽）
    ctx.bezierCurveTo(-fWidth * 1.4, -fLen * 0.3, -fWidth * 1.2, -fLen * 0.75, 0, -fLen);
    // 右侧羽片（略窄，呈现不对称自然美）
    ctx.bezierCurveTo(fWidth * 0.9, -fLen * 0.75, fWidth * 1.0, -fLen * 0.3, 0, 0);
    ctx.fill();

    // 2.3 羽片肌理细纹 (Barbs texture)
    if (this.depthLayer !== 'bg') {
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.25})`;
      ctx.lineWidth = Math.max(0.25, 0.5 * this.scale);
      const count = 7;
      for (let i = 1; i < count; i++) {
        const y = - (i / count) * fLen;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(-fWidth * 0.8 * (1 - Math.abs(y / fLen - 0.5)), y - 3 * this.scale);
        ctx.moveTo(0, y);
        ctx.lineTo(fWidth * 0.65 * (1 - Math.abs(y / fLen - 0.5)), y - 3 * this.scale);
        ctx.stroke();
      }
    }

    // 2.4 中心羽轴（Quill / Shaft）
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
    ctx.lineWidth = Math.max(0.35, 1.2 * this.scale);
    ctx.beginPath();
    ctx.moveTo(0, 2 * this.scale);
    ctx.quadraticCurveTo(this.stalkBend * 0.7, -fLen * 0.5, 0, -fLen);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 3. 琉璃花瓣 (Glassmorphic Blossom Petal)
   * 晶莹剔透粉白质感、随风自转翻滚
   */
  private renderPetal(ctx: CanvasRenderingContext2D) {
    const alpha = this.alpha;
    const pSize = (this.stemLength + this.pappusRadius) * 0.65;
    const rollScale = Math.sin(this.rollPhase) * 0.9;

    ctx.save();
    ctx.scale(rollScale, 1);

    // 花瓣渐变材质
    const petalGrad = ctx.createRadialGradient(0, -pSize * 0.4, 0, 0, -pSize * 0.4, pSize);
    petalGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.85})`);
    petalGrad.addColorStop(0.4, `rgba(255, 215, 235, ${alpha * 0.65})`);
    petalGrad.addColorStop(0.9, `rgba(244, 182, 215, ${alpha * 0.45})`);
    petalGrad.addColorStop(1, `rgba(240, 160, 200, ${alpha * 0.15})`);

    ctx.fillStyle = petalGrad;
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
    ctx.lineWidth = Math.max(0.35, 0.8 * this.scale);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-pSize * 0.7, -pSize * 0.35, -pSize * 0.6, -pSize * 0.9, 0, -pSize);
    ctx.bezierCurveTo(pSize * 0.6, -pSize * 0.9, pSize * 0.7, -pSize * 0.35, 0, 0);
    ctx.fill();
    ctx.stroke();

    // 花瓣中心微细叶脉
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
    ctx.lineWidth = Math.max(0.25, 0.5 * this.scale);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(this.stalkBend * 0.5, -pSize * 0.5, 0, -pSize * 0.85);
    ctx.stroke();

    ctx.restore();
  }
}
