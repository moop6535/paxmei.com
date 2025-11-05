import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Buffer } from 'buffer';
import '@styles/global.css';
import App from './App.tsx';

// Polyfill Buffer for gray-matter (markdown frontmatter parser)
window.Buffer = Buffer;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
