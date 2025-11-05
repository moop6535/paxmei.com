import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BlogList from './BlogList';
import type { BlogPost } from '@/types/content';

describe('BlogList Component', () => {
  const mockPosts: BlogPost[] = [
    {
      id: 'post-1',
      title: 'First Post',
      date: '2025-01-15',
      excerpt: 'This is the first post excerpt...',
      slug: 'first-post',
    },
    {
      id: 'post-2',
      title: 'Second Post',
      date: '2025-01-10',
      excerpt: 'This is the second post excerpt...',
      slug: 'second-post',
    },
  ];

  it('renders blog posts correctly', () => {
    render(
      <BrowserRouter>
        <BlogList posts={mockPosts} />
      </BrowserRouter>
    );

    expect(screen.getByText('Recent Posts')).toBeInTheDocument();
    expect(screen.getByText('First Post')).toBeInTheDocument();
    expect(screen.getByText('Second Post')).toBeInTheDocument();
    expect(screen.getByText('2025-01-15')).toBeInTheDocument();
    expect(screen.getByText('2025-01-10')).toBeInTheDocument();
    expect(screen.getByText('This is the first post excerpt...')).toBeInTheDocument();
    expect(screen.getByText('This is the second post excerpt...')).toBeInTheDocument();
  });

  it('renders correct links to blog posts', () => {
    render(
      <BrowserRouter>
        <BlogList posts={mockPosts} />
      </BrowserRouter>
    );

    const firstPostLink = screen.getByText('First Post').closest('a');
    const secondPostLink = screen.getByText('Second Post').closest('a');

    expect(firstPostLink).toHaveAttribute('href', '/blog/first-post');
    expect(secondPostLink).toHaveAttribute('href', '/blog/second-post');
  });

  it('renders empty list when no posts provided', () => {
    render(
      <BrowserRouter>
        <BlogList posts={[]} />
      </BrowserRouter>
    );

    expect(screen.getByText('Recent Posts')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('renders all posts in the correct order', () => {
    render(
      <BrowserRouter>
        <BlogList posts={mockPosts} />
      </BrowserRouter>
    );

    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(2);
  });
});
