import { useState, useEffect, useCallback, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDraggableOptions {
  initialPosition: Position;
  onDrag?: (position: Position) => void;
  onDragEnd?: (position: Position) => void;
  constrainToViewport?: boolean;
  windowSize?: { width: number; height: number };
}

interface UseDraggableReturn {
  position: Position;
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent | React.TouchEvent) => void;
}

export const useDraggable = ({
  initialPosition,
  onDrag,
  onDragEnd,
  constrainToViewport = true,
  windowSize = { width: 300, height: 200 },
}: UseDraggableOptions): UseDraggableReturn => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<Position>({ x: 0, y: 0 });
  const elementStartPos = useRef<Position>(initialPosition);

  // Constrain position to viewport
  const constrainPosition = useCallback(
    (pos: Position): Position => {
      if (!constrainToViewport) return pos;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const titleBarHeight = 40; // WindowChrome height

      // Ensure at least 40px of title bar is visible
      const minX = -(windowSize.width - titleBarHeight);
      const maxX = viewportWidth - titleBarHeight;
      const minY = 0;
      const maxY = viewportHeight - titleBarHeight;

      return {
        x: Math.max(minX, Math.min(maxX, pos.x)),
        y: Math.max(minY, Math.min(maxY, pos.y)),
      };
    },
    [constrainToViewport, windowSize]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Prevent text selection while dragging
    e.preventDefault();

    setIsDragging(true);

    // Handle both mouse and touch events
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStartPos.current = { x: clientX, y: clientY };
    elementStartPos.current = position;

    // Add grabbing cursor to body
    document.body.classList.add('cursor-grabbing');
  }, [position]);

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;

      // Handle both mouse and touch events
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - dragStartPos.current.x;
      const deltaY = clientY - dragStartPos.current.y;

      const newPosition = constrainPosition({
        x: elementStartPos.current.x + deltaX,
        y: elementStartPos.current.y + deltaY,
      });

      setPosition(newPosition);
      onDrag?.(newPosition);
    },
    [isDragging, constrainPosition, onDrag]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    document.body.classList.remove('cursor-grabbing');
    onDragEnd?.(position);
  }, [isDragging, position, onDragEnd]);

  // Add/remove event listeners
  useEffect(() => {
    if (isDragging) {
      // Mouse events
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      // Touch events
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleMouseMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Update position when initialPosition changes
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition.x, initialPosition.y]);

  // Handle window resize - reapply constraints
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => constrainPosition(prev));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [constrainPosition]);

  return {
    position,
    isDragging,
    handleMouseDown,
  };
};
