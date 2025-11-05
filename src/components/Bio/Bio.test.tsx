import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Bio from './Bio';
import type { Bio as BioType } from '@/types/content';

describe('Bio Component', () => {
  const mockBio: BioType = {
    name: 'Test User',
    title: 'Test Developer',
    tagline: 'Building awesome things',
    description: 'I love to code and create amazing experiences.',
    socialLinks: [
      {
        platform: 'GitHub',
        url: 'https://github.com/testuser',
        label: 'GitHub →',
      },
      {
        platform: 'Twitter',
        url: 'https://twitter.com/testuser',
        label: 'Twitter →',
      },
    ],
  };

  it('renders bio information correctly', () => {
    render(<Bio data={mockBio} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Test Developer')).toBeInTheDocument();
    expect(screen.getByText('Building awesome things')).toBeInTheDocument();
    expect(
      screen.getByText('I love to code and create amazing experiences.')
    ).toBeInTheDocument();
  });

  it('renders social links correctly', () => {
    render(<Bio data={mockBio} />);

    const githubLink = screen.getByText('GitHub →');
    const twitterLink = screen.getByText('Twitter →');

    expect(githubLink).toBeInTheDocument();
    expect(githubLink.closest('a')).toHaveAttribute(
      'href',
      'https://github.com/testuser'
    );

    expect(twitterLink).toBeInTheDocument();
    expect(twitterLink.closest('a')).toHaveAttribute(
      'href',
      'https://twitter.com/testuser'
    );
  });

  it('opens social links in new tab', () => {
    render(<Bio data={mockBio} />);

    const links = screen.getAllByRole('link');

    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('renders Connect heading', () => {
    render(<Bio data={mockBio} />);

    expect(screen.getByText('Connect')).toBeInTheDocument();
  });
});
