// app/authors/page.jsx
import AllUserPage from "../../page-components/AllUserPage";
import LayoutWrapper from "../LayoutWrapper";
import apiClient from "../../lib/api/client";

export const dynamic = 'force-dynamic';
// Optional: enable revalidation
// export const revalidate = 3600;

export const metadata = {
  title: "हमारे लेखक - EntertainIndia",
  description: "EntertainIndia के प्रतिभाशाली लेखकों और कंटेंट क्रिएटर्स से मिलें",
  openGraph: {
    title: "हमारे लेखक - EntertainIndia",
    description: "EntertainIndia के प्रतिभाशाली लेखकों और कंटेंट क्रिएटर्स से मिलें",
    images: [
      {
        url: "/og-logo.png",
        width: 1200,
        height: 630,
        alt: "EntertainIndia Authors",
      },
    ],
  },
};

const LANGUAGE_CODE = 'hi';

export default async function UsersMain() {
  let users = [];

  try {
    // Fetch only necessary fields to reduce payload
    const usersRes = await apiClient.get(
      `/users?` +
      `populate[avatar]=true` +
      `&populate[role]=true` +
      `&populate[articles][fields][0]=views` +
      `&populate[articles][fields][1]=language` +
      `&populate[articles][fields][2]=moderation_status` +
      `&populate[articles][fields][3]=publishedAt` +
      `&populate[web_stories][fields][0]=language` +
      `&populate[web_stories][fields][1]=moderation_status` +
      `&populate[web_stories][fields][2]=publishedAt` +
      `&pagination[limit]=100`
    );

    const rawUsers = Array.isArray(usersRes.data)
      ? usersRes.data
      : usersRes.data?.data || [];

    // Process and filter on server
    const processed = rawUsers
      .map((user) => {
        const data = user.attributes || user;

        // Remove 'authenticated' role
        const roleName = typeof data.role === 'object'
          ? data.role?.name || ''
          : data.role || '';
        if (roleName.toLowerCase() === 'authenticated') return null;

        // Filter articles (Hindi, published, moderated)
        const articles = (data.articles?.data || data.articles || [])
          .map(a => a.attributes || a)
          .filter(a =>
            a.publishedAt !== null &&
            a.moderation_status === 'published' &&
            (a.language || a.lang || '').toLowerCase() === LANGUAGE_CODE
          );

        // Filter web stories (Hindi, published, moderated)
        const webStories = (data.web_stories?.data || data.web_stories || [])
          .map(s => s.attributes || s)
          .filter(s =>
            s.publishedAt !== null &&
            s.moderation_status === 'published' &&
            (s.language || s.lang || '').toLowerCase() === LANGUAGE_CODE
          );

        const totalPosts = articles.length + webStories.length;
        // Views only from articles (as per requirement)
        const totalViews = articles.reduce((sum, a) => sum + (Number(a.views) || 0), 0);

        return {
          id: user.id,
          documentId: user.documentId || null,
          name: data.name || data.username || "अनाम",
          username_hindi: data.username_hindi || data.username || "अनाम",
          username: data.username || "",
          role: roleName || "लेखक",
          avatar: data.avatar?.url ? data.avatar : data.avatar?.data?.attributes || null,
          profileImage: data.avatar?.url || data.avatar?.data?.attributes?.url || null,
          bio: data.bio_hindi || "",
          articlesCount: articles.length,
          webStoriesCount: webStories.length,
          totalPosts,
          totalViews,
        };
      })
      .filter(Boolean); // remove nulls

    // Sort by total posts (highest first)
    processed.sort((a, b) => b.totalPosts - a.totalPosts);
    users = processed;

  } catch (error) {
    console.error("❌ Users Fetch Error:", error.message);
    users = [];
  }

  // JSON‑LD for SEO (CollectionPage + ItemList)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "हमारे लेखक - EntertainIndia",
    "description": "EntertainIndia के प्रतिभाशाली लेखक और कंटेंट क्रिएटर्स",
    "about": {
      "@type": "Thing",
      "name": "Authors"
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": users.map((u, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "item": {
          "@type": "Person",
          "name": u.username_hindi,
          "url": `https://entertainindia.com/author/${u.username || u.id}`,
          "image": u.profileImage || u.avatar?.url || "",
          "description": u.bio || "",
          "worksFor": {
            "@type": "Organization",
            "name": "EntertainIndia"
          }
        }
      }))
    }
  };

  return (
    <LayoutWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AllUserPage initialUsers={users} />
    </LayoutWrapper>
  );
}