import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Portfolio from './Portfolio';
import type { Project } from '@/types/content';

describe('Portfolio Component', () => {
  const mockProjects: Project[] = [
    {
      id: 'project-1',
      name: 'Test Project One',
      description: 'A cool project that does things',
      technologies: ['React', 'TypeScript'],
      links: {
        github: 'https://github.com/user/project1',
        live: 'https://project1.com',
      },
    },
    {
      id: 'project-2',
      name: 'Test Project Two',
      description: 'Another amazing project',
      technologies: ['Python', 'FastAPI'],
    },
  ];

  it('renders projects correctly', () => {
    render(<Portfolio projects={mockProjects} />);

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Test Project One')).toBeInTheDocument();
    expect(screen.getByText('Test Project Two')).toBeInTheDocument();
    expect(screen.getByText('A cool project that does things')).toBeInTheDocument();
    expect(screen.getByText('Another amazing project')).toBeInTheDocument();
  });

  it('renders technologies correctly', () => {
    render(<Portfolio projects={mockProjects} />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('FastAPI')).toBeInTheDocument();
  });

  it('renders project links when available', () => {
    render(<Portfolio projects={mockProjects} />);

    const githubLink = screen.getByText('GitHub →');
    const liveLink = screen.getByText('Live →');

    expect(githubLink).toBeInTheDocument();
    expect(githubLink.closest('a')).toHaveAttribute('href', 'https://github.com/user/project1');

    expect(liveLink).toBeInTheDocument();
    expect(liveLink.closest('a')).toHaveAttribute('href', 'https://project1.com');
  });

  it('does not render links section when no links are provided', () => {
    render(<Portfolio projects={[mockProjects[1]]} />);

    expect(screen.queryByText('GitHub →')).not.toBeInTheDocument();
    expect(screen.queryByText('Live →')).not.toBeInTheDocument();
  });

  it('opens links in new tab', () => {
    render(<Portfolio projects={mockProjects} />);

    const links = screen.getAllByRole('link');

    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('renders separator between links', () => {
    render(<Portfolio projects={mockProjects} />);

    // Should have separator between GitHub and Live links
    const separators = screen.getAllByText('|');
    expect(separators.length).toBeGreaterThan(0);
  });

  it('renders empty list when no projects provided', () => {
    render(<Portfolio projects={[]} />);

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });
});
