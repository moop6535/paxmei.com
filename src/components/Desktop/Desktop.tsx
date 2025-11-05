import type { ReactNode } from 'react';
import { useParticles } from '@hooks/useParticles';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { prefersReducedMotion } from '@/utils/responsive';
import Taskbar from '@components/Taskbar';
import MobileView from '@components/MobileView';
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
  const { isMobile } = useMediaQuery();
  const shouldReduceMotion = prefersReducedMotion();

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
      <Taskbar />
    </div>
  );
}
