import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <h3>Page Not Found</h3>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/">← Back to Home</Link>
    </div>
  );
}
