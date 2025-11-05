import Desktop from '@components/Desktop';
import Window from '@components/Window';

export default function Landing() {
  return (
    <Desktop>
      {/* Bio Window */}
      <Window id="bio" title="Bio" draggable minimizable closeable>
        <h2>Pax Mei</h2>
        <h4>Developer & Writer</h4>
        <p style={{ color: 'var(--color-accent)', marginTop: '1rem' }}>
          Building sleek experiences and sharing insights.
        </p>
        <p style={{ marginTop: '1rem', lineHeight: '1.75' }}>
          I'm a developer passionate about crafting unique web experiences. I love exploring the
          intersection of design, performance, and usability. When I'm not coding, I write about
          tech, design, and the creative process.
        </p>
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
          <h6 style={{ fontSize: 'var(--font-size-small)', marginBottom: '0.5rem' }}>Connect</h6>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="https://github.com/paxmei">GitHub →</a>
            <a href="https://twitter.com/paxmei">Twitter →</a>
            <a href="https://linkedin.com/in/paxmei">LinkedIn →</a>
            <a href="mailto:hello@paxmei.com">Email →</a>
          </div>
        </div>
      </Window>

      {/* Blog Window */}
      <Window id="blog" title="Blog" draggable minimizable closeable>
        <h3>Recent Posts</h3>
        <div style={{ marginTop: '1.5rem' }}>
          <article style={{ marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Welcome to paxmei.com</h4>
            <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-family-mono)' }}>
              2025-11-05
            </p>
            <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>
              Introducing my new personal site with a unique OS-brutalist design...
            </p>
          </article>

          <article style={{ marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Building with React 19</h4>
            <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-family-mono)' }}>
              2025-10-28
            </p>
            <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>
              Exploring the latest features in React 19 and what they mean for performance...
            </p>
          </article>

          <article>
            <h4 style={{ marginBottom: '0.5rem' }}>The Beauty of Brutalism</h4>
            <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-family-mono)' }}>
              2025-10-15
            </p>
            <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>
              Why brutalist design is making a comeback in modern web development...
            </p>
          </article>
        </div>
      </Window>

      {/* Portfolio Window */}
      <Window id="portfolio" title="Portfolio" draggable minimizable closeable>
        <h3>Projects</h3>
        <div style={{ marginTop: '1.5rem' }}>
          <article style={{ marginBottom: '2rem' }}>
            <h4>paxmei.com</h4>
            <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>
              Personal site with OS-brutalist design and draggable windows.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--font-size-tiny)', padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)' }}>React</span>
              <span style={{ fontSize: 'var(--font-size-tiny)', padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)' }}>TypeScript</span>
              <span style={{ fontSize: 'var(--font-size-tiny)', padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)' }}>Vite</span>
              <span style={{ fontSize: 'var(--font-size-tiny)', padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)' }}>Zustand</span>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <a href="https://github.com/paxmei/paxmei.com">GitHub →</a>
              {' | '}
              <a href="https://paxmei.com">Live →</a>
            </div>
          </article>

          <article style={{ marginBottom: '2rem' }}>
            <h4>Project Two</h4>
            <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>
              An interesting project that does something cool and impressive.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--font-size-tiny)', padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)' }}>Next.js</span>
              <span style={{ fontSize: 'var(--font-size-tiny)', padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)' }}>PostgreSQL</span>
            </div>
          </article>

          <article>
            <h4>Project Three</h4>
            <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>
              Another project showcasing different skills and technologies.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--font-size-tiny)', padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)' }}>Python</span>
              <span style={{ fontSize: 'var(--font-size-tiny)', padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)' }}>FastAPI</span>
            </div>
          </article>
        </div>
      </Window>
    </Desktop>
  );
}
