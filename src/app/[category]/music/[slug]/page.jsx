import LayoutWrapper from '../../../LayoutWrapper';
import MusicDetailPage from "../../../../page-components/MusicDetailPage"; // ← Keep this as MusicDetailPage
import { songsAPI } from "../../../../lib/api";
import { notFound } from 'next/navigation';

const SITE_URL = "https://entertainindia.in";

// ✅ Helper function to get actual category of song
const getActualCategory = (song) => {
  if (song?.category?.slug) return song.category.slug.toLowerCase();
  if (song?.categories?.length > 0) return song.categories[0].slug.toLowerCase();
  return 'music';
};

// ✅ MUSIC DETAIL PAGE - PERFECT SCHEMA GENERATOR
function generateMusicDetailSchema(song, category, slug) {
  const domain = SITE_URL;
  const songUrl = `${domain}/${category}/music/${slug}`;
  const imageUrl = song.thumbnail?.url || song.poster?.url || '';
  const publishDate = song.releaseDate || song.createdAt || new Date().toISOString();
  
  const graph = [];

  // 1️⃣ ORGANIZATION SCHEMA
  graph.push({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${domain}/#organization`,
    "name": "EntertainIndia",
    "alternateName": "एंटरटेनइंडिया",
    "url": domain,
    "logo": {
      "@type": "ImageObject",
      "url": `${domain}/logo.png`,
      "width": "512",
      "height": "512"
    },
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61584375938569",
      "https://x.com/EIndia99460",
      "https://www.instagram.com/entertainindiaofficial"
    ]
  });

  // 2️⃣ WEBSITE SCHEMA
  graph.push({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${domain}/#website`,
    "url": domain,
    "name": "EntertainIndia",
    "alternateName": "एंटरटेनइंडिया",
    "description": "Latest songs, music videos, and artist updates in Hindi",
    "inLanguage": "hi-IN",
    "publisher": {
      "@id": `${domain}/#organization`
    }
  });

  // 3️⃣ BREADCRUMB SCHEMA
  graph.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${songUrl}#breadcrumb`,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": domain
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": category.charAt(0).toUpperCase() + category.slice(1),
        "item": `${domain}/${category}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Music",
        "item": `${domain}/${category}/music`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": song.title?.substring(0, 50),
        "item": songUrl
      }
    ]
  });

  // 4️⃣ MUSIC RECORDING SCHEMA (Main)
  const musicSchema = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    "@id": `${songUrl}#music`,
    "name": song.title,
    "url": songUrl,
    "description": song.body?.substring(0, 200) || `${song.title} by ${song.artist}`,
    "byArtist": {
      "@type": "MusicGroup",
      "name": song.artist || "Various Artists"
    },
    "inLanguage": "hi-IN",
    "datePublished": publishDate,
    "image": imageUrl ? {
      "@type": "ImageObject",
      "url": imageUrl,
      "width": "1200",
      "height": "630"
    } : undefined,
    "duration": song.duration || undefined,
    "album": song.album ? {
      "@type": "MusicAlbum",
      "name": song.album
    } : undefined
  };

  // Add genre if exists
  if (song.genre) {
    musicSchema.genre = song.genre;
  }

  graph.push(musicSchema);

  // 5️⃣ WEBPAGE SCHEMA
  graph.push({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${songUrl}#webpage`,
    "url": songUrl,
    "name": `${song.title} - ${song.artist || ''} | गाने के बोल, क्रेडिट और स्ट्रीमिंग | EntertainIndia`,
    "description": song.body?.substring(0, 200) || `${song.title} by ${song.artist}`,
    "isPartOf": {
      "@id": `${domain}/#website`
    },
    "inLanguage": "hi-IN",
    "primaryImageOfPage": imageUrl ? {
      "@type": "ImageObject",
      "url": imageUrl
    } : undefined
  });

  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}

// ✅ SEO: Enhanced Metadata Generation
export async function generateMetadata({ params }) {
  const { category, slug } = await params;
  const song = await songsAPI.getBySlug(slug);

  const actualCategory = getActualCategory(song);
  if (!song || actualCategory !== category.toLowerCase()) {
    return { title: "गाना नहीं मिला", robots: { index: false } };
  }

  const seoTitle = `${song.title} - ${song.artist || ''} | बोल, क्रेडिट और स्ट्रीमिंग | EntertainIndia`;
  const seoDesc = song.body?.substring(0, 160) || `${song.title} को ${song.artist} द्वारा सुनें। रिलीज़ की तारीख, एलबम विवरण और स्ट्रीमिंग लिंक देखें।`;
  const songImageUrl = song.thumbnail?.url || song.poster?.url || '';
  const pageUrl = `${SITE_URL}/${category}/music/${slug}`;

  return {
    title: seoTitle,
    description: seoDesc,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    },
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: pageUrl,
      siteName: 'EntertainIndia',
      images: [
        {
          url: songImageUrl,
          width: 1200,
          height: 630,
          alt: song.title,
        },
      ],
      locale: 'hi_IN',
      type: 'music.song',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDesc,
      images: [songImageUrl],
    },
  };
}

// ✅ MAIN COMPONENT
export default async function MusicDetail({ params }) {
  const { slug, category } = await params;
  
  let song = null;
  try {
    song = await songsAPI.getBySlug(slug);
  } catch (error) {
    console.error("FETCH त्रुटि:", error);
  }

  if (!song) {
    return notFound();
  }

  const actualCategory = getActualCategory(song);
  if (actualCategory !== category.toLowerCase()) {
    return notFound();
  }

  // ✅ GENERATE COMPLETE SCHEMA
  const schemaData = generateMusicDetailSchema(song, category, slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      
      <h1 className="sr-only">{song.title} by {song.artist} - गाने का विवरण</h1>
      
      <LayoutWrapper>
        <MusicDetailPage  
          initialSong={song} 
          serverCategory={category} 
          slug={slug}
        />
      </LayoutWrapper>
    </>
  );
}