"use client"

import ShareBar from '../components/ui/ShareBar';
import Sidebar from '../components/layout/Sidebar';

export function ArticleShareBar({ url, title }) {
  return <ShareBar url={url} title={title} />;
}

export function ArticleSidebar({ related = [], title = "Related Articles" }) {
  return <Sidebar relatedArticles={related} relatedTitle={title} isArticlePage={true} />;
}
