import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBlogPost } from './useBlogPost';

describe('useBlogPost', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('should load blog post successfully', async () => {
    const mockMarkdown = `---
title: Test Post
date: 2025-01-01
excerpt: Test excerpt
---

# Test Content

This is a test post.`;

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      text: async () => mockMarkdown,
    });

    const { result } = renderHook(() => useBlogPost('test-post'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.meta.title).toBe('Test Post');
    expect(result.current.meta.date).toBe('2025-01-01');
    expect(result.current.meta.excerpt).toBe('Test excerpt');
    expect(result.current.content).toContain('# Test Content');
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useBlogPost('non-existent'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Blog post not found');
    expect(result.current.content).toBe('');
  });

  it('should handle network error', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useBlogPost('test-post'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
  });

  it('should cleanup on unmount', async () => {
    const mockMarkdown = `---
title: Test
date: 2025-01-01
excerpt: Test
---

Content`;

    (global.fetch as any).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              text: async () => mockMarkdown,
            });
          }, 100);
        })
    );

    const { unmount } = renderHook(() => useBlogPost('test-post'));

    unmount();

    // Should not throw or update state after unmount
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
});
