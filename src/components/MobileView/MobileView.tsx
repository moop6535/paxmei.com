import { useState, type ReactNode } from 'react';
import MobileNav, { type MobileTab } from '@components/MobileNav';
import styles from './MobileView.module.css';

interface MobileViewProps {
  children: {
    bio: ReactNode;
    blog: ReactNode;
    portfolio: ReactNode;
  };
}

export default function MobileView({ children }: MobileViewProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>('bio');

  const handleTabChange = (tab: MobileTab) => {
    setActiveTab(tab);
  };

  return (
    <div className={styles.container}>
      <main className={styles.content} role="main">
        <div
          className={`${styles.section} ${activeTab === 'bio' ? styles.active : ''}`}
          aria-hidden={activeTab !== 'bio'}
        >
          {children.bio}
        </div>

        <div
          className={`${styles.section} ${activeTab === 'blog' ? styles.active : ''}`}
          aria-hidden={activeTab !== 'blog'}
        >
          {children.blog}
        </div>

        <div
          className={`${styles.section} ${activeTab === 'portfolio' ? styles.active : ''}`}
          aria-hidden={activeTab !== 'portfolio'}
        >
          {children.portfolio}
        </div>
      </main>

      <MobileNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
