import { galleriesAPI } from '../../../lib/api';
import GalleryPage from '../../../page-components/GalleryPage';
import LayoutWrapper from '../../LayoutWrapper';
import { notFound } from 'next/navigation';
import LogoImg from '../../assets/entertainindia_logo.png';

const SITE_URL = 'https://entertainindia.in';
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || '';
const ORG_NAME = 'EntertainIndia';
const ORG_NAME_HI = 'एंटरटेनइंडिया';

// 🔧 FIX: safety check agar LogoImg.src already absolute hai
const LOGO_URL = LogoImg?.src?.startsWith('http') ? LogoImg.src : `${SITE_URL}${LogoImg?.src || ''}`;
const LOGO_W   = LogoImg?.width || 512;
const LOGO_H   = LogoImg?.height || 512;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function cleanText(text, maxLen) {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > maxLen ? clean.slice(0, maxLen - 3) + '...' : clean;
}

function formatDateISO(dateStr) {
  if (!dateStr) return null;
  try { return new Date(dateStr).toISOString(); } catch { return null; }
}

// 🔧 FIX: Strapi image URLs aksar relative hote hain ("/uploads/xyz.jpg") — bina
// absolute banaye, OG/Twitter/schema mein broken/invalid image URL chala jaata hai.
function toAbsoluteUrl(url) {
  if (!url) return '';
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}

// ─────────────────────────────────────────────────────────────
// SCHEMA GENERATOR  (fully optimized for Google rich results)
// ─────────────────────────────────────────────────────────────

function generateSchema(gallery, relatedData = []) {
  const pageUrl   = `${SITE_URL}/photos/${gallery.slug}`;
  const photos    = gallery.photos || [];
  const allImages = photos.map(p => toAbsoluteUrl(p.image?.url)).filter(Boolean);
  const coverImg  = toAbsoluteUrl(photos[0]?.image?.url || gallery.coverImage?.url || '');
  const pubDate   = formatDateISO(gallery.publishedAt);
  const modDate   = formatDateISO(gallery.updatedAt || gallery.publishedAt);
  const desc      = cleanText(
    gallery.description || `${gallery.title} की हाई-क्वालिटी फोटो गैलरी।`,
    200
  );

  // 1. Organization
  const organization = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    "name": ORG_NAME,
    "alternateName": ORG_NAME_HI,
    "url": SITE_URL,
    "logo": {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      "url": LOGO_URL,
      "width": LOGO_W,
      "height": LOGO_H,
      "caption": ORG_NAME
    },
    // 🔧 FIX: leading space hata diya ("  https://..." → "https://...") — yeh string
    // ke andar chhupa hua tha aur malformed URL bana raha tha. YouTube link bhi add
    // kiya (baaki pages mein consistent rakhne ke liye).
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61584375938569",
      "https://www.instagram.com/entertainindiaofficial/",
      "https://x.com/EIndia99460",
      "https://www.youtube.com/@EIndiaofficial"
    ]
  };

  // 2. WebSite
  // 🔧 FIX: SearchAction hata diya — /search route entertainindia.in par exist
  // nahi karta, isse Google sitelinks search box 404 khol deta.
  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "url": SITE_URL,
    "name": ORG_NAME,
    "alternateName": ORG_NAME_HI,
    "inLanguage": "hi-IN",
    "publisher": { "@id": `${SITE_URL}/#organization` }
  };

  // 3. BreadcrumbList
  const breadcrumb = {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",   "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Photos", "item": `${SITE_URL}/photos` },
      { "@type": "ListItem", "position": 3, "name": cleanText(gallery.title, 50), "item": pageUrl }
    ]
  };

  // 4. Individual ImageObject list (helps Google index each photo)
  // ⚠️ NOTE: pehle "/copyright" aur fir "/disclaimer" try kiya — user ne confirm
  // kiya ki site par koi disclaimer/copyright page hi nahi hai. Isliye license/
  // acquireLicensePage fields bilkul hata diye (yeh dono optional hain, koi
  // problem nahi inke bina — galat URL bhejne se behtar hai na bhejna).

  const imageObjects = photos.slice(0, 20).map((photo, i) => {
    const imgUrl = toAbsoluteUrl(photo.image?.url);
    return {
      "@type": "ImageObject",
      "@id": `${pageUrl}#photo-${i + 1}`,
      "url": imgUrl,
      "name": photo.caption || `${gallery.title} - फोटो ${i + 1}`,
      "description": photo.caption || desc,
      "contentUrl": imgUrl,
      "thumbnail": imgUrl,
      "representativeOfPage": i === 0,
      ...(photo.image?.width  && { "width":  photo.image.width  }),
      ...(photo.image?.height && { "height": photo.image.height }),
      ...(pubDate && { "uploadDate": pubDate }),
      "author":    { "@id": `${SITE_URL}/#organization` },
      "publisher": { "@id": `${SITE_URL}/#organization` }
    };
  }).filter(img => img.url);

  // 5. ImageGallery (CollectionPage sub-type — Google prefers this)
  const imageGallery = {
    "@type": ["CollectionPage", "ImageGallery"],
    "@id": `${pageUrl}#gallery`,
    "name": gallery.title,
    "headline": cleanText(gallery.title, 110),
    "description": desc,
    "url": pageUrl,
    "inLanguage": "hi-IN",
    "numberOfItems": photos.length,
    "image": coverImg ? {
      "@type": "ImageObject",
      "url": coverImg,
      "name": gallery.title
    } : undefined,
    "hasPart": imageObjects,
    ...(pubDate && { "datePublished": pubDate }),
    ...(modDate && { "dateModified":  modDate }),
    "author":      { "@id": `${SITE_URL}/#organization` },
    "publisher":   { "@id": `${SITE_URL}/#organization` },
    "isPartOf":    { "@id": `${SITE_URL}/#website` },
    "breadcrumb":  { "@id": `${pageUrl}#breadcrumb` },
    // Event context if available
    ...(gallery.event && {
      "about": {
        "@type": "Event",
        "name": gallery.event,
        ...(gallery.location && {
          "location": {
            "@type": "Place",
            "name": gallery.location
          }
        }),
        ...(gallery.event_date && {
          "startDate": formatDateISO(gallery.event_date)
        })
      }
    }),
    // Celebrity context
    ...(gallery.celebrity_name && {
      "mentions": {
        "@type": "Person",
        "name": gallery.celebrity_name
      }
    }),
    // Related galleries as relatedLink
    ...(relatedData.length > 0 && {
      "relatedLink": relatedData.slice(0, 6).map(g => `${SITE_URL}/photos/${g.slug}`)
    })
  };

  // 6. WebPage
  const webpage = {
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    "url": pageUrl,
    "name": `${cleanText(gallery.title, 40)} | फोटो गैलरी - ${ORG_NAME}`,
    "description": desc,
    "inLanguage": "hi-IN",
    "isPartOf":   { "@id": `${SITE_URL}/#website` },
    "breadcrumb": { "@id": `${pageUrl}#breadcrumb` },
    "primaryImageOfPage": coverImg ? { "@type": "ImageObject", "url": coverImg } : undefined,
    ...(pubDate && { "datePublished": pubDate }),
    ...(modDate && { "dateModified":  modDate }),
    "author":    { "@id": `${SITE_URL}/#organization` },
    "publisher": { "@id": `${SITE_URL}/#organization` },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".gallery-description"]
    }
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organization, website, breadcrumb, imageGallery, webpage]
  };
}

// ─────────────────────────────────────────────────────────────
// METADATA  (Next.js generateMetadata)
// ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const gallery = await galleriesAPI.getBySlug(slug);
    if (!gallery) return notFound();

    const pageUrl    = `${SITE_URL}/photos/${slug}`;
    const coverImg   = toAbsoluteUrl(gallery.photos?.[0]?.image?.url || gallery.coverImage?.url || ''); // 🔧 FIX
    const photos     = gallery.photos || [];

    // Title: keyword-rich, under 60 chars
    // Pattern: "{Celebrity} {Event} Photos | EntertainIndia"
    let titleCore = gallery.title;
    if (gallery.celebrity_name && !titleCore.includes(gallery.celebrity_name)) {
      titleCore = `${gallery.celebrity_name} - ${titleCore}`;
    }
    const seoTitle = cleanText(`${titleCore} | फोटो गैलरी - ${ORG_NAME}`, 65);

    // Description: action-oriented, under 155 chars
    // Includes: who, what, count, brand name
    const rawDesc = gallery.description
      ? cleanText(gallery.description, 120)
      : `${gallery.celebrity_name || ''} की ${gallery.event || 'लेटेस्ट'} फोटो गैलरी देखें।`;
    const photoCount = photos.length;
    const seoDesc = cleanText(
      `${rawDesc} ${photoCount} एक्सक्लूसिव फोटो - सिर्फ ${ORG_NAME} पर।`,
      155
    );

    // Keywords
    const keywords = [
      gallery.title,
      gallery.celebrity_name,
      gallery.event,
      gallery.location,
      gallery.fashionCategory,
      'फोटो गैलरी',
      'photo gallery',
      'celebrity photos',
      ORG_NAME,
    ].filter(Boolean).join(', ');

    return {
      title: seoTitle,
      description: seoDesc,
      keywords,

      alternates: {
        canonical: pageUrl,
        languages: { 'hi-IN': pageUrl }
      },

      robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },

      openGraph: {
        type: 'website',
        url: pageUrl,
        siteName: ORG_NAME,
        locale: 'hi_IN',
        title: cleanText(seoTitle, 60),
        description: seoDesc,
        images: coverImg ? [{
          url: coverImg,
          alt: gallery.title,
          width: 1200,
          height: 630,
        }] : [],
      },

      twitter: {
        card: 'summary_large_image',
        // 🔧 FIX: actual handle is @EIndia99460 (x.com/EIndia99460)
        site: '@EIndia99460',
        creator: '@EIndia99460',
        title: cleanText(seoTitle, 60),
        description: cleanText(seoDesc, 150),
        images: coverImg ? [coverImg] : [],
      },

      // Extra meta tags via other
      other: {
        // 🔧 FIX: leading space hata diya + correct Facebook URL
        'article:publisher': 'https://www.facebook.com/profile.php?id=61584375938569',
        ...(gallery.publishedAt && {
          'article:published_time': formatDateISO(gallery.publishedAt),
          'article:modified_time':  formatDateISO(gallery.updatedAt || gallery.publishedAt),
        }),
        ...(gallery.celebrity_name && {
          'article:tag': gallery.celebrity_name,
        }),
      },
    };
  } catch (error) {
    console.error('SEO metadata error:', error);
    return notFound();
  }
}

// ─────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────

export default async function PhotosSlugPage({ params }) {
  const { slug } = await params;

  try {
    const [galleryData, relatedData] = await Promise.all([
      galleriesAPI.getBySlug(slug),
      galleriesAPI.getRelated(slug, 6),
    ]);

    if (!galleryData) return notFound();

    const schema = generateSchema(galleryData, relatedData);

    return (
      <>
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        {/* Visually hidden H1 for SEO — GalleryPage shows decorative title */}
        <h1 className="sr-only">
          {galleryData.title} - फोटो गैलरी | {ORG_NAME}
        </h1>

        <LayoutWrapper>
          <article itemScope itemType="https://schema.org/ImageGallery">
            {/* Microdata helpers — invisible, purely for crawlers */}
            <meta itemProp="name"        content={galleryData.title} />
            <meta itemProp="description" content={
              cleanText(galleryData.description || galleryData.title, 200)
            } />
            {galleryData.publishedAt && (
              <meta itemProp="datePublished" content={formatDateISO(galleryData.publishedAt)} />
            )}
            {galleryData.celebrity_name && (
              <span itemScope itemType="https://schema.org/Person" className="sr-only">
                <meta itemProp="name" content={galleryData.celebrity_name} />
              </span>
            )}

            <GalleryPage
              slug={slug}
              initialGallery={galleryData}
              initialRelated={relatedData}
            />
          </article>
        </LayoutWrapper>
      </>
    );
  } catch (error) {
    console.error('Gallery fetch error:', error);
    return (
      <LayoutWrapper>
        <div className="text-center py-20 px-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ कोई त्रुटि हुई</h2>
          <p className="text-gray-600">
            गैलरी लोड नहीं हो पाई। कृपया कुछ समय बाद पुनः प्रयास करें।
          </p>
          <a
            href="/photos"
            className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            फोटो गैलरी पर वापस जाएं →
          </a>
        </div>
      </LayoutWrapper>
    );
  }
}