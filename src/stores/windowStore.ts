import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface WindowState {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isVisible: boolean;
}

interface WindowStore {
  windows: Record<string, WindowState>;
  windowStack: string[]; // Order determines z-index (last = highest)

  // Actions
  bringToFront: (id: string) => void;
  toggleMinimize: (id: string) => void;
  closeWindow: (id: string) => void;
  openWindow: (id: string, position: { x: number; y: number }, size: { width: number; height: number }) => void;
  updatePosition: (id: string, position: { x: number; y: number }) => void;
  getZIndex: (id: string) => number;
}

const initialWindows: Record<string, WindowState> = {
  bio: {
    id: 'bio',
    position: { x: 50, y: 50 },
    size: { width: 400, height: 500 },
    isMinimized: false,
    isVisible: true,
  },
  blog: {
    id: 'blog',
    position: { x: 500, y: 50 },
    size: { width: 450, height: 600 },
    isMinimized: false,
    isVisible: true,
  },
  portfolio: {
    id: 'portfolio',
    position: { x: 275, y: 300 },
    size: { width: 500, height: 400 },
    isMinimized: false,
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

      getZIndex: (id) => {
        const stack = get().windowStack;
        const index = stack.indexOf(id);
        return index === -1 ? 0 : index + 100; // Base z-index of 100
      },
    }),
    { name: 'window-store' }
  )
);
