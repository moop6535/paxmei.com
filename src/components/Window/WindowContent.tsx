import type { ReactNode } from 'react';
import styles from './WindowContent.module.css';

interface WindowContentProps {
  children: ReactNode;
}

export default function WindowContent({ children }: WindowContentProps) {
  return <div className={styles.content}>{children}</div>;
}
