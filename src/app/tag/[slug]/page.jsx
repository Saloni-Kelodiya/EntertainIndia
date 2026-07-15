// ... existing imports
import { articlesAPI, tagsAPI } from '../../../lib/api';
import TagClientView from '../../../page-components/TagPage';
import LayoutWrapper from '../../LayoutWrapper';
import { notFound } from 'next/navigation';

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in').replace(/\/$/, '');

export async function generateMetadata({ params }) {
  // ... unchanged
}

export default async function TagSlugPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  if (!slug) {
    notFound();
  }

  try {
    // 1. Fetch tag data
    const tagData = await tagsAPI.getBySlug(slug);

    // If tag doesn't exist → 404
    if (!tagData || !tagData.name || !tagData.slug) {
      notFound();
    }

    // 2. Fetch articles for this tag
    const articlesData = await articlesAPI.getAll({ tag: slug, pageSize: 24 });

    const initialArticles = articlesData?.articles || [];
    const totalCount = articlesData?.pagination?.total || initialArticles.length;

    let relatedArticles = [];

    // 3. If no articles found, fetch fallback articles (latest or trending)
    if (initialArticles.length === 0) {
      // Option A: Fetch latest 6 articles (no tag filter)
      const latestData = await articlesAPI.getAll({ pageSize: 6, sort: 'newest' });
      relatedArticles = latestData?.articles || [];

      // Option B (more relevant): Fetch articles from related tags
      // (if your API supports filtering by multiple tags or you have a recommendation endpoint)
      // const relatedData = await articlesAPI.getRelatedByTag(slug, { pageSize: 6 });
      // relatedArticles = relatedData?.articles || [];
    }

    return (
      <LayoutWrapper>
        <TagClientView
          formattedTagName={tagData.name}
          initialArticles={initialArticles}
          initialTotal={totalCount}
          relatedArticles={relatedArticles}   // 👈 new prop
        />
      </LayoutWrapper>
    );
  } catch (error) {
    console.error('Server Side Fetching Error for Tags:', error);
    notFound();
  }
}