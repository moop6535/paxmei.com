import { useNavigate } from 'react-router-dom';
import styles from './MobileHeader.module.css';

interface MobileHeaderProps {
  title: string;
  showBackButton?: boolean;
}

export default function MobileHeader({ title, showBackButton = true }: MobileHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header className={styles.header}>
      {showBackButton && (
        <button
          className={styles.backButton}
          onClick={handleBack}
          aria-label="Go back"
          title="Go back"
        >
          ←
        </button>
      )}
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.spacer} />
    </header>
  );
}
