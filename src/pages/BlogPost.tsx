import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Desktop from '@components/Desktop';
import Window from '@components/Window';
import Bio from '@components/Bio';
import BlogList from '@components/BlogList';
import Portfolio from '@components/Portfolio';
import MobileHeader from '@components/MobileHeader';
import MobileNav from '@components/MobileNav';
import { useBlogPost } from '@hooks/useBlogPost';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { useWindowStore } from '@stores/windowStore';
import { bio } from '@/data/bio';
import { blogPosts } from '@/data/blog';
import { projects } from '@/data/portfolio';
import styles from './BlogPost.module.css';

// Lazy load syntax highlighter to reduce initial bundle size
const CodeBlock = lazy(() => import('@components/CodeBlock/CodeBlock'));

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { meta, content, isLoading, error } = useBlogPost(slug || '');
  const { isMobile } = useMediaQuery();
  const openWindow = useWindowStore((state) => state.openWindow);
  const setMaximized = useWindowStore((state) => state.setMaximized);
  const setMinimized = useWindowStore((state) => state.setMinimized);

  // Initialize blog-post window maximized and minimize other windows when slug changes
  // Only do this on desktop
  useEffect(() => {
    if (!isMobile) {
      openWindow('blog-post', { x: 150, y: 100 }, { width: 700, height: 600 });

      // Minimize core windows
      ['bio', 'blog', 'portfolio'].forEach((id) => {
        setMinimized(id, true);
      });

      // Force maximize blog-post window (overrides any previous user state)
      setTimeout(() => {
        setMaximized('blog-post', true);
      }, 0);
    }
  }, [slug, isMobile, openWindow, setMaximized, setMinimized]);

  // Mobile layout
  if (isMobile) {
    const handleTabChange = (_tab: 'bio' | 'blog' | 'portfolio') => {
      navigate('/');
    };

    if (isLoading) {
      return (
        <>
          <MobileHeader title="Loading..." />
          <div className={styles.loading}>Loading post...</div>
          <MobileNav activeTab="blog" onTabChange={handleTabChange} />
        </>
      );
    }

    if (error) {
      return (
        <>
          <MobileHeader title="Error" />
          <div className={styles.error}>
            <h2>Post Not Found</h2>
            <p>{error}</p>
            <Link to="/" className={styles.backLink}>
              ← Back to Home
            </Link>
          </div>
          <MobileNav activeTab="blog" onTabChange={handleTabChange} />
        </>
      );
    }

    return (
      <>
        <MobileHeader title={meta.title} />
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
        <MobileNav activeTab="blog" onTabChange={handleTabChange} />
      </>
    );
  }

  // Desktop layout
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
