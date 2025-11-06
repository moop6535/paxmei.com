/**
 * useGameLoop Hook
 * Custom React hook for managing game loop and state
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameState, GameConfig } from './types';
import * as gameLogic from './gameLogic';

/**
 * Return type for useGameLoop hook
 */
interface UseGameLoopReturn {
  gameState: GameState;
  handleClick: (x: number, y: number) => void;
  handleRestart: () => void;
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
  const animationFrameRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(Date.now());

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
        const updatedObjects = gameLogic.updateObjects(
          prevState.objects,
          deltaTime
        );

        // Check bottom collisions
        const { remainingObjects, hitCount } = gameLogic.checkBottomCollisions(
          updatedObjects,
          config.canvasHeight
        );

        const newStrikes = prevState.strikes + hitCount;
        const gameOver = newStrikes >= config.maxStrikes;

        // Spawn new objects if conditions are met
        let objects = remainingObjects;
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

  return { gameState, handleClick, handleRestart };
}
