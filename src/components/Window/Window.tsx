import type { ReactNode } from 'react';
import { useWindowStore } from '@stores/windowStore';
import WindowChrome from './WindowChrome';
import WindowContent from './WindowContent';
import styles from './Window.module.css';

interface WindowProps {
  id: string;
  title: string;
  children: ReactNode;
  draggable?: boolean;
  resizable?: boolean;
  minimizable?: boolean;
  closeable?: boolean;
  className?: string;
}

export default function Window({
  id,
  title,
  children,
  draggable = false,
  resizable = false,
  minimizable = true,
  closeable = true,
  className = '',
}: WindowProps) {
  const window = useWindowStore((state) => state.windows[id]);
  const bringToFront = useWindowStore((state) => state.bringToFront);
  const toggleMinimize = useWindowStore((state) => state.toggleMinimize);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const getZIndex = useWindowStore((state) => state.getZIndex);
  const windowStack = useWindowStore((state) => state.windowStack);

  if (!window || !window.isVisible) {
    return null;
  }

  const isFocused = windowStack[windowStack.length - 1] === id;
  const zIndex = getZIndex(id);

  const handleClick = () => {
    if (!isFocused) {
      bringToFront(id);
    }
  };

  const handleMinimize = () => {
    toggleMinimize(id);
  };

  const handleClose = () => {
    closeWindow(id);
  };

  return (
    <div
      className={`${styles.window} ${isFocused ? styles.focused : ''} ${
        window.isMinimized ? styles.minimized : ''
      } ${className}`}
      style={{
        left: `${window.position.x}px`,
        top: `${window.position.y}px`,
        width: `${window.size.width}px`,
        height: `${window.size.height}px`,
        zIndex,
      }}
      onClick={handleClick}
    >
      <WindowChrome
        title={title}
        onMinimize={minimizable ? handleMinimize : undefined}
        onMaximize={resizable ? undefined : undefined} // Not implemented in Phase 3
        onClose={closeable ? handleClose : undefined}
        draggable={draggable}
      />
      <WindowContent>{children}</WindowContent>
    </div>
  );
}
