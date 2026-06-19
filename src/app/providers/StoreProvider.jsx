'use client';

import { useEffect } from 'react';
import { useStore } from '../../store/useStore';
export default function StoreProvider({ children }) {
  const { fetchCategories, fetchTrending, fetchPopular } = useStore();

  useEffect(() => {
    fetchCategories();
    fetchTrending();
    fetchPopular();
  }, [fetchCategories, fetchTrending, fetchPopular]);

  return <>{children}</>;
}

