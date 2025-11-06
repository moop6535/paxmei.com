import type { ReactNode } from 'react';
import { useEffect, useCallback } from 'react';
import { useParticles } from '@hooks/useParticles';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { prefersReducedMotion } from '@/utils/responsive';
import { useWindowStore } from '@stores/windowStore';
import Taskbar from '@components/Taskbar';
import MobileView from '@components/MobileView';
import MiniGame from '@components/MiniGame'; // [1] Comment this line to disable game
import styles from './Desktop.module.css';

interface DesktopProps {
  children?: ReactNode;
  mobileContent?: {
    bio: ReactNode;
    blog: ReactNode;
    portfolio: ReactNode;
  };
}

export default function Desktop({ children, mobileContent }: DesktopProps) {
  const { isMobile, isDesktop } = useMediaQuery();
  const shouldReduceMotion = prefersReducedMotion();
  const resetLayout = useWindowStore((state) => state.resetLayout);
  const setMinimized = useWindowStore((state) => state.setMinimized);
  const windows = useWindowStore((state) => state.windows);

  // Determine particle configuration based on device
  const particleConfig = isMobile
    ? {
        particleCount: shouldReduceMotion ? 0 : 25,
        particleSize: 2,
        particleSpeed: 0.3,
        particleColor: '#ffffff',
        particleOpacity: 0.15,
      }
    : {
        particleCount: shouldReduceMotion ? 0 : 75,
        particleSize: 3,
        particleSpeed: 0.5,
        particleColor: '#ffffff',
        particleOpacity: 0.2,
      };

  const canvasRef = useParticles(particleConfig);

  // Handle game exit by restoring a window (exits idle state)
  const handleGameExit = useCallback(() => {
    // Restore the bio window (or any window) to exit idle state
    const bioWindow = windows.bio;
    if (bioWindow && bioWindow.isMinimized) {
      setMinimized('bio', false);
    }
  }, [windows, setMinimized]);

  // Handle responsive window layout on desktop
  useEffect(() => {
    if (!isDesktop) return;

    // Reset layout on initial mount
    resetLayout();

    // Throttle resize events
    let resizeTimeout: number;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        resetLayout();
      }, 250);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [isDesktop, resetLayout]);

  // Render mobile view on mobile devices
  if (isMobile && mobileContent) {
    return (
      <div className={styles.desktop}>
        <canvas ref={canvasRef} className={styles.canvas} />
        <MobileView>{mobileContent}</MobileView>
      </div>
    );
  }

  // Render desktop view on larger devices
  return (
    <div className={styles.desktop}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.content}>{children}</div>
      <MiniGame onExit={handleGameExit} /> {/* [2] Comment this line to disable game */}
      <Taskbar />
    </div>
  );
}
