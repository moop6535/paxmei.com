import { useState, useEffect } from 'react';
import matter from 'gray-matter';

interface BlogPostMeta {
  title: string;
  date: string;
  excerpt: string;
}

interface BlogPostData {
  meta: BlogPostMeta;
  content: string;
  isLoading: boolean;
  error: string | null;
}

export const useBlogPost = (slug: string): BlogPostData => {
  const [data, setData] = useState<BlogPostData>({
    meta: { title: '', date: '', excerpt: '' },
    content: '',
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchPost = async () => {
      try {
        const response = await fetch(`/blog/${slug}.md`);

        if (!response.ok) {
          throw new Error('Blog post not found');
        }

        const markdown = await response.text();
        const { data: frontmatter, content } = matter(markdown);

        if (isMounted) {
          setData({
            meta: {
              title: frontmatter.title || '',
              date: typeof frontmatter.date === 'string'
                ? frontmatter.date
                : frontmatter.date?.toISOString().split('T')[0] || '',
              excerpt: frontmatter.excerpt || '',
            },
            content,
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        if (isMounted) {
          setData({
            meta: { title: '', date: '', excerpt: '' },
            content: '',
            isLoading: false,
            error: err instanceof Error ? err.message : 'Failed to load post',
          });
        }
      }
    };

    fetchPost();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return data;
};
