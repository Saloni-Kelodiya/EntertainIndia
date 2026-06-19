// app/authors/page.jsx

import AllUserPage from "../../page-components/AllUserPage";
import LayoutWrapper from "../LayoutWrapper";
import apiClient from "../../lib/api";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "हमारे लेखक - EntertainIndia",
  description: "EntertainIndia के प्रतिभाशाली लेखकों और कंटेंट क्रिएटर्स से मिलें",
};

// ✅ CHANGE THIS TO "hi" FOR HINDI
const LANGUAGE_CODE = 'hi';  // अब हिंदी के लिए 'hi'

export default async function UsersMain() {
  let users = [];

  try {
    // ✅ USERS WITH ARTICLES AND WEB STORIES
    const usersRes = await apiClient.get(
      `/users?populate[avatar]=true&populate[role]=true&populate[articles][populate]=*&populate[web_stories][populate]=*&pagination[limit]=100`
    );

    const rawUsers = Array.isArray(usersRes.data)
      ? usersRes.data
      : usersRes.data?.data || [];

    users = rawUsers.map((user) => {
      const data = user.attributes || user;

      // =========================
      // ARTICLES
      // =========================
      let rawArticles = [];

      if (Array.isArray(data.articles)) {
        rawArticles = data.articles;
      } else if (data.articles?.data) {
        rawArticles = data.articles.data.map((item) => ({
          id: item.id,
          ...(item.attributes || {}),
        }));
      }

      // ✅ FILTER ARTICLES - HINDI LANGUAGE
      const filteredArticles = rawArticles.filter((article) => {
        const isPublished = article.publishedAt !== null && article.publishedAt !== undefined;
        const isModerated = article.moderation_status === "published";
        const articleLanguage = article.language || article.lang || '';
        
        // ✅ Now checking for HINDI (not English)
        const isCorrectLanguage = articleLanguage.toLowerCase() === LANGUAGE_CODE;
        
        return isPublished && isCorrectLanguage && isModerated;
      });

      // =========================
      // WEB STORIES
      // =========================
      let rawWebStories = [];

      if (Array.isArray(data.web_stories)) {
        rawWebStories = data.web_stories;
      } else if (data.web_stories?.data) {
        rawWebStories = data.web_stories.data.map((item) => ({
          id: item.id,
          ...(item.attributes || {}),
        }));
      }

      // ✅ FILTER WEB STORIES - HINDI LANGUAGE
      const filteredWebStories = rawWebStories.filter((story) => {
        const isPublished = story.publishedAt !== null && story.publishedAt !== undefined;
        const isModerated = story.moderation_status === "published";
        const storyLanguage = story.language || story.lang || '';
        
        // ✅ Now checking for HINDI (not English)
        const isCorrectLanguage = storyLanguage.toLowerCase() === LANGUAGE_CODE;
        
        return isPublished && isCorrectLanguage && isModerated;
      });

      // =========================
      // COUNTS
      // =========================
      const articlesCount = filteredArticles.length;
      const webStoriesCount = filteredWebStories.length;
      const totalPosts = articlesCount + webStoriesCount;

      const totalViews = filteredArticles.reduce(
        (sum, article) => sum + (Number(article.views) || 0),
        0
      );

      return {
        id: user.id,
        documentId: user.documentId || null,
        name: data.name || data.username || "अनाम",
        username_hindi: data.username_hindi || data.username || "अनाम",
        username: data.username || "",
        role: "लेखक",
        avatar: data.avatar?.url ? data.avatar : data.avatar?.data?.attributes || null,
        profileImage: data.avatar?.url || data.avatar?.data?.attributes?.url || null,
        bio: data.bio_hindi || "",
        articlesCount,
        webStoriesCount,
        totalPosts,
        totalViews,
      };
    });

    // ✅ SORT BY TOTAL POSTS
    users.sort((a, b) => b.totalPosts - a.totalPosts);

  } catch (error) {
    console.error("❌ Users Fetch Error:", error.message);
    users = [];
  }

  return (
    <LayoutWrapper>
      <AllUserPage initialUsers={users} />
    </LayoutWrapper>
  );
}