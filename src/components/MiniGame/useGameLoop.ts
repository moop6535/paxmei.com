/**
 * useGameLoop Hook
 * Custom React hook for managing game loop and state
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameState, GameConfig, GameObject } from './types';
import * as gameLogic from './gameLogic';
import type { HitObjectInfo } from './gameLogic';

/**
 * Laser state for continuous firing
 */
export interface LaserState {
  isFiring: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

/**
 * Return type for useGameLoop hook
 */
interface UseGameLoopReturn {
  gameState: GameState;
  handleClick: (x: number, y: number) => void;
  handleRestart: () => void;
  setPaused: (paused: boolean) => void;
  updateObjects: (objects: GameObject[], scoreIncrease: number) => void;
  setLaser: (laser: LaserState | null) => void;
  hitObjects: HitObjectInfo[];
}

/**
 * Initial game state
 */
const createInitialState = (): GameState => ({
  score: 0,
  objects: [],
  strikes: 0,
  gameOver: false,
  isPaused: false,
  lastSpawnTime: Date.now(),
  difficultyMultiplier: 1,
  heat: 0,
});

/**
 * Custom hook for game loop management
 * @param config - Game configuration
 * @param isActive - Whether game is currently active
 * @returns Game state and handlers
 */
export function useGameLoop(
  config: GameConfig,
  isActive: boolean
): UseGameLoopReturn {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastFrameTimeRef = useRef<number>(Date.now());
  const laserRef = useRef<LaserState | null>(null);
  const [hitObjects, setHitObjects] = useState<HitObjectInfo[]>([]);

  // Game loop
  useEffect(() => {
    // Don't run loop if not active, paused, or game over
    if (!isActive || gameState.isPaused || gameState.gameOver) {
      return;
    }

    const loop = () => {
      const now = Date.now();
      const deltaTime = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      setGameState((prevState) => {
        // Update object positions
        let objects = gameLogic.updateObjects(
          prevState.objects,
          deltaTime
        );

        // Update heat
        let newHeat = prevState.heat;
        const isOverheated = prevState.heat >= 1.0;

        if (laserRef.current && laserRef.current.isFiring && !isOverheated) {
          // Build heat while firing (not overheated)
          newHeat = Math.min(1.0, prevState.heat + 0.015);
        } else {
          // Cool down when not firing or overheated
          newHeat = Math.max(0, prevState.heat - 0.008);
        }

        // Apply laser damage if firing and not overheated
        let scoreIncrease = 0;
        if (laserRef.current && laserRef.current.isFiring && !isOverheated) {
          const laserResult = gameLogic.applyLaserDamage(
            objects,
            laserRef.current.startX,
            laserRef.current.startY,
            laserRef.current.endX,
            laserRef.current.endY,
            0.08 // Damage per frame
          );
          objects = laserResult.objects;
          scoreIncrease = laserResult.destroyedCount;

          // Update hit objects for visual effects
          setHitObjects(laserResult.hitObjects);
        } else {
          setHitObjects([]);
        }

        // Check bottom collisions
        const { remainingObjects, hitCount } = gameLogic.checkBottomCollisions(
          objects,
          config.canvasHeight
        );

        const newStrikes = prevState.strikes + hitCount;
        const gameOver = newStrikes >= config.maxStrikes;

        // Spawn new objects if conditions are met
        objects = remainingObjects;
        const spawnInterval = gameLogic.getSpawnInterval(prevState.score);
        const shouldSpawn =
          objects.length < config.maxObjects &&
          now - prevState.lastSpawnTime >= spawnInterval;

        let lastSpawnTime = prevState.lastSpawnTime;

        if (shouldSpawn) {
          const newObject = gameLogic.generateRandomShape(
            config,
            now,
            prevState.score
          );
          objects = [...objects, newObject];
          lastSpawnTime = now;
        }

        return {
          ...prevState,
          objects,
          strikes: newStrikes,
          gameOver,
          lastSpawnTime,
          score: prevState.score + scoreIncrease,
          heat: newHeat,
        };
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    // Cleanup on unmount or when conditions change
    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, gameState.isPaused, gameState.gameOver, config]);

  /**
   * Handle click event
   * @param x - X coordinate of click
   * @param y - Y coordinate of click
   */
  const handleClick = useCallback((x: number, y: number) => {
    setGameState((prevState) => {
      if (prevState.gameOver) return prevState;

      const result = gameLogic.checkClickCollision(x, y, prevState.objects);
      if (result.hit) {
        return {
          ...prevState,
          score: prevState.score + 1,
          objects: result.remainingObjects,
        };
      }
      return prevState;
    });
  }, []);

  /**
   * Restart game from initial state
   */
  const handleRestart = useCallback(() => {
    lastFrameTimeRef.current = Date.now();
    setGameState(createInitialState());
  }, []);

  /**
   * Set pause state
   * @param paused - Whether game should be paused
   */
  const setPaused = useCallback((paused: boolean) => {
    setGameState((prevState) => ({
      ...prevState,
      isPaused: paused,
    }));
  }, []);

  /**
   * Update objects array directly (for laser damage)
   * @param objects - New objects array
   * @param scoreIncrease - Amount to increase score by
   */
  const updateObjects = useCallback((objects: GameObject[], scoreIncrease: number) => {
    setGameState((prevState) => ({
      ...prevState,
      objects,
      score: prevState.score + scoreIncrease,
    }));
  }, []);

  /**
   * Set laser state for continuous firing
   * @param laser - Laser state or null to stop firing
   */
  const setLaser = useCallback((laser: LaserState | null) => {
    laserRef.current = laser;
  }, []);

  return { gameState, handleClick, handleRestart, setPaused, updateObjects, setLaser, hitObjects };
}
