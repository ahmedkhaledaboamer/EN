import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingState from './components/ui/LoadingState';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Home loads with the app; every other page is its own chunk, loaded when opened.
const loaders = {
  Topics: () => import('./pages/Topics'),
  TopicPage: () => import('./pages/TopicPage'),
  Essentials: () => import('./pages/Essentials'),
  EssentialPage: () => import('./pages/EssentialPage'),
  Saved: () => import('./pages/Saved'),
  Review: () => import('./pages/Review'),
  Settings: () => import('./pages/Settings'),
  Placement: () => import('./pages/Placement'),
  Pronunciation: () => import('./pages/Pronunciation'),
  SoundGroupPage: () => import('./pages/SoundGroupPage'),
  ProgressPage: () => import('./pages/ProgressPage'),
  DailySession: () => import('./pages/DailySession'),
  Games: () => import('./pages/Games'),
};

/** Download every page chunk (used for offline mode and to make navigation instant). */
export function preloadPages() {
  return Promise.all(Object.values(loaders).map((load) => load()));
}

const Topics = lazy(loaders.Topics);
const TopicPage = lazy(loaders.TopicPage);
const Essentials = lazy(loaders.Essentials);
const EssentialPage = lazy(loaders.EssentialPage);
const Saved = lazy(loaders.Saved);
const Review = lazy(loaders.Review);
const Settings = lazy(loaders.Settings);
const Placement = lazy(loaders.Placement);
const Pronunciation = lazy(loaders.Pronunciation);
const SoundGroupPage = lazy(loaders.SoundGroupPage);
const ProgressPage = lazy(loaders.ProgressPage);
const DailySession = lazy(loaders.DailySession);
const Games = lazy(loaders.Games);

const page = (Component) => (
  <Suspense fallback={<LoadingState />}>
    <Component />
  </Suspense>
);

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="topics" element={page(Topics)} />
        <Route path="topics/:slug" element={page(TopicPage)} />
        <Route path="essentials" element={page(Essentials)} />
        <Route path="essentials/:slug" element={page(EssentialPage)} />
        <Route path="saved" element={page(Saved)} />
        <Route path="review" element={page(Review)} />
        <Route path="settings" element={page(Settings)} />
        <Route path="placement" element={page(Placement)} />
        <Route path="pronunciation" element={page(Pronunciation)} />
        <Route path="pronunciation/:id" element={page(SoundGroupPage)} />
        <Route path="progress" element={page(ProgressPage)} />
        <Route path="today" element={page(DailySession)} />
        <Route path="games" element={page(Games)} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
