import { articlesAPI, tagsAPI } from '../../../lib/api'; // Paths sahi se check karlein
import TagClientView from '../../../page-components/TagPage';
import LayoutWrapper from '../../LayoutWrapper';
import { notFound } from 'next/navigation';

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in').replace(/\/$/, '');

// ✅ STEP 1: Server Side Metadata & Canonical Injector
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  if (!slug) return {};

  try {
    const tagData = await tagsAPI.getBySlug(slug);
    
    // STRICT CHECK: Agar tagData ya uska name missing hai toh valid title fallback dein ya blank chodein
    if (!tagData || !tagData.name) {
      return { title: 'टैग समाचार - एंटरटेनइंडिया' };
    }

    const tagName = tagData.name;

    return {
      title: `#${tagName} - एंटरटेनइंडिया`,
      description: `एंटरटेनइंडिया पर ${tagName} के बारे में नवीनतम लेख, समाचार और ताज़ा ख़बरें पढ़ें।`,
      alternates: {
        canonical: `${BASE_URL}/tag/${slug}`, // 👈 Google duplicate issue pure fix!
      },
    };
  } catch (err) {
    console.error("Metadata error:", err);
    return {
      title: 'टैग समाचार - एंटरटेनइंडिया',
    };
  }
}

// ✅ STEP 2: Main Server Component
export default async function TagSlugPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  if (!slug) {
    notFound();
  }

  try {
    // Parallelly tags data aur articles data server par hi fetch hoga
    const [tagData, articlesData] = await Promise.all([
      tagsAPI.getBySlug(slug),
      articlesAPI.getAll({ tag: slug, pageSize: 24 })
    ]);

    // STRICT CHECK: Agar backend se tag delete ho chuka hai YA tag ka proper 'name' hi nahi mila, toh direct 404 show karo
    if (!tagData || !tagData.name ||!tagData.slug) {
      notFound(); 
    }

    // Ab guaranteed hai ki displayTagName strictly tag name hi hoga
    const displayTagName = tagData.name; 
    const initialArticles = articlesData?.articles || [];
    const totalCount = articlesData?.pagination?.total || initialArticles.length;

    return (
      <LayoutWrapper>
        <TagClientView 
          formattedTagName={displayTagName}
          initialArticles={initialArticles}
          initialTotal={totalCount}
        />
      </LayoutWrapper>
    );

  } catch (error) {
    console.error("Server Side Fetching Error for Tags:", error);
    notFound();
  }
}