import { Link } from 'react-router-dom';
import { useWindowStore } from '@stores/windowStore';
import styles from './Taskbar.module.css';

export default function Taskbar() {
  const windows = useWindowStore((state) => state.windows);
  const windowStack = useWindowStore((state) => state.windowStack);
  const bringToFront = useWindowStore((state) => state.bringToFront);
  const toggleMinimize = useWindowStore((state) => state.toggleMinimize);
  const openWindow = useWindowStore((state) => state.openWindow);

  // Core windows that should always be in taskbar
  const coreWindows = ['bio', 'blog', 'portfolio'];

  const handleTaskbarClick = (id: string) => {
    const window = windows[id];

    if (!window.isVisible) {
      // Restore closed window
      openWindow(id, window.position, window.size);
    } else if (window.isMinimized) {
      // Restore minimized window
      toggleMinimize(id);
      bringToFront(id);
    } else {
      // Window is open - check if focused
      const isFocused = windowStack[windowStack.length - 1] === id;
      if (isFocused) {
        // If already focused, minimize it
        toggleMinimize(id);
      } else {
        // Bring to front
        bringToFront(id);
      }
    }
  };

  const getWindowState = (id: string) => {
    const window = windows[id];
    const isFocused = windowStack[windowStack.length - 1] === id;

    if (!window.isVisible) return 'closed';
    if (window.isMinimized) return 'minimized';
    if (isFocused) return 'active';
    return 'open';
  };

  // Get title from window id (capitalize first letter)
  const getTitle = (id: string) => {
    return id.charAt(0).toUpperCase() + id.slice(1).replace('-', ' ');
  };

  return (
    <div className={styles.taskbar}>
      <Link to="/" className={styles.logo} title="Go to home">
        <span className={styles.logoPax}>PAX</span>
        <span className={styles.logoSeparator}>/</span>
        <span className={styles.logoMei}>MEI</span>
      </Link>

      <div className={styles.tasks}>
        {Object.keys(windows)
          .filter((id) => {
            // Show core windows always (even when closed)
            // Show temporary windows only when visible
            return coreWindows.includes(id) || windows[id].isVisible;
          })
          .map((id) => {
            const state = getWindowState(id);
            return (
              <button
                key={id}
                className={`${styles.task} ${styles[state]}`}
                onClick={() => handleTaskbarClick(id)}
                title={`${getTitle(id)} - ${state}`}
              >
                <span className={styles.taskLabel}>{getTitle(id)}</span>
                <span className={styles.taskIndicator} />
              </button>
            );
          })}
      </div>
    </div>
  );
}
