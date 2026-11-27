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
import Placement from './pages/Placement';
import Pronunciation from './pages/Pronunciation';
import SoundGroupPage from './pages/SoundGroupPage';
import ProgressPage from './pages/ProgressPage';
import DailySession from './pages/DailySession';
import Games from './pages/Games';
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
        <Route path="placement" element={<Placement />} />
        <Route path="pronunciation" element={<Pronunciation />} />
        <Route path="pronunciation/:id" element={<SoundGroupPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="today" element={<DailySession />} />
        <Route path="games" element={<Games />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
