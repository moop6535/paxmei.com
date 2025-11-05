import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Landing from '@pages/Landing';
import BlogPost from '@pages/BlogPost';
import NotFound from '@pages/NotFound';

describe('App Routing', () => {
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
  });

  it('renders Landing page on root route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    );
    // Check for Bio window which is on landing page
    expect(screen.getByText('Bio')).toBeInTheDocument();
  });

  it('renders BlogPost page on /blog/:slug route', () => {
    render(
      <MemoryRouter initialEntries={['/blog/test-post']}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Blog Post/i)).toBeInTheDocument();
    expect(screen.getByText(/Slug: test-post/i)).toBeInTheDocument();
  });

  it('renders NotFound page on invalid route', () => {
    render(
      <MemoryRouter initialEntries={['/invalid-route']}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/404/i)).toBeInTheDocument();
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
  });

  it('NotFound page has link back to home', () => {
    render(
      <MemoryRouter initialEntries={['/invalid-route']}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    );
    const homeLink = screen.getByRole('link', { name: /Back to Home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
