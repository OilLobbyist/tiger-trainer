import { Entity, EntityType } from './types';

export const COLORS = {
  CAT_BLUE: '#3a86ff', // Bright Blue
  CAT_YELLOW: '#ffbe0b', // Vivid Yellow
  LASER_RED: '#00f5ff', // Vibrant Cyan (highly visible to cats)
  MOUSE_BROWN: '#ffffff', // Pure White for maximum contrast
  BIRD_BLUE: '#3a86ff', // Bright Blue
  FISH_ORANGE: '#ffbe0b', // Vivid Yellow
  BACKGROUND_NIGHT: '#000000', // Pure Black for OLED
  BACKGROUND_GRASS: '#000000', 
  BACKGROUND_WATER: '#000000',
};

export const ENTITY_CONFIGS: Record<EntityType, Partial<Entity>> = {
  laser: {
    size: 18,
    color: COLORS.LASER_RED,
  },
  mouse: {
    size: 35,
    color: COLORS.MOUSE_BROWN,
  },
  bird: {
    size: 45,
    color: COLORS.BIRD_BLUE,
  },
  fish: {
    size: 40,
    color: COLORS.FISH_ORANGE,
  },
  string: {
    size: 30,
    color: COLORS.CAT_YELLOW,
  }
};
