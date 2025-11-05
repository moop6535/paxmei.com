import { useState, useEffect, useCallback, useRef } from 'react';

interface Size {
  width: number;
  height: number;
}

interface UseResizableOptions {
  initialSize: Size;
  minSize?: Size;
  maxSize?: Size;
  onResize?: (size: Size) => void;
  onResizeEnd?: (size: Size) => void;
}

interface UseResizableReturn {
  size: Size;
  isResizing: boolean;
  handleResizeStart: (e: React.MouseEvent | React.TouchEvent, direction: ResizeDirection) => void;
}

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export const useResizable = ({
  initialSize,
  minSize = { width: 300, height: 200 },
  maxSize = { width: window.innerWidth, height: window.innerHeight },
  onResize,
  onResizeEnd,
}: UseResizableOptions): UseResizableReturn => {
  const [size, setSize] = useState<Size>(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const elementStartSize = useRef<Size>(initialSize);
  const resizeDirection = useRef<ResizeDirection>('se');

  const constrainSize = useCallback(
    (newSize: Size): Size => {
      return {
        width: Math.max(minSize.width, Math.min(maxSize.width, newSize.width)),
        height: Math.max(minSize.height, Math.min(maxSize.height, newSize.height)),
      };
    },
    [minSize, maxSize]
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, direction: ResizeDirection) => {
      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      resizeStartPos.current = { x: clientX, y: clientY };
      elementStartSize.current = size;
      resizeDirection.current = direction;

      document.body.classList.add('cursor-resizing');
    },
    [size]
  );

  const handleResizeMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isResizing) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - resizeStartPos.current.x;
      const deltaY = clientY - resizeStartPos.current.y;

      const direction = resizeDirection.current;
      let newWidth = elementStartSize.current.width;
      let newHeight = elementStartSize.current.height;

      // Calculate new size based on direction
      if (direction.includes('e')) {
        newWidth = elementStartSize.current.width + deltaX;
      }
      if (direction.includes('w')) {
        newWidth = elementStartSize.current.width - deltaX;
      }
      if (direction.includes('s')) {
        newHeight = elementStartSize.current.height + deltaY;
      }
      if (direction.includes('n')) {
        newHeight = elementStartSize.current.height - deltaY;
      }

      const constrainedSize = constrainSize({ width: newWidth, height: newHeight });
      setSize(constrainedSize);
      onResize?.(constrainedSize);
    },
    [isResizing, constrainSize, onResize]
  );

  const handleResizeEnd = useCallback(() => {
    if (!isResizing) return;

    setIsResizing(false);
    document.body.classList.remove('cursor-resizing');
    onResizeEnd?.(size);
  }, [isResizing, size, onResizeEnd]);

  // Add/remove event listeners
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      window.addEventListener('touchmove', handleResizeMove);
      window.addEventListener('touchend', handleResizeEnd);

      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
        window.removeEventListener('touchmove', handleResizeMove);
        window.removeEventListener('touchend', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Update size when initialSize changes
  useEffect(() => {
    setSize(initialSize);
  }, [initialSize.width, initialSize.height]);

  return {
    size,
    isResizing,
    handleResizeStart,
  };
};
