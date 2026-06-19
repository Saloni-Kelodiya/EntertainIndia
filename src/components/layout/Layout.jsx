// app/LayoutWrapper.jsx
'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

import { useStore } from '../../store/useStore';
export default function Layout({ theme, setTheme, children,  }) {
  const pathname = usePathname();
  const hideHeaderFooter = pathname.startsWith('/author-dashboard');

 const loadAuthFromStorage = useStore(s => s.loadAuthFromStorage);

  useEffect(() => {
    loadAuthFromStorage();
  }, [loadAuthFromStorage]);
  
  return (
    <div className="min-h-screen ">
      {!hideHeaderFooter && (
        <Header theme={theme} setTheme={setTheme} />
      )}

      <main
        className={`flex-grow ${
          !hideHeaderFooter ? 'pt-[70px] md:pt-[70px] ' : ''
        }`}
      >
        {children}
      </main>
    <Footer />
    </div>
  );
}