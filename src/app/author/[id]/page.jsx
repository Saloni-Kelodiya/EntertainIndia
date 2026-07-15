import SingleUserPage from '../../../page-components/SingleUserPage';
import LayoutWrapper from '../../LayoutWrapper';
import apiClient from "../../../lib/api/client";
import { notFound } from "next/navigation";

// ─── Schema-accurate constants ────────────────────────────────────────────────
// Article schema: language enum = ["en","hi"], publish field = publish_datetime
// Web Story schema: moderation_status (not moderationStatus), thumbnail (not coverImage)

const HINDI_LANG = 'hi'; // exact enum value from schema

// Avatar only (meta call — no articles/stories needed)
const META_POPULATE = 'populate[avatar]=true';

// Articles: only fields used in ArticleCard + filtering
// publish_datetime is always null in practice — removed to save bandwidth
const ARTICLES_POPULATE = [
  'populate[articles][fields][0]=title',
  'populate[articles][fields][1]=slug',
  'populate[articles][fields][2]=summary',
  'populate[articles][fields][3]=publishedAt',
  'populate[articles][fields][4]=views',
  'populate[articles][fields][5]=language',
  'populate[articles][fields][6]=moderation_status',
  'populate[articles][fields][7]=MainCategory',
  'populate[articles][fields][8]=h1_title',
  'populate[articles][populate][hero_image][fields][0]=url',
  'populate[articles][populate][hero_image][fields][1]=formats',
  'populate[articles][populate][category][fields][0]=name',
  'populate[articles][populate][category][fields][1]=slug',
].join('&');

// Web Stories: slides को EXCLUDE करें — populate में न डालने पर भी आते हैं
// Fix: populate[web_stories][fields] explicitly list करो ताकि slides न आएं
// category = string enum (not array), views field नहीं है web stories में
const STORIES_POPULATE = [
  'populate[web_stories][fields][0]=title',
  'populate[web_stories][fields][1]=slug',
  'populate[web_stories][fields][2]=publishedAt',
  'populate[web_stories][fields][3]=language',
  'populate[web_stories][fields][4]=moderation_status',
  'populate[web_stories][fields][5]=category',         // string enum: "events","trending" etc.
  'populate[web_stories][fields][6]=featured',
  'populate[web_stories][populate][thumbnail][fields][0]=url',
  'populate[web_stories][populate][thumbnail][fields][1]=formats',
].join('&');

const FULL_POPULATE = `populate[avatar]=true&${ARTICLES_POPULATE}&${STORIES_POPULATE}`;

// ─── Filtering helpers ────────────────────────────────────────────────────────

function filterArticles(rawArticles = []) {
  const seen = new Set();
  return rawArticles.filter(article => {
    if (seen.has(article.id)) return false;
    seen.add(article.id);
    return (
      article.publishedAt != null &&          // draftAndPublish:true, so check this
      article.moderation_status === 'published' &&
      article.language === HINDI_LANG          // exact enum match — no .toLowerCase() needed
    );
  });
}

function filterStories(rawStories = []) {
  const seen = new Set();
  return rawStories
    .filter(story => {
      if (seen.has(story.id)) return false;
      seen.add(story.id);
      return (
        story.publishedAt != null &&
        story.moderation_status === 'published' && // schema field name confirmed
        story.language === HINDI_LANG
      );
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt || 0) -
        new Date(a.publishedAt || a.createdAt || 0)
    );
}

// Client को सिर्फ ArticleCard जरूरी fields भेजें
// category is array (manyToMany) — confirmed from real API response
function stripArticle({
  id, documentId, title, slug, summary,
  publishedAt, views, language,
  moderation_status, MainCategory,
  hero_image, category,           // category = array, hero_image = flat object
}) {
  return {
    id, documentId, title, slug, summary,
    publishedAt, views, language,
    moderation_status, MainCategory,
    hero_image, category,
  };
}

// Client को सिर्फ WebStoryCard जरूरी fields भेजें
// category = string enum, views नहीं है web stories में, thumbnail = flat object
function stripStory({
  id, documentId, title, slug,
  publishedAt, language, moderation_status,
  category, featured, thumbnail,
}) {
  return {
    id, documentId, title, slug,
    publishedAt, language, moderation_status,
    category, featured, thumbnail,
  };
}

// ─── fetchUser ────────────────────────────────────────────────────────────────

async function fetchUser(id, populate) {
  // 1. username से
  try {
    const res = await apiClient.get(
      `/users?filters[username][$eq]=${encodeURIComponent(id)}&${populate}`
    );
    const list = Array.isArray(res.data) ? res.data : [res.data];
    if (list[0]?.id) return list[0];
  } catch (e) {
    console.error('Username fetch failed:', e.message);
  }

  // 2. numeric id से
  if (!isNaN(id)) {
    try {
      const res = await apiClient.get(`/users/${id}?${populate}`);
      return res.data || null;
    } catch (e) {
      console.error('ID fetch failed:', e.message);
    }
  }

  return null;
}

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const user = await fetchUser(id, META_POPULATE);
    if (!user) return { title: 'यूजर नहीं मिला - EntertainIndia' };

    const rawDesc = user.bio_hindi || user.bio || '';
    const description = rawDesc
      ? rawDesc.substring(0, 160)
      : `EntertainIndia पर ${user.username_hindi || user.username} की प्रोफाइल`;

    return {
      title: `${user.username_hindi || user.username} - EntertainIndia`,
      description,
      openGraph: {
        title: user.username_hindi || user.username,
        description,
        images: [user.avatar?.url || '/default-avatar.png'],
      },
    };
  } catch {
    return { title: 'यूजर प्रोफाइल - EntertainIndia' };
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SingleUser({ params }) {
  const { id } = await params;

  let user       = null;
  let articles   = [];
  let webStories = [];

  try {
    user = await fetchUser(id, FULL_POPULATE);

    if (user) {
      // API response confirmed Strapi v5 flat format:
      // articles come as plain array of flat objects — NO data[].attributes wrapper
      const rawArticles = Array.isArray(user.articles)
        ? user.articles
        : user.articles?.data
          ? user.articles.data.map(({ id, attributes }) => ({ id, ...attributes })) // v4 fallback
          : [];

      articles = filterArticles(rawArticles).map(stripArticle);

      // Same flat format for web_stories
      const rawStories = Array.isArray(user.web_stories)
        ? user.web_stories
        : user.web_stories?.data
          ? user.web_stories.data.map(({ id, attributes }) => ({ id, ...attributes }))
          : [];

      webStories = filterStories(rawStories).map(stripStory);

      // Stats
      user.articlesCount = articles.length;
      user.totalViews    = articles.reduce((s, a) => s + (a.views || 0), 0);

      // id normalize
      if (!user.id && user.documentId) user.id = user.documentId;

      // Serialized payload से heavy/unused relations हटाएं
      delete user.articles;
      delete user.web_stories;
      delete user.posts;
      delete user.liked_posts;
      delete user.notifications;
      delete user.following;
      delete user.followers;
      delete user.shows_reviews;
      delete user.web_series_reviews;
      delete user.post_comment;
      delete user.role;
    }
  } catch (error) {
    console.error('यूजर डेटा फ़ेच करने में त्रुटि:', error.message);
  }

  if (!user) notFound();

  return (
    <LayoutWrapper>
      <SingleUserPage
        initialUser={user}
        initialArticles={articles}
        initialWebStories={webStories}
      />
    </LayoutWrapper>
  );
}