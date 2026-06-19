'use client';

import { use } from 'react';
import LayoutWrapper from '../LayoutWrapper';
import CategoryPage from '../../page-components/CategoryPage';

export default function CategoryRootPage({ params }) {
  const { category } = use(params);

  return (
    <LayoutWrapper>
      <CategoryPage category={category} />
    </LayoutWrapper>
  );
}
