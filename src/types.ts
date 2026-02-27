export type EntityType = 'laser' | 'mouse' | 'bird' | 'fish' | 'string';

export interface Entity {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  color: string;
  state: 'active' | 'caught' | 'hiding' | 'falling';
  lastChange: number;
}

export interface GameState {
  entities: Entity[];
  score: number;
  mode: EntityType;
  isPlaying: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}
