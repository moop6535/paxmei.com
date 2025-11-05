import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import Desktop from '@components/Desktop';
import Window from '@components/Window';
import { useBlogPost } from '@hooks/useBlogPost';
import { useWindowStore } from '@stores/windowStore';
import styles from './BlogPost.module.css';

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
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
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
