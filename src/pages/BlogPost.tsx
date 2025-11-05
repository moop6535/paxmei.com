import { useParams, Link } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Desktop from '@components/Desktop';
import Window from '@components/Window';
import { useBlogPost } from '@hooks/useBlogPost';
import { useWindowStore } from '@stores/windowStore';
import styles from './BlogPost.module.css';

// Lazy load syntax highlighter to reduce initial bundle size
const CodeBlock = lazy(() => import('@components/CodeBlock/CodeBlock'));

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { meta, content, isLoading, error } = useBlogPost(slug || '');
  const openWindow = useWindowStore((state) => state.openWindow);

  // Initialize window when component mounts
  useEffect(() => {
    openWindow('blog-post', { x: 150, y: 100 }, { width: 700, height: 600 });
  }, [openWindow]);

  if (isLoading) {
    return (
      <Desktop>
        <Window id="blog-post" title="Loading..." draggable minimizable closeable>
          <div className={styles.loading}>Loading post...</div>
        </Window>
      </Desktop>
    );
  }

  if (error) {
    return (
      <Desktop>
        <Window id="blog-post" title="Error" draggable minimizable closeable>
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
      <Window
        id="blog-post"
        title={meta.title}
        draggable
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
