import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from './NavBar';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPathname.current) {
      const scrollToTop = () => {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };
      
      scrollToTop();
      requestAnimationFrame(scrollToTop);
      setTimeout(scrollToTop, 100);
      setTimeout(scrollToTop, 300);
      
      prevPathname.current = location.pathname;
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleRouteChange = () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    
    window.addEventListener('hashchange', handleRouteChange);
    return () => window.removeEventListener('hashchange', handleRouteChange);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-dots pointer-events-none opacity-60" />
        <div className="relative container max-w-6xl mx-auto px-4 py-6 md:py-10 animate-stagger">
          {children}
        </div>
      </main>
      <footer className="py-4 text-center text-xs md:text-sm text-kid-textLight/80 font-kid bg-white/40 border-t border-kid-sky/10">
        <p>🎈 单词小博士 · 让记单词变得有趣 · v1.0 🎈</p>
      </footer>
    </div>
  );
}
