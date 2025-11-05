import styles from './MobileNav.module.css';

export type MobileTab = 'bio' | 'blog' | 'portfolio';

interface MobileNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

export default function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const tabs: { id: MobileTab; label: string }[] = [
    { id: 'bio', label: 'Bio' },
    { id: 'blog', label: 'Blog' },
    { id: 'portfolio', label: 'Portfolio' },
  ];

  return (
    <nav className={styles.nav} role="navigation" aria-label="Main navigation">
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
            aria-label={`Navigate to ${tab.label}`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span className={styles.label}>{tab.label}</span>
            {activeTab === tab.id && <span className={styles.indicator} aria-hidden="true" />}
          </button>
        ))}
      </div>
    </nav>
  );
}
