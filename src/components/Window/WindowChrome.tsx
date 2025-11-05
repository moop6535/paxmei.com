import styles from './WindowChrome.module.css';

interface WindowChromeProps {
  title: string;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  draggable?: boolean;
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void;
}

export default function WindowChrome({
  title,
  onMinimize,
  onMaximize,
  onClose,
  draggable = false,
  onMouseDown,
}: WindowChromeProps) {
  const handleButtonClick = (e: React.MouseEvent, callback?: () => void) => {
    e.stopPropagation(); // Prevent drag from starting when clicking buttons
    callback?.();
  };

  return (
    <div
      className={`${styles.chrome} ${draggable ? styles.draggable : ''}`}
      onMouseDown={onMouseDown}
      onTouchStart={onMouseDown}
    >
      <div className={styles.title}>{title}</div>
      <div className={styles.controls}>
        {onMinimize && (
          <button
            className={styles.button}
            onClick={(e) => handleButtonClick(e, onMinimize)}
            aria-label="Minimize"
            title="Minimize"
          >
            −
          </button>
        )}
        {onMaximize && (
          <button
            className={styles.button}
            onClick={(e) => handleButtonClick(e, onMaximize)}
            aria-label="Maximize"
            title="Maximize"
          >
            □
          </button>
        )}
        {onClose && (
          <button
            className={`${styles.button} ${styles.close}`}
            onClick={(e) => handleButtonClick(e, onClose)}
            aria-label="Close"
            title="Close"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
