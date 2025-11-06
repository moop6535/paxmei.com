/**
 * MiniGame Pure Logic
 * Pure functions for game mechanics (no side effects)
 */

import type {
  GameObject,
  GameConfig,
  ShapeType,
  CollisionResult,
  BottomCollisionResult,
} from './types';
import { GAME_COLORS } from './types';

/**
 * Calculate spawn interval based on score (difficulty progression)
 * Starts at 1500ms, decreases to minimum 800ms
 * @param score - Current game score
 * @returns Spawn interval in milliseconds
 */
export function getSpawnInterval(score: number): number {
  const safeScore = Math.max(0, score); // Clamp to 0 or positive
  return Math.max(800, 1500 - safeScore * 10);
}

/**
 * Calculate object speed based on score (difficulty progression)
 * Speed increases linearly with score
 * @param score - Current game score
 * @returns Speed in pixels per frame
 */
export function getObjectSpeed(score: number): number {
  const safeScore = Math.max(0, score); // Clamp to 0 or positive
  return 2 + safeScore * 0.05;
}

/**
 * Generate a random game object
 * @param config - Game configuration
 * @param currentTime - Current timestamp for unique ID
 * @param score - Current score (affects speed)
 * @returns New game object
 */
export function generateRandomShape(
  config: GameConfig,
  currentTime: number,
  score: number
): GameObject {
  const shapes: ShapeType[] = ['rect', 'circle', 'triangle'];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const size =
    config.objectMinSize +
    Math.random() * (config.objectMaxSize - config.objectMinSize);
  const color =
    GAME_COLORS.OBJECT_COLORS[
      Math.floor(Math.random() * GAME_COLORS.OBJECT_COLORS.length)
    ];

  return {
    id: `obj-${currentTime}-${Math.random()}`,
    x: Math.random() * (config.canvasWidth - size),
    y: -size, // Start just above viewport
    width: size,
    height: size,
    speed: getObjectSpeed(score),
    shape,
    color,
  };
}

/**
 * Update all objects positions (move them down)
 * @param objects - Array of game objects
 * @param deltaTime - Time since last frame (ms)
 * @returns Updated array of objects
 */
export function updateObjects(
  objects: GameObject[],
  deltaTime: number
): GameObject[] {
  // Normalize deltaTime to 60fps equivalent (16.67ms per frame)
  const frameMultiplier = deltaTime / 16.67;

  return objects.map((obj) => ({
    ...obj,
    y: obj.y + obj.speed * frameMultiplier,
  }));
}

/**
 * Check if any objects hit the bottom of the canvas
 * @param objects - Array of game objects
 * @param canvasHeight - Height of canvas
 * @returns Objects that didn't hit bottom and count of hits
 */
export function checkBottomCollisions(
  objects: GameObject[],
  canvasHeight: number
): BottomCollisionResult {
  const remainingObjects: GameObject[] = [];
  let hitCount = 0;

  objects.forEach((obj) => {
    if (obj.y + obj.height >= canvasHeight) {
      hitCount++;
    } else {
      remainingObjects.push(obj);
    }
  });

  return { remainingObjects, hitCount };
}

/**
 * Check if a click hit any object
 * @param clickX - X coordinate of click
 * @param clickY - Y coordinate of click
 * @param objects - Array of game objects
 * @returns Collision result with hit status and remaining objects
 */
export function checkClickCollision(
  clickX: number,
  clickY: number,
  objects: GameObject[]
): CollisionResult {
  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    let isHit = false;

    switch (obj.shape) {
      case 'rect':
        isHit = isPointInRect(clickX, clickY, obj);
        break;
      case 'circle':
        isHit = isPointInCircle(clickX, clickY, obj);
        break;
      case 'triangle':
        isHit = isPointInTriangle(clickX, clickY, obj);
        break;
    }

    if (isHit) {
      // Remove hit object
      const remainingObjects = [
        ...objects.slice(0, i),
        ...objects.slice(i + 1),
      ];
      return {
        hit: true,
        hitObjectId: obj.id,
        remainingObjects,
      };
    }
  }

  return {
    hit: false,
    remainingObjects: objects,
  };
}

/**
 * Check if point is inside rectangle (AABB collision)
 * @param px - Point X coordinate
 * @param py - Point Y coordinate
 * @param obj - Game object
 * @returns True if point is inside rectangle
 */
export function isPointInRect(
  px: number,
  py: number,
  obj: GameObject
): boolean {
  return (
    px >= obj.x &&
    px <= obj.x + obj.width &&
    py >= obj.y &&
    py <= obj.y + obj.height
  );
}

/**
 * Check if point is inside circle (distance-based collision)
 * @param px - Point X coordinate
 * @param py - Point Y coordinate
 * @param obj - Game object
 * @returns True if point is inside circle
 */
export function isPointInCircle(
  px: number,
  py: number,
  obj: GameObject
): boolean {
  const centerX = obj.x + obj.width / 2;
  const centerY = obj.y + obj.height / 2;
  const radius = obj.width / 2;

  const dx = px - centerX;
  const dy = py - centerY;
  const distanceSquared = dx * dx + dy * dy;

  return distanceSquared <= radius * radius;
}

/**
 * Check if point is inside triangle (barycentric coordinate method)
 * Triangle vertices: top-center, bottom-right, bottom-left
 * @param px - Point X coordinate
 * @param py - Point Y coordinate
 * @param obj - Game object
 * @returns True if point is inside triangle
 */
export function isPointInTriangle(
  px: number,
  py: number,
  obj: GameObject
): boolean {
  // Triangle vertices
  const x1 = obj.x + obj.width / 2; // Top center
  const y1 = obj.y;
  const x2 = obj.x + obj.width; // Bottom right
  const y2 = obj.y + obj.height;
  const x3 = obj.x; // Bottom left
  const y3 = obj.y + obj.height;

  // Barycentric coordinates
  const denominator = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
  const a = ((y2 - y3) * (px - x3) + (x3 - x2) * (py - y3)) / denominator;
  const b = ((y3 - y1) * (px - x3) + (x1 - x3) * (py - y3)) / denominator;
  const c = 1 - a - b;

  // Point is inside if all barycentric coordinates are >= 0
  return a >= 0 && b >= 0 && c >= 0;
}
