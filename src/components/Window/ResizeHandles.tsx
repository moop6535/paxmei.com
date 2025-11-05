import type { ResizeDirection } from '@hooks/useResizable';
import styles from './ResizeHandles.module.css';

interface ResizeHandlesProps {
  onResizeStart: (e: React.MouseEvent | React.TouchEvent, direction: ResizeDirection) => void;
}

export default function ResizeHandles({ onResizeStart }: ResizeHandlesProps) {
  const directions: ResizeDirection[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

  return (
    <>
      {directions.map((direction) => (
        <div
          key={direction}
          className={`${styles.handle} ${styles[direction]}`}
          onMouseDown={(e) => onResizeStart(e, direction)}
          onTouchStart={(e) => onResizeStart(e, direction)}
        />
      ))}
    </>
  );
}
