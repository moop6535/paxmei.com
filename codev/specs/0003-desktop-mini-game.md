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
- [ ] Visual style matches brutalist/tech aesthetic
- [ ] Bundle size increase is <15KB gzipped
- [ ] Game runs at 60fps on mid-range hardware
- [ ] No localStorage usage (ephemeral only)
- [ ] Works on desktop viewport sizes only
- [ ] All tests pass with >80% coverage (game logic)
- [ ] Documentation updated (README, component docs)

## Constraints
### Technical Constraints
- Must work with existing windowStore detection
- Canvas-based rendering preferred (already using canvas for particles)
- Cannot interfere with particle background
- Must be tree-shakeable (minimal impact when not active)
- React + TypeScript + CSS Modules architecture
- Zustand for state management (if needed)

### Business Constraints
- Must maintain site performance benchmarks
- Should not detract from main portfolio content
- Development scope: single feature sprint

## Assumptions
- Users will discover the game organically
- Desktop viewport only (isMobile check prevents mobile rendering)
- Modern browser with canvas support
- requestAnimationFrame available for game loop
- User prefers-reduced-motion respected (game should be simpler/slower or not run)

## Solution Approaches

### Approach 1: Canvas-Based Falling Objects (Recommended)
**Description**: Objects fall from top of screen. User clicks to destroy them before they reach the bottom. Speed increases over time. Visual style uses stark geometric shapes with high-contrast colors.

**Technical Design**:
- New `MiniGame` component with dedicated canvas layer
- Game state: score, active objects, game speed multiplier
- Click detection via canvas coordinate mapping
- Objects: Simple geometric primitives (rectangles, circles, triangles)
- Collision detection: AABB for objects hitting bottom
- Game over when X objects reach bottom (e.g., 3 strikes)

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
- **Initial Load Impact**: <15KB gzipped (game component + logic)
- **Runtime Memory**: <10MB additional heap allocation
- **Frame Rate**: Stable 60fps on mid-range desktop (2015+ hardware)
- **Canvas Operations**: <1000 draw calls per frame
- **Game Loop**: Must not block main thread
- **Cleanup**: Zero memory leaks when game deactivates

## Security Considerations
- No user data collection
- No external requests
- No localStorage writes
- Canvas operations sandboxed to game component
- Input validation on click coordinates (bounds checking)

## Test Scenarios
### Functional Tests
1. **Happy Path**: All windows minimized → game appears → user plays → restores window → game disappears
2. **Score Tracking**: Clicking falling objects increments score correctly
3. **Game Over**: Three objects reaching bottom triggers game over state
4. **State Transitions**: Game properly initializes and cleans up on mount/unmount
5. **Click Detection**: Clicks register correctly on objects within canvas

### Non-Functional Tests
1. **Performance**: Game maintains 60fps with 20+ objects on screen
2. **Memory**: No memory leaks after 10+ game activate/deactivate cycles
3. **Accessibility**: Respects prefers-reduced-motion (slower or disabled)
4. **Responsive**: Gracefully handles window resizes during gameplay
5. **Bundle Size**: Verify gzipped size increase is under threshold

### Edge Cases
1. Window restored mid-click should cancel click event
2. Rapid minimize/restore cycles should not break game state
3. Multiple simultaneous clicks should be handled gracefully
4. Canvas resize during gameplay should not crash

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
// In windowStore or custom hook
const isDesktopIdle = useMemo(() => {
  return Object.values(windows).every(
    (win) => win.isMinimized || !win.isVisible
  );
}, [windows]);
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
  speed: number;
  shape: 'rect' | 'circle' | 'triangle';
  color: string;
}

interface GameState {
  score: number;
  objects: GameObject[];
  strikes: number;
  gameOver: boolean;
  isPaused: boolean;
}
```

### Visual Aesthetic
- **Colors**: High-contrast (black/white/red accent)
- **Shapes**: Geometric primitives (rectangles, circles, triangles)
- **Borders**: Thick (4-6px), stark
- **Animations**: Linear, no easing (brutalist principle)
- **Typography**: Monospace for score display
- **Background**: Semi-transparent overlay on particles

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
*This section will be populated after initial self-review pass*

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
