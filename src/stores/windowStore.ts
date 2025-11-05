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
  toggleMaximize: (id: string) => void;
  closeWindow: (id: string) => void;
  openWindow: (id: string, position: { x: number; y: number }, size: { width: number; height: number }) => void;
  updatePosition: (id: string, position: { x: number; y: number }) => void;
  updateSize: (id: string, size: { width: number; height: number }) => void;
  getZIndex: (id: string) => number;
}

const initialWindows: Record<string, WindowState> = {
  bio: {
    id: 'bio',
    position: { x: 450, y: 250 },
    size: { width: 500, height: 450 },
    isMinimized: false,
    isMaximized: false,
    isVisible: true,
  },
  blog: {
    id: 'blog',
    position: { x: 250, y: 150 },
    size: { width: 550, height: 500 },
    isMinimized: false,
    isMaximized: false,
    isVisible: true,
  },
  portfolio: {
    id: 'portfolio',
    position: { x: 50, y: 50 },
    size: { width: 550, height: 450 },
    isMinimized: false,
    isMaximized: false,
    isVisible: true,
  },
};

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
            // Window already exists, just make it visible and bring to front
            return {
              windows: {
                ...state.windows,
                [id]: {
                  ...existingWindow,
                  isVisible: true,
                  isMinimized: false,
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

      getZIndex: (id) => {
        const stack = get().windowStack;
        const index = stack.indexOf(id);
        return index === -1 ? 0 : index + 100; // Base z-index of 100
      },
    }),
    { name: 'window-store' }
  )
);
