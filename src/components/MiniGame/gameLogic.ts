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
 * Starts at 1500ms, decreases to minimum 600ms (faster ramp-up)
 * @param score - Current game score
 * @returns Spawn interval in milliseconds
 */
export function getSpawnInterval(score: number): number {
  const safeScore = Math.max(0, score); // Clamp to 0 or positive
  return Math.max(600, 1500 - safeScore * 25);
}

/**
 * Calculate object speed based on score (difficulty progression)
 * Speed increases linearly with score (faster ramp-up)
 * @param score - Current game score
 * @returns Speed in pixels per frame
 */
export function getObjectSpeed(score: number): number {
  const safeScore = Math.max(0, score); // Clamp to 0 or positive
  return 2 + safeScore * 0.12;
}

/**
 * Generate a random game object with health based on difficulty
 * @param config - Game configuration
 * @param currentTime - Current timestamp for unique ID
 * @param score - Current score (affects speed and health)
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

  // Assign health based on shape (and increase with score)
  let maxHealth: number;
  let color: string;

  if (shape === 'rect') {
    // Rectangles are weakest (1-3 hits)
    maxHealth = 1 + Math.floor(score / 20);
    color = GAME_COLORS.OBJECT_COLORS[2]; // #999999 (gray)
  } else if (shape === 'circle') {
    // Circles are medium (2-5 hits)
    maxHealth = 2 + Math.floor(score / 15);
    color = GAME_COLORS.OBJECT_COLORS[1]; // #cccccc (light gray)
  } else {
    // Triangles are toughest (3-7 hits)
    maxHealth = 3 + Math.floor(score / 10);
    color = GAME_COLORS.OBJECT_COLORS[0]; // #ffffff (white)
  }

  return {
    id: `obj-${currentTime}-${Math.random()}`,
    x: Math.random() * (config.canvasWidth - size),
    y: -size, // Start just above viewport
    width: size,
    height: size,
    speed: getObjectSpeed(score),
    shape,
    color,
    health: maxHealth,
    maxHealth,
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

/**
 * Apply laser damage to objects
 * @param objects - Array of game objects
 * @param laserStartX - Laser start X
 * @param laserStartY - Laser start Y
 * @param laserEndX - Laser end X
 * @param laserEndY - Laser end Y
 * @param damagePerFrame - Damage to apply per frame (default 0.1)
 * @returns Updated objects and destroyed count
 */
export function applyLaserDamage(
  objects: GameObject[],
  laserStartX: number,
  laserStartY: number,
  laserEndX: number,
  laserEndY: number,
  damagePerFrame: number = 0.1
): { objects: GameObject[]; destroyedCount: number } {
  const updatedObjects: GameObject[] = [];
  let destroyedCount = 0;

  objects.forEach((obj) => {
    let isHit = false;

    // Check if laser intersects with object
    switch (obj.shape) {
      case 'rect':
        isHit = lineIntersectsRect(laserStartX, laserStartY, laserEndX, laserEndY, obj);
        break;
      case 'circle':
        isHit = lineIntersectsCircle(laserStartX, laserStartY, laserEndX, laserEndY, obj);
        break;
      case 'triangle':
        isHit = lineIntersectsTriangle(laserStartX, laserStartY, laserEndX, laserEndY, obj);
        break;
    }

    if (isHit) {
      const newHealth = obj.health - damagePerFrame;
      if (newHealth <= 0) {
        destroyedCount++;
        // Don't add to updated objects (destroyed)
      } else {
        updatedObjects.push({ ...obj, health: newHealth });
      }
    } else {
      updatedObjects.push(obj);
    }
  });

  return { objects: updatedObjects, destroyedCount };
}

/**
 * Check if line segment intersects rectangle
 */
function lineIntersectsRect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  obj: GameObject
): boolean {
  // Check if line endpoints are inside rect
  if (isPointInRect(x1, y1, obj) || isPointInRect(x2, y2, obj)) {
    return true;
  }

  // Check if line intersects any edge of rectangle
  const left = obj.x;
  const right = obj.x + obj.width;
  const top = obj.y;
  const bottom = obj.y + obj.height;

  return (
    lineIntersectsLine(x1, y1, x2, y2, left, top, right, top) ||
    lineIntersectsLine(x1, y1, x2, y2, right, top, right, bottom) ||
    lineIntersectsLine(x1, y1, x2, y2, right, bottom, left, bottom) ||
    lineIntersectsLine(x1, y1, x2, y2, left, bottom, left, top)
  );
}

/**
 * Check if line segment intersects circle
 */
function lineIntersectsCircle(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  obj: GameObject
): boolean {
  const cx = obj.x + obj.width / 2;
  const cy = obj.y + obj.height / 2;
  const radius = obj.width / 2;

  // Vector from line start to circle center
  const dx = cx - x1;
  const dy = cy - y1;

  // Line direction vector
  const lx = x2 - x1;
  const ly = y2 - y1;

  // Project circle center onto line
  const dot = dx * lx + dy * ly;
  const lenSq = lx * lx + ly * ly;
  const t = Math.max(0, Math.min(1, dot / lenSq));

  // Closest point on line to circle center
  const closestX = x1 + t * lx;
  const closestY = y1 + t * ly;

  // Distance from circle center to closest point
  const distX = cx - closestX;
  const distY = cy - closestY;
  const distSq = distX * distX + distY * distY;

  return distSq <= radius * radius;
}

/**
 * Check if line segment intersects triangle
 */
function lineIntersectsTriangle(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  obj: GameObject
): boolean {
  // Triangle vertices
  const tx1 = obj.x + obj.width / 2; // Top center
  const ty1 = obj.y;
  const tx2 = obj.x + obj.width; // Bottom right
  const ty2 = obj.y + obj.height;
  const tx3 = obj.x; // Bottom left
  const ty3 = obj.y + obj.height;

  // Check if line endpoints are inside triangle
  if (isPointInTriangle(x1, y1, obj) || isPointInTriangle(x2, y2, obj)) {
    return true;
  }

  // Check if line intersects any edge of triangle
  return (
    lineIntersectsLine(x1, y1, x2, y2, tx1, ty1, tx2, ty2) ||
    lineIntersectsLine(x1, y1, x2, y2, tx2, ty2, tx3, ty3) ||
    lineIntersectsLine(x1, y1, x2, y2, tx3, ty3, tx1, ty1)
  );
}

/**
 * Check if two line segments intersect
 */
function lineIntersectsLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number
): boolean {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom === 0) return false; // Parallel lines

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}
