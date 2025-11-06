import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface WindowState {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  isVisible: boolean;
  // Store pre-maximized state for restoration
  preMaximizedPosition?: { x: number; y: number };
  preMaximizedSize?: { width: number; height: number };
}

interface WindowStore {
  windows: Record<string, WindowState>;
  windowStack: string[]; // Order determines z-index (last = highest)

  // Actions
  bringToFront: (id: string) => void;
  toggleMinimize: (id: string) => void;
  setMinimized: (id: string, minimized: boolean) => void;
  toggleMaximize: (id: string) => void;
  setMaximized: (id: string, maximized: boolean) => void;
  closeWindow: (id: string) => void;
  openWindow: (id: string, position: { x: number; y: number }, size: { width: number; height: number }) => void;
  updatePosition: (id: string, position: { x: number; y: number }) => void;
  updateSize: (id: string, size: { width: number; height: number }) => void;
  getZIndex: (id: string) => number;
  resetLayout: () => void;
}

// Calculate responsive window layout based on viewport size
const getResponsiveLayout = (): Record<string, WindowState> => {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

  // Responsive padding and gaps (scale with viewport)
  const padding = Math.floor(viewportWidth * 0.03);
  const gap = Math.floor(viewportWidth * 0.02);
  const taskbarHeight = 48;

  // Available space
  const availableWidth = viewportWidth - (padding * 2);
  const availableHeight = viewportHeight - taskbarHeight - (padding * 2);

  // Define minimum comfortable sizes for windows
  const minStackedWidth = 380;
  const minStackedHeight = 350;

  // For side-by-side, we need more generous minimums for comfort
  const minSideBySideWidth = 480;
  const minSideBySideHeight = 400;

  // Calculate bio dimensions (banner at top)
  const bioHeight = Math.max(
    Math.min(Math.floor(availableHeight * 0.3), 320),
    Math.min(280, availableHeight * 0.25)
  );
  const bioWidth = Math.min(availableWidth, 1400);

  // Available space for bottom windows
  const bottomY = padding + bioHeight + gap;
  const bottomAvailableHeight = availableHeight - bioHeight - gap;

  // Determine if we have enough width for comfortable side-by-side layout
  // Need space for two windows at minimum comfortable width + gap between them
  const minWidthForSideBySide = (minSideBySideWidth * 2) + gap;
  const useSideBySide = availableWidth >= minWidthForSideBySide;

  let blogConfig: { position: { x: number; y: number }; size: { width: number; height: number } };
  let portfolioConfig: { position: { x: number; y: number }; size: { width: number; height: number } };

  if (useSideBySide) {
    // Side-by-side layout (when we have enough horizontal space)
    const totalBottomWidth = Math.min(availableWidth, 1600);
    const blogWidth = Math.max(
      minSideBySideWidth,
      Math.floor(totalBottomWidth * 0.35)
    );
    const portfolioWidth = Math.max(
      minSideBySideWidth,
      totalBottomWidth - blogWidth - gap
    );
    const bottomHeight = Math.max(
      minSideBySideHeight,
      Math.min(bottomAvailableHeight, 560)
    );

    blogConfig = {
      position: { x: padding, y: bottomY },
      size: { width: blogWidth, height: bottomHeight },
    };

    portfolioConfig = {
      position: { x: padding + blogWidth + gap, y: bottomY },
      size: { width: portfolioWidth, height: bottomHeight },
    };
  } else {
    // Stacked layout (when viewport is too narrow for comfortable side-by-side)
    const stackedWidth = Math.max(
      minStackedWidth,
      Math.min(availableWidth, 900)
    );
    const stackedHeight = Math.max(
      minStackedHeight,
      Math.min(Math.floor(bottomAvailableHeight * 0.46), 480)
    );

    blogConfig = {
      position: { x: padding, y: bottomY },
      size: { width: stackedWidth, height: stackedHeight },
    };

    portfolioConfig = {
      position: { x: padding, y: bottomY + stackedHeight + gap },
      size: { width: stackedWidth, height: stackedHeight },
    };
  }

  return {
    bio: {
      id: 'bio',
      position: { x: padding, y: padding },
      size: { width: bioWidth, height: bioHeight },
      isMinimized: false,
      isMaximized: false,
      isVisible: true,
    },
    blog: {
      id: 'blog',
      position: blogConfig.position,
      size: blogConfig.size,
      isMinimized: false,
      isMaximized: false,
      isVisible: true,
    },
    portfolio: {
      id: 'portfolio',
      position: portfolioConfig.position,
      size: portfolioConfig.size,
      isMinimized: false,
      isMaximized: false,
      isVisible: true,
    },
  };
};

const initialWindows = getResponsiveLayout();

export const useWindowStore = create<WindowStore>()(
  devtools(
    (set, get) => ({
      windows: initialWindows,
      windowStack: ['portfolio', 'blog', 'bio'], // Bio is on top initially

      bringToFront: (id) => {
        set((state) => {
          const filtered = state.windowStack.filter((windowId) => windowId !== id);
          return {
            windowStack: [...filtered, id],
          };
        });
      },

      toggleMinimize: (id) => {
        set((state) => ({
          windows: {
            ...state.windows,
            [id]: {
              ...state.windows[id],
              isMinimized: !state.windows[id].isMinimized,
            },
          },
        }));
      },

      setMinimized: (id, minimized) => {
        set((state) => ({
          windows: {
            ...state.windows,
            [id]: {
              ...state.windows[id],
              isMinimized: minimized,
            },
          },
        }));
      },

      closeWindow: (id) => {
        set((state) => ({
          windows: {
            ...state.windows,
            [id]: {
              ...state.windows[id],
              isVisible: false,
            },
          },
          windowStack: state.windowStack.filter((windowId) => windowId !== id),
        }));
      },

      openWindow: (id, position, size) => {
        set((state) => {
          const existingWindow = state.windows[id];

          if (existingWindow) {
            // Window already exists, restore it with fresh position/size
            return {
              windows: {
                ...state.windows,
                [id]: {
                  ...existingWindow,
                  position,
                  size,
                  isVisible: true,
                  isMinimized: false,
                  isMaximized: false, // Reset maximized state when reopening
                  preMaximizedPosition: undefined,
                  preMaximizedSize: undefined,
                },
              },
              windowStack: [...state.windowStack.filter((w) => w !== id), id],
            };
          }

          // Create new window
          return {
            windows: {
              ...state.windows,
              [id]: {
                id,
                position,
                size,
                isMinimized: false,
                isMaximized: false,
                isVisible: true,
              },
            },
            windowStack: [...state.windowStack, id],
          };
        });
      },

      updatePosition: (id, position) => {
        set((state) => ({
          windows: {
            ...state.windows,
            [id]: {
              ...state.windows[id],
              position,
            },
          },
        }));
      },

      updateSize: (id, size) => {
        set((state) => ({
          windows: {
            ...state.windows,
            [id]: {
              ...state.windows[id],
              size,
            },
          },
        }));
      },

      toggleMaximize: (id) => {
        set((state) => {
          const window = state.windows[id];

          if (window.isMaximized) {
            // Restore to pre-maximized state
            return {
              windows: {
                ...state.windows,
                [id]: {
                  ...window,
                  isMaximized: false,
                  position: window.preMaximizedPosition || window.position,
                  size: window.preMaximizedSize || window.size,
                  preMaximizedPosition: undefined,
                  preMaximizedSize: undefined,
                },
              },
            };
          } else {
            // Maximize - save current state and set to full viewport
            return {
              windows: {
                ...state.windows,
                [id]: {
                  ...window,
                  isMaximized: true,
                  preMaximizedPosition: window.position,
                  preMaximizedSize: window.size,
                  position: { x: 0, y: 0 },
                  size: {
                    width: globalThis.window.innerWidth,
                    height: globalThis.window.innerHeight - 48, // Subtract taskbar height
                  },
                },
              },
            };
          }
        });
      },

      setMaximized: (id, maximized) => {
        set((state) => {
          const window = state.windows[id];
          if (!window) return state;

          if (maximized && !window.isMaximized) {
            // Maximize - save current state and set to full viewport
            return {
              windows: {
                ...state.windows,
                [id]: {
                  ...window,
                  isMaximized: true,
                  preMaximizedPosition: window.position,
                  preMaximizedSize: window.size,
                  position: { x: 0, y: 0 },
                  size: {
                    width: globalThis.window.innerWidth,
                    height: globalThis.window.innerHeight - 48, // Subtract taskbar height
                  },
                },
              },
            };
          } else if (!maximized && window.isMaximized) {
            // Restore to pre-maximized state
            return {
              windows: {
                ...state.windows,
                [id]: {
                  ...window,
                  isMaximized: false,
                  position: window.preMaximizedPosition || window.position,
                  size: window.preMaximizedSize || window.size,
                  preMaximizedPosition: undefined,
                  preMaximizedSize: undefined,
                },
              },
            };
          }

          return state;
        });
      },

      getZIndex: (id) => {
        const stack = get().windowStack;
        const index = stack.indexOf(id);
        return index === -1 ? 0 : index + 100; // Base z-index of 100
      },

      resetLayout: () => {
        const newLayout = getResponsiveLayout();
        set((state) => {
          const updatedWindows = { ...state.windows };

          // Update each window's position and size, but preserve user state
          Object.keys(newLayout).forEach((id) => {
            if (updatedWindows[id]) {
              // Only update if window is not maximized or minimized
              if (!updatedWindows[id].isMaximized && !updatedWindows[id].isMinimized) {
                updatedWindows[id] = {
                  ...updatedWindows[id],
                  position: newLayout[id].position,
                  size: newLayout[id].size,
                };
              }
            }
          });

          return { windows: updatedWindows };
        });
      },
    }),
    { name: 'window-store' }
  )
);
