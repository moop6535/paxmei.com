import { useParams } from 'react-router-dom';
import Desktop from '@components/Desktop';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <Desktop>
      <div style={{ padding: '2rem' }}>
        <h1>Blog Post</h1>
        <p>Slug: {slug}</p>
      </div>
    </Desktop>
  );
}
