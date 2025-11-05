import type { ReactNode } from 'react';
import { useWindowStore } from '@stores/windowStore';
import { useDraggable } from '@hooks/useDraggable';
import { useResizable } from '@hooks/useResizable';
import WindowChrome from './WindowChrome';
import WindowContent from './WindowContent';
import ResizeHandles from './ResizeHandles';
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
  const toggleMaximize = useWindowStore((state) => state.toggleMaximize);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const updatePosition = useWindowStore((state) => state.updatePosition);
  const updateSize = useWindowStore((state) => state.updateSize);
  const getZIndex = useWindowStore((state) => state.getZIndex);
  const windowStack = useWindowStore((state) => state.windowStack);

  // Draggable hook (disabled when maximized)
  const { position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: window?.position || { x: 0, y: 0 },
    onDragEnd: (pos) => {
      updatePosition(id, pos);
    },
    constrainToViewport: true,
    windowSize: window?.size || { width: 300, height: 200 },
  });

  // Resizable hook (disabled when maximized)
  const { size, isResizing, handleResizeStart } = useResizable({
    initialSize: window?.size || { width: 300, height: 200 },
    minSize: { width: 300, height: 200 },
    maxSize: { width: globalThis.window.innerWidth, height: globalThis.window.innerHeight - 48 },
    onResize: (newSize) => {
      // Update in real-time while resizing
      updateSize(id, newSize);
    },
    onResizeEnd: (newSize) => {
      updateSize(id, newSize);
    },
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

  const handleMaximize = () => {
    toggleMaximize(id);
  };

  const handleClose = () => {
    closeWindow(id);
  };

  const handleChromeMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    // Bring to front when starting to drag
    if (!isFocused) {
      bringToFront(id);
    }

    // Start dragging if enabled and not maximized
    if (draggable && !window.isMaximized) {
      handleMouseDown(e);
    }
  };

  // Use dragged position if dragging, otherwise use store position
  const displayPosition = draggable && isDragging ? position : window.position;

  // Use resized size if resizing, otherwise use store size
  const displaySize = resizable && isResizing ? size : window.size;

  return (
    <div
      className={`${styles.window} ${isFocused ? styles.focused : ''} ${
        window.isMinimized ? styles.minimized : ''
      } ${window.isMaximized ? styles.maximized : ''} ${isDragging ? styles.dragging : ''} ${
        isResizing ? styles.resizing : ''
      } ${className}`}
      style={{
        left: `${displayPosition.x}px`,
        top: `${displayPosition.y}px`,
        width: `${displaySize.width}px`,
        height: `${displaySize.height}px`,
        zIndex,
        willChange: isDragging || isResizing ? 'transform' : 'auto',
      }}
      onClick={handleClick}
    >
      <WindowChrome
        title={title}
        onMinimize={minimizable ? handleMinimize : undefined}
        onMaximize={resizable ? handleMaximize : undefined}
        onClose={closeable ? handleClose : undefined}
        draggable={draggable && !window.isMaximized}
        onMouseDown={handleChromeMouseDown}
      />
      <WindowContent>{children}</WindowContent>
      {resizable && !window.isMaximized && <ResizeHandles onResizeStart={handleResizeStart} />}
    </div>
  );
}
