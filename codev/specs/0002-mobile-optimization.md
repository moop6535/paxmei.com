# Specification: Mobile Device Support for paxmei.com

**Spec ID**: 0002
**Plan**: 0002-mobile-optimization.md
**Created**: 2025-11-05
**Status**: Draft
**Protocol**: SPIDER-SOLO

---

## Problem Statement

paxmei.com currently provides an excellent desktop experience with OS-style window management, but the site is not optimized for mobile devices. Key issues include:

1. **Unusable window management on mobile**: Draggable windows are difficult to manage on small touchscreens
2. **Small touch targets**: Buttons and links don't meet minimum 44x44px touch target requirements
3. **Poor typography on mobile**: Text is too small, requiring users to zoom
4. **Performance issues**: Particle background may impact performance on lower-end mobile devices
5. **No mobile navigation pattern**: Desktop taskbar doesn't translate well to mobile

### User Impact
- Mobile users (estimated 40-60% of web traffic) have a suboptimal experience
- Difficult to navigate between Bio, Blog, and Portfolio sections
- Blog posts hard to read on mobile
- Accidental taps due to small touch targets
- Potential performance issues and battery drain

---

## Goals & Non-Goals

### Goals
1. **Mobile-first navigation**: Tab-based bottom navigation for < 768px viewports
2. **Touch-optimized UI**: All interactive elements meet 44x44px minimum
3. **Readable typography**: 16px minimum body text, optimized line-height
4. **60fps performance**: Optimized particle animation for mobile
5. **Full-screen content**: Blog posts display full-screen on mobile
6. **Cross-browser compatibility**: Works on Safari iOS 14+ and Chrome Android 90+
7. **Accessibility**: Respects prefers-reduced-motion, maintains WCAG AA standards

### Non-Goals
- PWA/offline functionality (future enhancement)
- Swipe gestures for navigation (keeping interactions explicit)
- Dark mode toggle (site is dark-only currently)
- Mobile-specific content or features
- Redesigning the desktop experience

---

## Design Principles

### Brutalist Aesthetic on Mobile
- Maintain sharp edges, monospace typography, high contrast
- Tab navigation uses same terminal/OS aesthetic
- No rounded corners or gradients
- Minimal animations (respect performance and accessibility)

### Progressive Enhancement
- Desktop experience remains unchanged
- Mobile users get optimized tab-based UI
- Tablet users (768-1024px) get simplified window management or tabs
- Feature detection prevents broken states

### Performance First
- Target 60fps on mid-range mobile devices (iPhone SE, Pixel 4a)
- Reduce particle count on mobile (75 → 25)
- Code-split mobile-specific components
- Optimize bundle size (< 150KB gzipped)

---

## Technical Architecture

### Responsive Breakpoints

```typescript
const BREAKPOINTS = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
}
```

### Component Structure

```
src/
├── components/
│   ├── Desktop/           # Conditional renderer (mobile vs desktop)
│   ├── MobileView/        # Mobile-specific full-screen container
│   ├── MobileNav/         # Bottom tab navigation
│   ├── MobileContent/     # Content wrapper without window chrome
│   ├── MobileHeader/      # Mobile header with back button
│   └── Window/            # Desktop-only (hidden on mobile)
├── hooks/
│   ├── useMediaQuery.ts   # Breakpoint detection hook
│   └── useDeviceCapabilities.ts  # Touch/device detection
└── utils/
    └── responsive.ts      # Responsive utility functions
```

### State Management

- Zustand window store remains unchanged (desktop uses it)
- Mobile navigation uses local React state (active tab)
- No need to sync mobile/desktop state (different UI paradigms)

---

## User Experience

### Mobile Navigation Flow (< 768px)

1. **Homepage**: Bottom tab bar with Bio, Blog, Portfolio tabs
2. **Bio Tab**: Full-screen bio content, scrollable
3. **Blog Tab**: Full-screen list of blog posts
4. **Portfolio Tab**: Full-screen portfolio projects
5. **Blog Post**: Tap blog → full-screen post with back button

### Tablet Experience (768-1024px)

Two possible approaches (to be decided during implementation):
1. **Simplified windows**: Larger touch targets, fewer windows visible
2. **Tab-based like mobile**: Use tab navigation on tablet as well

Recommendation: Use tab-based on tablet for consistency and simplicity.

### Desktop Experience (> 1024px)

No changes. Full window management system with:
- Draggable/resizable windows
- Minimize/maximize/close controls
- Taskbar for window restoration

---

## Interaction Design

### Mobile Bottom Tab Navigation

```
┌─────────────────────────────────┐
│                                 │
│        CONTENT AREA             │
│        (scrollable)             │
│                                 │
│                                 │
├─────────────────────────────────┤
│  [Bio]   [Blog]   [Portfolio]  │  ← 56px height
└─────────────────────────────────┘
```

**Tap behavior:**
- Tap tab → switches content to that section
- Active tab highlighted with accent color
- Smooth fade transition between sections

### Mobile Blog Post View

```
┌─────────────────────────────────┐
│  ← Blog Post Title              │  ← 56px sticky header
├─────────────────────────────────┤
│                                 │
│   Blog post content             │
│   (markdown rendered)           │
│   (scrollable)                  │
│                                 │
└─────────────────────────────────┘
```

**Back button behavior:**
- Tap back → returns to Blog tab
- Maintains scroll position in blog list

---

## Visual Design

### Typography Scale (Mobile)

```css
/* Mobile overrides */
@media (max-width: 767px) {
  --font-size-base: 1rem;        /* 16px (was 15px) */
  --font-size-h1: 2rem;          /* 32px (was 40px) */
  --font-size-h2: 1.5rem;        /* 24px (was 32px) */
  --font-size-h3: 1.25rem;       /* 20px (was 24px) */
  --line-height-normal: 1.6;     /* Improved readability */
  --line-height-relaxed: 1.8;
}
```

### Touch Targets

All interactive elements must be at least 44x44px (WCAG AAA):
- Tab navigation buttons: 56px height × 33% width
- Back button: 44x44px
- Blog post links: min 44px height
- Portfolio project links: min 44px height

### Spacing

Increased touch-friendly spacing on mobile:
- Button padding: 12px vertical, 16px horizontal
- Section spacing: 24px between major sections
- List item spacing: 16px between items

---

## Particle Animation Optimization

### Desktop Configuration
```typescript
{
  count: 75,
  size: 3,
  speed: 0.5,
  opacity: 0.2
}
```

### Mobile Configuration
```typescript
{
  count: 25,          // 67% reduction
  size: 2,            // Smaller particles
  speed: 0.3,         // Slower movement
  opacity: 0.15       // More subtle
}
```

### Performance Monitoring

```typescript
// Pseudo-code
if (averageFPS < 50) {
  reduceParticleCount(50%);
}
if (averageFPS < 40) {
  disableParticles();
}
```

### Accessibility

```typescript
if (prefersReducedMotion) {
  disableParticles();
}
```

---

## Accessibility Requirements

### WCAG AA Compliance
- ✅ Color contrast 4.5:1 for body text
- ✅ Touch targets 44x44px minimum
- ✅ Keyboard navigation (where applicable on mobile)
- ✅ Screen reader compatibility
- ✅ Respects prefers-reduced-motion

### Focus Management
- Back button receives focus when blog post opens
- Tab navigation maintains logical focus order
- No keyboard traps

### Screen Reader Support
- Proper ARIA labels on navigation
- Semantic HTML structure
- Alt text for images (if any added)

---

## Performance Requirements

### Core Web Vitals (Mobile)

| Metric | Target | Current | Priority |
|--------|--------|---------|----------|
| FCP | < 1.5s | TBD | P0 |
| LCP | < 2.5s | TBD | P0 |
| TTI | < 3.5s | TBD | P0 |
| CLS | < 0.1 | TBD | P0 |
| FID | < 100ms | TBD | P0 |

### Bundle Size
- Total bundle (mobile): < 150KB gzipped
- Code split mobile components
- Lazy load particle background on mobile

### Animation Performance
- Maintain 60fps on:
  - iPhone SE (2020)
  - Pixel 4a
  - Mid-range Android devices

---

## Browser Compatibility

### Minimum Supported Versions

| Browser | Version | Market Share |
|---------|---------|--------------|
| Safari iOS | 14.0+ | ~60% iOS users |
| Chrome Android | 90+ | ~65% Android users |
| Firefox Mobile | Latest | ~5% mobile users |
| Samsung Internet | Latest | ~7% Android users |

### Known Issues & Workarounds

**Safari iOS viewport height:**
- Issue: 100vh includes address bar
- Fix: Use JavaScript-calculated height or `100dvh`

**iOS rubber-band scrolling:**
- Issue: Overscroll reveals gray background
- Fix: Prevent overscroll on specific containers

**300ms tap delay (legacy):**
- Issue: Delay on older mobile browsers
- Fix: Already handled by modern browsers, add `touch-action: manipulation`

---

## Testing Strategy

### Manual Testing Devices

**Required:**
- iPhone 12 or newer (Safari)
- iPhone SE 2020 (Safari, small screen)
- Google Pixel 4a or newer (Chrome)
- Samsung Galaxy S21 or newer (Chrome/Samsung Internet)

**Optional:**
- iPad (Safari, tablet breakpoint)
- Various Android tablets

### Automated Testing

1. **Unit Tests**: Vitest for hooks and utilities
2. **Component Tests**: React Testing Library
3. **Integration Tests**: Test mobile navigation flow
4. **Performance Tests**: Lighthouse CI on mobile
5. **Accessibility Tests**: axe-core

### Testing Checklist

- [ ] Tab navigation works on mobile
- [ ] Blog post opens full-screen
- [ ] Back button returns to blog list
- [ ] All touch targets minimum 44x44px
- [ ] Typography readable without zoom
- [ ] Code blocks scroll horizontally
- [ ] Images scale to viewport
- [ ] Particle animation runs at 60fps
- [ ] Respects prefers-reduced-motion
- [ ] Works in portrait and landscape
- [ ] Works on slow 3G network
- [ ] Lighthouse mobile score > 90

---

## Rollout Plan

### Phase 1: Development (Weeks 1-2)
- Implement Phases 1-3 (foundation, navigation, typography)
- Internal testing on dev devices

### Phase 2: Beta Testing (Week 3)
- Implement Phases 4-5 (blog posts, particles)
- Test on BrowserStack or real device farm
- Gather feedback

### Phase 3: Polish & Launch (Week 4)
- Implement Phases 6-7 (cross-browser, documentation)
- Final Lighthouse audits
- Deploy to production

### Rollback Plan

If critical issues discovered:
1. Add feature flag: `ENABLE_MOBILE_UI=false`
2. Fall back to desktop UI on mobile (with viewport zoom)
3. Fix issues in development
4. Re-enable mobile UI

---

## Success Metrics

### Quantitative Metrics
- Lighthouse mobile score > 90
- Mobile bounce rate < 50%
- Mobile session duration > 2 minutes
- 60fps particle animation (Chrome DevTools)
- Bundle size < 150KB gzipped

### Qualitative Metrics
- User feedback: "Easy to navigate on mobile"
- No user reports of unresponsive touch targets
- No user reports of unreadable text
- Maintains brutalist aesthetic perception

---

## Open Questions

1. **Tablet navigation**: Should tablets (768-1024px) use tab navigation or simplified windows?
   - **Recommendation**: Use tab navigation for consistency

2. **Swipe gestures**: Should we support swipe-to-switch-tabs?
   - **Recommendation**: No, keep interactions explicit (tap-only) for accessibility

3. **Particle behavior on tablet**: Same as mobile or desktop?
   - **Recommendation**: Use medium preset (50 particles)

4. **iOS safe area**: How to handle notch and home indicator?
   - **Recommendation**: Use `env(safe-area-inset-*)` CSS variables

5. **Landscape mode**: Should we optimize for landscape orientation?
   - **Recommendation**: Yes, ensure tab bar and content work in landscape

---

## Future Enhancements (Out of Scope)

- PWA support with offline functionality
- Swipe gestures for tab navigation
- Pull-to-refresh on mobile
- Share button for blog posts
- Mobile-specific animations or transitions
- Custom fonts optimization for mobile
- Dark mode toggle (currently dark-only)

---

## Appendix

### Device Testing Matrix

| Device | OS | Browser | Screen Size | Priority |
|--------|----|---------| ------------|----------|
| iPhone 14 | iOS 16+ | Safari | 390x844 | P0 |
| iPhone SE | iOS 15+ | Safari | 375x667 | P0 |
| Pixel 6 | Android 12+ | Chrome | 412x915 | P0 |
| Galaxy S21 | Android 11+ | Chrome | 360x800 | P1 |
| iPad Pro | iOS 16+ | Safari | 1024x1366 | P1 |

### Performance Baseline

To be measured before Phase 1:
- Current Lighthouse mobile score: ?
- Current mobile bounce rate: ?
- Current bundle size: ~158KB gzipped

### References

- [WCAG 2.1 Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Web.dev Mobile Performance](https://web.dev/mobile/)
- [iOS Safe Area](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)
