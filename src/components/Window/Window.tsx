import type { ReactNode } from 'react';
import { useWindowStore } from '@stores/windowStore';
import { useDraggable } from '@hooks/useDraggable';
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
  const updatePosition = useWindowStore((state) => state.updatePosition);
  const getZIndex = useWindowStore((state) => state.getZIndex);
  const windowStack = useWindowStore((state) => state.windowStack);

  // Draggable hook
  const { position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: window?.position || { x: 0, y: 0 },
    onDragEnd: (pos) => {
      updatePosition(id, pos);
    },
    constrainToViewport: true,
    windowSize: window?.size || { width: 300, height: 200 },
  });

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

  const handleChromeMouseDown = (e: React.MouseEvent) => {
    // Bring to front when starting to drag
    if (!isFocused) {
      bringToFront(id);
    }

    // Start dragging if enabled
    if (draggable) {
      handleMouseDown(e);
    }
  };

  // Use dragged position if dragging, otherwise use store position
  const displayPosition = draggable && isDragging ? position : window.position;

  return (
    <div
      className={`${styles.window} ${isFocused ? styles.focused : ''} ${
        window.isMinimized ? styles.minimized : ''
      } ${isDragging ? styles.dragging : ''} ${className}`}
      style={{
        left: `${displayPosition.x}px`,
        top: `${displayPosition.y}px`,
        width: `${window.size.width}px`,
        height: `${window.size.height}px`,
        zIndex,
        willChange: isDragging ? 'transform' : 'auto',
      }}
      onClick={handleClick}
    >
      <WindowChrome
        title={title}
        onMinimize={minimizable ? handleMinimize : undefined}
        onMaximize={resizable ? undefined : undefined}
        onClose={closeable ? handleClose : undefined}
        draggable={draggable}
        onMouseDown={handleChromeMouseDown}
      />
      <WindowContent>{children}</WindowContent>
    </div>
  );
}
