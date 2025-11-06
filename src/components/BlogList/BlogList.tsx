import { Link } from 'react-router-dom';
import type { BlogPost } from '@/types/content';
import styles from './BlogList.module.css';

interface BlogListProps {
  posts: BlogPost[];
}

export default function BlogList({ posts }: BlogListProps) {
  return (
    <div className={styles.blogList}>
      <h3 className={styles.heading}>Recent Posts</h3>

      <div className={styles.posts}>
        {posts.map((post, index) => (
          <article
            key={post.id}
            className={`${styles.post} ${index !== posts.length - 1 ? styles.withBorder : ''}`}
          >
            <Link to={`/blog/${post.slug}`} className={styles.postLink}>
              <h4 className={styles.postTitle}>{post.title}</h4>
              <p className={styles.postDate}>{post.date}</p>
              <p className={styles.postExcerpt}>{post.excerpt}</p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
