import { useParams } from 'react-router-dom';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div>
      <h1>Blog Post</h1>
      <p>Slug: {slug}</p>
    </div>
  );
}
