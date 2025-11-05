import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BlogPost from './BlogPost';

describe('BlogPost Page', () => {
  beforeEach(() => {
    // Mock canvas for Desktop component
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      scale: vi.fn(),
      fillStyle: '',
    })) as any;

    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1024,
      height: 768,
      top: 0,
      left: 0,
      bottom: 768,
      right: 1024,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    global.requestAnimationFrame = vi.fn(() => 1) as any;
    global.cancelAnimationFrame = vi.fn();
    global.fetch = vi.fn();
  });

  it('renders loading state initially', () => {
    (global.fetch as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <MemoryRouter initialEntries={['/blog/test-post']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Loading post...')).toBeInTheDocument();
  });

  it('renders blog post content successfully', async () => {
    const mockMarkdown = `---
title: Test Blog Post
date: 2025-01-15
excerpt: This is a test
---

# Introduction

This is the **content** of the test post.

## Code Example

\`\`\`typescript
const hello = 'world';
\`\`\`

A paragraph with a [link](https://example.com).
`;

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      text: async () => mockMarkdown,
    });

    render(
      <MemoryRouter initialEntries={['/blog/test-post']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const titles = screen.getAllByText('Test Blog Post');
      expect(titles.length).toBeGreaterThan(0);
    });

    expect(screen.getByText('2025-01-15')).toBeInTheDocument();
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText(/This is the/)).toBeInTheDocument();
    expect(screen.getByText('Code Example')).toBeInTheDocument();
  });

  it('renders error state when post not found', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(
      <MemoryRouter initialEntries={['/blog/non-existent']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Post Not Found')).toBeInTheDocument();
    });

    expect(screen.getByText('Blog post not found')).toBeInTheDocument();
    expect(screen.getByText('← Back to Home')).toBeInTheDocument();
  });

  it('renders back to home link', async () => {
    const mockMarkdown = `---
title: Test
date: 2025-01-01
excerpt: Test
---

Content`;

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      text: async () => mockMarkdown,
    });

    render(
      <MemoryRouter initialEntries={['/blog/test']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const titles = screen.getAllByText('Test');
      expect(titles.length).toBeGreaterThan(0);
    });

    const backLinks = screen.getAllByText('← Back to Home');
    expect(backLinks.length).toBeGreaterThan(0);
    expect(backLinks[0].closest('a')).toHaveAttribute('href', '/');
  });
});
