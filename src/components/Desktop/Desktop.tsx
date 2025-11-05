import type { ReactNode } from 'react';
import { useParticles } from '@hooks/useParticles';
import styles from './Desktop.module.css';

interface DesktopProps {
  children: ReactNode;
}

export default function Desktop({ children }: DesktopProps) {
  const canvasRef = useParticles({
    particleCount: 75,
    particleSize: 3,
    particleSpeed: 0.5,
    particleColor: '#ffffff',
    particleOpacity: 0.2,
  });

  return (
    <div className={styles.desktop}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
