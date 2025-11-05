import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from '@pages/Landing';
import BlogPost from '@pages/BlogPost';
import NotFound from '@pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
