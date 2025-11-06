import type { Bio as BioType } from '@/types/content';
import { GitHubIcon, TwitterIcon, LinkedInIcon, EmailIcon } from '@components/Icons/Icons';
import styles from './Bio.module.css';

interface BioProps {
  data: BioType;
}

const iconMap: Record<string, React.ComponentType> = {
  GitHub: GitHubIcon,
  Twitter: TwitterIcon,
  LinkedIn: LinkedInIcon,
  Email: EmailIcon,
};

export default function Bio({ data }: BioProps) {
  return (
    <div className={styles.bio}>
      <h2 className={styles.name}>{data.name}</h2>
      <h4 className={styles.title}>{data.title}</h4>

      <p className={styles.tagline}>{data.tagline}</p>

      <p className={styles.description}>{data.description}</p>

      <div className={styles.socialSection}>
        <h6 className={styles.socialHeading}>Connect</h6>
        <div className={styles.socialLinks}>
          {data.socialLinks.map((link) => {
            const Icon = iconMap[link.platform];
            return (
              <a
                key={link.platform}
                href={link.url}
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                title={link.platform}
              >
                {Icon && <Icon />}
                <span className={styles.socialLabel}>{link.platform}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
