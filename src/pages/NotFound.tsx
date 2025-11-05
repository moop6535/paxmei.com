import { Link } from 'react-router-dom';
import Desktop from '@components/Desktop';

export default function NotFound() {
  return (
    <Desktop>
      <div style={{ padding: '2rem' }}>
        <h1>404</h1>
        <h3>Page Not Found</h3>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/">← Back to Home</Link>
      </div>
    </Desktop>
  );
}
