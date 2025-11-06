# Plan: Desktop Mini-Game (Idle State Easter Egg)

## Metadata
- **ID**: 0003-desktop-mini-game
- **Status**: draft
- **Specification**: [codev/specs/0003-desktop-mini-game.md](../specs/0003-desktop-mini-game.md)
- **Created**: 2025-11-06

## Executive Summary
This plan implements a brutalist-aesthetic falling objects arcade game that activates when all desktop windows are minimized. The implementation follows a bottom-up approach, building from pure logic functions through rendering to integration. The game is fully isolated in `src/components/MiniGame/` and can be disabled by commenting 2 lines in Desktop.tsx.

**Approach**: Canvas-based falling objects (Approach 1 from specification)
- Geometric shapes fall from top of screen
- Single-click destruction mechanic
- Progressive difficulty (spawn rate and speed increase with score)
- 3-strikes game over rule
- Self-contained, tree-shakeable implementation

## Success Metrics
- [ ] All specification success criteria met
- [ ] Test coverage >80% for game logic
- [ ] Bundle size increase <20KB gzipped
- [ ] 60fps with 0-25 objects, 45fps with 25-40 objects
- [ ] Game can be disabled by commenting 2 lines
- [ ] Zero console errors or warnings
- [ ] Respects prefers-reduced-motion
- [ ] Works on viewports ≥1024x768

## Phase Breakdown

### Phase 1: Core Game Types and Pure Logic
**Dependencies**: None
**Status**: pending

#### Objectives
- Establish type-safe foundation for game state and objects
- Implement pure functions for game mechanics (no side effects)
- Create independently testable game logic

#### Deliverables
- [ ] `src/components/MiniGame/types.ts` - All TypeScript interfaces
- [ ] `src/components/MiniGame/gameLogic.ts` - Pure functions for game mechanics
- [ ] Unit tests for all pure functions
- [ ] JSDoc documentation for all exports

#### Implementation Details

**Files to Create**:
```
src/components/MiniGame/
  ├── types.ts           # All game types
  └── gameLogic.ts       # Pure game logic functions
```

**types.ts**:
```typescript
export type ShapeType = 'rect' | 'circle' | 'triangle';

// Color palette (brutalist high-contrast)
export const GAME_COLORS = {
  WHITE: '#ffffff',
  BLACK: '#000000',
  RED: '#ff0000',
  OBJECT_COLORS: ['#ffffff', '#cccccc', '#999999'], // White to gray spectrum
} as const;

export interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  shape: ShapeType;
  color: string; // One of GAME_COLORS.OBJECT_COLORS
}

export interface GameState {
  score: number;
  objects: GameObject[];
  strikes: number; // 0-3
  gameOver: boolean;
  isPaused: boolean;
  lastSpawnTime: number;
  difficultyMultiplier: number;
}

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
```

**gameLogic.ts** (Pure Functions):
```typescript
// Spawn interval calculation
export function getSpawnInterval(score: number): number {
  return Math.max(800, 1500 - (score * 10));
}

// Object speed calculation
export function getObjectSpeed(score: number): number {
  return 2 + (score * 0.05);
}

// Generate random shape
export function generateRandomShape(config: GameConfig, currentTime: number, score: number): GameObject {
  const shapes: ShapeType[] = ['rect', 'circle', 'triangle'];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const size = config.objectMinSize + Math.random() * (config.objectMaxSize - config.objectMinSize);
  const color = GAME_COLORS.OBJECT_COLORS[Math.floor(Math.random() * GAME_COLORS.OBJECT_COLORS.length)];

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

// Update all objects positions
export function updateObjects(objects: GameObject[], deltaTime: number): GameObject[] {
  // Move objects down based on speed
}

// Check if object hit bottom
export function checkBottomCollisions(objects: GameObject[], canvasHeight: number): {
  remainingObjects: GameObject[];
  hitCount: number;
} {
  // Return objects that didn't hit + count of hits
}

// Check if click hit an object
export function checkClickCollision(
  clickX: number,
  clickY: number,
  objects: GameObject[]
): { hit: boolean; hitObjectId?: string; remainingObjects: GameObject[] } {
  // Point-in-shape collision detection
}

// Check if point is in rectangle
export function isPointInRect(px: number, py: number, obj: GameObject): boolean {
  // AABB collision
}

// Check if point is in circle
export function isPointInCircle(px: number, py: number, obj: GameObject): boolean {
  // Distance-based collision
}

// Check if point is in triangle
export function isPointInTriangle(px: number, py: number, obj: GameObject): boolean {
  // Barycentric coordinate method
}
```

#### Acceptance Criteria
- [ ] All types defined with complete JSDoc comments
- [ ] All pure functions return predictable results (no side effects)
- [ ] Spawn interval decreases from 1500ms to 800ms as score increases
- [ ] Object speed increases with score (2 + score * 0.05)
- [ ] Collision detection works for all three shapes
- [ ] All edge cases handled (negative coordinates, out of bounds)

#### Test Plan
- **Unit Tests**:
  - `getSpawnInterval()` returns correct values for scores 0, 10, 50, 100
  - `getObjectSpeed()` increases linearly with score
  - `generateRandomShape()` creates valid objects within canvas bounds
  - `updateObjects()` moves all objects by speed * deltaTime
  - `checkBottomCollisions()` correctly identifies objects past canvas height
  - `checkClickCollision()` for each shape type (rect, circle, triangle)
  - Point-in-shape functions for edge cases (on border, outside, inside)
- **Coverage Target**: 100% for pure functions

#### Rollback Strategy
Delete files, no integration yet - safe to remove

#### Risks
- **Risk**: Triangle collision detection complexity
  - **Mitigation**: Use well-tested barycentric coordinate algorithm, add comprehensive tests

---

### Phase 2: Game Loop and State Management
**Dependencies**: Phase 1
**Status**: pending

#### Objectives
- Implement game loop using requestAnimationFrame
- Manage game state with React hooks
- Handle spawn timing and object lifecycle

#### Deliverables
- [ ] `src/components/MiniGame/useGameLoop.ts` - Custom hook for game loop
- [ ] Integration tests for game loop
- [ ] State management tests (spawn timing, score updates, game over)

#### Implementation Details

**Files to Create**:
```
src/components/MiniGame/
  └── useGameLoop.ts     # Game loop hook
```

**useGameLoop.ts**:
```typescript
import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, GameConfig, GameObject } from './types';
import * as gameLogic from './gameLogic';

interface UseGameLoopReturn {
  gameState: GameState;
  handleClick: (x: number, y: number) => void;
  handleRestart: () => void;
}

export function useGameLoop(
  config: GameConfig,
  isActive: boolean
): UseGameLoopReturn {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const animationFrameRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(Date.now());

  // Game loop
  useEffect(() => {
    if (!isActive || gameState.isPaused || gameState.gameOver) {
      return;
    }

    const loop = () => {
      const now = Date.now();
      const deltaTime = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      setGameState(prevState => {
        // Update object positions
        const updatedObjects = gameLogic.updateObjects(prevState.objects, deltaTime);

        // Check bottom collisions
        const { remainingObjects, hitCount } = gameLogic.checkBottomCollisions(
          updatedObjects,
          config.canvasHeight
        );

        const newStrikes = prevState.strikes + hitCount;
        const gameOver = newStrikes >= config.maxStrikes;

        // Spawn new objects
        let objects = remainingObjects;
        if (
          objects.length < config.maxObjects &&
          now - prevState.lastSpawnTime >= gameLogic.getSpawnInterval(prevState.score)
        ) {
          const newObject = gameLogic.generateRandomShape(config, now, prevState.score);
          objects = [...objects, newObject];
        }

        return {
          ...prevState,
          objects,
          strikes: newStrikes,
          gameOver,
          lastSpawnTime: objects.length > remainingObjects.length ? now : prevState.lastSpawnTime,
        };
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, gameState.isPaused, gameState.gameOver, config]);

  // Click handler
  const handleClick = useCallback((x: number, y: number) => {
    setGameState(prevState => {
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

  // Restart handler
  const handleRestart = useCallback(() => {
    setGameState(initialState);
  }, []);

  return { gameState, handleClick, handleRestart };
}
```

#### Acceptance Criteria
- [ ] Game loop runs at 60fps when active
- [ ] Game loop stops when isActive=false
- [ ] Objects spawn at correct intervals based on score
- [ ] Objects are capped at 40 simultaneous
- [ ] Strikes increment when objects hit bottom
- [ ] Game over triggers at 3 strikes
- [ ] Click handler updates score correctly
- [ ] Restart resets all state
- [ ] No memory leaks (requestAnimationFrame cleanup)

#### Test Plan
- **Unit Tests**:
  - Hook initializes with correct default state
  - Click handler increments score on hit
  - Click handler ignores misses
  - Restart resets state
- **Integration Tests**:
  - Game loop updates objects over time
  - Spawn timing respects intervals
  - Object cap enforced
  - Game over state reached correctly
- **Manual Testing**:
  - Run game loop for 60 seconds, verify no performance degradation
  - Check browser DevTools Performance tab for frame drops

#### Rollback Strategy
Remove useGameLoop.ts, revert Phase 1 if needed

#### Risks
- **Risk**: requestAnimationFrame memory leaks
  - **Mitigation**: Thorough cleanup in useEffect, memory profiling with React DevTools
- **Risk**: State updates causing unnecessary re-renders
  - **Mitigation**: Use useCallback, profile with React DevTools Profiler

---

### Phase 3: Canvas Rendering and Visual Presentation
**Dependencies**: Phase 1, Phase 2
**Status**: pending

#### Objectives
- Implement canvas rendering with brutalist aesthetic
- Create visual feedback for game events (hits, strikes)
- Style game UI (score, strikes, game over screen)

#### Deliverables
- [ ] `src/components/MiniGame/MiniGame.tsx` - Main component with rendering
- [ ] `src/components/MiniGame/MiniGame.module.css` - Brutalist styles
- [ ] Visual rendering tests (snapshot or manual)
- [ ] Accessibility tests (contrast, reduced motion)

#### Implementation Details

**Files to Create**:
```
src/components/MiniGame/
  ├── MiniGame.tsx
  └── MiniGame.module.css
```

**MiniGame.tsx** (Rendering Logic):
```typescript
import { useRef, useEffect, useMemo } from 'react';
import { useGameLoop } from './useGameLoop';
import { GameObject, GameConfig, GAME_COLORS } from './types';
import styles from './MiniGame.module.css';

const TASKBAR_HEIGHT = 48; // Match Desktop component

export default function MiniGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game configuration
  const config: GameConfig = useMemo(() => ({
    canvasWidth: window.innerWidth,
    canvasHeight: window.innerHeight - TASKBAR_HEIGHT,
    maxObjects: 40,
    maxStrikes: 3,
    baseSpawnInterval: 1500,
    minSpawnInterval: 800,
    baseSpeed: 2,
    objectMinSize: 40,
    objectMaxSize: 60,
  }), []);

  const { gameState, handleClick, handleRestart } = useGameLoop(config, true);

  // Render loop
  useEffect(() => {
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
    gameState.objects.forEach(obj => {
      drawObject(ctx, obj);
    });

    // Draw UI (score, strikes)
    drawUI(ctx, gameState);

    // Draw game over screen if needed
    if (gameState.gameOver) {
      drawGameOver(ctx, gameState.score, handleRestart);
    }
  }, [gameState]);

  // Click handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    handleClick(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      width={window.innerWidth}
      height={window.innerHeight - 48} // Subtract taskbar
      onClick={handleCanvasClick}
    />
  );
}

// Draw functions
function drawObject(ctx: CanvasRenderingContext2D, obj: GameObject) {
  ctx.strokeStyle = obj.color;
  ctx.lineWidth = 5;

  switch (obj.shape) {
    case 'rect':
      ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
      break;
    case 'circle':
      ctx.beginPath();
      ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(obj.x + obj.width / 2, obj.y);
      ctx.lineTo(obj.x + obj.width, obj.y + obj.height);
      ctx.lineTo(obj.x, obj.y + obj.height);
      ctx.closePath();
      ctx.stroke();
      break;
  }
}

function drawUI(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.fillStyle = GAME_COLORS.WHITE;
  ctx.font = '24px monospace';
  ctx.fillText(`SCORE: ${state.score}`, 20, 40);

  ctx.fillStyle = state.strikes > 0 ? GAME_COLORS.RED : GAME_COLORS.WHITE;
  ctx.fillText(`STRIKES: ${state.strikes}/3`, 20, 75);
}

function drawGameOver(ctx: CanvasRenderingContext2D, score: number, canvasWidth: number, canvasHeight: number) {
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
```

**MiniGame.module.css** (Brutalist Styling):
```css
.canvas {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 90; /* Above particles (1), below windows (100+) */
  cursor: crosshair;
  image-rendering: pixelated; /* Brutalist crisp edges */
}

.canvas:focus {
  outline: 4px solid #ffffff;
  outline-offset: -4px;
}
```

#### Acceptance Criteria
- [ ] Canvas renders at z-index 90 (above particles, below windows)
- [ ] Objects render with correct shapes (rect, circle, triangle)
- [ ] Borders are 5px thick and high-contrast
- [ ] Score displays in top-left with monospace font
- [ ] Strikes display below score, red when >0
- [ ] Game over screen centers text and shows score
- [ ] Click changes cursor to crosshair
- [ ] Semi-transparent background (rgba(0,0,0,0.7)) applied

#### Test Plan
- **Visual Tests**:
  - Manually verify all shapes render correctly
  - Check brutalist aesthetic (thick borders, stark colors)
  - Verify z-index layering (canvas above particles)
  - Test on multiple resolutions
- **Accessibility Tests**:
  - Verify contrast ratios meet WCAG AA
  - Test keyboard navigation (though mouse-only game)
- **Manual Testing**:
  - Play game and verify visual feedback on clicks
  - Check game over screen appears correctly

#### Rollback Strategy
Remove MiniGame.tsx and .module.css, keep Phase 1 & 2

#### Risks
- **Risk**: Canvas performance issues with many objects
  - **Mitigation**: Object cap at 40, batch draw calls, profile with DevTools
- **Risk**: High DPI displays causing blur
  - **Mitigation**: Scale canvas correctly with devicePixelRatio if needed

---

### Phase 4: Input Handling and Game Control
**Dependencies**: Phase 1, Phase 2, Phase 3
**Status**: pending

#### Objectives
- Implement click feedback (visual flash on hit) integrated into render loop
- Add ESC key handler for accessibility (works during gameplay AND game over)
- Handle game restart from game over screen
- Ensure input handling doesn't cause performance issues

#### Deliverables
- [ ] Click feedback animation
- [ ] ESC key listener and cleanup
- [ ] Restart functionality from game over state
- [ ] Input handling tests

#### Implementation Details

**Updates to MiniGame.tsx**:
```typescript
// Add to MiniGame component:

// Click feedback state (integrated into game state)
const [clickFeedback, setClickFeedback] = useState<{ x: number; y: number; timestamp: number } | null>(null);

// Enhanced click handler with feedback
const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Visual feedback (150ms flash)
  setClickFeedback({ x, y, timestamp: Date.now() });
  setTimeout(() => setClickFeedback(null), 150);

  // Handle game restart if game over
  if (gameState.gameOver) {
    handleRestart();
    return;
  }

  handleClick(x, y);
};

// ESC key handler (works during gameplay AND game over)
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Signal parent to restore a window (handled in Phase 5)
      if (onExit) onExit();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [onExit]);

// Update render loop to include click feedback
useEffect(() => {
  // ... existing render code ...

  // Draw click feedback if active
  if (clickFeedback) {
    ctx.strokeStyle = GAME_COLORS.WHITE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(clickFeedback.x, clickFeedback.y, 20, 0, Math.PI * 2);
    ctx.stroke();
  }
}, [gameState, clickFeedback]);
```

#### Acceptance Criteria
- [ ] Click shows brief white circle flash (150ms)
- [ ] ESC key exits game (handled by parent Desktop component)
- [ ] Clicking during game over restarts game
- [ ] Rapid clicks don't cause issues (implicit debouncing via state)
- [ ] Event listeners cleaned up on unmount

#### Test Plan
- **Unit Tests**:
  - ESC key triggers handleExit callback
  - Click during game over calls handleRestart
- **Integration Tests**:
  - Click feedback appears and disappears
  - Multiple rapid clicks handled gracefully
- **Manual Testing**:
  - Click objects and verify flash appears
  - Press ESC and verify game exits
  - Rapid click test (10+ clicks per second)

#### Rollback Strategy
Revert changes to MiniGame.tsx, keep Phase 1-3

#### Risks
- **Risk**: Event listener memory leaks
  - **Mitigation**: Proper cleanup in useEffect return
- **Risk**: Click feedback interfering with rendering
  - **Mitigation**: Brief timeout (150ms), minimal canvas operations

---

### Phase 5: Desktop Integration and Polish
**Dependencies**: Phase 1, Phase 2, Phase 3, Phase 4
**Status**: pending

#### Objectives
- Integrate MiniGame into Desktop component
- Implement idle state detection
- Add viewport and reduced motion checks
- Create index.ts for clean exports
- Performance optimization and final polish

#### Deliverables
- [ ] `src/components/MiniGame/index.ts` - Clean export
- [ ] Desktop.tsx integration (2 lines)
- [ ] Idle state detection logic
- [ ] Viewport size checks (≥1024x768)
- [ ] Reduced motion respect
- [ ] Bundle size verification (<20KB gzipped)
- [ ] Final performance profiling

#### Implementation Details

**Files to Create/Modify**:
```
src/components/MiniGame/
  └── index.ts           # export { default } from './MiniGame';

src/components/Desktop/
  └── Desktop.tsx        # Add MiniGame import and component
```

**MiniGame/index.ts**:
```typescript
export { default } from './MiniGame';
```

**Desktop.tsx Integration**:
```typescript
// Add import (line 1 to comment for removal)
import MiniGame from '@components/MiniGame';

// ... rest of Desktop component ...

// In Desktop component, add conditional rendering check:
import { useWindowStore } from '@stores/windowStore';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { prefersReducedMotion } from '@/utils/responsive';

export default function Desktop({ children, mobileContent }: DesktopProps) {
  const { isMobile, isDesktop } = useMediaQuery();
  const windows = useWindowStore((state) => state.windows);

  // Idle state detection
  const isDesktopIdle = useMemo(() => {
    return Object.values(windows).every(
      (win) => win.isMinimized || !win.isVisible
    );
  }, [windows]);

  // Check if game should render
  const shouldShowGame = isDesktopIdle &&
                         isDesktop &&
                         !prefersReducedMotion() &&
                         window.innerWidth >= 1024 &&
                         window.innerHeight >= 768;

  return (
    <div className={styles.desktop}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.content}>{children}</div>
      {shouldShowGame && <MiniGame />} {/* Line 2 to comment for removal */}
      <Taskbar />
    </div>
  );
}
```

**MiniGame.tsx Final Updates**:
```typescript
// Add prop to accept exit handler
interface MiniGameProps {
  onExit?: () => void;
}

export default function MiniGame({ onExit }: MiniGameProps) {
  // ... existing code from Phase 3 and 4 ...

  // ESC key already handled in Phase 4, onExit prop ready

  // Add window resize handler
  useEffect(() => {
    const handleResize = () => {
      // Update canvas size on resize
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ... rest of component
}
```

**Desktop.tsx Exit Handler**:
```typescript
const handleGameExit = useCallback(() => {
  // Restore bio window (or any window) to exit idle state
  const bioWindow = windows.bio;
  if (bioWindow) {
    setMinimized('bio', false);
  }
}, [windows, setMinimized]);

// Pass to MiniGame
{shouldShowGame && <MiniGame onExit={handleGameExit} />}
```

#### Acceptance Criteria
- [ ] Game only renders when all windows minimized
- [ ] Game does not render on mobile (isMobile check)
- [ ] Game does not render when prefers-reduced-motion enabled
- [ ] Game does not render on viewports <1024x768
- [ ] ESC key restores a window (exits idle state) - works during gameplay and game over
- [ ] Opening any window hides game immediately
- [ ] Window resize during gameplay updates canvas correctly
- [ ] Bundle size increase <20KB gzipped (verify with build analysis)
- [ ] High DPI displays render sharply (devicePixelRatio scaling)
- [ ] No console errors or warnings
- [ ] Code can be disabled by commenting 2 lines

#### Test Plan
- **Integration Tests**:
  - Minimize all windows → game appears
  - Restore any window → game disappears
  - ESC key → window restored
  - Viewport resize below 1024x768 → game hides
- **Accessibility Tests**:
  - Enable prefers-reduced-motion → game does not render
  - Keyboard navigation still works for windows
- **Performance Tests**:
  - Profile with React DevTools Profiler
  - Measure bundle size with `npm run build`
  - Lighthouse performance audit
  - Check FPS with 25+ objects on screen
- **Manual Testing**:
  - Full gameplay session (start to game over to restart)
  - Rapid minimize/restore cycles
  - Browser window resize during gameplay
  - Test on multiple browsers (Chrome, Firefox, Safari)

#### Rollback Strategy
Comment out 2 lines in Desktop.tsx:
```typescript
// import MiniGame from '@components/MiniGame';
// {shouldShowGame && <MiniGame onExit={handleGameExit} />}
```
Optionally delete `src/components/MiniGame/` directory.

#### Risks
- **Risk**: Bundle size exceeds 20KB
  - **Mitigation**: Code splitting, tree-shaking verification, minification check
- **Risk**: Game interferes with window restoration
  - **Mitigation**: Careful z-index management, event propagation testing
- **Risk**: Memory leaks from window store subscription
  - **Mitigation**: React DevTools memory profiling, proper cleanup

---

## Dependency Map
```
Phase 1 (Types & Logic)
   ↓
Phase 2 (Game Loop)
   ↓
Phase 3 (Rendering)
   ↓
Phase 4 (Input)
   ↓
Phase 5 (Integration)
```

## Resource Requirements
### Development Resources
- **Engineers**: 1 (solo developer)
- **Environment**: Local development environment with Vite

### Infrastructure
- No database changes
- No new services
- No configuration updates
- No monitoring additions (client-side only)

## Integration Points
### Internal Systems
- **windowStore (Zustand)**: Read windows state for idle detection
  - **Integration Type**: React hook subscription
  - **Phase**: Phase 5
  - **Fallback**: N/A (required dependency)

- **useMediaQuery hook**: Detect desktop vs mobile
  - **Integration Type**: Custom React hook
  - **Phase**: Phase 5
  - **Fallback**: N/A (existing utility)

- **prefersReducedMotion util**: Accessibility check
  - **Integration Type**: Utility function
  - **Phase**: Phase 5
  - **Fallback**: Default to enabled (safe default)

- **Desktop component**: Single integration point
  - **Integration Type**: Component composition
  - **Phase**: Phase 5
  - **Fallback**: Comment out 2 lines to disable

## Risk Analysis
### Technical Risks
| Risk | Probability | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Bundle size exceeds 20KB | Medium | Medium | Code splitting, tree-shaking, minification | Developer |
| Canvas performance issues | Low | High | Object cap (40), requestAnimationFrame optimization | Developer |
| Memory leaks in game loop | Low | High | Thorough useEffect cleanup, profiling | Developer |
| Z-index conflicts with windows | Low | Medium | Explicit z-index values, visual testing | Developer |
| Triangle collision detection bugs | Medium | Low | Comprehensive unit tests, barycentric method | Developer |

### Schedule Risks
| Risk | Probability | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Rendering complexity underestimated | Low | Low | Simple shapes, no animations beyond movement | Developer |
| Testing takes longer than expected | Medium | Low | Prioritize critical path tests, manual testing acceptable | Developer |

## Validation Checkpoints
1. **After Phase 1**: Run unit tests, verify 100% coverage of pure functions
2. **After Phase 2**: Profile game loop with React DevTools, check for re-render issues
3. **After Phase 3**: Visual inspection of brutalist aesthetic, contrast checks
4. **After Phase 4**: Full input testing (clicks, keyboard, edge cases)
5. **Before Completion**: Bundle size analysis, full E2E gameplay test, memory profiling

## Monitoring and Observability
### Metrics to Track (Development Only)
- Bundle size delta (must be <20KB gzipped)
- FPS during gameplay (target 60fps with 0-25 objects)
- Memory heap size over 10 activate/deactivate cycles
- Time to first render after idle state detected

### Logging Requirements
- Development mode: Console log for game state transitions
- Production mode: No logging (silent operation)

### Alerting
- N/A (client-side Easter egg, no production alerts needed)

## Documentation Updates Required
- [ ] README.md - Add section about desktop mini-game Easter egg
- [ ] Component documentation - JSDoc for MiniGame exports
- [ ] Architecture update - Note MiniGame in component structure
- [ ] Removal instructions - Document 2-line comment process

## Post-Implementation Tasks
- [ ] Performance validation on mid-range hardware
- [ ] Bundle size verification with build tools
- [ ] Memory leak testing (10+ activate/deactivate cycles)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Accessibility audit (prefers-reduced-motion, contrast)
- [ ] Playtesting for difficulty balance

## Self-Review Notes

### Issues Identified and Resolutions:

1. **Color Palette Unspecified** ✅
   - **Issue**: "High-contrast colors" mentioned but exact values not defined
   - **Resolution**: Added specific color constants section to Phase 1
   - **Impact**: Ensures consistent brutalist aesthetic

2. **Config Object Location Unclear** ✅
   - **Issue**: GameConfig used in Phase 2 but instantiation not specified
   - **Resolution**: Move config instantiation to Phase 3 (MiniGame component)
   - **Impact**: Clear ownership of configuration

3. **Exit Handler Flow Convoluted** ✅
   - **Issue**: Exit handler passed through multiple layers but doesn't control anything
   - **Resolution**: Simplify - ESC key should restore a window directly in Phase 5
   - **Impact**: Clearer separation of concerns

4. **Canvas Resize Handling Missing** ✅
   - **Issue**: Window resize during gameplay not explicitly handled
   - **Resolution**: Add resize listener in Phase 5 integration
   - **Impact**: Prevents coordinate misalignment bugs

5. **High DPI Mitigation Not Detailed** ✅
   - **Issue**: Risk mentioned but no implementation details
   - **Resolution**: Add devicePixelRatio scaling to Phase 3 rendering
   - **Impact**: Sharp rendering on retina displays

6. **Click Feedback Integration** ✅
   - **Issue**: Phase 4 click feedback might interfere with Phase 3 render loop
   - **Resolution**: Integrate click feedback into main render loop, not separate
   - **Impact**: Single render path, no conflicts

7. **Object Color Strategy Undefined** ✅
   - **Issue**: Objects have "color" field but generation not specified
   - **Resolution**: Define color palette and random selection in Phase 1
   - **Impact**: Consistent visual variety

8. **Hardcoded Taskbar Height** ✅
   - **Issue**: "48" hardcoded, should be constant
   - **Resolution**: Reference from Desktop component or define constant
   - **Impact**: Maintainability and correctness

9. **ESC Key Scope Unclear** ✅
   - **Issue**: ESC mentioned in Phase 4 but should work during gameplay too
   - **Resolution**: Clarify ESC works always (gameplay + game over)
   - **Impact**: Consistent exit mechanism

## Approval
- [ ] Technical Lead Review (Self - SPIDER-SOLO)
- [ ] Resource Allocation Confirmed
- [ ] Stakeholder Sign-off

## Change Log
| Date | Change | Reason | Author |
|------|--------|--------|--------|
| 2025-11-06 | Initial plan draft | Specification approved | Claude |

## Notes
- All game code isolated in `src/components/MiniGame/` directory
- Two-line removal process documented for easy disable
- No external dependencies required
- Canvas-based implementation for performance
- Progressive difficulty ensures replayability
- Easter egg discovery is intentional - no prominent UI hints
