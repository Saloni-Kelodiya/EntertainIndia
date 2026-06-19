'use client';

import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';

export default function ThemeLayoutWrapper({ children }) {
  const [theme, setTheme] = useState(null);

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  // Apply theme
  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  if (!theme) return null; // ⛔ prevent hydration mismatch

  return (
    <AppLayout theme={theme} setTheme={setTheme}>
      {children}
    </AppLayout>
  );
}
