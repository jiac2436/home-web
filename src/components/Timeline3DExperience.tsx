import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

import { TIMELINE_PROJECTS, type TimelineProject } from '../data/timelineProjects';
export type { TimelineProject };

// ================= 着色器源码 =================
const beamVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vLocalX;
  void main() {
    vUv = uv;
    vLocalX = position.x;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const beamFragmentShader = `
  uniform float uTime;
  uniform float uDrawHeadX;
  uniform vec3 uColorCore;
  uniform vec3 uColorAmber;
  uniform vec3 uColorOrange;
  uniform vec3 uColorSmoke;
  uniform float uLayerOffset;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vLocalX;

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
          dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y
    );
  }

  void main() {
    float d = abs(vUv.y);
    if (d > 0.96) discard;

    // 动态绘制遮罩：左侧完全绘制，右侧平滑淡出，超过 uDrawHeadX 时截断
    float drawMask = uDrawHeadX > 160.0 ? 1.0 : (1.0 - smoothstep(uDrawHeadX - 16.0, uDrawHeadX + 8.0, vWorldPos.x));
    if (drawMask < 0.001) discard;

    float wX1 = vWorldPos.x * 0.045;
    float wX2 = vWorldPos.x * 0.095;
    float gravWave = 0.65 * sin(wX1 - uTime * 0.25 + uLayerOffset * 0.8) 
                   + 0.35 * sin(wX2 - uTime * 0.35 + 1.6);

    float edgeCurvatureWeight = smoothstep(0.05, 0.85, d);
    float waveDisplacement = gravWave * 0.20 * edgeCurvatureWeight;
    float wavyY = vUv.y + waveDisplacement;

    vec2 p = vec2(vWorldPos.x * 0.028 - uTime * 0.22 + uLayerOffset * 0.4, wavyY * 2.6);
    vec2 q = vec2(
      noise(p + vec2(0.0, -uTime * 0.08)),
      noise(p + vec2(3.6, 1.8) + vec2(0.0, uTime * 0.06))
    );
    vec2 r = vec2(
      noise(p + 2.6 * q + vec2(1.8, 4.5) - uTime * 0.06),
      noise(p + 2.6 * q + vec2(6.2, 2.1) + uTime * 0.05)
    );

    float nA = noise(p + 3.0 * r);
    float nB = noise(p * 2.5 + 1.8 * q);
    float ridgeA = 1.0 - abs(nA);
    float ridgeB = 1.0 - abs(nB);
    float plasma = (ridgeA * 0.65 + ridgeB * 0.35);
    plasma = pow(plasma, 1.4) * 1.35;

    float coreShift = (q.y * 0.12 + sin(vWorldPos.x * 0.032 - uTime * 0.16) * 0.035);
    float coreDist = abs(wavyY - coreShift);
    float coreThickness = 0.075 + 0.040 * ridgeA;
    float coreGlow = exp(-pow(coreDist / coreThickness, 2.2));
    float coreEnergy = coreGlow * (0.35 + 0.65 * ridgeA);

    float radialEnvelope = exp(-pow(d / 0.58, 2.0));
    float edgeSmoke = 0.82 + 0.18 * noise(vec2(vWorldPos.x * 0.016 - uTime * 0.10, wavyY * 1.6));
    float edgeCutoff = smoothstep(edgeSmoke, edgeSmoke - 0.25, d);
    float energy = plasma * radialEnvelope;

    vec3 colCrimson = vec3(0.58, 0.14, 0.03);
    vec3 colFire    = vec3(0.96, 0.40, 0.06);
    vec3 colAmber   = vec3(1.00, 0.72, 0.18);
    vec3 colCore    = vec3(1.00, 0.95, 0.78);

    vec3 col = mix(colCrimson, colFire, smoothstep(0.10, 0.52, energy));
    col = mix(col, colAmber, smoothstep(0.42, 0.88, energy));
    col = mix(col, colCore, clamp(coreEnergy * 0.84, 0.0, 0.90));

    float endFade = smoothstep(1000.0, 750.0, abs(vLocalX));
    float alpha = (energy * 0.50 + coreEnergy * 0.46) * edgeCutoff * endFade * drawMask;
    float layerWeight = 0.69;

    gl_FragColor = vec4(col * alpha * layerWeight, alpha * layerWeight);
  }
`;

const fogVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vLocalX;
  uniform float uTime;
  uniform float uPhase;

  void main() {
    vUv = uv;
    vLocalX = position.x;
    vec3 pos = position;
    vec4 wp = modelMatrix * vec4(pos, 1.0);
    float waveY = sin(wp.x * 0.030 - uTime * 0.15 + uPhase) * 1.8;
    float waveZ = cos(wp.x * 0.022 - uTime * 0.12 + uPhase * 1.4) * 1.3;
    wp.y += waveY;
    wp.z += waveZ;
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const fogFragmentShader = `
  uniform float uTime;
  uniform float uDrawHeadX;
  uniform float uLayerOffset;
  uniform vec3 uColorInner;
  uniform vec3 uColorMid;
  uniform vec3 uColorOuter;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vLocalX;

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
          dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y
    );
  }

  void main() {
    float d = abs(vUv.y);
    if (d > 0.88) discard;

    float drawMask = uDrawHeadX > 160.0 ? 1.0 : (1.0 - smoothstep(uDrawHeadX - 20.0, uDrawHeadX + 12.0, vWorldPos.x));
    if (drawMask < 0.001) discard;

    float envelope = smoothstep(0.88, 0.16, d);
    float spinePass = smoothstep(0.0, 0.08, d) * 0.35 + 0.65;
    float fogConcentration = envelope * spinePass;

    vec2 p = vec2(vWorldPos.x * 0.015 - uTime * 0.075, vUv.y * 1.6 + uLayerOffset);
    vec2 q = vec2(
      noise(p + vec2(0.0, uTime * 0.030)),
      noise(p + vec2(3.8, 1.7) - uTime * 0.025)
    );
    float nA = noise(p + 2.2 * q);
    float nB = noise(p * 2.0 + 3.0 * q);
    float smokeField = (nA * 0.65 + nB * 0.35) * 0.5 + 0.5;

    float softMist = pow(smokeField, 1.30);
    float wideHaze = exp(-pow(d / 0.52, 2.0)) * 0.45;
    float totalMist = fogConcentration * softMist * 1.25 + wideHaze * fogConcentration * 0.50;

    vec3 col = mix(uColorOuter, uColorMid, smoothstep(0.10, 0.55, totalMist));
    col = mix(col, uColorInner, smoothstep(0.38, 0.88, totalMist) * (1.0 - d * 0.55));

    float endFade = smoothstep(1000.0, 750.0, abs(vLocalX));
    float alpha = clamp(totalMist * 0.825, 0.0, 0.95) * endFade * drawMask;
    gl_FragColor = vec4(col * alpha * 1.5, alpha);
  }
`;

const emberVertexShader = `
  attribute vec4 aData;
  uniform float uTime;
  uniform float uDrawHeadX;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec3 pos = position;
    float speed = aData.z;
    float seed = aData.w;

    float flowX = mod(pos.x + uTime * speed * 4.2 + 1000.0, 2000.0) - 1000.0;
    pos.x = flowX;
    pos.y += sin(uTime * 0.8 + seed) * 0.8;
    pos.z += cos(uTime * 0.6 + seed * 1.2) * 0.6;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float sizeBase = (sin(seed * 4.3) * 0.5 + 0.5) * 3.4 + 1.8;
    gl_PointSize = sizeBase * (240.0 / -mvPosition.z);

    float drawMask = uDrawHeadX > 160.0 ? 1.0 : (1.0 - smoothstep(uDrawHeadX - 10.0, uDrawHeadX + 5.0, pos.x));
    float endFade = smoothstep(1000.0, 750.0, abs(flowX));
    float flicker = sin(uTime * (2.2 + fract(seed * 7.3) * 3.0) + seed) * 0.40 + 0.60;
    float edgeFade = smoothstep(11.0, 1.5, abs(pos.y));
    vAlpha = flicker * edgeFade * endFade * drawMask;
    vSeed = seed;
  }
`;

const emberFragmentShader = `
  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float r = length(coord) * 2.0;
    if (r > 1.0) discard;

    float intensity = exp(-r * r * 2.6);
    vec3 emberCol = mix(vec3(1.0, 0.48, 0.12), vec3(1.0, 0.82, 0.35), fract(vSeed * 13.7));
    if (fract(vSeed * 7.1) > 0.60) {
      emberCol = mix(emberCol, vec3(1.0, 0.98, 0.88), 0.85);
    }

    float finalAlpha = intensity * vAlpha * 2.025;
    gl_FragColor = vec4(emberCol * finalAlpha, finalAlpha);
  }
`;

const helixVertexShader = `
  attribute float aRibbonSide;
  uniform float uTime;
  uniform float uDrawHeadX;
  uniform float uRadius;
  uniform float uSpeed;
  uniform float uWavelength;
  uniform float uPhase;
  uniform float uTilt;
  uniform float uLifeSpeed;
  uniform float uLifeOffset;
  varying vec2 vUv;
  varying float vDepthZ;
  varying vec3 vWorldPos;
  varying float vEmergence;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float worldX = pos.x + modelMatrix[3][0];

    float lifeCycle = fract(uTime * uLifeSpeed * 0.16 + uLifeOffset);
    float temporalLife = smoothstep(0.08, 0.32, lifeCycle) * smoothstep(0.92, 0.68, lifeCycle);

    float packetOffset = mod(worldX - uTime * uSpeed * 30.0 + uPhase * 90.0, 260.0) - 130.0;
    float spatialEnvelope = smoothstep(60.0, 10.0, abs(packetOffset));
    float endFade = smoothstep(1000.0, 750.0, abs(pos.x));
    float drawMask = uDrawHeadX > 160.0 ? 1.0 : (1.0 - smoothstep(uDrawHeadX - 15.0, uDrawHeadX + 10.0, worldX));

    float emergence = spatialEnvelope * temporalLife * endFade * drawMask;
    vEmergence = emergence;

    float theta = worldX * uWavelength - uTime * uSpeed + uPhase;
    float currentRadius = uRadius * emergence;

    float helixY = sin(theta) * currentRadius;
    float helixZ = cos(theta) * currentRadius * 0.85 + sin(theta) * currentRadius * uTilt;

    vec3 centerPos = vec3(pos.x, helixY, helixZ);
    vec4 wp = modelMatrix * vec4(centerPos, 1.0);
    vWorldPos = wp.xyz;
    vDepthZ = helixZ;

    vec4 mvCenter = modelViewMatrix * vec4(centerPos, 1.0);
    mvCenter.y += aRibbonSide * (0.55 + 0.40 * emergence);
    gl_Position = projectionMatrix * mvCenter;
  }
`;

const helixFragmentShader = `
  uniform float uTime;
  uniform vec3 uColorHead;
  uniform vec3 uColorTail;
  varying vec2 vUv;
  varying float vDepthZ;
  varying vec3 vWorldPos;
  varying float vEmergence;

  void main() {
    if (vEmergence < 0.01) discard;

    float d = abs(vUv.y);
    float coreGlow = exp(-d * d * 4.2);
    float energyPulse = 0.70 + 0.30 * sin(vWorldPos.x * 0.09 - uTime * 2.4);

    vec3 col = mix(uColorTail, uColorHead, vEmergence);
    col *= energyPulse;

    float depthFactor = smoothstep(-15.0, 15.0, vDepthZ) * 0.45 + 0.55;
    float alpha = coreGlow * vEmergence * depthFactor * 0.85;
    gl_FragColor = vec4(col * alpha, alpha);
  }
`;

function createRibbonGeometry(length: number, segments: number) {
  const geo = new THREE.BufferGeometry();
  const numVerts = (segments + 1) * 2;
  const positions = new Float32Array(numVerts * 3);
  const uvs = new Float32Array(numVerts * 2);
  const ribbonSides = new Float32Array(numVerts);
  const indices: number[] = [];

  const halfLen = length / 2;
  const step = length / segments;

  for (let i = 0; i <= segments; i++) {
    const x = -halfLen + i * step;
    const u = i / segments;

    const idx1 = i * 2;
    positions[idx1 * 3 + 0] = x;
    positions[idx1 * 3 + 1] = 0;
    positions[idx1 * 3 + 2] = 0;
    uvs[idx1 * 2 + 0] = u;
    uvs[idx1 * 2 + 1] = -1.0;
    ribbonSides[idx1] = -1.0;

    const idx2 = i * 2 + 1;
    positions[idx2 * 3 + 0] = x;
    positions[idx2 * 3 + 1] = 0;
    positions[idx2 * 3 + 2] = 0;
    uvs[idx2 * 2 + 0] = u;
    uvs[idx2 * 2 + 1] = 1.0;
    ribbonSides[idx2] = 1.0;

    if (i < segments) {
      const a = idx1;
      const b = idx2;
      const c = (i + 1) * 2;
      const d = (i + 1) * 2 + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setAttribute('aRibbonSide', new THREE.BufferAttribute(ribbonSides, 1));
  geo.setIndex(indices);
  return geo;
}

// 预渲染柔光能量光晕材质（全局复用）
function createAuraTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  g.addColorStop(0.2, 'rgba(254, 240, 138, 0.80)');
  g.addColorStop(0.45, 'rgba(245, 158, 11, 0.40)');
  g.addColorStop(0.7, 'rgba(217, 119, 6, 0.12)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

// 生成 3D 浮空标牌 Sprite
function createMilestoneSprite(yearText: string, nameText: string, colorHex: number): THREE.Sprite {
  const c = document.createElement('canvas');
  c.width = 360;
  c.height = 150;
  const ctx = c.getContext('2d')!;
  const hexStr = `#${colorHex.toString(16).padStart(6, '0')}`;

  // 1. 半透明高科技深蓝毛玻璃底色 (80% 透明度)
  ctx.fillStyle = 'rgba(8, 14, 26, 0.20)';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(10, 10, 340, 130, 22);
  } else {
    ctx.rect(10, 10, 340, 130);
  }
  ctx.fill();

  // 2. 发光霓虹边框
  ctx.strokeStyle = hexStr;
  ctx.lineWidth = 3.2;
  ctx.shadowColor = hexStr;
  ctx.shadowBlur = 14;
  ctx.stroke();

  // 3. 年份大字
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(yearText, 180, 64);

  // 4. 战役主题标签
  ctx.fillStyle = hexStr;
  ctx.font = 'bold 23px sans-serif';
  ctx.fillText(nameText, 180, 110);

  const tex = new THREE.CanvasTexture(c);
  const spriteMat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(15, 6.25, 1);
  sprite.renderOrder = 25;
  return sprite;
}

interface NodeMeshItem {
  idx: number;
  xPos: number;
  group: THREE.Group;
  coreOrb: THREE.Mesh;
  crystalCage: THREE.LineSegments;
  auraSprite: THREE.Sprite;
  sprite: THREE.Sprite;
  hitMesh: THREE.Mesh;
  accentColor: number;
}

export interface Timeline3DExperienceProps {
  // 绘制进度 (0.0 ~ 1.0)
  drawProgress: number;
  // 是否处于当前活动模块
  isActive: boolean;
  // 穿越完成回调 (白光过载至 1.0 时触发)
  onWarpComplete?: () => void;
  // 在 01 节点继续向上滚次回溯回调
  onRollback?: () => void;
}

export const Timeline3DExperience: React.FC<Timeline3DExperienceProps> = ({
  drawProgress,
  isActive,
  onWarpComplete,
  onRollback,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 当前选中的战役索引 (0 ~ 5)
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentIdxRef = useRef(0);
  const isHudCollapsedRef = useRef(false);
  const [isHudCollapsed, setIsHudCollapsed] = useState(false);

  // 穿越状态 (0.0 ~ 1.0)
  const [warpProgress, setWarpProgress] = useState(0);
  const isWarpingRef = useRef(false);
  const readyForWarpRef = useRef(false);
  const warpCooldownUntilRef = useRef(0);

  const isActiveRef = useRef(isActive);
  useEffect(() => {
    isActiveRef.current = isActive;
    if (!isActive) {
      // 离开当前模块时，彻底复位内部白光与状态锁，确保下次回退进入时不白屏、不卡死！
      isWarpingRef.current = false;
      readyForWarpRef.current = false;
      setWarpProgress(0);
      targetDistanceRef.current = 70;
      targetOrbitThetaRef.current = 1.030;
      targetOrbitPhiRef.current = 0.020;
      orbitThetaRef.current = 1.030;
      orbitPhiRef.current = 0.020;
      distanceRef.current = 70;
      if (cameraRef.current) {
        cameraRef.current.fov = 45.0;
        cameraRef.current.updateProjectionMatrix();
      }
    } else {
      // 激活当前模块：
      isWarpingRef.current = false;
      readyForWarpRef.current = false;
      warpAnimRef.current.active = false;
      setWarpProgress(0);
      targetDistanceRef.current = 70;
      targetOrbitThetaRef.current = 1.030;
      targetOrbitPhiRef.current = 0.020;
      orbitThetaRef.current = 1.030;
      orbitPhiRef.current = 0.020;
      distanceRef.current = 70;
      if (cameraRef.current) {
        cameraRef.current.fov = 45.0;
        cameraRef.current.updateProjectionMatrix();
      }

      if (drawProgressRef.current >= 0.95) {
        // 从后续 Works 模块逆向回退进入：精准停在最后一个战役 (06，idx=5)，并锁定跃迁冷却 1.2s，防误触瞬间切走！
        currentIdxRef.current = TIMELINE_PROJECTS.length - 1;
        setCurrentIdx(TIMELINE_PROJECTS.length - 1);
        warpCooldownUntilRef.current = performance.now() + 1200;
      } else if (drawProgressRef.current <= 0.05) {
        // 从前序模块正向进入：停在第 01 战役 (idx=0)
        currentIdxRef.current = 0;
        setCurrentIdx(0);
      }
    }
  }, [isActive]);

  const onWarpCompleteRef = useRef(onWarpComplete);
  useEffect(() => {
    onWarpCompleteRef.current = onWarpComplete;
  }, [onWarpComplete]);

  const onRollbackRef = useRef(onRollback);
  useEffect(() => {
    onRollbackRef.current = onRollback;
  }, [onRollback]);

  const drawProgressRef = useRef(drawProgress);
  useEffect(() => {
    drawProgressRef.current = drawProgress;
    // 进度映射：从最左侧 -140 到最右侧 +180，确保覆盖全部 6 大节点
    const headX = -140 + Math.min(1, Math.max(0, drawProgress)) * 320;
    drawHeadXRef.current = headX;
  }, [drawProgress]);

  // Three.js 核心对象引用
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const milestoneMeshesRef = useRef<NodeMeshItem[]>([]);
  const drawHeadXRef = useRef(-145);

  // 着色器 Uniforms 引用
  const beamUniformsRef = useRef<{ [key: string]: { value: any } }[]>([]);
  const fogUniformsRef = useRef<{ [key: string]: { value: any } }[]>([]);
  const emberUniformsRef = useRef<{ [key: string]: { value: any } }>({ uTime: { value: 0 }, uDrawHeadX: { value: -145 } });
  const helixUniformsListRef = useRef<{ [key: string]: { value: any } }[]>([]);

  // 默认最佳视角参数
  const orbitThetaRef = useRef(1.030);
  const orbitPhiRef = useRef(0.020);
  const targetOrbitThetaRef = useRef(1.030);
  const targetOrbitPhiRef = useRef(0.020);
  const distanceRef = useRef(70);
  const targetDistanceRef = useRef(70);

  // 顺线时空超光速跃迁动画状态
  const warpAnimRef = useRef<{
    active: boolean;
    startTime: number;
    startCamX: number;
    startCamY: number;
    startCamZ: number;
    startLookAtX: number;
    startLookAtY: number;
    startLookAtZ: number;
  }>({
    active: false,
    startTime: 0,
    startCamX: 0,
    startCamY: 4.5,
    startCamZ: 0,
    startLookAtX: 0,
    startLookAtY: 1.2,
    startLookAtZ: 0,
  });
  const currentTrackingXRef = useRef(TIMELINE_PROJECTS[0].xPos);
  const currentCamPosRef = useRef({ x: 0, y: 4.5, z: 0 });

  const toggleHUD = useCallback(() => {
    isHudCollapsedRef.current = !isHudCollapsedRef.current;
    setIsHudCollapsed(isHudCollapsedRef.current);
  }, []);

  const warpToMilestone = useCallback((idx: number) => {
    if (idx < 0 || idx >= TIMELINE_PROJECTS.length) return;
    currentIdxRef.current = idx;
    setCurrentIdx(idx);
    if (isHudCollapsedRef.current) {
      toggleHUD();
    }
  }, [toggleHUD]);

  // 启动时空穿越动效：1s温和旋转扭正平移 -> 1s逐渐加速 -> 0.5s最终冲刺变白
  const startWarpOut = useCallback(() => {
    if (isWarpingRef.current) return;
    isWarpingRef.current = true;

    const curX = currentCamPosRef.current.x;
    const curY = currentCamPosRef.current.y;
    const curZ = currentCamPosRef.current.z;
    const startLookAtX = currentTrackingXRef.current + (isHudCollapsedRef.current ? 0 : 8);
    const startLookAtY = 1.2;
    const startLookAtZ = 0.0;

    warpAnimRef.current = {
      active: true,
      startTime: performance.now(),
      startCamX: curX,
      startCamY: curY,
      startCamZ: curZ,
      startLookAtX,
      startLookAtY,
      startLookAtZ,
    };
  }, []);

  // 初始化 Three.js 场景与渲染器
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 4000);
    cameraRef.current = camera;

    // 1. 主时间线光带
    const beamGroup = new THREE.Group();
    scene.add(beamGroup);

    const BEAM_LENGTH = 2000;
    const BEAM_HEIGHT = 12;
    const beamUniforms: { [key: string]: { value: any } }[] = [];
    const numLayers = 3;
    const beamZOffsets = [-1.8, 0.0, 1.8];

    for (let i = 0; i < numLayers; i++) {
      const geo = new THREE.PlaneGeometry(BEAM_LENGTH, BEAM_HEIGHT, 320, 12);
      const uvAttr = geo.attributes.uv;
      for (let j = 0; j < uvAttr.count; j++) {
        const u = uvAttr.getX(j);
        const v = uvAttr.getY(j) * 2.0 - 1.0;
        uvAttr.setXY(j, u, v);
      }

      const uniforms = {
        uTime: { value: 0 },
        uDrawHeadX: { value: -140 },
        uColorCore: { value: new THREE.Color(0xffedd5) },
        uColorAmber: { value: new THREE.Color(0xf97316) },
        uColorOrange: { value: new THREE.Color(0xd9381e) },
        uColorSmoke: { value: new THREE.Color(0x7c1d0f) },
        uLayerOffset: { value: i * 1.8 }
      };
      beamUniforms.push(uniforms);

      const mat = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: beamVertexShader,
        fragmentShader: beamFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0, beamZOffsets[i]);
      mesh.renderOrder = 0;
      beamGroup.add(mesh);
    }
    beamUniformsRef.current = beamUniforms;

    // 2. 包裹光雾
    const fogGroup = new THREE.Group();
    scene.add(fogGroup);
    const FOG_LENGTH = 2000;
    const FOG_HEIGHT = 23;
    const fogUniforms: { [key: string]: { value: any } }[] = [];
    const numFogLayers = 2;
    const fogZOffsets = [-1.8, 1.8];
    const fogRotX = [0.10, -0.10];

    for (let i = 0; i < numFogLayers; i++) {
      const geo = new THREE.PlaneGeometry(FOG_LENGTH, FOG_HEIGHT, 320, 12);
      const uvAttr = geo.attributes.uv;
      for (let j = 0; j < uvAttr.count; j++) {
        const u = uvAttr.getX(j);
        const v = uvAttr.getY(j) * 2.0 - 1.0;
        uvAttr.setXY(j, u, v);
      }

      const uniforms = {
        uTime: { value: 0 },
        uDrawHeadX: { value: -140 },
        uPhase: { value: i * 1.5 },
        uLayerOffset: { value: i * 2.3 },
        uColorInner: { value: new THREE.Color(0xf97316) },
        uColorMid: { value: new THREE.Color(0xd9381e) },
        uColorOuter: { value: new THREE.Color(0x6b1609) }
      };
      fogUniforms.push(uniforms);

      const mat = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: fogVertexShader,
        fragmentShader: fogFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0, fogZOffsets[i]);
      mesh.rotation.x = fogRotX[i];
      mesh.renderOrder = 1;
      fogGroup.add(mesh);
    }
    fogUniformsRef.current = fogUniforms;

    // 3. 火星余烬微粒系统
    const EMBER_COUNT = 1800;
    const emberGeo = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(EMBER_COUNT * 3);
    const emberData = new Float32Array(EMBER_COUNT * 4);

    for (let i = 0; i < EMBER_COUNT; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const spread = (Math.random() - 0.5) * (Math.random() - 0.5) * 4.0;
      const y = spread * 11.0;
      const z = (Math.random() - 0.5) * 10.0;

      emberPositions[i * 3 + 0] = x;
      emberPositions[i * 3 + 1] = y;
      emberPositions[i * 3 + 2] = z;

      emberData[i * 4 + 0] = x;
      emberData[i * 4 + 1] = y;
      emberData[i * 4 + 2] = 0.5 + Math.random() * 1.1;
      emberData[i * 4 + 3] = Math.random() * 100.0;
    }

    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
    emberGeo.setAttribute('aData', new THREE.BufferAttribute(emberData, 4));

    const emberUniforms = { uTime: { value: 0 }, uDrawHeadX: { value: -140 } };
    emberUniformsRef.current = emberUniforms;

    const emberMat = new THREE.ShaderMaterial({
      uniforms: emberUniforms,
      vertexShader: emberVertexShader,
      fragmentShader: emberFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const emberPoints = new THREE.Points(emberGeo, emberMat);
    scene.add(emberPoints);

    // 4. 空间螺旋流光线
    const helixGroup = new THREE.Group();
    scene.add(helixGroup);
    const helixRibbonGeo = createRibbonGeometry(2000, 600);
    const helixUniformsList: { [key: string]: { value: any } }[] = [];

    const helixConfigs = [
      { radius: 7.1, speed: 1.15, wavelength: 0.058, phase: 0.0, tilt: 0.12, lifeSpeed: 1.25, lifeOffset: 0.0, head: 0xf97316, tail: 0xffedd5 },
      { radius: 6.9, speed: 0.95, wavelength: 0.048, phase: 1.9, tilt: -0.15, lifeSpeed: 1.05, lifeOffset: 0.33, head: 0xfb923c, tail: 0xffedd5 },
      { radius: 7.2, speed: 0.80, wavelength: 0.040, phase: 3.6, tilt: 0.20, lifeSpeed: 0.90, lifeOffset: 0.66, head: 0xd9381e, tail: 0xffedd5 },
      { radius: 6.8, speed: 1.05, wavelength: 0.052, phase: 5.2, tilt: -0.10, lifeSpeed: 1.15, lifeOffset: 0.50, head: 0xf59e0b, tail: 0xffedd5 }
    ];

    helixConfigs.forEach(cfg => {
      const uniforms = {
        uTime: { value: 0 },
        uDrawHeadX: { value: -140 },
        uRadius: { value: cfg.radius },
        uSpeed: { value: cfg.speed },
        uWavelength: { value: cfg.wavelength },
        uPhase: { value: cfg.phase },
        uTilt: { value: cfg.tilt },
        uLifeSpeed: { value: cfg.lifeSpeed },
        uLifeOffset: { value: cfg.lifeOffset },
        uColorHead: { value: new THREE.Color(cfg.head) },
        uColorTail: { value: new THREE.Color(cfg.tail) }
      };
      helixUniformsList.push(uniforms);

      const mat = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: helixVertexShader,
        fragmentShader: helixFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(helixRibbonGeo, mat);
      mesh.renderOrder = 2;
      helixGroup.add(mesh);
    });
    helixUniformsListRef.current = helixUniformsList;

    // 5. 构建 6 大战役节点
    const milestoneGroup = new THREE.Group();
    scene.add(milestoneGroup);
    const auraTexture = createAuraTexture();
    const milestoneMeshes: NodeMeshItem[] = [];

    TIMELINE_PROJECTS.forEach((p, idx) => {
      const g = new THREE.Group();
      g.position.set(p.xPos, 0, 0);

      // 光晕 Sprite
      const auraMat = new THREE.SpriteMaterial({
        map: auraTexture,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.82
      });
      const auraSprite = new THREE.Sprite(auraMat);
      auraSprite.scale.set(11, 11, 1);
      auraSprite.renderOrder = 14;
      g.add(auraSprite);

      // 核心星核
      const coreGeo = new THREE.SphereGeometry(1.4, 24, 24);
      const coreMat = new THREE.MeshBasicMaterial({
        color: p.accentColor,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
      });
      const coreOrb = new THREE.Mesh(coreGeo, coreMat);
      coreOrb.renderOrder = 15;
      g.add(coreOrb);

      // 高维几何晶格骨架
      const crystalGeo = new THREE.IcosahedronGeometry(2.3, 0);
      const crystalWire = new THREE.WireframeGeometry(crystalGeo);
      const crystalMat = new THREE.LineBasicMaterial({
        color: p.accentColor,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
      });
      const crystalCage = new THREE.LineSegments(crystalWire, crystalMat);
      crystalCage.renderOrder = 16;
      g.add(crystalCage);

      // 悬浮全息标牌
      const sprite = createMilestoneSprite(p.year, p.timelineBadge, p.accentColor);
      sprite.position.set(0, 7.8, 0);
      sprite.userData = { milestoneIndex: idx };
      g.add(sprite);

      // 射线检测碰撞球
      const hitGeo = new THREE.SphereGeometry(5.8, 12, 12);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.material.depthWrite = false;
      hitMesh.userData = { milestoneIndex: idx };
      g.add(hitMesh);

      milestoneGroup.add(g);
      milestoneMeshes.push({
        idx,
        xPos: p.xPos,
        group: g,
        coreOrb,
        crystalCage,
        auraSprite,
        sprite,
        hitMesh,
        accentColor: p.accentColor
      });
    });
    milestoneMeshesRef.current = milestoneMeshes;

    // 交互拾取目标
    const getInteractiveTargets = () => {
      const targets: THREE.Object3D[] = [];
      milestoneMeshes.forEach(item => {
        if (item.hitMesh) targets.push(item.hitMesh);
        if (item.sprite) targets.push(item.sprite);
      });
      return targets;
    };

    // 鼠标与事件交互
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let dragStartPos = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('#dossier-hud') || target?.closest('nav')) return;
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
      dragStartPos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseCoord.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseCoord.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (isDragging) {
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        prevMouse = { x: e.clientX, y: e.clientY };

        targetOrbitThetaRef.current -= dx * 0.005;
        targetOrbitPhiRef.current = Math.max(-0.25, Math.min(0.28, targetOrbitPhiRef.current + dy * 0.005));
      } else {
        const target = e.target as HTMLElement | null;
        if (!target?.closest('#dossier-hud') && !target?.closest('nav')) {
          raycaster.setFromCamera(mouseCoord, camera);
          const interactiveTargets = getInteractiveTargets();
          const intersects = raycaster.intersectObjects(interactiveTargets);
          if (intersects.length > 0) {
            canvas.style.cursor = 'pointer';
          } else {
            canvas.style.cursor = 'grab';
          }
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      isDragging = false;
      const dragDist = Math.hypot(e.clientX - dragStartPos.x, e.clientY - dragStartPos.y);

      if (dragDist < 5) {
        mouseCoord.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouseCoord.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouseCoord, camera);
        const interactiveTargets = getInteractiveTargets();
        const intersects = raycaster.intersectObjects(interactiveTargets);
        if (intersects.length > 0) {
          const hitIdx = intersects[0].object.userData.milestoneIndex;
          warpToMilestone(hitIdx);
        }
      }
    };

    // 滚轮交互
    let wheelThrottleTimer = 0;

    const handleWheel = (e: WheelEvent) => {
      // 若时间线尚未完全画出，不拦截，放行给外层推进画线
      if (drawProgressRef.current < 0.95) return;

      // 若鼠标在右侧全息看板内，放行给文章滚动
      const target = e.target as HTMLElement | null;
      if (target?.closest('#dossier-hud')) return;

      // 核心拦截：绝不冒泡给外层 HorizontalStoryStage！杜绝误切模块！
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();

      if (isWarpingRef.current) return;

      const now = performance.now();
      if (now - wheelThrottleTimer < 320) return;

      if (Math.abs(e.deltaY) > 12) {
        wheelThrottleTimer = now;
        const dir = e.deltaY > 0 ? 1 : -1;

        if (dir > 0) {
          // 向后推进战役
          if (currentIdxRef.current < TIMELINE_PROJECTS.length - 1) {
            warpToMilestone(currentIdxRef.current + 1);
            readyForWarpRef.current = false;
          } else {
            // 已在 06 节点（最后一个）：
            // 1. 若仍处于从后序模块回退进入的冷却期，禁止触发跃迁
            if (now < warpCooldownUntilRef.current) {
              return;
            }
            // 2. 必须在 06 节点停顿后再滑一次才触发时空穿越！
            if (!readyForWarpRef.current) {
              readyForWarpRef.current = true;
            } else {
              startWarpOut();
            }
          }
        } else {
          // 向前回溯
          readyForWarpRef.current = false;
          if (currentIdxRef.current > 0) {
            warpToMilestone(currentIdxRef.current - 1);
          } else {
            onRollbackRef.current?.();
          }
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (currentIdxRef.current > 0) warpToMilestone(currentIdxRef.current - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (currentIdxRef.current < TIMELINE_PROJECTS.length - 1) {
          warpToMilestone(currentIdxRef.current + 1);
        } else {
          startWarpOut();
        }
      } else if (e.key === 'Escape') {
        toggleHUD();
      }
    };

    // 触摸手势交互支持
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('#dossier-hud') || target?.closest('nav')) return;
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        dragStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('#dossier-hud') || target?.closest('nav')) return;
      if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - prevMouse.x;
        const dy = e.touches[0].clientY - prevMouse.y;
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        targetOrbitThetaRef.current -= dx * 0.006;
        targetOrbitPhiRef.current = Math.max(-0.25, Math.min(0.28, targetOrbitPhiRef.current + dy * 0.006));
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDragging) return;
      isDragging = false;
      if (e.changedTouches.length === 1) {
        const t = e.changedTouches[0];
        const dragDist = Math.hypot(t.clientX - dragStartPos.x, t.clientY - dragStartPos.y);
        if (dragDist < 6) {
          mouseCoord.x = (t.clientX / window.innerWidth) * 2 - 1;
          mouseCoord.y = -(t.clientY / window.innerHeight) * 2 + 1;
          raycaster.setFromCamera(mouseCoord, camera);
          const interactiveTargets = getInteractiveTargets();
          const intersects = raycaster.intersectObjects(interactiveTargets);
          if (intersects.length > 0) {
            const hitIdx = intersects[0].object.userData.milestoneIndex;
            warpToMilestone(hitIdx);
          }
        }
      }
    };

    // 窗口尺寸自适应
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    // 渲染主循环
    const animStartTime = performance.now();
    let currentTrackingX = TIMELINE_PROJECTS[0].xPos;
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // 功耗与性能保护：未激活或时间线未绘制时暂停高负载 3D 渲染，彻底消除电脑发热与电量消耗！
      if (!isActiveRef.current || drawProgressRef.current < 0.001) {
        return;
      }

      const now = performance.now();
      const elapsed = (now - animStartTime) * 0.001;

      // 1. 流光粒子 Uniforms 更新（在跃迁全周期平滑加速）
      let flowSpeedMultiplier = 1.0;
      if (warpAnimRef.current.active) {
        const elapsedWarp = performance.now() - warpAnimRef.current.startTime;
        if (elapsedWarp < 1000) {
          // 阶段 1 (0 ~ 1.0s)：初始温和，保持原速并平缓渐升至 1.2
          const t1 = elapsedWarp / 1000;
          flowSpeedMultiplier = 1.0 + (t1 * t1) * 0.2;
        } else if (elapsedWarp < 2000) {
          // 阶段 2 (1.0 ~ 2.0s)：顺着时间线逐渐加速，流速由 1.2 平滑递增至 6.0
          const t2 = (elapsedWarp - 1000) / 1000;
          const accel = t2 * 0.3 + (t2 * t2) * 0.7;
          flowSpeedMultiplier = 1.2 + accel * 4.8;
        } else {
          // 阶段 3 (2.0 ~ 2.5s)：最终冲刺，流速狂飙至 16.0
          const t3 = Math.min(1.0, (elapsedWarp - 2000) / 500);
          flowSpeedMultiplier = 6.0 + Math.pow(t3, 2.0) * 10.0;
        }
      }
      const flowTime = elapsed * flowSpeedMultiplier;
      const currentHeadX = drawHeadXRef.current;

      beamUniformsRef.current.forEach(u => {
        u.uTime.value = flowTime;
        u.uDrawHeadX.value = currentHeadX;
      });
      fogUniformsRef.current.forEach(u => {
        u.uTime.value = flowTime;
        u.uDrawHeadX.value = currentHeadX;
      });
      emberUniformsRef.current.uTime.value = flowTime;
      emberUniformsRef.current.uDrawHeadX.value = currentHeadX;
      helixUniformsListRef.current.forEach(u => {
        u.uTime.value = flowTime;
        u.uDrawHeadX.value = currentHeadX;
      });

      // 2. 更新 3D 时空共振能量枢纽（随绘制扫过平滑生成与呼吸自转）
      const slowBreath = 1.0 + Math.sin(flowTime * 0.35) * 0.05;

      milestoneMeshesRef.current.forEach((item) => {
        const isActiveNode = item.idx === currentIdxRef.current;

        // 依据绘制扫略线计算节点入场显现比例 (0.0 ~ 1.0)
        let appearRatio = 1.0;
        if (currentHeadX < 160.0) {
          const nodeDist = currentHeadX - item.xPos;
          appearRatio = Math.max(0, Math.min(1, (nodeDist + 15.0) / 25.0));
        }

        // 高维晶格多轴轻柔自转
        item.crystalCage.rotation.x += 0.006;
        item.crystalCage.rotation.y += 0.009;

        // 能量核与光晕呼吸加权并结合入场动画
        const targetScale = (isActiveNode ? 1.18 : 0.85) * appearRatio;
        const breathScale = targetScale * slowBreath;
        item.coreOrb.scale.set(breathScale, breathScale, breathScale);
        item.auraSprite.scale.set(11 * breathScale, 11 * breathScale, 1);
        item.crystalCage.scale.set(appearRatio, appearRatio, appearRatio);

        // 浮空标牌轻柔浮沉与入场
        item.sprite.position.y = 7.8 + Math.sin(flowTime * 0.5 + item.idx) * 0.25;
        item.sprite.scale.set(15 * appearRatio, 6.25 * appearRatio, 1);
        (item.sprite.material as THREE.SpriteMaterial).opacity = appearRatio;
      });

      // 3. 更新相机轨迹与聚焦
      currentTrackingXRef.current = currentTrackingX;

      if (warpAnimRef.current.active) {
        const elapsedWarp = performance.now() - warpAnimRef.current.startTime;
        const { startCamX, startCamY, startCamZ, startLookAtX, startLookAtY, startLookAtZ } = warpAnimRef.current;

        let camX: number;
        let camY: number;
        let camZ: number;
        let lookAtX: number;
        let lookAtY: number;
        let lookAtZ: number;
        let curFov = 45.0;

        if (elapsedWarp < 1000) {
          // =========================================================================
          // 阶段 1 (0.0s ~ 1.0s，耗时 1.0 秒)：镜头旋转扭正与平滑移入伴飞位，初速度平顺为 0
          // =========================================================================
          const t1 = Math.min(1.0, elapsedWarp / 1000);
          // 五次平滑曲线 (Quintic Smoothstep)，保证旋转对齐极度柔顺无顿挫
          const w1 = t1 * t1 * t1 * (t1 * (t1 * 6.0 - 15.0) + 10.0);

          // 前向位移：初速度严格为 0，1 秒内前向仅平缓滑行 10 个单位（消除任何前冲与顿挫感）
          camX = startCamX + 10.0 * (t1 * t1);
          // 高度平滑过渡至伴飞高度 4.8
          camY = startCamY + (4.8 - startCamY) * w1;
          // 平滑过渡至右侧伴飞轨道 (Z = 8.0)，视线斜切避开中空缝隙
          camZ = startCamZ + (8.0 - startCamZ) * w1;

          // 视线平滑从当前聚焦目标平缓扭正至正前方航道
          const targetLookAtX = camX + 60.0;
          const targetLookAtY = 1.2;
          const targetLookAtZ = 0.5;

          lookAtX = startLookAtX + (targetLookAtX - startLookAtX) * w1;
          lookAtY = startLookAtY + (targetLookAtY - startLookAtY) * w1;
          lookAtZ = startLookAtZ + (targetLookAtZ - startLookAtZ) * w1;

          curFov = 45.0;
          setWarpProgress(0);

        } else if (elapsedWarp < 2000) {
          // =========================================================================
          // 阶段 2 (1.0s ~ 2.0s，耗时 1.0 秒)：顺着时间线逐渐加速，推背感平滑攀升
          // =========================================================================
          const tau = (elapsedWarp - 1000) / 1000;
          // 前向位移二阶递增：衔接阶段 1 末速度 20.0，并在 1 秒内平滑加速至 280.0
          // d(forwardDist)/d(tau) 在 tau=0 时为 20.0，在 tau=1 时为 280.0
          const forwardDist = 10.0 + (20.0 * tau + 10.0 * tau * tau + 80.0 * tau * tau * tau);
          camX = startCamX + forwardDist;

          // 贴地平稳伴飞 (高度从 4.8 微降至 3.8，Z 轴维持在 8.0 ~ 7.2 偏右伴飞)
          camY = 4.8 - tau * 1.0;
          camZ = 8.0 - tau * 0.8;

          lookAtX = camX + 120.0;
          lookAtY = 1.2;
          lookAtZ = 0.5;

          // 动态广角平滑拉伸：FOV 从 45.0° 逐渐扩展至 65.0°
          curFov = 45.0 + tau * 20.0;
          setWarpProgress(0);

        } else {
          // =========================================================================
          // 阶段 3 (2.0s ~ 2.5s，耗时 0.5 秒)：最终冲刺，突破超速然后变白
          // =========================================================================
          const u = Math.min(1.0, (elapsedWarp - 2000) / 500);
          // 阶段 2 累计位移 120.0，阶段 2 末速度 280.0
          // 阶段 3 位移在 0.5 秒内极速爆发：衔接初速度 280.0 并暴冲至超光速
          const forwardDist = 120.0 + (140.0 * u + 120.0 * u * u + 40.0 * u * u * u);
          camX = startCamX + forwardDist;

          camY = 3.8 - u * 0.3;
          camZ = 7.2 - u * 0.2;

          lookAtX = camX + 200.0;
          lookAtY = 1.2;
          lookAtZ = 0.5;

          // 极限 FOV 爆发拉伸：从 65.0° 暴增至 90.0°
          curFov = 65.0 + u * 25.0;

          // 全屏耀斑过载：最后 0.5 秒内变纯白
          const whiteP = Math.pow(u, 1.4);
          setWarpProgress(whiteP);
        }

        camera.fov = curFov;
        camera.updateProjectionMatrix();

        camera.position.set(camX, camY, camZ);
        camera.lookAt(lookAtX, lookAtY, lookAtZ);

        currentCamPosRef.current = { x: camX, y: camY, z: camZ };

        if (elapsedWarp >= 2500) {
          setWarpProgress(1.0);
          warpAnimRef.current.active = false;
          onWarpCompleteRef.current?.();

          setTimeout(() => {
            isWarpingRef.current = false;
            readyForWarpRef.current = false;
            setWarpProgress(0);
            targetDistanceRef.current = 70;
            targetOrbitThetaRef.current = 1.030;
            targetOrbitPhiRef.current = 0.020;
            orbitThetaRef.current = 1.030;
            orbitPhiRef.current = 0.020;
            distanceRef.current = 70;
            if (cameraRef.current) {
              cameraRef.current.fov = 45.0;
              cameraRef.current.updateProjectionMatrix();
            }
          }, 300);
        }
      } else {
        // 常规交互与浏览聚焦摄像机
        const targetX = TIMELINE_PROJECTS[currentIdxRef.current].xPos;
        currentTrackingX += (targetX - currentTrackingX) * 0.08;

        orbitThetaRef.current += (targetOrbitThetaRef.current - orbitThetaRef.current) * 0.08;
        orbitPhiRef.current += (targetOrbitPhiRef.current - orbitPhiRef.current) * 0.08;
        distanceRef.current += (targetDistanceRef.current - distanceRef.current) * 0.08;

        const offsetDist = isHudCollapsedRef.current ? 0 : -18;
        const camCenterX = currentTrackingX + offsetDist;

        const camX = camCenterX + distanceRef.current * Math.sin(orbitThetaRef.current) * Math.cos(orbitPhiRef.current);
        const camY = 4.5 + distanceRef.current * Math.sin(orbitPhiRef.current) + Math.sin(elapsed * 0.3) * 0.25;
        const camZ = distanceRef.current * Math.cos(orbitThetaRef.current) * Math.cos(orbitPhiRef.current);

        if (camera.fov !== 45.0) {
          camera.fov = 45.0;
          camera.updateProjectionMatrix();
        }

        camera.position.set(camX, camY, camZ);
        camera.lookAt(currentTrackingX + (isHudCollapsedRef.current ? 0 : 8), 1.2, 0);

        currentCamPosRef.current = { x: camX, y: camY, z: camZ };
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [toggleHUD, warpToMilestone, startWarpOut]);

  // 当前选中的战役数据
  const activeProject = TIMELINE_PROJECTS[currentIdx];
  const colorHex = `#${activeProject.accentColor.toString(16).padStart(6, '0')}`;

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden select-none">
      {/* 1. Three.js WebGL 画布 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* 2. 底部时间轴刻度导轨 (当时间线绘制推进至 50% 以上时平滑显现) */}
      <nav
        className={`absolute bottom-5 left-6 right-6 z-20 pointer-events-none flex flex-col items-center transition-all duration-700 ${
          drawProgress > 0.45 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-2xl px-4 sm:px-6 py-2.5 rounded-2xl border border-amber-500/35 shadow-2xl max-w-4xl w-full">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
            <span className="text-amber-300 font-bold font-mono">
              {activeProject.year} ({currentIdx + 1} / {TIMELINE_PROJECTS.length})
            </span>
            {currentIdx === TIMELINE_PROJECTS.length - 1 && (
              <button
                onClick={startWarpOut}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs animate-pulse transition-all shadow-[0_0_12px_rgba(245,158,11,0.6)] cursor-pointer"
              >
                <span>启动时空跃迁 ❯❯</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {TIMELINE_PROJECTS.map((p, idx) => {
              const isActive = idx === currentIdx;
              const pColorHex = `#${p.accentColor.toString(16).padStart(6, '0')}`;
              return (
                <button
                  key={p.id}
                  onClick={() => warpToMilestone(idx)}
                  className={`group flex flex-col items-center cursor-pointer transition-all p-1.5 rounded-xl ${
                    isActive ? 'bg-amber-500/25 border shadow-lg' : 'hover:bg-slate-800/50 border border-transparent'
                  }`}
                  style={isActive ? { borderColor: pColorHex, boxShadow: `0 0 16px ${pColorHex}66` } : undefined}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full transition-all"
                      style={{
                        backgroundColor: pColorHex,
                        boxShadow: isActive ? `0 0 10px ${pColorHex}` : undefined
                      }}
                    />
                    <span className="text-[10px] font-mono font-bold text-slate-300">{p.code}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold mt-1 truncate max-w-[85px] ${
                      isActive ? 'text-amber-200 font-black' : 'text-slate-400'
                    }`}
                  >
                    {p.year}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 3. 右侧悬浮全息战役看板 (HUD) */}
      <aside
        id="dossier-hud"
        className={`pointer-events-auto absolute right-6 top-6 bottom-32 w-[380px] sm:w-[440px] md:w-[480px] z-20 rounded-3xl p-5 sm:p-6 flex flex-col overflow-hidden shadow-2xl transition-all duration-500 bg-slate-950/85 backdrop-blur-2xl border border-amber-500/35 ${
          drawProgress > 0.45 && !isHudCollapsed ? 'translate-x-0 opacity-100' : 'translate-x-[110%] opacity-0 pointer-events-none'
        }`}
      >
        {/* 背景动态光晕 */}
        <div
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: `${colorHex}22` }}
        />

        {/* 顶部状态栏 */}
        <div className="relative z-10 border-b border-amber-500/20 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border transition-all duration-300"
                style={{
                  borderColor: `${colorHex}88`,
                  color: colorHex,
                  backgroundColor: `${colorHex}1a`
                }}
              >
                STAGE // {activeProject.code}
              </span>
              <span
                className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border transition-all duration-300"
                style={{
                  borderColor: `${colorHex}66`,
                  color: colorHex,
                  backgroundColor: `${colorHex}14`
                }}
              >
                {activeProject.timelineBadge}
              </span>
            </div>
            <div className="text-[11px] font-mono font-bold text-amber-300">
              {activeProject.period}
            </div>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-50 mt-2.5 font-mono leading-snug tracking-tight">
            {activeProject.title}
          </h2>
          <div className="text-xs text-amber-200/90 font-medium mt-1 flex flex-wrap items-center gap-2">
            <span>{activeProject.company}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">{activeProject.role}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{activeProject.location}</span>
          </div>
        </div>

        {/* 中间滚动区 */}
        <div className="relative z-10 flex-1 overflow-y-auto custom-scroll my-3 pr-2 space-y-3.5" data-timeline-scroll="true">
          {/* Slogan */}
          <div className="p-3 rounded-xl bg-amber-500/10 border-l-2 border-amber-400 text-xs text-amber-100/90 leading-relaxed italic">
            "{activeProject.slogan}"
          </div>

          {/* 4 大核心指标 */}
          <div>
            <div className="text-[10px] font-mono font-bold tracking-widest text-amber-400/90 uppercase mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>战役核心量化指标 (KEY METRICS)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {activeProject.metrics.map((m, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-900/80 border border-amber-500/20 shadow-inner">
                  <div
                    className="text-xl sm:text-2xl font-black font-mono leading-none mb-1"
                    style={{
                      color: colorHex,
                      textShadow: `0 0 16px ${colorHex}88`
                    }}
                  >
                    {m.val}
                  </div>
                  <div className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wide">
                    {m.lbl}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                    {m.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 深度架构攻坚 */}
          <div>
            <div className="text-[10px] font-mono font-bold tracking-widest text-amber-400/90 uppercase mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>深度架构攻坚 (ARCHITECTURAL DEEP-DIVE)</span>
            </div>
            <div className="space-y-2">
              {activeProject.deepChapters.map((ch, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-900/70 border border-amber-500/15 text-xs">
                  <h4 className="font-bold font-mono flex items-center gap-1.5 mb-1" style={{ color: colorHex }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorHex, boxShadow: `0 0 6px ${colorHex}` }} />
                    {ch.title}
                  </h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed pl-3 border-l border-amber-500/30">
                    {ch.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 技术栈 */}
          <div>
            <div className="text-[10px] font-mono font-bold tracking-widest text-amber-400/90 uppercase mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>核心技术栈 (TECH STACK)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeProject.techStack.map((t, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* 启动时空跃迁按钮 */}
          {currentIdx === TIMELINE_PROJECTS.length - 1 && (
            <div className="pt-2">
              <button
                onClick={startWarpOut}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>已达最终战役 · 启动时空跃迁进入精选作品</span>
                <span>❯❯</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 4. 时空穿越全屏白光覆盖层 (Whiteout) */}
      <div
        className="pointer-events-none absolute inset-0 w-full h-full z-50 bg-white transition-opacity duration-75"
        style={{
          opacity: warpProgress,
          mixBlendMode: 'normal'
        }}
      />
    </div>
  );
};
