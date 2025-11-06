import { useEffect } from 'react';
import Desktop from '@components/Desktop';
import Window from '@components/Window';
import MobileContent from '@components/MobileContent';
import Bio from '@components/Bio';
import BlogList from '@components/BlogList';
import Portfolio from '@components/Portfolio';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { useWindowStore } from '@stores/windowStore';
import { bio } from '@/data/bio';
import { blogPosts } from '@/data/blog';
import { projects } from '@/data/portfolio';

export default function Landing() {
  const { isMobile } = useMediaQuery();
  const setMinimized = useWindowStore((state) => state.setMinimized);
  const closeWindow = useWindowStore((state) => state.closeWindow);

  // Restore core windows when navigating back home (desktop only)
  useEffect(() => {
    if (!isMobile) {
      // Restore core windows to visible state
      ['bio', 'blog', 'portfolio'].forEach((id) => {
        setMinimized(id, false);
      });

      // Close the blog-post window if it exists
      closeWindow('blog-post');
    }
  }, [isMobile, setMinimized, closeWindow]);
  // Mobile content (full-screen without windows)
  const mobileContent = {
    bio: (
      <MobileContent>
        <Bio data={bio} />
      </MobileContent>
    ),
    blog: (
      <MobileContent>
        <BlogList posts={blogPosts} />
      </MobileContent>
    ),
    portfolio: (
      <MobileContent>
        <Portfolio projects={projects} />
      </MobileContent>
    ),
  };

  return (
    <Desktop mobileContent={mobileContent}>
      {/* Desktop Windows */}
      <Window id="bio" title="Bio" draggable resizable minimizable closeable>
        <Bio data={bio} />
      </Window>

      <Window id="blog" title="Blog" draggable resizable minimizable closeable>
        <BlogList posts={blogPosts} />
      </Window>

      <Window id="portfolio" title="Portfolio" draggable resizable minimizable closeable>
        <Portfolio projects={projects} />
      </Window>
    </Desktop>
  );
}
