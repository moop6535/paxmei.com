/**
 * MiniGame Component
 * Canvas-based falling objects game that appears when all windows are minimized
 */

import { useRef, useEffect, useMemo } from 'react';
import { useWindowStore } from '@stores/windowStore';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { prefersReducedMotion } from '@/utils/responsive';
import { useGameLoop } from './useGameLoop';
import type { GameObject, GameConfig } from './types';
import { GAME_COLORS } from './types';
import styles from './MiniGame.module.css';

const TASKBAR_HEIGHT = 48; // Match Desktop component

/**
 * MiniGame Component
 * Only renders when all windows are minimized (desktop idle state)
 */
export default function MiniGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDesktop } = useMediaQuery();
  const windows = useWindowStore((state) => state.windows);

  // Detect idle state (all windows minimized or hidden)
  const isDesktopIdle = useMemo(() => {
    return Object.values(windows).every(
      (win) => win.isMinimized || !win.isVisible
    );
  }, [windows]);

  // Check if game should render
  const shouldRenderGame =
    isDesktopIdle &&
    isDesktop &&
    !prefersReducedMotion() &&
    window.innerWidth >= 1024 &&
    window.innerHeight >= 768;

  // Game configuration
  const config: GameConfig = useMemo(
    () => ({
      canvasWidth: window.innerWidth,
      canvasHeight: window.innerHeight - TASKBAR_HEIGHT,
      maxObjects: 40,
      maxStrikes: 3,
      baseSpawnInterval: 1500,
      minSpawnInterval: 800,
      baseSpeed: 2,
      objectMinSize: 40,
      objectMaxSize: 60,
    }),
    []
  );

  const { gameState, handleClick, handleRestart } = useGameLoop(
    config,
    shouldRenderGame
  );

  // Canvas click handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle restart if game over
    if (gameState.gameOver) {
      handleRestart();
      return;
    }

    handleClick(x, y);
  };

  // Render loop
  useEffect(() => {
    if (!shouldRenderGame) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw semi-transparent background
    ctx.fillStyle = GAME_COLORS.BLACK;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.globalAlpha = 1.0;

    // Draw objects
    gameState.objects.forEach((obj) => {
      drawObject(ctx, obj);
    });

    // Draw UI (score, strikes)
    drawUI(ctx, gameState);

    // Draw game over screen if needed
    if (gameState.gameOver) {
      drawGameOver(ctx, gameState.score, rect.width, rect.height);
    }
  }, [shouldRenderGame, gameState]);

  // Window resize handler
  useEffect(() => {
    if (!shouldRenderGame) return;

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [shouldRenderGame]);

  // Don't render if conditions not met
  if (!shouldRenderGame) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      width={window.innerWidth}
      height={window.innerHeight - TASKBAR_HEIGHT}
      onClick={handleCanvasClick}
      data-testid="minigame-canvas"
    />
  );
}

/**
 * Draw a game object on canvas
 */
function drawObject(ctx: CanvasRenderingContext2D, obj: GameObject) {
  ctx.strokeStyle = obj.color;
  ctx.lineWidth = 5;

  switch (obj.shape) {
    case 'rect':
      ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
      break;
    case 'circle':
      ctx.beginPath();
      ctx.arc(
        obj.x + obj.width / 2,
        obj.y + obj.height / 2,
        obj.width / 2,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      break;
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(obj.x + obj.width / 2, obj.y); // Top center
      ctx.lineTo(obj.x + obj.width, obj.y + obj.height); // Bottom right
      ctx.lineTo(obj.x, obj.y + obj.height); // Bottom left
      ctx.closePath();
      ctx.stroke();
      break;
  }
}

/**
 * Draw UI (score and strikes)
 */
function drawUI(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.fillStyle = GAME_COLORS.WHITE;
  ctx.font = '24px monospace';
  ctx.fillText(`SCORE: ${state.score}`, 20, 40);

  ctx.fillStyle = state.strikes > 0 ? GAME_COLORS.RED : GAME_COLORS.WHITE;
  ctx.fillText(`STRIKES: ${state.strikes}/3`, 20, 75);
}

/**
 * Draw game over screen
 */
function drawGameOver(
  ctx: CanvasRenderingContext2D,
  score: number,
  canvasWidth: number,
  canvasHeight: number
) {
  // Game over overlay
  ctx.fillStyle = GAME_COLORS.BLACK;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.globalAlpha = 1.0;

  ctx.fillStyle = GAME_COLORS.WHITE;
  ctx.font = '48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvasWidth / 2, canvasHeight / 2 - 50);

  ctx.font = '32px monospace';
  ctx.fillText(`SCORE: ${score}`, canvasWidth / 2, canvasHeight / 2 + 10);

  ctx.font = '20px monospace';
  ctx.fillText('Click to restart', canvasWidth / 2, canvasHeight / 2 + 60);
}

// Import GameState type
import type { GameState } from './types';
