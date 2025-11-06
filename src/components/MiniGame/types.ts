/**
 * MiniGame Types
 * Type definitions for the desktop idle-state mini-game
 */

export type ShapeType = 'rect' | 'circle' | 'triangle';

/**
 * Color palette (brutalist high-contrast aesthetic)
 */
export const GAME_COLORS = {
  WHITE: '#ffffff',
  BLACK: '#000000',
  RED: '#ff0000',
  OBJECT_COLORS: ['#ffffff', '#cccccc', '#999999'], // White to gray spectrum
} as const;

/**
 * Represents a falling game object
 */
export interface GameObject {
  id: string;
  x: number; // Top-left X coordinate
  y: number; // Top-left Y coordinate
  width: number; // Object width in pixels
  height: number; // Object height in pixels
  speed: number; // Pixels per frame
  shape: ShapeType;
  color: string; // One of GAME_COLORS.OBJECT_COLORS
}

/**
 * Complete game state
 */
export interface GameState {
  score: number;
  objects: GameObject[];
  strikes: number; // 0-3, game over at 3
  gameOver: boolean;
  isPaused: boolean;
  lastSpawnTime: number; // Timestamp for spawn rate control
  difficultyMultiplier: number; // Increases with score
}

/**
 * Game configuration
 */
export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  maxObjects: number; // 40
  maxStrikes: number; // 3
  baseSpawnInterval: number; // 1500ms
  minSpawnInterval: number; // 800ms
  baseSpeed: number; // 2 pixels/frame
  objectMinSize: number; // 40px
  objectMaxSize: number; // 60px
}

/**
 * Result of collision check
 */
export interface CollisionResult {
  hit: boolean;
  hitObjectId?: string;
  remainingObjects: GameObject[];
}

/**
 * Result of bottom collision check
 */
export interface BottomCollisionResult {
  remainingObjects: GameObject[];
  hitCount: number;
}
