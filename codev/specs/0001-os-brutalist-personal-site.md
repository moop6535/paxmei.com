# Specification: OS-Brutalist Personal Site for paxmei.com

**Spec ID**: 0001
**Created**: 2025-11-05
**Status**: Draft
**Protocol**: SPIDER-SOLO

---

## 1. Problem Statement

The developer needs a personal website and blog that stands out from typical portfolio sites. Current portfolio websites often use the same templated designs with excessive animations and conventional layouts. The developer wants something that feels both nostalgic (terminal/desktop OS) and cutting-edge, with a unique aesthetic that makes a strong first impression while maintaining exceptional performance and usability.

### Current State
- Fresh Vite + React 19 + TypeScript repository
- No existing content or design
- pnpm package manager
- Target hosting: Cloudflare Pages

### Desired State
- Striking personal site with OS-inspired interface
- Draggable window system for content navigation
- Clean, bold typography with minimal visual noise
- Subtle ambient particle effects
- High-performance, buttery-smooth interactions
- Support for bio, blog, and portfolio content
- Markdown-based blog system (extensible for future)

---

## 2. Stakeholders

**Primary User**: The developer (site owner)
- Wants to showcase work and writing
- Values unique, impressive design
- Prefers minimal maintenance
- Wants easy content updates (Markdown)

**Secondary Users**: Site visitors (recruiters, collaborators, readers)
- Need to quickly understand who the developer is
- Want to read blog content
- May want to view portfolio/projects
- Expect fast, smooth experience

---

## 3. Design Philosophy & Aesthetic

### Core Concept: "OS-Brutalist Fusion"
A hybrid design language that merges:
- **Desktop OS metaphor**: Draggable windows, window chrome, taskbar/dock-style navigation
- **Terminal aesthetic**: Monospace accents, system font hierarchy, command-line influences
- **Modern minimalism**: Bold typography, generous whitespace, clean lines
- **Subtle ambience**: Delicate particle system (dust-in-light effect)

### Design Principles
1. **No Unnecessary Animation**: Remove bouncy, playful animations. Only use animation for:
   - Window drag interactions (essential for UX)
   - Particle movement (ambient, not distracting)
   - State transitions (instant or near-instant)

2. **Bold Typography Hierarchy**:
   - Large, impactful headings (96px+ for hero)
   - Clear type scale (8-point scale recommended)
   - Mix of sans-serif (UI) and monospace (code/accents)
   - High contrast for readability

3. **Dark Mode Only**:
   - Deep black or near-black backgrounds (#000000 to #0a0a0a)
   - High-contrast white or off-white text (#ffffff to #f5f5f5)
   - Accent color: single color for highlights (suggest: electric blue #00ffff or terminal green #00ff00)
   - Window chrome in subtle grays (#1a1a1a to #2a2a2a)

4. **Clean Lines & Structure**:
   - Sharp edges (minimal border-radius, if any)
   - Visible grid system
   - Precise alignment
   - Generous spacing (avoid cramped UI)

5. **Performance First**:
   - Target: 60fps interactions
   - Lazy load content
   - Optimize particle system (Canvas or WebGL)
   - Minimal bundle size
   - Fast initial load (<1s on fast connection)

---

## 4. Technical Architecture

### Frontend Framework
- **React 19** with TypeScript (already configured)
- **Vite** for build tooling (already configured)
- **React Router** for navigation (to be added)

### State Management
- **Zustand** (lightweight, performant) for global state:
  - Window positions and z-index ordering
  - Active window tracking
  - Window minimize/maximize states
  - Theme/accent color (if customizable in future)

### Styling Approach
- **CSS Modules** or **Vanilla Extract** for component styles
  - Rationale: Type-safe, scoped styles, no runtime cost
  - Avoid Tailwind (conflicts with brutalist aesthetic and custom window system)
  - Use CSS custom properties for theming

### Window System Architecture
**Key Components**:
1. **WindowManager**: Top-level container managing all windows
2. **Window**: Individual draggable window component
   - Props: title, content, defaultPosition, defaultSize, minimizable, closeable
   - State: position (x, y), size (width, height), zIndex, minimized, focused
3. **WindowChrome**: Title bar with drag handle, controls (minimize, maximize, close)
4. **Desktop**: Background layer with particle system
5. **Dock/Taskbar**: Navigation for opening/switching between windows

**Window Interaction Model**:
- Click window → brings to front (highest z-index)
- Drag title bar → moves window (constrained to viewport)
- Double-click title bar → maximize/restore
- Click minimize → collapses to taskbar
- Click close → removes window from view
- Persist window positions in localStorage (optional enhancement)

### Content Architecture
**Three Primary Windows**:
1. **Bio/About Window**:
   - Hero section with name and tagline
   - Short bio
   - Links to social profiles (GitHub, Twitter, LinkedIn, etc.)

2. **Blog Window**:
   - List of blog posts (title, date, excerpt)
   - Click post → opens in new window or navigates to post detail view
   - Markdown rendering with syntax highlighting

3. **Portfolio Window**:
   - Grid or list of projects
   - Each project: title, description, tech stack, links
   - Optional: screenshots/images

**Content Management**:
- Blog posts stored as Markdown files in `/content/posts/`
- Frontmatter for metadata (title, date, excerpt, tags)
- Markdown parser: **react-markdown** with **remark-gfm** for GitHub-flavored Markdown
- Syntax highlighting: **react-syntax-highlighter** with custom dark theme

### Particle System
**Technical Approach**:
- Use **HTML5 Canvas** for particle rendering
- Create custom hook: `useParticles()`
- Particle characteristics:
  - Small dots (2-4px diameter)
  - Slow, organic movement (Perlin noise or similar)
  - Varying opacity (0.1 to 0.3)
  - Sparse distribution (50-100 particles max)
  - Subtle, barely noticeable unless you look closely
- Performance: Use `requestAnimationFrame` with delta time
- Render on background layer (below windows)

### Drag System
**Implementation Options**:
1. **Custom Hook** (`useDraggable`):
   - Use `onMouseDown`, `onMouseMove`, `onMouseUp` events
   - Track position delta
   - Apply constraints (keep window in viewport)
   - Pros: Full control, lightweight
   - Cons: More code to write and test

2. **Library** (`react-draggable` or `@dnd-kit/core`):
   - Pros: Battle-tested, accessibility built-in
   - Cons: Additional dependency

**Recommendation**: Start with custom hook for learning and control, but be open to library if complexity grows.

---

## 5. Solution Approaches

### Approach 1: Single-Page Application (SPA) with Window System
**Description**: All content exists in draggable windows on a single "desktop" view. Navigation is handled by opening/closing/switching windows.

**Implementation**:
- Desktop component renders all available windows
- Dock/taskbar shows available apps (Bio, Blog, Portfolio)
- Clicking dock item opens corresponding window
- Blog posts open in new window instances

**Pros**:
- Pure OS metaphor
- Unique, impressive experience
- No page transitions (fast)
- All content accessible from one view

**Cons**:
- Complex state management (many windows open at once)
- May feel cluttered with multiple windows
- Accessibility challenges (keyboard navigation)
- SEO challenges (single URL for all content)

**Complexity**: High
**Risk**: Medium (accessibility, UX complexity)

---

### Approach 2: Hybrid SPA + Multi-Page (Recommended)
**Description**: Landing page uses desktop metaphor with 3-4 windows. Blog posts and detailed content use separate routes but maintain the aesthetic.

**Implementation**:
- **Landing page** (`/`): Desktop with Bio, Blog (list), Portfolio windows
- **Blog post detail** (`/blog/:slug`): Full-screen window with post content
- **Project detail** (`/portfolio/:slug`): Full-screen window with project details
- Consistent window chrome and styling across all views
- Subtle particle background on all pages

**Pros**:
- Best of both worlds: impressive landing, practical content pages
- Better SEO (unique URLs for content)
- Simpler state management
- More accessible
- Easier deep-linking and sharing

**Cons**:
- Slight navigation overhead (page transitions)
- Less "pure" OS metaphor

**Complexity**: Medium
**Risk**: Low

---

### Approach 3: Terminal-First (Alternate Direction)
**Description**: Focus on terminal aesthetic instead of windows. Command-line interface for navigation, ASCII art, text-based UI.

**Implementation**:
- Terminal prompt for navigation (e.g., `> cd blog`, `> ls projects`)
- ASCII art header
- All content rendered in terminal-style window
- Monospace fonts throughout

**Pros**:
- Simpler to implement
- Strong retro aesthetic
- Very performant (minimal DOM)

**Cons**:
- Less impressive visually
- Steeper learning curve for users
- May feel gimmicky

**Complexity**: Medium
**Risk**: Medium (usability)

---

## 6. Recommended Approach

**Approach 2: Hybrid SPA + Multi-Page**

This approach offers the best balance of:
- **Impressive first impression**: Landing page with draggable windows feels unique and interactive
- **Practical content consumption**: Blog posts and projects have dedicated URLs for sharing and SEO
- **Maintainability**: Simpler state management than pure window system
- **Accessibility**: Easier to make keyboard-navigable and screen-reader friendly
- **Performance**: Can lazy-load content, optimize per route

### Architecture Details

**Route Structure**:
```
/ (landing)
  ├── WindowManager (Desktop view)
  │   ├── Bio Window
  │   ├── Blog List Window
  │   └── Portfolio List Window
  └── Particle Background

/blog/:slug (post detail)
  ├── Full-screen Window
  │   └── Markdown Content
  └── Particle Background

/portfolio/:slug (project detail)
  ├── Full-screen Window
  │   └── Project Details
  └── Particle Background
```

**Shared Components**:
- `<Desktop>`: Background + particles
- `<Window>`: Window container with chrome
- `<WindowChrome>`: Title bar (static on detail pages, draggable on landing)
- `<Dock>`: Navigation (appears on all pages, links to home)

---

## 7. Detailed Component Specifications

### 7.1 Desktop Component
**Responsibilities**:
- Render particle canvas as background
- Manage global window z-index ordering
- Provide context for window interactions

**Props**: None (or children for flexibility)

**State**:
- `windowStack: string[]` (ordered list of window IDs by z-index)

**Methods**:
- `bringToFront(windowId: string)`: Reorders stack to bring window to top

---

### 7.2 Window Component
**Responsibilities**:
- Render window chrome and content
- Handle drag interactions (on landing page)
- Manage window position and size
- Handle minimize/maximize/close actions

**Props**:
```typescript
interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  draggable?: boolean; // false for detail pages
  resizable?: boolean; // future enhancement
  minimizable?: boolean;
  maximizable?: boolean;
  closeable?: boolean;
  onClose?: () => void;
  className?: string;
}
```

**State**:
- `position: { x: number; y: number }`
- `size: { width: number; height: number }`
- `isMinimized: boolean`
- `isMaximized: boolean`
- `isFocused: boolean`

**Styling**:
- Background: `#0a0a0a` with slight transparency (0.95)
- Border: `1px solid #2a2a2a`
- Box shadow: `0 20px 60px rgba(0, 0, 0, 0.8)` when focused
- Title bar height: `40px`
- Title bar background: `#1a1a1a`

---

### 7.3 WindowChrome Component
**Responsibilities**:
- Render title bar
- Handle drag events (pass to parent Window)
- Render control buttons (minimize, maximize, close)

**Props**:
```typescript
interface WindowChromeProps {
  title: string;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  draggable?: boolean;
}
```

**Layout**:
```
[Drag Handle] [Title]                    [Minimize] [Maximize] [Close]
```

**Control Buttons**:
- Size: 12x12px icons or symbols
- Colors: `#666` inactive, `#fff` hover, accent color for close (e.g., `#ff0000`)
- Spacing: 8px between buttons

---

### 7.4 Dock Component
**Responsibilities**:
- Provide navigation to primary windows/sections
- Show active/open windows
- Handle window opening/switching

**Props**:
```typescript
interface DockProps {
  items: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    isActive?: boolean;
  }>;
}
```

**Positioning**:
- Fixed position at bottom of screen
- Horizontal layout
- Height: `60px`
- Background: `#0a0a0a` with slight transparency

**Item Styling**:
- Width: `60px` square
- Icon size: `32px`
- Active indicator: bottom border (`2px solid accent-color`)

---

### 7.5 ParticleBackground Component
**Responsibilities**:
- Render particle system on canvas
- Animate particles smoothly
- Respond to window resize

**Props**:
```typescript
interface ParticleBackgroundProps {
  particleCount?: number; // default 75
  particleSize?: number; // default 3
  particleSpeed?: number; // default 0.5
  particleColor?: string; // default "#ffffff"
  particleOpacity?: number; // default 0.2
}
```

**Particle Behavior**:
- Each particle has:
  - Position (x, y)
  - Velocity (vx, vy)
  - Opacity (0.1 to 0.3, random)
  - Size (2 to 4px, random)
- Movement: slow drift with slight randomness (Perlin noise optional)
- Boundaries: wrap around screen edges (toroidal topology)

**Performance Optimizations**:
- Use `requestAnimationFrame`
- Only render when particles actually move
- Throttle on low-end devices (detect via FPS)

---

### 7.6 BlogList Component
**Responsibilities**:
- Display list of blog posts
- Filter/sort posts (future: by date, tags)
- Handle post selection

**Props**:
```typescript
interface BlogListProps {
  posts: Array<{
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    tags?: string[];
  }>;
  onPostClick: (slug: string) => void;
}
```

**Layout**:
- List view (not grid)
- Each post: title (large), date (small, monospace), excerpt
- Hover state: subtle highlight
- Click: navigate to `/blog/:slug`

---

### 7.7 BlogPost Component
**Responsibilities**:
- Render full blog post from Markdown
- Handle syntax highlighting for code blocks
- Display metadata (title, date, tags)

**Props**:
```typescript
interface BlogPostProps {
  post: {
    slug: string;
    title: string;
    date: string;
    content: string; // markdown
    tags?: string[];
  };
}
```

**Markdown Rendering**:
- Use `react-markdown` with `remark-gfm`
- Custom renderers for:
  - Code blocks: `react-syntax-highlighter` with dark theme (e.g., `atomOneDark`)
  - Links: styled with accent color, no underline
  - Headings: match site typography scale
  - Blockquotes: left border accent

---

## 8. Typography System

### Font Stack
**Headings & UI**:
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

**Monospace (Code, Accents)**:
```css
font-family: "SF Mono", "Fira Code", "Courier New", monospace;
```

### Type Scale (Major Third, 1.250 ratio)
- **Hero (h1)**: 96px / 6rem
- **h2**: 76.8px / 4.8rem
- **h3**: 61.44px / 3.84rem
- **h4**: 49.15px / 3.072rem
- **h5**: 39.32px / 2.458rem
- **h6 / Large Body**: 31.46px / 1.968rem
- **Body**: 20px / 1.25rem
- **Small**: 16px / 1rem
- **Tiny**: 12.8px / 0.8rem

### Font Weights
- **Regular**: 400 (body text)
- **Medium**: 500 (subheadings)
- **Bold**: 700 (headings)
- **Black**: 900 (hero, emphasis)

---

## 9. Color System

### Core Palette
- **Background**: `#000000` (pure black) or `#0a0a0a` (near black)
- **Surface**: `#1a1a1a` (window chrome, cards)
- **Border**: `#2a2a2a` (subtle dividers)
- **Text Primary**: `#ffffff` (high contrast)
- **Text Secondary**: `#a0a0a0` (less important text)
- **Text Tertiary**: `#666666` (labels, captions)

### Accent Color (Recommend: Electric Blue)
- **Primary**: `#00ffff` (cyan/electric blue)
- **Hover**: `#66ffff` (lighter)
- **Active**: `#00cccc` (darker)

**Alternative Accents** (user can choose):
- Terminal Green: `#00ff00`
- Neon Pink: `#ff00ff`
- Warning Orange: `#ff6600`

---

## 10. Content Structure

### Blog Posts
**File Structure**:
```
/content/
  /posts/
    /my-first-post.md
    /another-post.md
```

**Frontmatter Format**:
```yaml
---
title: "My First Post"
date: "2025-11-05"
excerpt: "A short description of the post for previews"
tags: ["react", "typescript", "web-dev"]
published: true
---

# Post content starts here...
```

**Markdown Processing**:
- Build-time parsing (not runtime) for performance
- Generate static JSON index of all posts
- Lazy load full post content on detail page

---

## 11. Success Criteria

### Functional Requirements
- [ ] Desktop landing page with 3 draggable windows (Bio, Blog, Portfolio)
- [ ] Windows can be dragged, brought to front, minimized, closed
- [ ] Dock/taskbar for opening and switching windows
- [ ] Blog list displays all posts from `/content/posts/`
- [ ] Blog post detail page renders Markdown with syntax highlighting
- [ ] Portfolio list displays projects (data can be hardcoded initially)
- [ ] Particle background renders smoothly on all pages
- [ ] Navigation between landing and detail pages works correctly
- [ ] Responsive design (graceful degradation on mobile)

### Performance Requirements
- [ ] First Contentful Paint (FCP) < 1.0s on fast connection
- [ ] Time to Interactive (TTI) < 2.0s
- [ ] Particle animation runs at 60fps on desktop
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices)
- [ ] Bundle size < 300KB gzipped (excluding content)

### Visual/UX Requirements
- [ ] Bold, impactful typography that draws attention
- [ ] Clean, sharp lines (minimal or no border-radius)
- [ ] Dark mode only (deep black background)
- [ ] Subtle particle effect (not distracting)
- [ ] Smooth window dragging (no jank)
- [ ] Clear visual hierarchy
- [ ] Accessible keyboard navigation (Tab, Enter, Esc work correctly)
- [ ] Screen reader friendly (ARIA labels where needed)

### Code Quality Requirements
- [ ] TypeScript with strict mode enabled
- [ ] No ESLint errors
- [ ] Component-level CSS modules
- [ ] Reusable hooks (`useDraggable`, `useParticles`, `useWindowManager`)
- [ ] Proper React 19 patterns (hooks, context, memoization)

---

## 12. Out of Scope (For Now)

The following features are explicitly **not** included in this initial version but may be added later:

- **Comments system** (Disqus, utterances, etc.)
- **Blog post search** or filtering by tags
- **Dark/light mode toggle** (dark mode only for now)
- **Window resizing** (fixed or content-based sizing only)
- **Custom window layouts** saved to localStorage
- **Contact form** (just link to email/social for now)
- **RSS feed generation**
- **SEO meta tags** (can add later)
- **Analytics integration**
- **CMS integration** (just Markdown files for now)
- **Image optimization pipeline** (use standard `<img>` for now)
- **Internationalization (i18n)**

---

## 13. Open Questions

### Critical (Must resolve before implementation)
1. **Exact accent color preference**:
   - Electric blue (#00ffff)?
   - Terminal green (#00ff00)?
   - Other?

2. **Window behavior on mobile**:
   - Disable dragging, show windows in vertical stack?
   - Simplify to single-page scroll?
   - Or embrace desktop-only experience?

3. **Bio content**:
   - What should go in the Bio window? (Name, title, short bio, links?)
   - Any specific social links?

### Important (Affects design, can decide during implementation)
4. **Portfolio data source**:
   - Hardcoded in component?
   - JSON file in `/content/`?
   - Same Markdown approach as blog?

5. **Window default positions and sizes**:
   - Should they be stacked/cascading?
   - Or arranged in specific layout?

6. **Dock position**:
   - Bottom (macOS style)?
   - Top (taskbar style)?
   - Side?

### Nice-to-know (Optimization)
7. **Content volume**:
   - How many blog posts initially?
   - How many portfolio items?
   - Affects pagination decisions

8. **Custom fonts**:
   - Stick with system fonts?
   - Or use web fonts (e.g., Inter, JetBrains Mono)?

---

## 14. Risks & Mitigations

### Risk 1: Window System Complexity
**Impact**: High (could derail project)
**Likelihood**: Medium

**Mitigation**:
- Start with fixed windows (no drag) to prove layout
- Add dragging incrementally
- Use well-tested library if custom implementation is too complex

### Risk 2: Accessibility Challenges
**Impact**: Medium (bad for inclusivity)
**Likelihood**: High (window systems are inherently less accessible)

**Mitigation**:
- Ensure all content is reachable via keyboard
- Add skip links
- Provide alternative navigation (not just windows)
- Test with screen reader early

### Risk 3: Performance on Low-End Devices
**Impact**: Medium (poor UX for some users)
**Likelihood**: Medium

**Mitigation**:
- Use Canvas for particles (better than DOM)
- Detect low FPS, disable particles if needed
- Code-split heavy components
- Lazy load blog content

### Risk 4: Mobile Experience
**Impact**: Medium (many users on mobile)
**Likelihood**: High (window dragging doesn't work well on touch)

**Mitigation**:
- Design mobile-specific layout (no dragging)
- Use media queries to switch layouts
- Test on real devices early

---

## 15. Dependencies to Add

### Production Dependencies
- `react-router-dom` (^6.x) - Routing
- `zustand` (^4.x) - State management
- `react-markdown` (^9.x) - Markdown rendering
- `remark-gfm` (^4.x) - GitHub-flavored Markdown
- `react-syntax-highlighter` (^15.x) - Code syntax highlighting

### Dev Dependencies
- `@types/react-syntax-highlighter` - TypeScript types
- `vanilla-extract` or `CSS Modules` (already supported by Vite)

**Total estimated bundle impact**: ~150-200KB (gzipped)

---

## 16. Timeline Considerations

**Note**: As per SPIDER-SOLO protocol, no time estimates are provided. Instead, work is broken into phases:

1. **Phase 1: Foundation** - Project setup, routing, basic layout
2. **Phase 2: Window System** - Window component, chrome, basic dragging
3. **Phase 3: Particle Background** - Canvas particle system
4. **Phase 4: Content Components** - Bio, Blog list, Portfolio list
5. **Phase 5: Blog Detail** - Markdown rendering, syntax highlighting
6. **Phase 6: Polish** - Typography refinement, final styling, responsive
7. **Phase 7: Performance** - Optimization, lazy loading, bundle analysis

Each phase will follow the IDE loop (Implement → Defend → Evaluate).

---

## 17. References & Inspiration

### Design Inspiration
- **Brutalist Websites**: [brutalistwebsites.com](https://brutalistwebsites.com)
- **Windows 95 UI**: Classic desktop window chrome
- **macOS Big Sur**: Modern window shadows and translucency
- **Terminal.css**: [terminalcss.xyz](https://terminalcss.xyz) (for terminal aesthetic)

### Technical References
- **React 19 Docs**: [react.dev](https://react.dev)
- **Zustand**: [github.com/pmndrs/zustand](https://github.com/pmndrs/zustand)
- **react-markdown**: [github.com/remarkjs/react-markdown](https://github.com/remarkjs/react-markdown)
- **Canvas Particle Systems**: MDN Canvas API tutorials

---

## 18. Self-Review Notes

_(To be added after initial self-review)_

---

## Appendix: Example Window Layout

```
┌──────────────────────────────────────────────────────────────┐
│                         DESKTOP                              │
│  ┌────────────────────┐  ┌─────────────────────┐            │
│  │ Bio                │  │ Blog                │            │
│  ├────────────────────┤  ├─────────────────────┤            │
│  │                    │  │ • Post Title 1      │            │
│  │ [Name]             │  │   2025-11-01        │            │
│  │ Developer & Writer │  │                     │            │
│  │                    │  │ • Post Title 2      │            │
│  │ [Bio text...]      │  │   2025-10-15        │            │
│  │                    │  │                     │            │
│  │ [Social links]     │  │ • Post Title 3      │            │
│  │                    │  │   2025-10-01        │            │
│  └────────────────────┘  └─────────────────────┘            │
│                                                              │
│            ┌───────────────────────┐                        │
│            │ Portfolio             │                        │
│            ├───────────────────────┤                        │
│            │ Project 1             │                        │
│            │ [Description]         │                        │
│            │                       │                        │
│            │ Project 2             │                        │
│            │ [Description]         │                        │
│            └───────────────────────┘                        │
│                                                              │
│ [Particle effects in background]                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
  ┌──────────────────────────────────────────────────────────┐
  │  [Bio]     [Blog]     [Portfolio]                        │
  └──────────────────────────────────────────────────────────┘
                         DOCK
```

---

**End of Specification**
