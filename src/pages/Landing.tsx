import Desktop from '@components/Desktop';
import Window from '@components/Window';
import Bio from '@components/Bio';
import BlogList from '@components/BlogList';
import Portfolio from '@components/Portfolio';
import { bio } from '@/data/bio';
import { blogPosts } from '@/data/blog';
import { projects } from '@/data/portfolio';

export default function Landing() {
  return (
    <Desktop>
      {/* Bio Window */}
      <Window id="bio" title="Bio" draggable minimizable closeable>
        <Bio data={bio} />
      </Window>

      {/* Blog Window */}
      <Window id="blog" title="Blog" draggable minimizable closeable>
        <BlogList posts={blogPosts} />
      </Window>

      {/* Portfolio Window */}
      <Window id="portfolio" title="Portfolio" draggable minimizable closeable>
        <Portfolio projects={projects} />
      </Window>
    </Desktop>
  );
}
