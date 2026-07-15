'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useStore } from '../../store/useStore';
import Header from "./Header";
// Header aur Footer ko dynamic chunking ke sath import karein

const Footer = dynamic(() => import('./Footer'), { ssr: true });

export default function AppLayout({ theme, setTheme, children }) {
  const pathname = usePathname();
  
  // Dashboard routing logic
  const hideLayout = pathname.startsWith('/author-dashboard');

  const loadAuthFromStorage = useStore(s => s.loadAuthFromStorage);

  useEffect(() => {
    loadAuthFromStorage();
  }, [loadAuthFromStorage]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      {/* Agar dashboard nahi hai, tabhi header render hoga aur chunk load hoga */}
      {!hideLayout && <Header theme={theme} setTheme={setTheme} />}

      {/* Main Content Space Allocation */}
      <main className={`flex-grow ${!hideLayout ? 'pt-[120px]' : ''}`}>
        {children}
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
}