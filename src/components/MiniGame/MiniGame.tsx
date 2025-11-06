/**
 * MiniGame Component
 * Canvas-based falling objects game that appears when all windows are minimized
 */

import { useRef, useEffect, useMemo, useState } from 'react';
import { useWindowStore } from '@stores/windowStore';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { prefersReducedMotion } from '@/utils/responsive';
import { useGameLoop } from './useGameLoop';
import type { GameObject, GameConfig, ScorePopup, Particle, Cannon } from './types';
import { GAME_COLORS } from './types';
import * as gameLogic from './gameLogic';
import styles from './MiniGame.module.css';

const TASKBAR_HEIGHT = 48; // Match Desktop component

interface MiniGameProps {
  onExit?: () => void;
}

/**
 * MiniGame Component
 * Only renders when all windows are minimized (desktop idle state)
 */
export default function MiniGame({ onExit }: MiniGameProps = {}) {
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

  // Game configuration (reduced difficulty)
  const config: GameConfig = useMemo(
    () => ({
      canvasWidth: window.innerWidth,
      canvasHeight: window.innerHeight - TASKBAR_HEIGHT,
      maxObjects: 25, // Reduced from 40
      maxStrikes: 3,
      baseSpawnInterval: 2000, // Increased from 1500
      minSpawnInterval: 1000, // Increased from 600
      baseSpeed: 1.5, // Reduced from 2
      objectMinSize: 40,
      objectMaxSize: 60,
    }),
    []
  );

  // Game should be active whenever conditions are met
  // Pause state will be managed separately based on window visibility
  const { gameState, handleClick, handleRestart, setPaused, updateObjects, setLaser, hitObjects } = useGameLoop(
    config,
    shouldRenderGame
  );

  // Update pause state based on idle status
  useEffect(() => {
    if (!shouldRenderGame) return;

    // Pause when any window is visible (not idle)
    // Resume when all windows are minimized (idle)
    setPaused(!isDesktopIdle);
  }, [shouldRenderGame, isDesktopIdle, setPaused]);

  // Click feedback state (shows brief flash on click)
  const [clickFeedback, setClickFeedback] = useState<{
    x: number;
    y: number;
    timestamp: number;
  } | null>(null);

  // Visual effects state
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [lastCatchTime, setLastCatchTime] = useState<number>(0);
  const [comboCount, setComboCount] = useState<number>(0);
  const [strikeFlash, setStrikeFlash] = useState<number>(0);

  // Cannon and laser state
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [cannon, setCannon] = useState<Cannon>({
    x: window.innerWidth / 2,
    y: window.innerHeight - TASKBAR_HEIGHT - 40,
    angle: -Math.PI / 2, // Point upward initially
    width: 60,
    height: 30,
    isFiring: false,
  });
  const [laserIntensity, setLaserIntensity] = useState<number>(0);

  // Mouse move handler - update cannon angle and mouse position
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    // Calculate angle from cannon to mouse
    const dx = x - cannon.x;
    const dy = y - cannon.y;
    const angle = Math.atan2(dy, dx);

    setCannon((prev) => ({ ...prev, angle }));
  };

  // Mouse down handler - start firing laser
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState.gameOver) {
      // Restart on click if game over
      handleRestart();
      setComboCount(0);
      setScorePopups([]);
      setParticles([]);
      return;
    }

    setIsMouseDown(true);
    setCannon((prev) => ({ ...prev, isFiring: true }));
  };

  // Mouse up handler - stop firing laser
  const handleMouseUp = () => {
    setIsMouseDown(false);
    setCannon((prev) => ({ ...prev, isFiring: false }));
    setLaser(null);
  };

  // Update laser state when firing
  useEffect(() => {
    if (!shouldRenderGame || gameState.isPaused || gameState.gameOver) {
      setLaser(null);
      return;
    }

    if (cannon.isFiring) {
      const laserLength = 2000;
      const laserEndX = cannon.x + Math.cos(cannon.angle) * laserLength;
      const laserEndY = cannon.y + Math.sin(cannon.angle) * laserLength;

      setLaser({
        isFiring: true,
        startX: cannon.x,
        startY: cannon.y,
        endX: laserEndX,
        endY: laserEndY,
      });
    } else {
      setLaser(null);
    }
  }, [shouldRenderGame, gameState.isPaused, gameState.gameOver, cannon.isFiring, cannon.angle, cannon.x, cannon.y, setLaser]);

  // Create sparks and explosions from hit objects
  useEffect(() => {
    if (hitObjects.length === 0) return;

    const now = Date.now();
    const newParticles: Particle[] = [];

    hitObjects.forEach((hit) => {
      if (hit.wasDestroyed) {
        // Big explosion for destroyed objects
        const timeSinceLastKill = now - lastCatchTime;
        const isCombo = timeSinceLastKill < 800;
        const newComboCount = isCombo ? comboCount + 1 : 0;

        if (timeSinceLastKill >= 800 || comboCount === 0) {
          setComboCount(newComboCount);
        }
        setLastCatchTime(now);

        const particleCount = 20 + newComboCount * 4;
        for (let i = 0; i < particleCount; i++) {
          const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.2;
          const speed = 4 + Math.random() * 5;
          newParticles.push({
            id: `explosion-${now}-${i}`,
            x: hit.x,
            y: hit.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            maxLife: 1,
            color: newComboCount > 0 ? GAME_COLORS.YELLOW : GAME_COLORS.CYAN,
            size: 5 + newComboCount,
          });
        }
      } else {
        // Small sparks for objects being hit
        const sparkCount = 3;
        for (let i = 0; i < sparkCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 3;
          newParticles.push({
            id: `spark-${now}-${hit.x}-${hit.y}-${i}`,
            x: hit.x + (Math.random() - 0.5) * hit.width * 0.8,
            y: hit.y + (Math.random() - 0.5) * hit.height * 0.8,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            maxLife: 1,
            color: GAME_COLORS.WHITE,
            size: 2,
          });
        }
      }
    });

    if (newParticles.length > 0) {
      setParticles((prev) => [...prev, ...newParticles]);
    }
  }, [hitObjects, comboCount, lastCatchTime]);

  // Animate visual effects
  useEffect(() => {
    if (!shouldRenderGame || gameState.isPaused) return;

    const animateEffects = () => {
      const now = Date.now();

      // Pulse laser intensity
      if (cannon.isFiring) {
        setLaserIntensity((prev) => (prev + 0.1) % 1);
      } else {
        setLaserIntensity(0);
      }

      // Update particles
      setParticles((prev) =>
        prev
          .map((p) => {
            const age = (now - (p.id.match(/\d+/)?.[0] ? parseInt(p.id.match(/\d+/)![0]) : now)) / 600;
            const life = Math.max(0, 1 - age);
            return {
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              life,
            };
          })
          .filter((p) => p.life > 0)
      );

      // Remove old score popups (after 1 second)
      setScorePopups((prev) => prev.filter((popup) => now - popup.timestamp < 1000));
    };

    const interval = setInterval(animateEffects, 1000 / 60);
    return () => clearInterval(interval);
  }, [shouldRenderGame, gameState.isPaused, cannon.isFiring]);

  // Detect strikes and flash screen
  const prevStrikesRef = useRef(gameState.strikes);
  useEffect(() => {
    if (gameState.strikes > prevStrikesRef.current) {
      setStrikeFlash(Date.now());
    }
    prevStrikesRef.current = gameState.strikes;
  }, [gameState.strikes]);

  // ESC key handler (works during gameplay AND game over)
  useEffect(() => {
    if (!shouldRenderGame) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Signal parent to restore a window (exits idle state)
        if (onExit) {
          onExit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shouldRenderGame, onExit]);

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

    // Draw strike flash (red overlay)
    const flashAge = Date.now() - strikeFlash;
    if (flashAge < 200) {
      ctx.fillStyle = GAME_COLORS.RED;
      ctx.globalAlpha = 0.3 * (1 - flashAge / 200);
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.globalAlpha = 1.0;
    }

    // Draw laser beam if firing
    if (cannon.isFiring && !gameState.isPaused && !gameState.gameOver) {
      drawLaser(ctx, cannon, mousePos, laserIntensity, gameState.heat);
    }

    // Draw particles
    particles.forEach((particle) => {
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.life;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });

    // Draw objects with glow and health bars
    gameState.objects.forEach((obj) => {
      drawObjectWithHealthBar(ctx, obj);
    });

    // Draw cannon
    drawCannon(ctx, cannon);

    // Draw click feedback if active
    if (clickFeedback) {
      ctx.strokeStyle = GAME_COLORS.CYAN;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(clickFeedback.x, clickFeedback.y, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    // Draw score popups
    scorePopups.forEach((popup) => {
      const age = (Date.now() - popup.timestamp) / 1000;
      const yOffset = -age * 50; // Float upward
      const alpha = Math.max(0, 1 - age);

      ctx.fillStyle = popup.isCombo ? GAME_COLORS.YELLOW : GAME_COLORS.GREEN;
      ctx.globalAlpha = alpha;
      ctx.font = popup.isCombo ? 'bold 32px monospace' : 'bold 24px monospace';
      ctx.textAlign = 'center';
      const text = popup.isCombo ? `+${popup.value} COMBO!` : `+${popup.value}`;
      ctx.fillText(text, popup.x, popup.y + yOffset);
      ctx.globalAlpha = 1.0;
    });

    // Draw UI (score, strikes, combo)
    drawUI(ctx, gameState, comboCount);

    // Draw pause overlay
    if (gameState.isPaused) {
      drawPauseOverlay(ctx, rect.width, rect.height);
    }

    // Draw game over screen if needed
    if (gameState.gameOver) {
      drawGameOver(ctx, gameState.score, rect.width, rect.height);
    }
  }, [shouldRenderGame, gameState, clickFeedback, scorePopups, particles, strikeFlash, comboCount, cannon, mousePos, laserIntensity]);

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
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      data-testid="minigame-canvas"
    />
  );
}

/**
 * Draw a game object with glow effect
 */
function drawObjectWithGlow(ctx: CanvasRenderingContext2D, obj: GameObject) {
  // Draw glow (outer shadow)
  ctx.shadowColor = obj.color;
  ctx.shadowBlur = 15;
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

  // Reset shadow
  ctx.shadowBlur = 0;
}

/**
 * Draw UI (score, strikes, and combo)
 */
function drawUI(ctx: CanvasRenderingContext2D, state: GameState, combo: number) {
  ctx.textAlign = 'left';
  ctx.fillStyle = GAME_COLORS.WHITE;
  ctx.font = 'bold 28px monospace';
  ctx.fillText(`SCORE: ${state.score}`, 20, 40);

  ctx.fillStyle = state.strikes > 0 ? GAME_COLORS.RED : GAME_COLORS.WHITE;
  ctx.font = '24px monospace';
  ctx.fillText(`STRIKES: ${state.strikes}/3`, 20, 75);

  // Show combo if active
  if (combo > 0) {
    ctx.fillStyle = GAME_COLORS.YELLOW;
    ctx.font = 'bold 32px monospace';
    ctx.shadowColor = GAME_COLORS.YELLOW;
    ctx.shadowBlur = 10;
    ctx.fillText(`${combo + 1}x COMBO!`, 20, 115);
    ctx.shadowBlur = 0;
  }

  // Heat bar
  const barWidth = 250;
  const barHeight = 20;
  const barX = 20;
  const barY = combo > 0 ? 150 : 110;

  // Label
  const isOverheated = state.heat >= 1.0;
  ctx.fillStyle = isOverheated ? GAME_COLORS.RED : GAME_COLORS.WHITE;
  ctx.font = '20px monospace';
  ctx.fillText(isOverheated ? 'OVERHEATED!' : 'HEAT', barX, barY - 5);

  // Background
  ctx.fillStyle = GAME_COLORS.BLACK;
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // Heat fill (color based on heat level)
  let heatColor;
  if (state.heat < 0.5) {
    heatColor = GAME_COLORS.CYAN;
  } else if (state.heat < 0.75) {
    heatColor = GAME_COLORS.YELLOW;
  } else {
    heatColor = GAME_COLORS.RED;
  }

  ctx.fillStyle = heatColor;
  ctx.fillRect(barX, barY, barWidth * state.heat, barHeight);

  // Border
  ctx.strokeStyle = GAME_COLORS.WHITE;
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barWidth, barHeight);

  // Overheat warning flash
  if (isOverheated) {
    ctx.shadowColor = GAME_COLORS.RED;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = GAME_COLORS.RED;
    ctx.lineWidth = 3;
    ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
    ctx.shadowBlur = 0;
  }
}

/**
 * Draw pause overlay
 */
function drawPauseOverlay(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
) {
  // Semi-transparent overlay
  ctx.fillStyle = GAME_COLORS.BLACK;
  ctx.globalAlpha = 0.6;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.globalAlpha = 1.0;

  // Pause text
  ctx.fillStyle = GAME_COLORS.CYAN;
  ctx.font = 'bold 64px monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = GAME_COLORS.CYAN;
  ctx.shadowBlur = 20;
  ctx.fillText('PAUSED', canvasWidth / 2, canvasHeight / 2 - 20);
  ctx.shadowBlur = 0;

  ctx.fillStyle = GAME_COLORS.WHITE;
  ctx.font = '24px monospace';
  ctx.fillText('Minimize all windows to resume', canvasWidth / 2, canvasHeight / 2 + 40);
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

  // Game over text with glow
  ctx.fillStyle = GAME_COLORS.RED;
  ctx.font = 'bold 64px monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = GAME_COLORS.RED;
  ctx.shadowBlur = 20;
  ctx.fillText('GAME OVER', canvasWidth / 2, canvasHeight / 2 - 50);
  ctx.shadowBlur = 0;

  ctx.fillStyle = GAME_COLORS.YELLOW;
  ctx.font = 'bold 40px monospace';
  ctx.fillText(`SCORE: ${score}`, canvasWidth / 2, canvasHeight / 2 + 20);

  ctx.fillStyle = GAME_COLORS.WHITE;
  ctx.font = '24px monospace';
  ctx.fillText('Click to restart', canvasWidth / 2, canvasHeight / 2 + 70);
  ctx.font = '20px monospace';
  ctx.fillStyle = GAME_COLORS.CYAN;
  ctx.fillText('Press ESC to exit', canvasWidth / 2, canvasHeight / 2 + 105);
}

/**
 * Draw cannon at bottom center
 */
function drawCannon(ctx: CanvasRenderingContext2D, cannon: Cannon) {
  ctx.save();
  ctx.translate(cannon.x, cannon.y);
  ctx.rotate(cannon.angle);

  // Cannon barrel (rectangle extending from center)
  ctx.fillStyle = GAME_COLORS.CYAN;
  ctx.strokeStyle = GAME_COLORS.WHITE;
  ctx.lineWidth = 3;

  // Draw barrel
  ctx.fillRect(0, -cannon.height / 4, cannon.width, cannon.height / 2);
  ctx.strokeRect(0, -cannon.height / 4, cannon.width, cannon.height / 2);

  // Draw cannon base (circle)
  ctx.beginPath();
  ctx.arc(0, 0, cannon.height / 2, 0, Math.PI * 2);
  ctx.fillStyle = GAME_COLORS.WHITE;
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw laser beam from cannon to mouse
 */
function drawLaser(
  ctx: CanvasRenderingContext2D,
  cannon: Cannon,
  mousePos: { x: number; y: number },
  intensity: number,
  heat: number
) {
  const laserLength = 2000;
  const endX = cannon.x + Math.cos(cannon.angle) * laserLength;
  const endY = cannon.y + Math.sin(cannon.angle) * laserLength;

  // Determine laser color based on heat level
  let laserColor: string;
  const isOverheated = heat >= 1.0;

  if (isOverheated) {
    // Overheated: flickering red effect
    laserColor = Math.random() > 0.3 ? GAME_COLORS.RED : GAME_COLORS.YELLOW;
  } else if (heat > 0.75) {
    // Critical: red
    laserColor = GAME_COLORS.RED;
  } else if (heat > 0.5) {
    // Warming: yellow
    laserColor = GAME_COLORS.YELLOW;
  } else {
    // Cool: cyan
    laserColor = GAME_COLORS.CYAN;
  }

  // Outer glow
  ctx.strokeStyle = laserColor;
  ctx.lineWidth = 12;
  ctx.globalAlpha = 0.2 + intensity * 0.1;
  ctx.shadowColor = laserColor;
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.moveTo(cannon.x, cannon.y);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Middle layer
  ctx.lineWidth = 6;
  ctx.globalAlpha = 0.5 + intensity * 0.2;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.moveTo(cannon.x, cannon.y);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Core beam
  ctx.strokeStyle = GAME_COLORS.WHITE;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.8 + intensity * 0.2;
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.moveTo(cannon.x, cannon.y);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Reset
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1.0;
}

/**
 * Draw object with health bar
 */
function drawObjectWithHealthBar(ctx: CanvasRenderingContext2D, obj: GameObject) {
  // Draw glow (outer shadow)
  ctx.shadowColor = obj.color;
  ctx.shadowBlur = 15;
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

  // Reset shadow
  ctx.shadowBlur = 0;

  // Draw health bar if object has taken damage
  if (obj.health < obj.maxHealth) {
    const barWidth = obj.width;
    const barHeight = 6;
    const barX = obj.x;
    const barY = obj.y - 12;

    // Background (red)
    ctx.fillStyle = GAME_COLORS.RED;
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health (green -> yellow -> red)
    const healthPercent = obj.health / obj.maxHealth;
    let healthColor;
    if (healthPercent > 0.6) {
      healthColor = GAME_COLORS.GREEN;
    } else if (healthPercent > 0.3) {
      healthColor = GAME_COLORS.YELLOW;
    } else {
      healthColor = GAME_COLORS.RED;
    }

    ctx.fillStyle = healthColor;
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    // Border
    ctx.strokeStyle = GAME_COLORS.WHITE;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }
}

// Import GameState type
import type { GameState } from './types';
