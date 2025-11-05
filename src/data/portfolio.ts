import type { Project } from '@/types/content';

export const projects: Project[] = [
  {
    id: 'paxmei-com',
    name: 'paxmei.com',
    description: 'Personal site with OS-brutalist design and draggable windows.',
    technologies: ['React', 'TypeScript', 'Vite', 'Zustand'],
    links: {
      github: 'https://github.com/paxmei/paxmei.com',
      live: 'https://paxmei.com',
    },
  },
  {
    id: 'project-two',
    name: 'Project Two',
    description: 'An interesting project that does something cool and impressive.',
    technologies: ['Next.js', 'PostgreSQL'],
  },
  {
    id: 'project-three',
    name: 'Project Three',
    description: 'Another project showcasing different skills and technologies.',
    technologies: ['Python', 'FastAPI'],
  },
];
