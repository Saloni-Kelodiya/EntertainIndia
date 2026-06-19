import SingleUserPage from '../../../page-components/SingleUserPage';
import LayoutWrapper from '../../LayoutWrapper';
import apiClient, { webStoriesAPI } from "../../../lib/api";
import { notFound } from "next/navigation";

// हिंदी भाषा कोड
const HINDI_LANG_CODE = 'hi';

// SEO मेटा डेटा डायनामिक रूप से जनरेट करें
export async function generateMetadata({ params }) {
  const { id } = await params;
  
  try {
    // apiClient का उपयोग करें
    const userResponse = await apiClient.get(`/users?filters[username][$eq]=${id}&populate[articles][populate]=*`);
    let user = Array.isArray(userResponse.data) ? userResponse.data[0] : userResponse.data;
    
    if (!user && !isNaN(id)) {
      const userByIdResponse = await apiClient.get(`/users/${id}?populate[articles][populate][hero_image][populate]=*`);
      user = userByIdResponse.data;
    }
    
    if (!user) return { title: "यूजर नहीं मिला - EntertainIndia" };

    const bioText = typeof user.bio === "string" 
      ? user.bio 
      : user.bio?.[0]?.children?.[0]?.text || "";

    const safeDescription = bioText 
      ? bioText.substring(0, 160) 
      : `EntertainIndia पर ${user.username || user.name} की प्रोफाइल`;

    return {
      title: `${user.name || user.username} - EntertainIndia`,
      description: safeDescription,
      openGraph: {
        title: user.name || user.username,
        description: safeDescription,
        images: [user.avatar?.url || user.profileImage || "/default-avatar.png"],
      },
    };
  } catch (error) {
    return { title: "यूजर प्रोफाइल - EntertainIndia" };
  }
}

export default async function SingleUser({ params }) {
  const { id } = await params;
  
  let user = null;
  let articles = [];
  let webStories = [];
  
  try {
    // पहला प्रयास: यूजरनेम से यूजर ढूंढें
    const userResponse = await apiClient.get(
      `/users?filters[username][$eq]=${id}&populate[avatar]=true&populate[articles][populate]=*`
    );
    
    user = Array.isArray(userResponse.data) ? userResponse.data[0] : userResponse.data;
    
    // दूसरा प्रयास: अगर यूजरनेम से नहीं मिला तो आईडी से ढूंढें
    if (!user && !isNaN(id)) {
      const userByIdResponse = await apiClient.get(
        `/users/${id}?populate[avatar]=true&populate[articles][populate]=*`
      );
      user = userByIdResponse.data;
    }
    
    if (user) {
      // आर्टिकल निकालें
      let rawArticles = [];
      
      // Strapi v4 फॉर्मेट हैंडल करें
      if (user.articles?.data && Array.isArray(user.articles.data)) {
        rawArticles = user.articles.data.map(item => ({
          id: item.id,
          ...item.attributes,
          ...item
        }));
      } else if (Array.isArray(user.articles)) {
        rawArticles = user.articles;
      }
      
      // आर्टिकल फ़िल्टर करें: सिर्फ पब्लिश और हिंदी भाषा के
      articles = rawArticles.filter(article => {
        // पब्लिश स्टेटस चेक करें
        const isPublished = article.publishedAt !== null && 
                           article.publishedAt !== undefined;
         const isModerated = article.moderation_status === "published";
        // भाषा चेक करें - अलग-अलग संभावित फ़ील्ड नाम
        const articleLanguage = article.language || article.lang || '';
        const isHindi = articleLanguage.toLowerCase() === HINDI_LANG_CODE || 
                       articleLanguage.toLowerCase() === 'hindi';
        
        return isPublished && isHindi && isModerated;
      });
      
      // डुप्लीकेट आर्टिकल हटाएं
      const uniqueArticleIds = new Set();
      articles = articles.filter(article => {
        if (uniqueArticleIds.has(article.id)) {
          return false;
        }
        uniqueArticleIds.add(article.id);
        return true;
      });
      
      // वेब स्टोरीज फ़ेच करें
      try {
        // पहले यूजरनेम से ढूंढें
        const storiesRes = await webStoriesAPI.getAll({ 
          author: user.username,
          pageSize: 100 
        });
        
        webStories = storiesRes.stories || [];
        
        // अगर यूजरनेम से नहीं मिला तो यूजर आईडी से ढूंढें
        if (webStories.length === 0 && user.id) {
          const storiesByIdRes = await webStoriesAPI.getMyStories(user.id);
          webStories = storiesByIdRes.stories || [];
        }
        
        // वेब स्टोरीज फ़िल्टर करें: सिर्फ पब्लिश और हिंदी भाषा की
        webStories = webStories.filter(story => {
          const isPublished = story.publishedAt !== null && 
                             story.publishedAt !== undefined;
           const isModerated = story.moderationStatus === "published";
          const storyLanguage = story.language || story.lang || '';
          const isHindi = storyLanguage.toLowerCase() === HINDI_LANG_CODE || 
                         storyLanguage.toLowerCase() === 'hindi';
          
          return isPublished && isHindi && isModerated;
        });
        
        // डुप्लीकेट वेब स्टोरीज हटाएं
        const uniqueStoryIds = new Set();
        webStories = webStories.filter(story => {
          if (uniqueStoryIds.has(story.id)) {
            return false;
          }
          uniqueStoryIds.add(story.id);
          return true;
        });
        
        // वेब स्टोरीज को डेट के अनुसार सॉर्ट करें (नई से पुरानी)
        webStories.sort((a, b) => {
          const dateA = new Date(a.publishDate || a.publishedAt || a.createdAt || 0);
          const dateB = new Date(b.publishDate || b.publishedAt || b.createdAt || 0);
          return dateB - dateA;
        });
        
      } catch (storyError) {
        // साइलेंट फेल - वेब स्टोरीज के बिना भी काम चलेगा
        console.error("वेब स्टोरीज फ़ेच करने में त्रुटि:", storyError.message);
        webStories = [];
      }
      
      // सिर्फ फ़िल्टर किए गए आर्टिकल से कुल व्यूज कैलकुलेट करें
      const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
      
      // यूजर ऑब्जेक्ट में काउंट्स जोड़ें
      user.articlesCount = articles.length;
      user.totalViews = totalViews;
      
      // यूजर आईडी सुनिश्चित करें
      if (!user.id && user.documentId) {
        user.id = user.documentId;
      }
    }
    
  } catch (error) {
    // साइलेंट फेल
    console.error("यूजर डेटा फ़ेच करने में त्रुटि:", error.message);
  }

  if (!user) {
    notFound();
  }

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