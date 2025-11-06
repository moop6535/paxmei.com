/**
 * MiniGame Logic Tests
 * Comprehensive unit tests for pure game logic functions
 */

import { describe, it, expect } from 'vitest';
import {
  getSpawnInterval,
  getObjectSpeed,
  generateRandomShape,
  updateObjects,
  checkBottomCollisions,
  checkClickCollision,
  isPointInRect,
  isPointInCircle,
  isPointInTriangle,
} from './gameLogic';
import type { GameObject, GameConfig } from './types';

describe('gameLogic', () => {
  const mockConfig: GameConfig = {
    canvasWidth: 800,
    canvasHeight: 600,
    maxObjects: 40,
    maxStrikes: 3,
    baseSpawnInterval: 1500,
    minSpawnInterval: 800,
    baseSpeed: 2,
    objectMinSize: 40,
    objectMaxSize: 60,
  };

  describe('getSpawnInterval', () => {
    it('returns base interval at score 0', () => {
      expect(getSpawnInterval(0)).toBe(2000);
    });

    it('decreases interval as score increases (faster ramp-up)', () => {
      expect(getSpawnInterval(10)).toBe(1850); // 2000 - 10*15
      expect(getSpawnInterval(30)).toBe(1550); // 2000 - 30*15
    });

    it('caps at minimum interval (600ms)', () => {
      expect(getSpawnInterval(70)).toBe(1000); // 2000 - 70*15 = 950, capped at 1000
      expect(getSpawnInterval(100)).toBe(1000);
      expect(getSpawnInterval(200)).toBe(1000);
    });

    it('handles negative scores gracefully', () => {
      expect(getSpawnInterval(-10)).toBe(2000); // Should max out
    });
  });

  describe('getObjectSpeed', () => {
    it('returns base speed at score 0', () => {
      expect(getObjectSpeed(0)).toBe(1.5);
    });

    it('increases speed linearly with score (faster ramp-up)', () => {
      expect(getObjectSpeed(10)).toBe(2.3);  // 1.5 + 10*0.08
      expect(getObjectSpeed(20)).toBe(3.1);  // 1.5 + 20*0.08
      expect(getObjectSpeed(50)).toBe(5.5);  // 1.5 + 50*0.08
    });

    it('continues increasing without cap', () => {
      expect(getObjectSpeed(100)).toBe(9.5);  // 1.5 + 100*0.08
      expect(getObjectSpeed(200)).toBe(17.5); // 1.5 + 200*0.08
    });
  });

  describe('generateRandomShape', () => {
    it('creates object with valid properties', () => {
      const obj = generateRandomShape(mockConfig, Date.now(), 0);

      expect(obj.id).toBeDefined();
      expect(typeof obj.id).toBe('string');
      expect(obj.shape).toMatch(/^(rect|circle|triangle)$/);
      expect(obj.color).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('creates object within canvas bounds', () => {
      const obj = generateRandomShape(mockConfig, Date.now(), 0);

      expect(obj.x).toBeGreaterThanOrEqual(0);
      expect(obj.x).toBeLessThanOrEqual(mockConfig.canvasWidth - obj.width);
    });

    it('starts object above viewport', () => {
      const obj = generateRandomShape(mockConfig, Date.now(), 0);

      expect(obj.y).toBeLessThan(0);
    });

    it('creates object with size in valid range', () => {
      const obj = generateRandomShape(mockConfig, Date.now(), 0);

      expect(obj.width).toBeGreaterThanOrEqual(mockConfig.objectMinSize);
      expect(obj.width).toBeLessThanOrEqual(mockConfig.objectMaxSize);
      expect(obj.height).toBe(obj.width); // Should be square
    });

    it('assigns speed based on score', () => {
      const obj1 = generateRandomShape(mockConfig, Date.now(), 0);
      const obj2 = generateRandomShape(mockConfig, Date.now(), 20);

      expect(obj1.speed).toBe(1.5);
      expect(obj2.speed).toBe(3.1); // 1.5 + 20*0.08
    });

    it('creates unique IDs', () => {
      const obj1 = generateRandomShape(mockConfig, Date.now(), 0);
      const obj2 = generateRandomShape(mockConfig, Date.now(), 0);

      expect(obj1.id).not.toBe(obj2.id);
    });
  });

  describe('updateObjects', () => {
    it('moves objects down based on speed', () => {
      const objects: GameObject[] = [
        {
          id: '1',
          x: 100,
          y: 100,
          width: 50,
          height: 50,
          speed: 2,
          shape: 'rect',
          color: '#ffffff',
        },
      ];

      const updated = updateObjects(objects, 16.67); // 1 frame at 60fps
      expect(updated[0].y).toBeCloseTo(102, 1);
    });

    it('handles multiple objects', () => {
      const objects: GameObject[] = [
        {
          id: '1',
          x: 100,
          y: 100,
          width: 50,
          height: 50,
          speed: 2,
          shape: 'rect',
          color: '#ffffff',
        },
        {
          id: '2',
          x: 200,
          y: 150,
          width: 50,
          height: 50,
          speed: 3,
          shape: 'circle',
          color: '#cccccc',
        },
      ];

      const updated = updateObjects(objects, 16.67);
      expect(updated).toHaveLength(2);
      expect(updated[0].y).toBeCloseTo(102, 1);
      expect(updated[1].y).toBeCloseTo(153, 1);
    });

    it('handles varying deltaTime correctly', () => {
      const objects: GameObject[] = [
        {
          id: '1',
          x: 100,
          y: 100,
          width: 50,
          height: 50,
          speed: 2,
          shape: 'rect',
          color: '#ffffff',
        },
      ];

      // Double deltaTime should double movement
      const updated1 = updateObjects(objects, 16.67);
      const updated2 = updateObjects(objects, 33.34);

      const movement1 = updated1[0].y - 100;
      const movement2 = updated2[0].y - 100;

      expect(movement2).toBeCloseTo(movement1 * 2, 1);
    });

    it('does not mutate original array', () => {
      const objects: GameObject[] = [
        {
          id: '1',
          x: 100,
          y: 100,
          width: 50,
          height: 50,
          speed: 2,
          shape: 'rect',
          color: '#ffffff',
        },
      ];

      const original = objects[0].y;
      updateObjects(objects, 16.67);

      expect(objects[0].y).toBe(original);
    });
  });

  describe('checkBottomCollisions', () => {
    it('detects objects past bottom', () => {
      const objects: GameObject[] = [
        {
          id: '1',
          x: 100,
          y: 590,
          width: 50,
          height: 50,
          speed: 2,
          shape: 'rect',
          color: '#ffffff',
        },
      ];

      const result = checkBottomCollisions(objects, 600);
      expect(result.hitCount).toBe(1);
      expect(result.remainingObjects).toHaveLength(0);
    });

    it('keeps objects above bottom', () => {
      const objects: GameObject[] = [
        {
          id: '1',
          x: 100,
          y: 500,
          width: 50,
          height: 50,
          speed: 2,
          shape: 'rect',
          color: '#ffffff',
        },
      ];

      const result = checkBottomCollisions(objects, 600);
      expect(result.hitCount).toBe(0);
      expect(result.remainingObjects).toHaveLength(1);
    });

    it('handles objects exactly at bottom', () => {
      const objects: GameObject[] = [
        {
          id: '1',
          x: 100,
          y: 550,
          width: 50,
          height: 50,
          speed: 2,
          shape: 'rect',
          color: '#ffffff',
        },
      ];

      const result = checkBottomCollisions(objects, 600);
      expect(result.hitCount).toBe(1);
    });

    it('handles mixed case', () => {
      const objects: GameObject[] = [
        {
          id: '1',
          x: 100,
          y: 500,
          width: 50,
          height: 50,
          speed: 2,
          shape: 'rect',
          color: '#ffffff',
        },
        {
          id: '2',
          x: 200,
          y: 590,
          width: 50,
          height: 50,
          speed: 2,
          shape: 'circle',
          color: '#cccccc',
        },
        {
          id: '3',
          x: 300,
          y: 400,
          width: 50,
          height: 50,
          speed: 2,
          shape: 'triangle',
          color: '#999999',
        },
      ];

      const result = checkBottomCollisions(objects, 600);
      expect(result.hitCount).toBe(1);
      expect(result.remainingObjects).toHaveLength(2);
      expect(result.remainingObjects.find((o) => o.id === '2')).toBeUndefined();
    });

    it('handles empty array', () => {
      const result = checkBottomCollisions([], 600);
      expect(result.hitCount).toBe(0);
      expect(result.remainingObjects).toHaveLength(0);
    });
  });

  describe('checkClickCollision', () => {
    it('detects hit on rectangle', () => {
      const objects: GameObject[] = [
        {
          id: '1',
          x: 100,
          y: 100,
          width: 50,
          height: 50,
          speed: 2,
          shape: 'rect',
          color: '#ffffff',
        },
      ];

      const result = checkClickCollision(120, 120, objects);
      expect(result.hit).toBe(true);
      expect(result.hitObjectId).toBe('1');
      expect(result.remainingObjects).toHaveLength(0);
    });

    it('detects hit on circle', () => {
      const objects: GameObject[] = [
        {
          id: '1',
          x: 100,
          y: 100,
          width: 50,
          height: 50,
          speed: 2,
          shape: 'circle',
          color: '#ffffff',
        },
      ];

      const result = checkClickCollision(125, 125, objects);
      expect(result.hit).toBe(true);
      expect(result.hitObjectId).toBe('1');
    });

    it('detects hit on triangle', () => {
      const objects: GameObject[] = [
        {
          id: '1',
          x: 100,
          y: 100,
          width: 50,
          height: 50,
          speed: 2,
          shape: 'triangle',
          color: '#ffffff',
        },
      ];

      const result = checkClickCollision(125, 125, objects);
      expect(result.hit).toBe(true);
      expect(result.hitObjectId).toBe('1');
    });

    it('returns false for miss', () => {
      const objects: GameObject[] = [
        {
          id: '1',
          x: 100,
          y: 100,
          width: 50,
          height: 50,
          speed: 2,
          shape: 'rect',
          color: '#ffffff',
        },
      ];

      const result = checkClickCollision(200, 200, objects);
      expect(result.hit).toBe(false);
      expect(result.hitObjectId).toBeUndefined();
      expect(result.remainingObjects).toHaveLength(1);
    });

    it('hits first object in array', () => {
      const objects: GameObject[] = [
        {
          id: '1',
          x: 100,
          y: 100,
          width: 50,
          height: 50,
          speed: 2,
          shape: 'rect',
          color: '#ffffff',
        },
        {
          id: '2',
          x: 110,
          y: 110,
          width: 50,
          height: 50,
          speed: 2,
          shape: 'rect',
          color: '#cccccc',
        },
      ];

      // Click in overlapping area
      const result = checkClickCollision(120, 120, objects);
      expect(result.hit).toBe(true);
      expect(result.hitObjectId).toBe('1');
      expect(result.remainingObjects).toHaveLength(1);
    });

    it('handles empty array', () => {
      const result = checkClickCollision(100, 100, []);
      expect(result.hit).toBe(false);
      expect(result.remainingObjects).toHaveLength(0);
    });
  });

  describe('isPointInRect', () => {
    const rect: GameObject = {
      id: '1',
      x: 100,
      y: 100,
      width: 50,
      height: 50,
      speed: 2,
      shape: 'rect',
      color: '#ffffff',
    };

    it('detects point inside rectangle', () => {
      expect(isPointInRect(125, 125, rect)).toBe(true);
    });

    it('detects point on edges', () => {
      expect(isPointInRect(100, 100, rect)).toBe(true); // Top-left
      expect(isPointInRect(150, 150, rect)).toBe(true); // Bottom-right
    });

    it('rejects point outside rectangle', () => {
      expect(isPointInRect(50, 125, rect)).toBe(false); // Left
      expect(isPointInRect(200, 125, rect)).toBe(false); // Right
      expect(isPointInRect(125, 50, rect)).toBe(false); // Above
      expect(isPointInRect(125, 200, rect)).toBe(false); // Below
    });
  });

  describe('isPointInCircle', () => {
    const circle: GameObject = {
      id: '1',
      x: 100,
      y: 100,
      width: 50,
      height: 50,
      speed: 2,
      shape: 'circle',
      color: '#ffffff',
    };

    it('detects point at center', () => {
      expect(isPointInCircle(125, 125, circle)).toBe(true);
    });

    it('detects point near edge', () => {
      expect(isPointInCircle(145, 125, circle)).toBe(true);
    });

    it('rejects point outside circle', () => {
      expect(isPointInCircle(180, 125, circle)).toBe(false);
      expect(isPointInCircle(125, 180, circle)).toBe(false);
    });

    it('rejects point at corners of bounding box', () => {
      // Corners of bounding box are outside circle
      expect(isPointInCircle(100, 100, circle)).toBe(false);
      expect(isPointInCircle(150, 150, circle)).toBe(false);
    });
  });

  describe('isPointInTriangle', () => {
    const triangle: GameObject = {
      id: '1',
      x: 100,
      y: 100,
      width: 50,
      height: 50,
      speed: 2,
      shape: 'triangle',
      color: '#ffffff',
    };

    it('detects point at center', () => {
      expect(isPointInTriangle(125, 125, triangle)).toBe(true);
    });

    it('detects point near vertices', () => {
      // Near top center
      expect(isPointInTriangle(125, 110, triangle)).toBe(true);
      // Near bottom
      expect(isPointInTriangle(125, 140, triangle)).toBe(true);
    });

    it('rejects point outside triangle', () => {
      expect(isPointInTriangle(125, 50, triangle)).toBe(false); // Above
      expect(isPointInTriangle(125, 200, triangle)).toBe(false); // Below
      expect(isPointInTriangle(50, 125, triangle)).toBe(false); // Left
      expect(isPointInTriangle(200, 125, triangle)).toBe(false); // Right
    });

    it('rejects corners of bounding box', () => {
      // Top corners are outside triangle
      expect(isPointInTriangle(100, 100, triangle)).toBe(false);
      expect(isPointInTriangle(150, 100, triangle)).toBe(false);
    });
  });
});
