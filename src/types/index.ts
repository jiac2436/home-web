export type ParticleTheme = 'dandelion' | 'feather' | 'petal' | 'maple';

export interface SeedConfig {
  x: number;
  y: number;
  scale: number;
  alpha: number;
  layer: 'foreground' | 'midground' | 'background';
}

export interface WindVector {
  x: number;
  y: number;
}
