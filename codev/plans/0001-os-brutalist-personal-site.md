# Implementation Plan: OS-Brutalist Personal Site for paxmei.com

**Plan ID**: 0001
**Spec**: 0001-os-brutalist-personal-site.md
**Created**: 2025-11-05
**Status**: Planning
**Protocol**: SPIDER-SOLO

---

## Overview

This plan breaks down the implementation of the paxmei.com OS-brutalist personal site into **7 focused phases**. Each phase follows the IDE loop (Implement → Defend → Evaluate) and ends with a single atomic commit after user approval.

### Success Metrics
- Desktop landing page with 3 draggable windows
- Smooth 60fps particle animation
- Blog post rendering with Markdown and syntax highlighting
- Responsive design (desktop, tablet, mobile)
- Lighthouse score > 90
- Bundle size < 300KB gzipped
- All tests passing with > 70% coverage

---

## Phase Status Legend

- `pending` - Not started
- `in-progress` - Currently being worked on
- `completed` - Finished, tested, evaluated, and committed
- `blocked` - Cannot proceed due to external factors

---

## Phase 1: Project Foundation & Core Setup

**Status**: `pending`

### Objective
Set up project dependencies, routing infrastructure, basic layout structure, and design system foundations. Establish the architectural skeleton that all subsequent phases will build upon.

### Dependencies
None (first phase)

### Tasks
1. Install production dependencies:
   - `react-router-dom` (routing)
   - `zustand` (state management)
   - `react-markdown` + `remark-gfm` (markdown rendering)
   - `react-syntax-highlighter` (code highlighting)

2. Install dev dependencies:
   - `@types/react-syntax-highlighter`
   - `vitest` + `@testing-library/react` + `jsdom` (testing)
   - `@testing-library/jest-dom`

3. Configure Vite:
   - Set up TypeScript paths for clean imports
   - Configure build optimization settings
   - Add test configuration for Vitest

4. Set up routing structure:
   - Create `src/pages/` directory
   - Implement basic router in `App.tsx`
   - Create placeholder pages: `Landing.tsx`, `BlogPost.tsx`, `NotFound.tsx`
   - Add Cloudflare Pages redirect config (`public/_redirects`)

5. Establish design system:
   - Create `src/styles/variables.css` with CSS custom properties:
     - Color palette (background, surface, borders, text, accent)
     - Typography scale (font sizes, weights, line heights)
     - Spacing scale (consistent margins/paddings)
     - Z-index layers
   - Create `src/styles/global.css` with base styles and resets
   - Import global styles in `main.tsx`

6. Create project directory structure:
   ```
   src/
   ├── components/      # Reusable UI components
   ├── pages/           # Route components
   ├── hooks/           # Custom React hooks
   ├── stores/          # Zustand stores
   ├── styles/          # Global styles and CSS modules
   ├── data/            # Static data (bio, portfolio)
   ├── utils/           # Helper functions
   └── types/           # TypeScript type definitions
   ```

7. Create `content/` directory for Markdown:
   ```
   content/
   └── posts/           # Blog posts
   ```

### Acceptance Criteria
- [ ] All dependencies installed without conflicts
- [ ] Routing works: navigating to `/`, `/blog/test`, `/404` renders correct pages
- [ ] Design system variables are defined and accessible
- [ ] Global styles applied (black background, white text visible)
- [ ] Directory structure matches plan
- [ ] TypeScript compiles without errors
- [ ] Dev server runs successfully (`pnpm dev`)

### Testing (Defend Phase)
- **Unit Tests**:
  - Test that router renders correct components for each route
  - Test 404 page renders for invalid routes
- **Integration Tests**:
  - Test navigation between routes works
  - Test that global styles are applied
- **Build Test**:
  - Ensure `pnpm build` completes successfully
  - Verify output bundle structure

### Evaluation Checklist
- [ ] All acceptance criteria met
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Code follows TypeScript strict mode
- [ ] Self-review completed
- [ ] User approval obtained

### Commit Message Format
```
[Spec 0001][Phase: foundation] feat: Project foundation and core setup

- Add dependencies for routing, state, markdown, and testing
- Configure Vite with TypeScript paths and test setup
- Implement basic routing structure with placeholder pages
- Establish design system with CSS variables
- Create project directory structure
- Add Cloudflare Pages redirect configuration

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Phase 2: Desktop Background & Particle System

**Status**: `pending`

### Objective
Create the immersive particle background that runs on all pages. This foundational visual element must be performant (60fps) and subtle, enhancing the aesthetic without distracting from content.

### Dependencies
- Phase 1 (foundation must be complete)

### Tasks
1. Create `Desktop` component (`src/components/Desktop/Desktop.tsx`):
   - Renders particle canvas as background
   - Provides container for page content
   - Full viewport height/width
   - Fixed position, lowest z-index

2. Create `useParticles` hook (`src/hooks/useParticles.ts`):
   - Manages Canvas reference and context
   - Initializes particle array on mount
   - Particle properties:
     - Position (x, y)
     - Velocity (vx, vy) - slow drift
     - Size (2-4px, random)
     - Opacity (0.1-0.3, random)
   - Animation loop with `requestAnimationFrame`
   - Delta time calculation for consistent animation speed
   - Cleanup on unmount

3. Implement particle animation logic:
   - Smooth, organic movement (gentle sine wave or Perlin noise)
   - Toroidal wrapping (particles wrap around screen edges)
   - Responsive particle count:
     - Desktop (>= 1024px): 75 particles
     - Tablet (768-1023px): 50 particles
     - Mobile (< 768px): 30 particles
   - FPS monitoring: reduce particle count if FPS drops below 50

4. Canvas rendering optimization:
   - Use `clearRect` for efficient clearing
   - Batch draw operations
   - Only render when particles actually move
   - Handle window resize events (recreate canvas)

5. Styling:
   - Canvas positioned `fixed`, covers viewport
   - `z-index: 1` (behind all content)
   - `pointer-events: none` (doesn't block interactions)
   - Particle color: `rgba(255, 255, 255, opacity)`

6. Integrate Desktop component:
   - Wrap all page components with `<Desktop>`
   - Ensure content renders above particle layer

### Acceptance Criteria
- [ ] Particle background renders on all pages
- [ ] Particles move smoothly at 60fps on desktop
- [ ] Particle count scales based on viewport size
- [ ] Canvas resizes correctly when window resizes
- [ ] No performance impact on other interactions
- [ ] Particles are subtle and don't distract from content
- [ ] No memory leaks (canvas cleans up on unmount)

### Testing (Defend Phase)
- **Unit Tests**:
  - Test `useParticles` hook initializes particles correctly
  - Test particle count calculation based on viewport width
  - Test particle wrapping logic (edge cases)
- **Integration Tests**:
  - Test Desktop component renders children correctly
  - Test canvas resizes on window resize event
- **Performance Tests**:
  - Measure FPS using browser DevTools
  - Verify particle animation runs at 60fps
  - Test on low-end device (or throttle CPU in DevTools)

### Evaluation Checklist
- [ ] Particle animation is visually appealing
- [ ] Performance meets 60fps target
- [ ] Canvas cleanup works (no memory leaks)
- [ ] Responsive behavior works on all screen sizes
- [ ] All tests passing
- [ ] Self-review completed
- [ ] User approval obtained

### Commit Message Format
```
[Spec 0001][Phase: particles] feat: Desktop background with particle system

- Create Desktop component with full-viewport canvas
- Implement useParticles hook with smooth animation
- Add responsive particle count scaling
- Optimize for 60fps performance with FPS monitoring
- Handle canvas cleanup and window resize

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Phase 3: Window System Core (Components & State)

**Status**: `pending`

### Objective
Build the core window system components and state management. This includes Window, WindowChrome, and the global window manager state. Dragging functionality will be added in Phase 4 - this phase focuses on rendering, styling, and basic interactions.

### Dependencies
- Phase 2 (particle background complete)

### Tasks
1. Create Zustand store (`src/stores/windowStore.ts`):
   - State:
     ```typescript
     interface WindowState {
       id: string;
       position: { x: number; y: number };
       isMinimized: boolean;
       isVisible: boolean;
     }

     interface WindowStore {
       windows: Record<string, WindowState>;
       windowStack: string[]; // Order determines z-index
       bringToFront: (id: string) => void;
       toggleMinimize: (id: string) => void;
       closeWindow: (id: string) => void;
       openWindow: (id: string, position: { x: number; y: number }) => void;
     }
     ```
   - Implement z-index management (array-based approach from spec)
   - Initial state: three windows (bio, blog, portfolio) open and visible

2. Create `Window` component (`src/components/Window/Window.tsx`):
   - Props:
     ```typescript
     interface WindowProps {
       id: string;
       title: string;
       children: React.ReactNode;
       draggable?: boolean;
       resizable?: boolean; // Not implemented in v1
       minimizable?: boolean;
       closeable?: boolean;
       defaultPosition?: { x: number; y: number };
       defaultSize?: { width: number; height: number };
       className?: string;
     }
     ```
   - Styling (CSS Module):
     - Background: `#0a0a0a` with 95% opacity
     - Border: `1px solid #2a2a2a`
     - Box shadow: `0 20px 60px rgba(0, 0, 0, 0.8)` when focused
     - Rounded corners: `0` (sharp edges)
     - Minimum size: 300px width, 200px height
   - Integrate with window store for position and z-index
   - Handle click to bring to front
   - Conditionally render based on `isVisible` state
   - Transform based on `isMinimized` state (scale down or hide)

3. Create `WindowChrome` component (`src/components/Window/WindowChrome.tsx`):
   - Props:
     ```typescript
     interface WindowChromeProps {
       title: string;
       onMinimize?: () => void;
       onMaximize?: () => void;
       onClose?: () => void;
       draggable?: boolean;
     }
     ```
   - Layout:
     ```
     [Title]                    [Minimize] [Maximize] [Close]
     ```
   - Styling:
     - Height: `40px`
     - Background: `#1a1a1a`
     - Border-bottom: `1px solid #2a2a2a`
     - Title: White, 14px, medium weight
     - Buttons: 12x12px, gray inactive, white on hover
   - Control buttons:
     - Minimize: `−` (horizontal line)
     - Maximize: `□` (square outline) - not functional in v1
     - Close: `×` (multiply symbol), red on hover
   - Add `cursor: move` when draggable (preparation for Phase 4)

4. Create window content components:
   - `WindowContent.tsx`: Styled container for window children
   - Padding: `24px`
   - Overflow: `auto` (scrollable if content overflows)
   - Max height: `calc(100% - 40px)` (account for chrome)

5. Implement focus/blur behavior:
   - Clicking window calls `bringToFront(id)`
   - Focused window has higher z-index
   - Focused window has stronger box shadow

6. Create initial window layout for Landing page:
   - Bio window: top-left (50px, 50px), size (400px, 500px)
   - Blog window: top-right (500px, 50px), size (450px, 600px)
   - Portfolio window: center (275px, 300px), size (500px, 400px)

### Acceptance Criteria
- [ ] Window component renders with correct styling
- [ ] WindowChrome displays title and control buttons
- [ ] Clicking window brings it to front (z-index updates)
- [ ] Close button removes window from view
- [ ] Minimize button toggles minimized state
- [ ] All three windows render on Landing page with correct positions
- [ ] Windows have proper visual hierarchy (shadows, borders)
- [ ] Window content scrolls when overflowing

### Testing (Defend Phase)
- **Unit Tests**:
  - Test window store actions (bringToFront, closeWindow, toggleMinimize)
  - Test z-index calculation from windowStack array
  - Test Window component renders children correctly
  - Test WindowChrome button click handlers
- **Integration Tests**:
  - Test clicking window updates z-index in store
  - Test close button removes window from DOM
  - Test minimize button toggles minimized state
- **Visual Tests**:
  - Snapshot test for Window styling
  - Verify focus state styling applied correctly

### Evaluation Checklist
- [ ] Windows render beautifully with OS-style chrome
- [ ] Focus behavior works intuitively
- [ ] Z-index stacking is correct
- [ ] All control buttons functional (except maximize)
- [ ] All tests passing
- [ ] Self-review completed
- [ ] User approval obtained

### Commit Message Format
```
[Spec 0001][Phase: window-system] feat: Window system core components and state

- Create Zustand store for window management
- Implement Window component with focus and z-index handling
- Create WindowChrome with control buttons
- Add initial window layout for Landing page
- Style windows with OS-brutalist aesthetic

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Phase 4: Window Dragging System

**Status**: `pending`

### Objective
Implement smooth, performant window dragging with viewport constraints. Windows should feel natural to drag, stay within bounds, and maintain buttery-smooth interactions.

### Dependencies
- Phase 3 (window system core complete)

### Tasks
1. Create `useDraggable` hook (`src/hooks/useDraggable.ts`):
   - Parameters:
     ```typescript
     interface UseDraggableOptions {
       initialPosition: { x: number; y: number };
       onDrag?: (position: { x: number; y: number }) => void;
       onDragEnd?: (position: { x: number; y: number }) => void;
       constrainToViewport?: boolean;
       dragHandle?: React.RefObject<HTMLElement>;
     }
     ```
   - Returns:
     ```typescript
     interface UseDraggableReturn {
       position: { x: number; y: number };
       isDragging: boolean;
       handleMouseDown: (e: React.MouseEvent) => void;
     }
     ```
   - Implementation:
     - Track drag start position and offset
     - Calculate delta on mouse move
     - Update position state
     - Apply viewport constraints (min 40px of title bar visible)
     - Clean up event listeners on unmount

2. Implement viewport constraint logic:
   - X-axis clamping:
     ```typescript
     const minX = -(windowWidth - 40);
     const maxX = viewportWidth - 40;
     const clampedX = Math.max(minX, Math.min(maxX, x));
     ```
   - Y-axis clamping:
     ```typescript
     const minY = 0;
     const maxY = viewportHeight - 40;
     const clampedY = Math.max(minY, Math.min(maxY, y));
     ```
   - Update constraints on window resize

3. Integrate dragging into Window component:
   - Use `useDraggable` hook
   - Only enable if `draggable={true}` prop
   - Attach mouse down handler to WindowChrome
   - Update window store position on drag end
   - Apply `transform: translate(x, y)` for smooth movement
   - Add `user-select: none` while dragging (prevent text selection)

4. Optimize drag performance:
   - Use `will-change: transform` on window
   - Throttle position updates if needed (but aim for every frame)
   - Use `requestAnimationFrame` for smooth rendering
   - Prevent layout thrashing

5. Add visual feedback:
   - Cursor changes to `grabbing` while dragging
   - Window gets higher z-index immediately on drag start
   - Optional: subtle scale effect (1.02) while dragging

6. Handle edge cases:
   - Window resize during drag (update constraints)
   - Drag beyond viewport (constrain immediately)
   - Touch devices (disable dragging on mobile via media query)
   - Multi-touch (ignore)

### Acceptance Criteria
- [ ] Windows can be dragged by title bar
- [ ] Dragging is smooth (60fps, no jank)
- [ ] Windows constrained to viewport (title bar always visible)
- [ ] Cursor changes to `grabbing` during drag
- [ ] Window position persists after drag
- [ ] Dragging brings window to front
- [ ] No text selection during drag
- [ ] Dragging disabled on mobile/tablet (responsive)

### Testing (Defend Phase)
- **Unit Tests**:
  - Test `useDraggable` hook calculates position correctly
  - Test viewport constraint clamping logic
  - Test initial position is set correctly
- **Integration Tests**:
  - Test dragging updates window position in store
  - Test window moves visually when dragged
  - Test constraints prevent dragging beyond viewport
  - Test dragging brings window to front
- **Manual Tests**:
  - Test drag performance (DevTools FPS counter)
  - Test on different screen sizes
  - Test edge cases (drag to edges, resize window)

### Evaluation Checklist
- [ ] Dragging feels natural and responsive
- [ ] Performance is smooth (no frame drops)
- [ ] Constraints work correctly
- [ ] Visual feedback is clear
- [ ] All tests passing
- [ ] Self-review completed
- [ ] User approval obtained

### Commit Message Format
```
[Spec 0001][Phase: dragging] feat: Window dragging system

- Create useDraggable hook with viewport constraints
- Implement smooth drag interactions on WindowChrome
- Add visual feedback (cursor, z-index on drag)
- Optimize for 60fps performance
- Disable dragging on mobile devices

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Phase 5: Content Components (Bio, Blog List, Portfolio)

**Status**: `pending`

### Objective
Create the content components that populate the three main windows on the Landing page. Implement static data for Bio and Portfolio, and set up the blog post index system.

### Dependencies
- Phase 4 (dragging complete, windows fully functional)

### Tasks
1. Create Bio data and component:
   - **Data** (`src/data/bio.ts`):
     ```typescript
     export const bioData = {
       name: "Pax Mei",
       title: "Developer & Writer",
       tagline: "Building sleek experiences and sharing insights.",
       bio: `I'm a developer passionate about crafting unique web experiences.
             I love exploring the intersection of design, performance, and usability.
             When I'm not coding, I write about tech, design, and the creative process.`,
       socialLinks: [
         { platform: 'GitHub', url: 'https://github.com/paxmei', icon: '→' },
         { platform: 'Twitter', url: 'https://twitter.com/paxmei', icon: '→' },
         { platform: 'LinkedIn', url: 'https://linkedin.com/in/paxmei', icon: '→' },
         { platform: 'Email', url: 'mailto:hello@paxmei.com', icon: '→' },
       ],
     };
     ```
   - **Component** (`src/components/Bio/Bio.tsx`):
     - Display name (h1, 48px, bold)
     - Display title (h4, 24px)
     - Display tagline (h5, 20px, accent color)
     - Display bio paragraph (16px)
     - Display social links (inline list with arrows)
     - Styling: generous spacing, clean hierarchy

2. Create Portfolio data and component:
   - **Data** (`src/data/portfolio.ts`):
     ```typescript
     export const portfolio: PortfolioItem[] = [
       {
         id: 'paxmei-site',
         title: 'paxmei.com',
         description: 'Personal site with OS-brutalist design and draggable windows.',
         techStack: ['React', 'TypeScript', 'Vite', 'Zustand'],
         links: { github: '#', demo: 'https://paxmei.com' },
         featured: true,
         startDate: '2025-11-05',
         status: 'active',
       },
       // Add 2-3 placeholder projects
     ];
     ```
   - **Component** (`src/components/Portfolio/PortfolioList.tsx`):
     - Display list of projects
     - Each item: title (h4), description (body), tech stack (small pills)
     - Links: GitHub, Demo (if available)
     - Hover state: subtle highlight
     - Click: navigate to `/portfolio/:id` (future, for now just link to demo)

3. Create Blog post index system:
   - **Sample Posts**: Create 2-3 sample Markdown files in `content/posts/`:
     ```markdown
     ---
     title: "Welcome to paxmei.com"
     date: "2025-11-05"
     excerpt: "Introducing my new personal site with a unique OS-brutalist design."
     tags: ["meta", "design", "web-dev"]
     published: true
     ---

     # Welcome

     This is the first post on my new site...
     ```
   - **Build Script** (`scripts/generate-posts-index.js`):
     - Scan `content/posts/` for `.md` files
     - Parse frontmatter using `gray-matter` package
     - Generate `src/data/posts-index.json` with metadata only
     - Run as prebuild step in `package.json`
   - **Component** (`src/components/Blog/BlogList.tsx`):
     - Import `posts-index.json`
     - Display list of posts (title, date, excerpt)
     - Sort by date (newest first)
     - Hover state: highlight
     - Click: navigate to `/blog/:slug`

4. Create Dock component (`src/components/Dock/Dock.tsx`):
   - Fixed position at bottom of viewport
   - Three items: Bio, Blog, Portfolio
   - Each item: icon (can be text for now) + label
   - Active state: shows which windows are open
   - Click: toggles window visibility (open/close)
   - Styling:
     - Background: `#0a0a0a` with 90% opacity
     - Height: `60px`
     - Border-top: `1px solid #2a2a2a`
     - Items: 60px square, centered
     - Active indicator: bottom border (accent color)

5. Integrate components into Landing page:
   - Render three Window components
   - Bio Window contains `<Bio />` component
   - Blog Window contains `<BlogList />` component
   - Portfolio Window contains `<PortfolioList />` component
   - Render `<Dock />` at bottom

6. Add typography and spacing refinements:
   - Apply type scale from design system
   - Ensure consistent spacing (multiples of 8px)
   - Proper line-height for readability
   - High contrast for accessibility

### Acceptance Criteria
- [ ] Bio window displays name, title, tagline, bio, and social links
- [ ] Portfolio window displays list of projects with tech stacks
- [ ] Blog window displays list of posts sorted by date
- [ ] Dock renders at bottom with three items
- [ ] Clicking dock items toggles window visibility
- [ ] All typography follows design system scale
- [ ] Content is readable and well-spaced
- [ ] Social and project links are functional

### Testing (Defend Phase)
- **Unit Tests**:
  - Test Bio component renders all data fields
  - Test PortfolioList renders correct number of projects
  - Test BlogList sorts posts by date correctly
  - Test Dock toggles window visibility on click
- **Integration Tests**:
  - Test clicking blog post navigates to detail page (even if 404 for now)
  - Test dock active state syncs with open windows
  - Test window content scrolls when overflowing
- **Build Tests**:
  - Test `generate-posts-index.js` script runs and produces valid JSON
  - Test build succeeds with posts index

### Evaluation Checklist
- [ ] All content displays beautifully
- [ ] Typography hierarchy is clear
- [ ] Dock provides intuitive navigation
- [ ] Data structure is clean and extensible
- [ ] All tests passing
- [ ] Self-review completed
- [ ] User approval obtained

### Commit Message Format
```
[Spec 0001][Phase: content] feat: Content components for Bio, Blog, and Portfolio

- Create Bio component with social links
- Create Portfolio list with sample projects
- Create Blog list with post index system
- Add build script to generate posts index from Markdown
- Implement Dock component for window navigation
- Integrate all content into Landing page

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Phase 6: Blog Post Detail & Markdown Rendering

**Status**: `pending`

### Objective
Implement the blog post detail page with full Markdown rendering and syntax highlighting. This page should maintain the OS-brutalist aesthetic while providing an excellent reading experience.

### Dependencies
- Phase 5 (content components complete, blog list functional)

### Tasks
1. Create BlogPost page component (`src/pages/BlogPost.tsx`):
   - Get slug from URL params (`useParams`)
   - Load Markdown file dynamically:
     ```typescript
     const content = await import(`/content/posts/${slug}.md?raw`);
     ```
   - Parse frontmatter and content (use `gray-matter`)
   - Render in full-screen Window component

2. Create MarkdownRenderer component (`src/components/Markdown/MarkdownRenderer.tsx`):
   - Use `react-markdown` with `remark-gfm`
   - Custom renderers for:
     - **Code blocks**: Use `react-syntax-highlighter`
       - Theme: `atomOneDark` or similar dark theme
       - Show language label in top-right corner
       - Line numbers optional (test readability)
     - **Links**: Accent color, no underline, underline on hover
     - **Headings**: Match site typography scale
     - **Blockquotes**: Left border (accent color), italic
     - **Lists**: Proper indentation and spacing
     - **Horizontal rules**: Subtle line (border color)
   - Styling:
     - Line height: 1.75 for body text (readability)
     - Max width: 720px (optimal reading length)
     - Proper spacing between elements

3. Implement syntax highlighting:
   - Install `react-syntax-highlighter` and types
   - Create custom theme if needed (match site colors)
   - Ensure code blocks have proper padding and borders
   - Add copy button to code blocks (optional enhancement)

4. Create BlogPost header section:
   - Display title (h1, large)
   - Display date (small, monospace, muted)
   - Display tags (small pills with accent border)
   - Spacing: generous padding above and below

5. Add navigation:
   - Back button in window chrome or at top of content
   - Links to previous/next posts (optional, future enhancement)
   - Share buttons (optional, future enhancement)

6. Handle loading and error states:
   - Loading: Show skeleton or spinner while fetching
   - Error: If post not found, show 404 message in window
   - Graceful fallback for missing frontmatter fields

7. Optimize Markdown rendering:
   - Memoize parsed content to avoid re-parsing
   - Lazy load syntax highlighter (code-splitting)
   - Test with long posts to ensure performance

8. Add metadata and SEO (optional):
   - Set page title to post title
   - Meta description from excerpt
   - Open Graph tags for social sharing

### Acceptance Criteria
- [ ] Blog post loads and renders Markdown correctly
- [ ] Syntax highlighting works for code blocks
- [ ] Custom Markdown styles match site aesthetic
- [ ] Post metadata (title, date, tags) displays properly
- [ ] Loading state shows while post is fetching
- [ ] 404 message shows for non-existent posts
- [ ] Back navigation works (browser back or link to home)
- [ ] Content is readable and well-formatted
- [ ] Max-width ensures optimal reading experience

### Testing (Defend Phase)
- **Unit Tests**:
  - Test MarkdownRenderer renders basic Markdown correctly
  - Test frontmatter parsing extracts all fields
  - Test custom renderers (code, links, headings)
- **Integration Tests**:
  - Test BlogPost page loads post based on slug
  - Test navigation to blog post from BlogList works
  - Test back button returns to home
  - Test 404 handling for invalid slug
- **Visual Tests**:
  - Snapshot test for rendered Markdown
  - Verify syntax highlighting theme matches design

### Evaluation Checklist
- [ ] Blog posts look beautiful and are easy to read
- [ ] Code blocks are properly highlighted
- [ ] Navigation is intuitive
- [ ] Performance is good (no lag on long posts)
- [ ] All tests passing
- [ ] Self-review completed
- [ ] User approval obtained

### Commit Message Format
```
[Spec 0001][Phase: blog-detail] feat: Blog post detail page with Markdown rendering

- Create BlogPost page component with dynamic Markdown loading
- Implement MarkdownRenderer with custom styling
- Add syntax highlighting for code blocks
- Display post metadata (title, date, tags)
- Handle loading and error states
- Optimize Markdown rendering performance

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Phase 7: Responsive Design, Polish & Optimization

**Status**: `pending`

### Objective
Make the site fully responsive, add final polish, optimize performance, and prepare for deployment. Ensure the site looks and works beautifully on all devices.

### Dependencies
- Phase 6 (all core features complete)

### Tasks
1. Implement responsive layouts:
   - **Desktop (>= 1024px)**:
     - Full window system with dragging
     - Three windows in cascading layout
     - Dock at bottom
   - **Tablet (768px - 1023px)**:
     - Windows become fixed panels (no dragging)
     - Two-column grid or vertical stack
     - Dock visible
   - **Mobile (< 768px)**:
     - Single-column card layout
     - Windows are full-width, static positioned
     - Dock becomes horizontal bottom nav (always visible)
     - Disable dragging
     - Reduce particle count

2. Add media query CSS:
   - Create breakpoint constants
   - Add responsive styles to Window, Dock, Desktop components
   - Test on various screen sizes (DevTools responsive mode)

3. Implement 404 page:
   - Full-screen window with "404 Not Found" message
   - Large "404" text (96px)
   - Friendly message
   - Link back to home
   - Same particle background

4. Typography refinements:
   - Ensure all headings use type scale
   - Check line-height for readability
   - Verify contrast ratios (WCAG AA minimum)
   - Test font rendering on different browsers

5. Accessibility improvements:
   - Add ARIA labels to interactive elements
   - Ensure keyboard navigation works:
     - Tab through dock items
     - Enter to toggle windows
     - Escape to close focused window
   - Add skip link to main content
   - Test with screen reader (VoiceOver or NVDA)
   - Ensure focus styles are visible

6. Performance optimizations:
   - Code-split routes (lazy load BlogPost page)
   - Lazy load syntax highlighter
   - Optimize images (if any added)
   - Run Lighthouse audit:
     - Performance > 90
     - Accessibility > 90
     - Best Practices > 90
   - Analyze bundle size:
     - Use `vite-bundle-visualizer`
     - Ensure main bundle < 150KB gzipped
     - Defer non-critical JavaScript

7. Add loading states and transitions:
   - Suspense fallback for lazy-loaded components
   - Smooth fade-in for blog post content
   - Loading indicator for dynamic imports (if slow)
   - Ensure transitions are instant or very fast (no slow animations)

8. Cross-browser testing:
   - Test on Chrome, Firefox, Safari
   - Test on mobile Safari (iOS)
   - Verify particle canvas works on all browsers
   - Check for any layout issues

9. Final polish:
   - Remove console.logs
   - Clean up unused CSS
   - Verify all links work
   - Check for typos in content
   - Ensure all images have alt text (if added)
   - Add favicon (simple design)

10. Deployment preparation:
    - Create `public/_redirects` for Cloudflare Pages:
      ```
      /* /index.html 200
      ```
    - Test production build locally (`pnpm build && pnpm preview`)
    - Verify bundle size and performance
    - Update README with deployment instructions

### Acceptance Criteria
- [ ] Site is fully responsive (desktop, tablet, mobile)
- [ ] 404 page renders correctly
- [ ] All typography is refined and readable
- [ ] Keyboard navigation works throughout site
- [ ] Lighthouse scores > 90 (Performance, Accessibility, Best Practices)
- [ ] Bundle size < 300KB gzipped
- [ ] Cross-browser testing passed (Chrome, Firefox, Safari)
- [ ] No console errors or warnings
- [ ] Production build successful
- [ ] All previous features still work

### Testing (Defend Phase)
- **Unit Tests**:
  - Test responsive utilities (breakpoint helpers)
  - Test 404 page renders
- **Integration Tests**:
  - Test responsive layouts at different breakpoints
  - Test keyboard navigation flow
  - Test all routes work in production build
- **Performance Tests**:
  - Run Lighthouse CI
  - Measure FPS on mobile devices
  - Test on slow 3G connection
- **Accessibility Tests**:
  - Run axe DevTools
  - Test with screen reader
  - Verify keyboard-only navigation
- **Visual Regression Tests**:
  - Snapshot tests for all pages
  - Verify responsive breakpoints

### Evaluation Checklist
- [ ] Site works beautifully on all devices
- [ ] Performance meets or exceeds targets
- [ ] Accessibility is excellent
- [ ] Code is clean and production-ready
- [ ] All tests passing
- [ ] Self-review completed
- [ ] User approval obtained
- [ ] Ready for deployment

### Commit Message Format
```
[Spec 0001][Phase: polish] feat: Responsive design, polish, and optimization

- Implement responsive layouts for desktop, tablet, mobile
- Create 404 page with OS-brutalist styling
- Add accessibility improvements (ARIA, keyboard nav)
- Optimize performance (code-splitting, bundle size)
- Refine typography and spacing
- Cross-browser testing and fixes
- Prepare for Cloudflare Pages deployment

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Risk Management

### High-Risk Items

1. **Window Dragging Performance**
   - **Risk**: Dragging could be janky on lower-end devices
   - **Mitigation**: Use `requestAnimationFrame`, optimize render cycle, add will-change CSS
   - **Fallback**: Disable dragging on mobile, simplify to fixed windows

2. **Particle System Performance**
   - **Risk**: Canvas animation could impact frame rate
   - **Mitigation**: FPS monitoring, reduce particle count on low-end devices, optimize render loop
   - **Fallback**: Disable particles on mobile or if FPS drops below threshold

3. **Markdown Rendering Performance**
   - **Risk**: Large blog posts could be slow to parse and render
   - **Mitigation**: Memoize parsed content, lazy load syntax highlighter, code-split
   - **Fallback**: Static HTML rendering (more complex build step)

### Medium-Risk Items

4. **Cross-Browser Compatibility**
   - **Risk**: Canvas or CSS transforms may behave differently
   - **Mitigation**: Test on all major browsers early, use prefixes if needed
   - **Fallback**: Graceful degradation for unsupported browsers

5. **Mobile Experience**
   - **Risk**: Window system may not translate well to small screens
   - **Mitigation**: Design responsive layout early, test on real devices
   - **Fallback**: Simplified card layout without window chrome

6. **Accessibility of Window System**
   - **Risk**: Custom window UI may not be keyboard/screen-reader friendly
   - **Mitigation**: Add proper ARIA labels, test with assistive tech, provide keyboard shortcuts
   - **Fallback**: Provide alternative navigation method

### Low-Risk Items

7. **Bundle Size**
   - **Risk**: Dependencies could bloat bundle
   - **Mitigation**: Monitor bundle size after each phase, use bundle analyzer
   - **Fallback**: Replace heavy dependencies with lighter alternatives

---

## Testing Strategy

### Unit Tests (Per Phase)
- Test individual components in isolation
- Test hooks with `@testing-library/react-hooks`
- Test utility functions
- Aim for 70%+ coverage

### Integration Tests (Per Phase)
- Test component interactions
- Test state management (Zustand store)
- Test routing and navigation
- Test user workflows (click, drag, navigate)

### Performance Tests (Phase 2, 4, 7)
- Lighthouse CI in automated testing
- Manual FPS monitoring during development
- Bundle size analysis after each phase

### Accessibility Tests (Phase 7)
- Automated: axe DevTools, Lighthouse
- Manual: Keyboard navigation, screen reader testing

### Browser Compatibility (Phase 7)
- Test on latest Chrome, Firefox, Safari
- Test on mobile Safari (iOS)
- Use BrowserStack if available

---

## Build & Deployment

### Build Process
1. Run tests: `pnpm test`
2. Run linter: `pnpm lint`
3. Generate post index: `pnpm prebuild`
4. Build for production: `pnpm build`
5. Preview locally: `pnpm preview`

### Deployment to Cloudflare Pages
1. Connect repository to Cloudflare Pages
2. Set build command: `pnpm build`
3. Set output directory: `dist`
4. Deploy on push to `main` branch
5. Verify production site

### Environment Variables
None required for initial version (all static)

---

## Future Enhancements (Out of Scope for v1)

The following features are explicitly **not** in this implementation plan but can be added later:

- Window resizing functionality
- Window position persistence in localStorage
- Blog post search and filtering
- Comments system
- RSS feed generation
- Contact form
- Portfolio detail pages
- Dark/light mode toggle
- Custom window layouts
- Snap-to-edge dragging
- Multiple blog post pages / pagination
- CMS integration
- Image optimization pipeline

---

## Self-Review Notes

_(To be added after initial self-review)_

---

**End of Plan**
