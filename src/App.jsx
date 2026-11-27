import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Topics from './pages/Topics';
import TopicPage from './pages/TopicPage';
import Essentials from './pages/Essentials';
import EssentialPage from './pages/EssentialPage';
import Saved from './pages/Saved';
import Review from './pages/Review';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="topics" element={<Topics />} />
        <Route path="topics/:slug" element={<TopicPage />} />
        <Route path="essentials" element={<Essentials />} />
        <Route path="essentials/:slug" element={<EssentialPage />} />
        <Route path="saved" element={<Saved />} />
        <Route path="review" element={<Review />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
