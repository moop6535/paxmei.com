import type { ReactNode } from 'react';
import styles from './MobileContent.module.css';

interface MobileContentProps {
  children: ReactNode;
  title?: string;
}

export default function MobileContent({ children, title }: MobileContentProps) {
  return (
    <div className={styles.content}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.inner}>{children}</div>
    </div>
  );
}
