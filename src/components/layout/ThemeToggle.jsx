'use client';

import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ theme, setTheme }) {
  if (!theme || typeof setTheme !== 'function') return null;

  return (
    <button
      onClick={() =>
        setTheme(theme === 'light' ? 'dark' : 'light')
      }
      className="
        p-2 rounded-full transition
        bg-gray-200 text-gray-800
        dark:bg-gray-800 dark:text-gray-200
      "
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon size={20} />
      ) : (
        <Sun size={20} className="text-yellow-400" />
      )}
    </button>
  );
}
