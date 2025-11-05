import styles from './WindowChrome.module.css';

interface WindowChromeProps {
  title: string;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  draggable?: boolean;
}

export default function WindowChrome({
  title,
  onMinimize,
  onMaximize,
  onClose,
  draggable = false,
}: WindowChromeProps) {
  return (
    <div className={`${styles.chrome} ${draggable ? styles.draggable : ''}`}>
      <div className={styles.title}>{title}</div>
      <div className={styles.controls}>
        {onMinimize && (
          <button
            className={styles.button}
            onClick={onMinimize}
            aria-label="Minimize"
            title="Minimize"
          >
            −
          </button>
        )}
        {onMaximize && (
          <button
            className={styles.button}
            onClick={onMaximize}
            aria-label="Maximize"
            title="Maximize"
          >
            □
          </button>
        )}
        {onClose && (
          <button
            className={`${styles.button} ${styles.close}`}
            onClick={onClose}
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
