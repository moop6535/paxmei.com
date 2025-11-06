# Specification: Desktop Mini-Game (Idle State Easter Egg)

## Metadata
- **ID**: 0003-desktop-mini-game
- **Status**: draft
- **Created**: 2025-11-06

## Clarifying Questions Asked
1. **What style of game would you prefer for the desktop idle state?**
   - Answer: Arcade (fast-paced, reaction-based)

2. **Should the game tie into your personal brand/site theme?**
   - Answer: Yes - brutalist/tech aesthetic

3. **Should progress/scores persist across sessions?**
   - Answer: No - fresh each time

4. **What level of interaction complexity?**
   - Answer: Single input (click/tap only)

## Problem Statement
When all windows are minimized on the desktop view, users see only the particle background. This creates an opportunity for a delightful Easter egg experience - a fun, lightweight mini-game that rewards users who discover this state. The game should be reminiscent of Chrome's offline dinosaur game but with a unique identity that matches the site's brutalist aesthetic.

## Current State
- Desktop component renders particle background via canvas
- When all windows are minimized, only particles and taskbar are visible
- No interactive elements exist in the idle state
- Users may feel the desktop is "empty" when windows are minimized

## Desired State
- Detect when all windows are minimized (desktop idle state)
- Render a lightweight, arcade-style mini-game overlay
- Game uses brutalist/tech aesthetic matching the site's design
- Single-click interaction for accessibility and simplicity
- Game disappears when any window is restored
- No persistence - fresh experience each time
- Maintains site performance (minimal bundle size impact)

## Stakeholders
- **Primary Users**: Desktop visitors who explore the window management system
- **Secondary Users**: Mobile users (game should gracefully not render on mobile)
- **Technical Team**: Solo developer (paxmei)
- **Business Owner**: Personal portfolio site owner

## Success Criteria
- [ ] Game activates automatically when all windows are minimized
- [ ] Game deactivates immediately when any window is restored
- [ ] Single-click/tap input mechanism works reliably
- [ ] Keyboard ESC key exits game (accessibility)
- [ ] Visual style matches brutalist/tech aesthetic
- [ ] Bundle size increase is <20KB gzipped (revised from 15KB after feasibility review)
- [ ] Game runs at 60fps with up to 25 objects on screen
- [ ] No localStorage usage (ephemeral only)
- [ ] Works on desktop viewport sizes only (minimum 1024x768)
- [ ] Respects prefers-reduced-motion (game disabled entirely)
- [ ] All tests pass with >80% coverage (game logic)
- [ ] Documentation updated (README, component docs)

## Constraints
### Technical Constraints
- Must work with existing windowStore detection
- Canvas-based rendering required (coordinate with existing particle canvas)
- Use separate canvas layer (z-index: 90, above particles, below windows)
- Cannot interfere with particle background
- Must be tree-shakeable (minimal impact when not active)
- React + TypeScript + CSS Modules architecture
- Zustand for state management (if needed)
- Minimum viewport: 1024x768 (game disabled below this)

### Business Constraints
- Must maintain site performance benchmarks
- Should not detract from main portfolio content
- Development scope: single feature sprint

## Assumptions
- Users will discover the game organically
- Desktop viewport only (isMobile check prevents mobile rendering)
- Modern browser with canvas support
- requestAnimationFrame available for game loop
- User prefers-reduced-motion respected (game does not run at all when enabled)
- Users understand click-to-destroy mechanic intuitively
- No instruction overlay needed (game is self-explanatory)

## Solution Approaches

### Approach 1: Canvas-Based Falling Objects (Recommended)
**Description**: Objects fall from top of screen. User clicks to destroy them before they reach the bottom. Speed increases over time. Visual style uses stark geometric shapes with high-contrast colors.

**Technical Design**:
- New `MiniGame` component with dedicated canvas layer (separate from particles)
- Canvas z-index: 90 (particles=1, game=90, windows=100+)
- Game state: score, active objects, game speed multiplier, strikes
- Click detection via canvas coordinate mapping
- Objects: Simple geometric primitives (rectangles, circles, triangles)
- Object spawning: 1 object every 1.5s initially, decreasing to 0.8s at score 50+
- Spawn position: Random X coordinate, Y=-objectHeight (just above viewport)
- Collision detection: AABB for objects hitting bottom, point-in-rect for clicks
- Game over when 3 objects reach bottom (3 strikes rule)
- Input: Mouse click or ESC key to exit

**Pros**:
- Simple collision detection
- Familiar arcade pattern (user understands immediately)
- Easy to add visual flair with shapes/colors
- Canvas-based (minimal DOM manipulation)
- Highly performant

**Cons**:
- Falling objects somewhat predictable after a few plays
- Requires careful balancing of difficulty curve

**Estimated Complexity**: Medium
**Risk Level**: Low

### Approach 2: Timed Precision Clicker
**Description**: Shapes appear randomly on screen with shrinking "hit zones". User must click within the zone before it disappears. More shapes appear as score increases.

**Technical Design**:
- Canvas-based rendering of shapes with animated borders
- Timer-based spawning system
- Point-in-shape collision detection
- Visual feedback for successful/failed clicks
- Progressive difficulty (faster timers, smaller zones)

**Pros**:
- Unique compared to Chrome dino game
- Tests precision and reaction time
- Can feel very satisfying with good animations
- Difficulty scales naturally

**Cons**:
- May feel repetitive quickly
- Harder to understand without instructions
- More complex collision shapes (circles, irregular polygons)

**Estimated Complexity**: Medium-High
**Risk Level**: Medium

### Approach 3: Rhythm-Based Timing Game
**Description**: Visual indicators move across screen. User must click when indicator reaches target zone. Think Guitar Hero but minimalist.

**Technical Design**:
- Moving indicator tracks (3-4 lanes)
- Target zones at screen edge
- Timing window calculation (perfect/good/miss)
- Score multiplier for consecutive hits
- Increasingly complex patterns

**Pros**:
- Highly satisfying when executed well
- Natural difficulty progression
- Strong skill-based gameplay

**Cons**:
- Most complex to implement
- Requires careful timing calibration
- May need audio feedback (complicates implementation)
- Less intuitive for first-time players

**Estimated Complexity**: High
**Risk Level**: Medium-High

## Recommended Approach
**Approach 1: Canvas-Based Falling Objects** is recommended because:
1. Simple, intuitive gameplay (click = destroy)
2. Lowest implementation complexity
3. Best performance characteristics
4. Easiest to make visually appealing with brutalist aesthetic
5. Familiar pattern users understand immediately

## Open Questions

### Critical (Blocks Progress)
- [x] Should game auto-start or require user interaction? → Auto-start when idle detected
- [x] What triggers game end? → Time-based or strikes-based? → Strikes-based (3 objects reach bottom)

### Important (Affects Design)
- [ ] Should there be a visual indicator that game is available? → TBD during implementation
- [ ] Should click sound effects be included? → No, keeping truly lightweight
- [ ] What's the optimal difficulty curve? → Start easy, ramp up every 10 points

### Nice-to-Know (Optimization)
- [ ] Should there be multiple object types with different behaviors? → Start simple, can add later
- [ ] Should game show instructions on first activation? → Simple on-screen hint

## Performance Requirements
- **Initial Load Impact**: <20KB gzipped (game component + logic) - revised after review
- **Runtime Memory**: <10MB additional heap allocation
- **Frame Rate**: Stable 60fps with 0-25 objects, acceptable 45fps with 25-40 objects
- **Canvas Operations**: <50 draw calls per frame (batching where possible)
- **Object Limit**: Hard cap at 40 simultaneous objects (prevents performance degradation)
- **Game Loop**: Must not block main thread (use requestAnimationFrame)
- **Cleanup**: Zero memory leaks when game deactivates (verified with heap snapshots)

## Security Considerations
- No user data collection
- No external requests
- No localStorage writes (ephemeral state only)
- Canvas operations sandboxed to game component
- Input validation on click coordinates (bounds checking to prevent canvas overflow)
- No eval() or dynamic code execution
- XSS-safe (no user-generated content)

## Test Scenarios
### Functional Tests
1. **Happy Path**: All windows minimized → game appears → user plays → restores window → game disappears
2. **Score Tracking**: Clicking falling objects increments score correctly
3. **Game Over**: Three objects reaching bottom triggers game over state with restart option
4. **State Transitions**: Game properly initializes and cleans up on mount/unmount
5. **Click Detection**: Clicks register correctly on objects within canvas bounds
6. **Keyboard Exit**: ESC key exits game and shows desktop
7. **Spawn Rate**: Objects spawn at correct intervals based on score/difficulty
8. **Reduced Motion**: Game does not render when prefers-reduced-motion is enabled

### Non-Functional Tests
1. **Performance**: Game maintains 60fps with 20+ objects on screen
2. **Memory**: No memory leaks after 10+ game activate/deactivate cycles
3. **Accessibility**: Respects prefers-reduced-motion (slower or disabled)
4. **Responsive**: Gracefully handles window resizes during gameplay
5. **Bundle Size**: Verify gzipped size increase is under threshold

### Edge Cases
1. Window restored mid-click should cancel click event and cleanup game
2. Rapid minimize/restore cycles should not break game state or cause memory leaks
3. Multiple simultaneous clicks should be handled gracefully (debounced)
4. Canvas resize during gameplay should scale game coordinates correctly
5. Viewport below 1024x768 should not render game at all
6. Object spawn cap (40 objects) should prevent runaway spawning
7. ESC key during game over screen should work correctly

## Dependencies
- **External Libraries**: None (pure React/TypeScript)
- **Internal Systems**:
  - `windowStore` (detect idle state)
  - `useParticles` hook (coordinate canvas layers)
  - `useMediaQuery` (desktop-only check)
  - `prefersReducedMotion` utility
- **Browser APIs**:
  - Canvas 2D API
  - requestAnimationFrame
  - Mouse/touch events

## Technical Specifications

### Idle State Detection
```typescript
// In MiniGame component
const isDesktopIdle = useMemo(() => {
  return Object.values(windows).every(
    (win) => win.isMinimized || !win.isVisible
  );
}, [windows]);

// Only render if idle + desktop + not reduced motion + viewport large enough
const shouldRenderGame = isDesktopIdle &&
                         isDesktop &&
                         !prefersReducedMotion() &&
                         viewportWidth >= 1024 &&
                         viewportHeight >= 768;
```

### Component Structure
```
src/components/
  MiniGame/
    MiniGame.tsx         # Main game component
    MiniGame.module.css  # Brutalist styling
    useGameLoop.ts       # Game loop hook
    gameLogic.ts         # Core game logic (pure functions)
    types.ts             # Game types
```

### Game State Interface
```typescript
interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number; // pixels per frame
  shape: 'rect' | 'circle' | 'triangle';
  color: string;
}

interface GameState {
  score: number;
  objects: GameObject[];
  strikes: number; // 0-3, game over at 3
  gameOver: boolean;
  isPaused: boolean;
  lastSpawnTime: number; // timestamp for spawn rate control
  difficultyMultiplier: number; // increases with score
}

// Spawn rate calculation
const getSpawnInterval = (score: number): number => {
  return Math.max(800, 1500 - (score * 10)); // ms between spawns
};

// Speed calculation
const getObjectSpeed = (score: number): number => {
  return 2 + (score * 0.05); // pixels per frame, caps naturally
};
```

### Visual Aesthetic
- **Colors**: High-contrast (black/white/red accent for strikes)
- **Shapes**: Geometric primitives (rectangles, circles, triangles)
- **Shape sizes**: 40-60px (large enough to click easily)
- **Borders**: Thick (4-6px), stark
- **Animations**: Linear, no easing (brutalist principle)
- **Typography**: Monospace for score display (top-left corner)
- **Background**: Semi-transparent black overlay (rgba(0,0,0,0.7)) on particles
- **Canvas Layer**: Separate canvas at z-index 90
- **Click Feedback**: Brief flash/border animation on successful hit

## References
- Chrome Dino Game (inspiration for simplicity)
- src/components/Desktop/Desktop.tsx (integration point)
- src/stores/windowStore.ts (idle detection)
- src/hooks/useParticles.ts (canvas coordination)

## Risks and Mitigation
| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Game impacts site performance | Low | High | Strict bundle size limits, performance profiling, code splitting |
| Canvas conflicts with particles | Medium | Medium | Use separate canvas layer with proper z-indexing |
| Game is too difficult/easy | Medium | Low | Playtest during implementation, adjust difficulty curve |
| Users never discover game | High | Low | Accept as Easter egg - discovery is part of the charm |
| Memory leaks from game loop | Low | Medium | Thorough cleanup in useEffect, automated leak testing |

## Self-Review Notes

### Issues Identified and Addressed:

1. **Canvas Layering Ambiguity** ✅
   - **Issue**: Original spec didn't clarify if game shares particle canvas or uses separate layer
   - **Resolution**: Specified separate canvas at z-index 90 (particles=1, windows=100+)
   - **Impact**: Clearer implementation path, prevents canvas conflict bugs

2. **Viewport Requirements Missing** ✅
   - **Issue**: No minimum size specified for playable experience
   - **Resolution**: Added 1024x768 minimum viewport requirement
   - **Impact**: Prevents broken experience on small desktop windows

3. **Spawn Mechanics Undefined** ✅
   - **Issue**: Object spawn rate and randomization not detailed
   - **Resolution**: Added specific spawn intervals (1.5s → 0.8s), position randomization, and cap at 40 objects
   - **Impact**: Clear implementation requirements, performance safety net

4. **Accessibility Gaps** ✅
   - **Issue**: Keyboard controls and prefers-reduced-motion behavior unclear
   - **Resolution**: Added ESC key to exit, specified game fully disabled when reduced motion preferred
   - **Impact**: Better accessibility, respects user preferences

5. **Performance Targets Vague** ✅
   - **Issue**: "60fps on mid-range hardware" not specific enough
   - **Resolution**: Added specific object count thresholds (60fps @ 0-25 objects, 45fps @ 25-40)
   - **Impact**: Testable performance criteria

6. **Bundle Size Underestimated** ✅
   - **Issue**: 15KB gzipped might be unrealistic with full game logic
   - **Resolution**: Revised to 20KB after considering canvas rendering, game loop, collision detection
   - **Impact**: Achievable target without sacrificing features

7. **Z-Index Strategy Missing** ✅
   - **Issue**: How game layers with particles and windows unclear
   - **Resolution**: Explicit z-index values specified (particles=1, game=90, windows=100+)
   - **Impact**: No rendering conflicts

8. **Input Handling Incomplete** ✅
   - **Issue**: Only mouse clicks specified, no keyboard escape
   - **Resolution**: Added ESC key support for accessibility
   - **Impact**: Users can exit game without restoring windows

### Additional Improvements Made:

- Added object size specification (40-60px for clickability)
- Added click feedback visual (flash on successful hit)
- Specified semi-transparent background (rgba(0,0,0,0.7))
- Added spawn rate formula for difficulty progression
- Added object speed formula tied to score
- Clarified "strikes" display uses red accent color
- Added explicit XSS safety note (no user-generated content)
- Expanded edge case coverage (viewport size, object cap)

### Confidence Level:
High - Specification is now comprehensive and implementation-ready. All ambiguities resolved.

## Approval
- [ ] Technical Lead Review (Self - SPIDER-SOLO)
- [ ] Stakeholder Sign-off
- [ ] Self-review complete

## Notes
- Game is intentionally an Easter egg - no prominent UI indicating its existence
- Discovery is part of the experience
- Keep gameplay simple and intuitive - no tutorial needed
- Performance is paramount - must not impact site's professional impression
- Future enhancement potential: Multiple game modes, unlockable variants
