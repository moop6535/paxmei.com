import type { Project } from '@/types/content';
import { CodeIcon } from '@components/Icons/Icons';
import styles from './Portfolio.module.css';

interface PortfolioProps {
  projects: Project[];
}

export default function Portfolio({ projects }: PortfolioProps) {
  return (
    <div className={styles.portfolio}>
      <h3 className={styles.heading}>Projects</h3>

      <div className={styles.projects}>
        {projects.map((project) => {
          const primaryLink = project.links?.live || project.links?.demo;

          return (
            <article key={project.id} className={styles.project}>
              {primaryLink ? (
                <a
                  href={primaryLink}
                  className={styles.projectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <h4 className={styles.projectName}>{project.name}</h4>

                  <p className={styles.projectDescription}>{project.description}</p>

                  <div className={styles.technologies}>
                    {project.technologies.map((tech) => (
                      <span key={tech} className={styles.tech}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </a>
              ) : (
                <>
                  <h4 className={styles.projectName}>{project.name}</h4>

                  <p className={styles.projectDescription}>{project.description}</p>

                  <div className={styles.technologies}>
                    {project.technologies.map((tech) => (
                      <span key={tech} className={styles.tech}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {project.links?.github && (
                <div className={styles.links}>
                  <a
                    href={project.links.github}
                    className={styles.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CodeIcon />
                    <span>Code</span>
                  </a>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
