'use client';

import { useEffect, useState } from 'react';
import Layout from '../components/layout/AppLayout.jsx';

export default function LayoutWrapper({ children }) {
  const [theme, setTheme] = useState('light'); // ⬅️ Null ki jagah default 'light' do
  const [mounted, setMounted] = useState(false); // ⬅️ Hydration handle karne ke liye

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  // Agar mounted nahi hai (Server side), toh bina theme ke render karo (SEO ke liye best)
  return (
    <Layout theme={theme} setTheme={setTheme}>
      {children}
    </Layout>
  );
}