# Implementation Plan: Mobile Device Support for paxmei.com

**Plan ID**: 0002
**Spec**: 0002-mobile-optimization.md
**Created**: 2025-11-05
**Status**: Planning
**Protocol**: SPIDER-SOLO

---

## Overview

This plan implements comprehensive mobile device support for paxmei.com while maintaining the OS-brutalist design aesthetic. The current desktop-focused window management system will be augmented with a mobile-optimized interface that replaces draggable windows with a touch-friendly navigation pattern.

### Success Metrics
- Touch targets minimum 44x44px (WCAG AAA compliance)
- Smooth 60fps animations on mobile devices
- Readable typography without zooming (16px base minimum)
- Single-column layout on mobile (< 768px)
- Tab-based navigation replaces window management
- Lighthouse mobile score > 90
- No horizontal scrolling required
- Particle animation optimized for mobile performance
- All interactive elements accessible via touch

### Mobile Breakpoints
- **Mobile**: < 768px (single column, tab-based UI)
- **Tablet**: 768px - 1024px (hybrid: simplified windows or tabs)
- **Desktop**: > 1024px (full window management system)

---

## Phase Status Legend

- `pending` - Not started
- `in-progress` - Currently being worked on
- `completed` - Finished, tested, evaluated, and committed
- `blocked` - Cannot proceed due to external factors

---

## Phase 1: Responsive Foundation & Mobile Detection

**Status**: `pending`

### Objective
Establish responsive design infrastructure, mobile detection hooks, and CSS breakpoint system. Create the foundation for conditional rendering based on device capabilities.

### Dependencies
None (first phase)

### Tasks

1. **Create Mobile Detection Hook**
   - Implement `src/hooks/useMediaQuery.ts`
   - Hook to detect screen size changes
   - Return breakpoint state (mobile/tablet/desktop)
   - Use `window.matchMedia()` with proper cleanup
   - Debounce resize events for performance
   - Add tests for `useMediaQuery.test.ts`

2. **Create Device Capabilities Hook**
   - Implement `src/hooks/useDeviceCapabilities.ts`
   - Detect touch support
   - Detect pointer precision
   - Detect viewport dimensions
   - Add tests

3. **Update CSS Variables for Mobile**
   - Extend `src/styles/variables.css` with mobile-specific overrides
   - Font sizes, spacing, touch targets

4. **Create Responsive Utility Functions**
   - Create `src/utils/responsive.ts`
   - Helper functions for viewport checks

5. **Update Global Styles for Touch**
   - Update `src/styles/global.css`
   - Remove hover effects on touch devices
   - Increase tap target sizes

### Acceptance Criteria
- [ ] `useMediaQuery` hook correctly identifies mobile/tablet/desktop
- [ ] `useDeviceCapabilities` hook returns accurate device info
- [ ] CSS variables scale appropriately at mobile breakpoint
- [ ] Tests pass for all new hooks
- [ ] No console warnings/errors on mobile viewport resize

---

## Phase 2: Mobile Navigation System (Tab-Based UI)

**Status**: `pending`

### Objective
Create a mobile-native navigation system that replaces the desktop window management with a tab-based interface.

### Dependencies
- Phase 1 (needs `useMediaQuery` and device detection)

### Tasks

1. **Create Mobile Navigation Component**
   - Create `src/components/MobileNav/MobileNav.tsx`
   - Bottom navigation bar with 3 tabs (Bio, Blog, Portfolio)
   - 56px height, touch-friendly
   - Active state indicator

2. **Create Mobile View Container**
   - Create `src/components/MobileView/MobileView.tsx`
   - Full-screen container for mobile content
   - Single active section visible

3. **Update Desktop Component for Conditional Rendering**
   - Modify `src/components/Desktop/Desktop.tsx`
   - Render `MobileView` on mobile, Desktop on desktop
   - Hide Taskbar on mobile

4. **Create Mobile Content Wrapper**
   - Create `src/components/MobileContent/MobileContent.tsx`
   - Wraps content without window chrome

5. **Update Landing Page for Mobile**
   - Modify `src/pages/Landing.tsx`

### Acceptance Criteria
- [ ] Mobile navigation visible and functional < 768px
- [ ] Desktop window management visible > 1024px
- [ ] Active tab indicator updates correctly
- [ ] Content switches smoothly between tabs
- [ ] Touch targets meet 44x44px minimum

---

## Phase 3: Mobile-Optimized Typography & Touch Targets

**Status**: `pending`

### Objective
Ensure all text is readable without zooming and all interactive elements meet minimum touch target sizes.

### Dependencies
- Phase 1 (CSS variables)
- Phase 2 (mobile navigation in place)

### Tasks

1. Update Bio/BlogList/Portfolio components with responsive styles
2. Increase touch target sizes
3. Scale typography for mobile readability
4. Update Window Chrome for tablet
5. Update Taskbar for tablet
6. Add responsive typography utilities

### Acceptance Criteria
- [ ] All body text minimum 16px on mobile
- [ ] All interactive elements minimum 44x44px
- [ ] No horizontal scrolling required
- [ ] Visual hierarchy maintained across breakpoints

---

## Phase 4: Mobile Blog Post View & Navigation

**Status**: `pending`

### Objective
Optimize the blog post detail view for mobile devices.

### Dependencies
- Phase 2 (mobile navigation system)
- Phase 3 (typography optimizations)

### Tasks

1. Create mobile blog post layout (full-screen)
2. Optimize code blocks for horizontal scroll
3. Add mobile back navigation
4. Update blog post navigation flow
5. Optimize markdown rendering

### Acceptance Criteria
- [ ] Blog posts display full-screen on mobile
- [ ] Back button navigates to blog list
- [ ] Code blocks scroll horizontally without breaking layout
- [ ] Images scale to fit mobile viewport

---

## Phase 5: Mobile-Optimized Particle Background

**Status**: `pending`

### Objective
Optimize the particle animation for mobile devices to maintain 60fps performance.

### Dependencies
- Phase 1 (device capabilities detection)

### Tasks

1. Update particle hook for responsive behavior (reduce count on mobile)
2. Create particle configuration presets
3. Update Desktop component with responsive particles
4. Add performance monitoring
5. Add particle toggle for accessibility (prefers-reduced-motion)

### Acceptance Criteria
- [ ] Particle count reduced on mobile (25 particles)
- [ ] Animation maintains 60fps on mobile
- [ ] Particles disabled if `prefers-reduced-motion: reduce`
- [ ] Desktop particle count unchanged

---

## Phase 6: Cross-Browser Testing & Polish

**Status**: `pending`

### Objective
Ensure consistent behavior across mobile browsers and fix browser-specific issues.

### Dependencies
- All previous phases

### Tasks

1. Test on Safari iOS
2. Test on Chrome Android
3. Fix iOS-specific issues (viewport, safe-area-inset)
4. Fix Android-specific issues
5. Add loading states & skeleton screens
6. Add error boundaries
7. Optimize bundle size
8. Add viewport meta tag

### Acceptance Criteria
- [ ] Works on Safari iOS 14+
- [ ] Works on Chrome Android 90+
- [ ] Safe area insets handled correctly
- [ ] Bundle size < 150KB gzipped
- [ ] Lighthouse mobile score > 90

---

## Phase 7: Documentation & Deployment

**Status**: `pending`

### Objective
Document mobile implementation and ensure proper deployment configuration.

### Dependencies
- All previous phases

### Tasks

1. Update README.md
2. Add mobile testing instructions
3. Update deployment configuration
4. Create mobile design documentation
5. Update component documentation
6. Performance documentation
7. Final review & checklist

### Acceptance Criteria
- [ ] README updated with mobile information
- [ ] Mobile testing guide created
- [ ] All documentation complete
- [ ] Final Lighthouse audit > 90

---

## Success Criteria Summary

### Functional Requirements
- ✅ Tab-based navigation on mobile (< 768px)
- ✅ Full-screen content views on mobile
- ✅ Touch-friendly interactions (44px targets)
- ✅ Responsive typography (16px minimum)
- ✅ Mobile blog post navigation
- ✅ Optimized particle background

### Performance Requirements
- ✅ Lighthouse mobile score > 90
- ✅ 60fps animations on mobile
- ✅ Bundle size < 150KB gzipped
- ✅ LCP < 2.5s on 3G

### Browser Support
- ✅ Safari iOS 14+
- ✅ Chrome Android 90+
- ✅ Firefox Mobile (latest)
