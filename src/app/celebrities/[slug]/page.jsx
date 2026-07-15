
import { celebritiesAPI } from '../../../lib/api/celebrities';
import CelebrityProfilePage from '../../../page-components/CelebrityProfilePage';
import LayoutWrapper from '../../LayoutWrapper';
import { notFound } from 'next/navigation';

//  STRICLY SAFE SCHEMA: Valid variables, no wrong or broken URLs
function generateCelebritySchema(celebrity, slug) {
  if (!celebrity) return null;

  const pageUrl = `https://entertainindia.in/celebrities/${slug}`;
  const ogImage = celebrity.avatar?.url || celebrity.Avatar?.url || 'https://entertainindia.in/default-seo-image.jpg';

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${pageUrl}#person`,
    name: celebrity.name,
    url: pageUrl,
    image: ogImage,
    description: celebrity.tagline || `${celebrity.name} ki biography, movies list, photo gallery aur parivaar ki jaankari.`,
    jobTitle: celebrity.professions?.name || 'Celebrity',
    knowsAbout: celebrity.industry?.map(ind => ind.name) || ['Cinema'],
    sameAs: celebrity.social_account?.map(social => social.profileurl).filter(Boolean) || []
  };
}

//  STEP 1: SEO Metadata Generator
export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  try {
    const celebrity = await celebritiesAPI.getBySlug(slug);

    if (!celebrity) {
      return {
        title: 'Celebrity Not Found | EntertainIndia',
        description: 'The requested celebrity profile could not be found.',
        robots: { index: false, follow: false },
      };
    }

    const pageUrl = `https://entertainindia.in/celebrities/${slug}`;
    const ogImage = celebrity.avatar?.url || celebrity.Avatar?.url || 'https://entertainindia.in/default-seo-image.jpg';

    return {
      title: `${celebrity.name} - Biography, Movies, Age & Family Details | EntertainIndia`,
      description: celebrity.tagline || `Detailed profile of ${celebrity.name}. Read about their career journey, latest movies, awards, and personal life.`,
      alternates: { canonical: pageUrl },
      robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
      },
      openGraph: {
        title: `${celebrity.name} | Profile Details`,
        description: celebrity.tagline || `Complete profile of ${celebrity.name}`,
        url: pageUrl,
        siteName: 'EntertainIndia',
        images: [{ url: ogImage, width: 1200, height: 630, alt: celebrity.name }],
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${celebrity.name} | Profile Details`,
        description: celebrity.tagline || `Complete profile of ${celebrity.name}`,
        images: [ogImage],
        site: '@EntertainIndia',
        creator: '@EntertainIndia',
      },
    };
  } catch (error) {
    console.error('Metadata fetch error:', error);
    return {
      title: 'Celebrity Profile | EntertainIndia',
      description: 'View celebrity profile and biography',
      robots: { index: false, follow: false },
    };
  }
}

//  STEP 2: Optimized Main Page Logic (No multiple sub-calls)
export default async function CelebritySlugPage({ params }) {
  const { slug } = await params;

  try {
    //  SINGLE COMPACT CALL: Ek hi request me saara data sorted aur normalized aa jayega
    const [mainCelebrity, allRes] = await Promise.all([
      celebritiesAPI.getDetailedProfile(slug),
      celebritiesAPI.getAll({ page: 1, pageSize: 8 }).catch(() => ({ celebrities: [] }))
    ]);

    if (!mainCelebrity) {
      notFound();
    }

    const schemaData = generateCelebritySchema(mainCelebrity, slug);

    return (
      <>
        {/*  Safe Valid Schema Injection */}
        {schemaData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
          />
        )}
        
        {/*  Clean H1 Accessibility structure */}
        <header className="sr-only">
          <h1>{mainCelebrity.name} - Biography, Movies, and Profile Details</h1>
        </header>
        
        <LayoutWrapper>
          <CelebrityProfilePage
            slug={slug}
            initialData={mainCelebrity} // Kyunki data already unified hai, extra spread structures ki jarurat nahi hai
            allCelebrities={allRes?.celebrities || []}
          />
        </LayoutWrapper>
      </>
    );
  } catch (err) {
    console.error("SEO Fetch Error:", err);
    notFound(); 
  }
}