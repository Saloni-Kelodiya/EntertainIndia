import LayoutWrapper from '../../../LayoutWrapper';
import MovieDetailPage from '../../../../page-components/MovieDetailPage';
import { moviesAPI, movieReviewsAPI } from '../../../../lib/api';
import { notFound, redirect } from 'next/navigation';
import LogoImg from '../../../../app/assets/entertainindia_logo.png';

const SITE_URL    = "https://entertainindia.in";
const STRAPI_URL  = process.env.NEXT_PUBLIC_STRAPI_URL || '';
const ORG_NAME    = "EntertainIndia";
const ORG_NAME_HI = "एंटरटेनइंडिया";
// 🔧 FIX: agar LogoImg.src already absolute hai to double-prefix na ho
const LOGO_URL = LogoImg?.src?.startsWith('http') ? LogoImg.src : `${SITE_URL}${LogoImg?.src || ''}`;
const LOGO_W   = LogoImg?.width || 512;
const LOGO_H   = LogoImg?.height || 512;

export const revalidate = 3600;
export const dynamic    = "force-static";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

// ⚠️ 'korean' is listed here but doesn't appear anywhere in the homepage nav/footer/
// trending links we could find. Please verify /korean and /korean/movies/[slug] are
// real, live routes before shipping — otherwise breadcrumbs for Korean movies will 404.
const VALID_CATEGORIES = ['bollywood', 'hollywood', 'bhojiwood', 'tollywood', 'korean'];

const CATEGORY_HI = {
  bollywood : 'बॉलीवुड',
  hollywood : 'हॉलीवुड',
  bhojiwood : 'भोजपुरी सिनेमा',
  tollywood : 'तेलुगु सिनेमा',
  korean    : 'कोरियन सिनेमा',
};

const CATEGORY_HI_SHORT = {
  bollywood : 'बॉलीवुड',
  hollywood : 'हॉलीवुड',
  bhojiwood : 'भोजपुरी',
  tollywood : 'तेलुगु',
  korean    : 'कोरियन',
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const getActualCategory = (movie) => {
  if (movie?.category?.slug)       return movie.category.slug.toLowerCase();
  if (movie?.categories?.length)   return movie.categories[0].slug.toLowerCase();
  return null;
};

function cleanText(text, maxLen) {
  if (!text) return '';
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length > maxLen ? clean.slice(0, maxLen - 3) + '...' : clean;
}

function toISO(dateStr) {
  if (!dateStr) return null;
  try { return new Date(dateStr).toISOString(); } catch { return null; }
}

// 🔧 FIX: Strapi media URLs aksar relative hote hain ("/uploads/xyz.jpg"). Bina is
// helper ke, woh seedha OG/Twitter/schema mein chala jaata hai — jo crawlers ke liye
// ek invalid/broken URL hai (absolute URL ke bina image fetch nahi ho payegi).
function toAbsoluteUrl(url) {
  if (!url) return '';
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}

// ISO 8601 duration: "PT2H15M" from "135 min" or "2h 15m"
function parseDuration(raw) {
  if (!raw) return undefined;
  const str = String(raw);
  // Already ISO
  if (str.startsWith('PT')) return str;
  // "135 min" or "135"
  const minMatch = str.match(/(\d+)\s*(?:min|m)/i);
  const hrMatch  = str.match(/(\d+)\s*(?:hr|h)/i);
  const totalMin = (hrMatch ? parseInt(hrMatch[1]) * 60 : 0) +
                   (minMatch ? parseInt(minMatch[1]) : (!hrMatch ? parseInt(str) || 0 : 0));
  if (!totalMin) return undefined;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h ? `PT${h}H${m > 0 ? m + 'M' : ''}` : `PT${m}M`;
}

// ─────────────────────────────────────────────────────────────
// SCHEMA GENERATOR
// ─────────────────────────────────────────────────────────────

function generateMovieSchema(movie, actualCategory, slug, reviews = []) {
  const pageUrl  = `${SITE_URL}/${actualCategory}/movies/${slug}`;
  const poster   = toAbsoluteUrl(movie.poster?.url || movie.backdrop?.url || '');
  const backdrop = toAbsoluteUrl(movie.backdrop?.url || '');
  const pubDate  = toISO(movie.publishedAt || movie.createdAt);
  const modDate  = toISO(movie.updatedAt   || movie.publishedAt);
  const relDate  = toISO(movie.releaseDate);
  const catHI    = CATEGORY_HI[actualCategory] || actualCategory;
  const desc     = cleanText(
    movie.description || movie.synopsis || `${movie.title} फिल्म की पूरी जानकारी।`,
    300
  );

  // ── 1. Organization ──────────────────────────────────────
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
      "caption": ORG_NAME,
    },
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61584375938569",
      "https://www.instagram.com/entertainindiaofficial/",
      "https://x.com/EIndia99460",
      "https://www.youtube.com/@EIndiaofficial"
    ],
  };

  // ── 2. WebSite ───────────────────────────────────────────
  // 🔧 FIX: SearchAction hata diya — entertainindia.in par /search route exist nahi
  // karta, isse Google sitelinks search box ek 404 page khol deta.
  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "url": SITE_URL,
    "name": ORG_NAME,
    "alternateName": ORG_NAME_HI,
    "inLanguage": "hi-IN",
    "publisher": { "@id": `${SITE_URL}/#organization` },
  };

  // ── 3. BreadcrumbList ────────────────────────────────────
  const breadcrumb = {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "होम",    "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": catHI,    "item": `${SITE_URL}/${actualCategory}` },
      { "@type": "ListItem", "position": 3, "name": "मूवीज़", "item": `${SITE_URL}/${actualCategory}/movies` },
      { "@type": "ListItem", "position": 4, "name": cleanText(movie.title, 50), "item": pageUrl },
    ],
  };

  // ── 4. Movie (main rich result) ──────────────────────────
  const directors = (movie.crew || [])
    .filter(c => c.role?.toLowerCase().includes('director') || c.job?.toLowerCase().includes('director'))
    .map(d => ({ "@type": "Person", "name": d.name }));

  // Also check flat director field
  if (!directors.length && movie.director) {
    directors.push({ "@type": "Person", "name": movie.director });
  }

  const actors = (movie.cast || []).slice(0, 15).map(a => ({
    "@type": "Person",
    "name": a.name || a.celebrities_profile?.name || '',
    ...(a.celebrities_profile?.Avatar?.url && {
      "image": toAbsoluteUrl(a.celebrities_profile.Avatar.url), // 🔧 FIX
    }),
  })).filter(a => a.name);

  const musicBy = (movie.crew || [])
    .filter(c => c.role?.toLowerCase().includes('music') || c.role?.toLowerCase().includes('composer'))
    .map(c => ({ "@type": "Person", "name": c.name }));

  const producedBy = (movie.crew || [])
    .filter(c => c.role?.toLowerCase().includes('producer'))
    .map(c => ({ "@type": "Person", "name": c.name }));

  // AggregateRating — only add if we have real data
  const aggregateRating = (() => {
    const val = parseFloat(movie.rating);
    const cnt = parseInt(movie.totalVotes || 0);
    if (!val || val <= 0) return undefined;
    return {
      "@type": "AggregateRating",
      "ratingValue": val.toFixed(1),
      "bestRating": "10",
      "worstRating": "1",
      "ratingCount": cnt > 0 ? cnt : 1,
    };
  })();

  // User reviews → Review schema (first 5)
  const reviewSchemas = reviews.slice(0, 5).map(r => ({
    "@type": "Review",
    "author": { "@type": "Person", "name": r.username || "दर्शक" },
    "reviewBody": cleanText(r.comment, 500),
    ...(r.rating && {
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": r.rating,
        "bestRating": "10",
        "worstRating": "1",
      },
    }),
    ...(r.createdAt && { "datePublished": toISO(r.createdAt) }),
  })).filter(r => r.reviewBody);

  // Genres
  const genres = (movie.genres || []).map(g => g.name).filter(Boolean);

  // Box office → potentialAction / offers hint via description
  const boxOffice = movie.boxOffice;

  const movieSchema = {
    "@type": "Movie",
    "@id": `${pageUrl}#movie`,
    "name": movie.title,
    "headline": cleanText(movie.title, 110),
    "url": pageUrl,
    "description": desc,
    "inLanguage": "hi-IN",
    ...(relDate && { "datePublished": relDate }),
    ...(pubDate && !relDate && { "datePublished": pubDate }),
    ...(modDate && { "dateModified": modDate }),

    // Images — Google needs at least 1 image for rich result
    "image": [
      ...(poster   ? [poster]   : []),
      ...(backdrop ? [backdrop] : []),
    ].filter(Boolean),

    // People
    ...(directors.length  && { "director":  directors }),
    ...(actors.length     && { "actor":     actors }),
    ...(musicBy.length    && { "musicBy":   musicBy }),
    ...(producedBy.length && { "producer":  producedBy }),

    // Classification
    ...(genres.length && { "genre": genres }),
    ...(movie.certificate && { "contentRating": movie.certificate }),
    ...(parseDuration(movie.duration) && { "duration": parseDuration(movie.duration) }),

    // Country / language
    ...(movie.country  && { "countryOfOrigin": { "@type": "Country", "name": movie.country } }),
    ...(movie.language && { "inLanguage": movie.language }),

    // Ratings
    ...(aggregateRating && { "aggregateRating": aggregateRating }),
    ...(reviewSchemas.length && { "review": reviewSchemas }),

    // Where to watch → potentialAction
    ...(movie.whereToWatch?.length && {
      "potentialAction": movie.whereToWatch
        .filter(w => w.url)
        .map(w => ({
          "@type": "WatchAction",
          "target": w.url,
          "actionAccessibilityRequirement": {
            "@type": "ActionAccessSpecification",
            "category": w.status?.toLowerCase().includes('free') ? "Free" : "Subscription",
            "availabilityStarts": relDate || undefined,
          },
        })),
    }),

    // Box office as description addon (no official schema field)
    ...(boxOffice?.worldwideCollection && {
      "description": `${desc} | वर्ल्डवाइड कलेक्शन: ${boxOffice.worldwideCollection}`,
    }),

    // Awards
    ...(movie.award?.length && {
      "award": movie.award
        .filter(a => a.awardStatus === 'Won')
        .map(a => `${a.name} - ${a.title} (${a.year || ''})`)
        .filter(Boolean),
    }),

    // 🔧 FIX: pointless empty "sameAs": [] hata diya jab similarMovies hote hain bhi
    // — empty array koi value add nahi karta, schema validators ko bhi confuse karta hai

    "publisher": { "@id": `${SITE_URL}/#organization` },
    "isPartOf":  { "@id": `${SITE_URL}/#website` },
  };

  // ── 5. WebPage ───────────────────────────────────────────
  const webpage = {
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    "url": pageUrl,
    "name": cleanText(`${movie.title} (${movie.year || ''}) | ${catHI} मूवी - ${ORG_NAME}`, 65),
    "description": cleanText(desc, 200),
    "inLanguage": "hi-IN",
    "isPartOf":   { "@id": `${SITE_URL}/#website` },
    "breadcrumb": { "@id": `${pageUrl}#breadcrumb` },
    ...(poster && { "primaryImageOfPage": { "@type": "ImageObject", "url": poster } }),
    ...(pubDate && { "datePublished": pubDate }),
    ...(modDate && { "dateModified":  modDate }),
    "author":    { "@id": `${SITE_URL}/#organization` },
    "publisher": { "@id": `${SITE_URL}/#organization` },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".movie-description", ".movie-tagline"],
    },
  };

  // ── 6. VideoObject (trailer) ─────────────────────────────
  // 🔧 FIX: maxresdefault.jpg doesn't exist for every YouTube video — YouTube returns
  // a tiny 120x90 grey placeholder instead of a 404, which can fail Google's rich
  // result image-size requirement. hqdefault.jpg is guaranteed to exist for virtually
  // every uploaded video, so it's a safer default thumbnail.
  const videoObject = movie.trailer_id ? {
    "@type": "VideoObject",
    "@id": `${pageUrl}#trailer`,
    "name": `${movie.title} - Official Trailer`,
    "description": cleanText(`${movie.title} का ऑफिशियल ट्रेलर`, 200),
    "thumbnailUrl": `https://img.youtube.com/vi/${movie.trailer_id}/hqdefault.jpg`,
    "embedUrl": `https://www.youtube.com/embed/${movie.trailer_id}`,
    "uploadDate": relDate || pubDate || new Date().toISOString(),
    "publisher": { "@id": `${SITE_URL}/#organization` },
  } : null;

  const graph = [organization, website, breadcrumb, movieSchema, webpage];
  if (videoObject) graph.push(videoObject);

  return { "@context": "https://schema.org", "@graph": graph };
}

// ─────────────────────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { slug, category } = await params;

  if (!VALID_CATEGORIES.includes(category)) {
    return { title: "पेज नहीं मिला | एंटरटेनइंडिया", robots: { index: false } };
  }

  try {
    const movie = await moviesAPI.getBySlug(slug);
    if (!movie) return { title: "मूवी नहीं मिली | एंटरटेनइंडिया", robots: { index: false } };

    const actualCategory = getActualCategory(movie);
    const catShort = CATEGORY_HI_SHORT[actualCategory] || actualCategory;
    const pageUrl  = `${SITE_URL}/${actualCategory}/movies/${slug}`;
    const poster   = toAbsoluteUrl(movie.poster?.url || movie.backdrop?.url || ''); // 🔧 FIX
    const year     = movie.year || (movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '');
    const genres   = (movie.genres || []).map(g => g.name).filter(Boolean).slice(0, 3).join(', ');

    // Title — "Stree 2 (2024) Cast, Review, Box Office | Bollywood | EntertainIndia"
    const titleCore = year ? `${movie.title} (${year})` : movie.title;
    const seoTitle  = cleanText(
      `${titleCore} कास्ट, रिव्यू, बॉक्स ऑफिस | ${catShort} | ${ORG_NAME}`,
      65
    );

    // Description — action-oriented with key facts
    const baseDesc = movie.description || movie.synopsis || movie.tagline || '';
    const castNames = (movie.cast || []).slice(0, 3).map(c => c.name).filter(Boolean).join(', ');
    const dirName   = movie.director || (movie.crew || []).find(c =>
      c.role?.toLowerCase().includes('director')
    )?.name || '';

    const descParts = [
      baseDesc ? cleanText(baseDesc, 80) : '',
      dirName  ? `निर्देशक: ${dirName}।` : '',
      castNames ? `कास्ट: ${castNames}।` : '',
      genres   ? `जॉनर: ${genres}।` : '',
    ].filter(Boolean);

    const seoDesc = cleanText(
      descParts.join(' ') || `${movie.title} फिल्म की पूरी जानकारी हिंदी में पढ़ें।`,
      155
    );

    // Keywords — movie-specific
    const keywords = [
      movie.title,
      `${movie.title} ${year}`,
      `${movie.title} कास्ट`,
      `${movie.title} रिव्यू`,
      `${movie.title} बॉक्स ऑफिस`,
      `${movie.title} ट्रेलर`,
      dirName && `${dirName} मूवी`,
      catShort + ' फिल्में',
      genres,
      ORG_NAME,
    ].filter(Boolean).join(', ');

    return {
      title: seoTitle,
      description: seoDesc,
      keywords,

      alternates: {
        canonical: pageUrl,
        languages: { 'hi-IN': pageUrl },
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
        type: 'video.movie',
        url: pageUrl,
        siteName: ORG_NAME,
        locale: 'hi_IN',
        title: cleanText(seoTitle, 60),
        description: seoDesc,
        images: poster ? [{
          url: poster,
          alt: `${movie.title} पोस्टर`,
          width: 1200,
          height: 630,
        }] : [],
        ...(movie.releaseDate && { releaseDate: movie.releaseDate }),
      },

      twitter: {
        card: 'summary_large_image',
        // 🔧 FIX: actual X/Twitter handle is @EIndia99460 (x.com/EIndia99460),
        // not @entertainindia
        site: '@EIndia99460',
        creator: '@EIndia99460',
        title: cleanText(seoTitle, 60),
        description: cleanText(seoDesc, 150),
        images: poster ? [poster] : [],
      },

      other: {
        // 🔧 FIX: correct Facebook URL (verified from live site footer)
        'article:publisher': 'https://www.facebook.com/profile.php?id=61584375938569',
        ...(movie.publishedAt && {
          'article:published_time': toISO(movie.publishedAt),
          'article:modified_time':  toISO(movie.updatedAt || movie.publishedAt),
        }),
        ...(movie.title && { 'article:tag': movie.title }),
      },
    };
  } catch (error) {
    console.error("SEO Metadata Error:", error);
    return {
      title: "मूवी डिटेल्स | एंटरटेनइंडिया",
      description: "बॉलीवुड, हॉलीवुड और अन्य फिल्मों की पूरी जानकारी हिंदी में पढ़ें।",
      robots: { index: false },
    };
  }
}

// ─────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────

export default async function CategoryMoviePage({ params }) {
  const { slug, category } = await params;

  if (!VALID_CATEGORIES.includes(category)) return notFound();

  try {
    const [movieData, initialReviews] = await Promise.all([
      moviesAPI.getCompleteMovieDetails(slug),
      movieReviewsAPI.getByMovie(slug).catch(() => []),
    ]);

    if (!movieData?.movie) return notFound();

    const actualCategory = getActualCategory(movieData.movie);
    if (!actualCategory) return notFound();

    // Wrong category → redirect to correct one
    if (actualCategory.toLowerCase() !== category.toLowerCase()) {
      return redirect(`/${actualCategory}/movies/${slug}`);
    }

    const serverData = {
      ...movieData.movie,
      cast:         movieData.cast         || [],
      crew:         movieData.crew         || [],
      articles:     movieData.articles     || [],
      similarMovies: movieData.similarMovies || [],
    };

    const schema = generateMovieSchema(serverData, actualCategory, slug, initialReviews);

    return (
      <>
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        {/* Visually hidden H1 */}
        <h1 className="sr-only">
          {serverData.title}
          {serverData.year ? ` (${serverData.year})` : ''} - {CATEGORY_HI[actualCategory]} मूवी | {ORG_NAME}
        </h1>

        <LayoutWrapper>
          <article
            itemScope
            itemType="https://schema.org/Movie"
          >
            {/* Microdata — invisible, for crawlers */}
            <meta itemProp="name"        content={serverData.title} />
            <meta itemProp="description" content={cleanText(serverData.description || serverData.synopsis || serverData.title, 200)} />
            {serverData.poster?.url   && <meta itemProp="image"         content={toAbsoluteUrl(serverData.poster.url)} />}
            {serverData.releaseDate   && <meta itemProp="datePublished"  content={toISO(serverData.releaseDate)} />}
            {serverData.director      && <meta itemProp="director"       content={serverData.director} />}
            {serverData.certificate   && <meta itemProp="contentRating"  content={serverData.certificate} />}
            {parseDuration(serverData.duration) && (
              <meta itemProp="duration" content={parseDuration(serverData.duration)} />
            )}

            <MovieDetailPage
              serverSlug={slug}
              serverCategory={actualCategory}
              initialData={serverData}
              initialReviews={initialReviews}
            />
          </article>
        </LayoutWrapper>
      </>
    );
  } catch (error) {
    console.error("Movie page error:", error);
    return notFound();
  }
}