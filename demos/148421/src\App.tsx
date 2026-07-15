import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useCallback } from 'react';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import LearnPage from './pages/LearnPage';
import TestPage from './pages/TestPage';
import TestResultPage from './pages/TestResultPage';
import VocabularyPage from './pages/VocabularyPage';
import ProgressPage from './pages/ProgressPage';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  const scrollUp = useCallback(() => {
    const scroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    scroll();
    setTimeout(scroll, 50);
    setTimeout(scroll, 100);
  }, []);

  useEffect(() => {
    scrollUp();
  }, [pathname, hash, scrollUp]);

  useEffect(() => {
    const handlePopState = () => {
      scrollUp();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [scrollUp]);

  return null;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/test/result" element={<TestResultPage />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}
