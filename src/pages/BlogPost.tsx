import { useParams, Link } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Desktop from '@components/Desktop';
import Window from '@components/Window';
import Bio from '@components/Bio';
import BlogList from '@components/BlogList';
import Portfolio from '@components/Portfolio';
import { useBlogPost } from '@hooks/useBlogPost';
import { useWindowStore } from '@stores/windowStore';
import { bio } from '@/data/bio';
import { blogPosts } from '@/data/blog';
import { projects } from '@/data/portfolio';
import styles from './BlogPost.module.css';

// Lazy load syntax highlighter to reduce initial bundle size
const CodeBlock = lazy(() => import('@components/CodeBlock/CodeBlock'));

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { meta, content, isLoading, error } = useBlogPost(slug || '');
  const openWindow = useWindowStore((state) => state.openWindow);
  const toggleMaximize = useWindowStore((state) => state.toggleMaximize);

  // Initialize blog-post window maximized when component mounts
  useEffect(() => {
    openWindow('blog-post', { x: 150, y: 100 }, { width: 700, height: 600 });
    // Maximize after a brief delay to ensure window is created
    setTimeout(() => {
      toggleMaximize('blog-post');
    }, 0);
  }, [openWindow, toggleMaximize]);

  if (isLoading) {
    return (
      <Desktop>
        {/* Core Windows */}
        <Window id="bio" title="Bio" draggable resizable minimizable closeable>
          <Bio data={bio} />
        </Window>
        <Window id="blog" title="Blog" draggable resizable minimizable closeable>
          <BlogList posts={blogPosts} />
        </Window>
        <Window id="portfolio" title="Portfolio" draggable resizable minimizable closeable>
          <Portfolio projects={projects} />
        </Window>

        {/* Blog Post Window */}
        <Window id="blog-post" title="Loading..." draggable resizable minimizable closeable>
          <div className={styles.loading}>Loading post...</div>
        </Window>
      </Desktop>
    );
  }

  if (error) {
    return (
      <Desktop>
        {/* Core Windows */}
        <Window id="bio" title="Bio" draggable resizable minimizable closeable>
          <Bio data={bio} />
        </Window>
        <Window id="blog" title="Blog" draggable resizable minimizable closeable>
          <BlogList posts={blogPosts} />
        </Window>
        <Window id="portfolio" title="Portfolio" draggable resizable minimizable closeable>
          <Portfolio projects={projects} />
        </Window>

        {/* Blog Post Window */}
        <Window id="blog-post" title="Error" draggable resizable minimizable closeable>
          <div className={styles.error}>
            <h2>Post Not Found</h2>
            <p>{error}</p>
            <Link to="/" className={styles.backLink}>
              ← Back to Home
            </Link>
          </div>
        </Window>
      </Desktop>
    );
  }

  return (
    <Desktop>
      {/* Core Windows */}
      <Window id="bio" title="Bio" draggable resizable minimizable closeable>
        <Bio data={bio} />
      </Window>
      <Window id="blog" title="Blog" draggable resizable minimizable closeable>
        <BlogList posts={blogPosts} />
      </Window>
      <Window id="portfolio" title="Portfolio" draggable resizable minimizable closeable>
        <Portfolio projects={projects} />
      </Window>

      {/* Blog Post Window */}
      <Window
        id="blog-post"
        title={meta.title}
        draggable
        resizable
        minimizable
        closeable
      >
        <article className={styles.article}>
          <header className={styles.header}>
            <h1 className={styles.title}>{meta.title}</h1>
            <time className={styles.date} dateTime={meta.date}>
              {meta.date}
            </time>
          </header>

          <div className={styles.content}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }: any) {
                  return (
                    <Suspense fallback={<code className={className}>{children}</code>}>
                      <CodeBlock inline={inline} className={className} {...props}>
                        {String(children)}
                      </CodeBlock>
                    </Suspense>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

          <footer className={styles.footer}>
            <Link to="/" className={styles.backLink}>
              ← Back to Home
            </Link>
          </footer>
        </article>
      </Window>
    </Desktop>
  );
}
