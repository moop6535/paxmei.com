import type { Project } from '@/types/content';
import styles from './Portfolio.module.css';

interface PortfolioProps {
  projects: Project[];
}

export default function Portfolio({ projects }: PortfolioProps) {
  return (
    <div className={styles.portfolio}>
      <h3 className={styles.heading}>Projects</h3>

      <div className={styles.projects}>
        {projects.map((project) => (
          <article key={project.id} className={styles.project}>
            <h4 className={styles.projectName}>{project.name}</h4>

            <p className={styles.projectDescription}>{project.description}</p>

            <div className={styles.technologies}>
              {project.technologies.map((tech) => (
                <span key={tech} className={styles.tech}>
                  {tech}
                </span>
              ))}
            </div>

            {project.links && (
              <div className={styles.links}>
                {project.links.github && (
                  <a
                    href={project.links.github}
                    className={styles.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub →
                  </a>
                )}
                {project.links.live && (
                  <>
                    {project.links.github && <span className={styles.separator}>|</span>}
                    <a
                      href={project.links.live}
                      className={styles.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Live →
                    </a>
                  </>
                )}
                {project.links.demo && (
                  <>
                    {(project.links.github || project.links.live) && (
                      <span className={styles.separator}>|</span>
                    )}
                    <a
                      href={project.links.demo}
                      className={styles.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Demo →
                    </a>
                  </>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
