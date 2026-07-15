export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in';
  const STRAPI_URL = process.env.STRAPI_URL || 'https://13.201.143.7:1337';

  const articleStartYear = 2026;
  const currentYear = new Date().getFullYear();
  // const currentYear=2027;

  // ---------- Articles & News (hardcoded start year) ----------
  const completedArticleYears = [];
  for (let year = articleStartYear; year < currentYear; year++) {
    completedArticleYears.push(year);
  }

  const articleYearSitemaps = completedArticleYears.flatMap((year) => [
    {
      url: `${baseUrl}/sitemap/articles/${year}.xml`,
      lastModified: new Date(`${year}-12-31`),
    },
    {
      url: `${baseUrl}/sitemap/news/${year}.xml`,
      lastModified: new Date(`${year}-12-31`),
    },
  ]);

  // ---------- Helper: fetch years from any content type ----------
  async function fetchYearsFromEndpoint(endpoint, filterLanguage = true) {
    try {
      const params = new URLSearchParams({
        'filters[publishedAt][$notNull]': 'true',
        'pagination[pageSize]': '1000',
        'fields[0]': 'createdAt',
      });
      if (filterLanguage) {
        params.append('filters[language][$eq]', 'hi');
      }

      const res = await fetch(`${STRAPI_URL}${endpoint}?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) return [];

      const data = await res.json();
      const items = data.data || [];
      const yearsSet = new Set();

      items.forEach((item) => {
        const createdAt = item.createdAt || item.attributes?.createdAt;
        if (createdAt) {
          const year = new Date(createdAt).getFullYear();
          if (!isNaN(year)) yearsSet.add(year);
        }
      });

      return Array.from(yearsSet)
        .filter((year) => year < currentYear) // only completed years
        .sort((a, b) => b - a);
    } catch (error) {
      console.error(`Error fetching years from ${endpoint}:`, error.message);
      return [];
    }
  }

  // ---------- Movies ----------
  const movieYears = await fetchYearsFromEndpoint('/api/movies', true);
  const movieYearSitemaps = movieYears.map((year) => ({
    url: `${baseUrl}/sitemap/movies/${year}.xml`,
    lastModified: new Date(`${year}-12-31`),
  }));

  // ---------- Music (Songs) ----------
  const musicYears = await fetchYearsFromEndpoint('/api/songs', true);
  const musicYearSitemaps = musicYears.map((year) => ({
    url: `${baseUrl}/sitemap/music/${year}.xml`,
    lastModified: new Date(`${year}-12-31`),
  }));

  // ---------- TV Shows ----------
  const tvShowYears = await fetchYearsFromEndpoint('/api/shows', true);
  const tvShowYearSitemaps = tvShowYears.map((year) => ({
    url: `${baseUrl}/sitemap/tv-shows/${year}.xml`,
    lastModified: new Date(`${year}-12-31`),
  }));

  // ---------- Web Series ----------
  const webSeriesYears = await fetchYearsFromEndpoint('/api/web-series-collections', true);
  const webSeriesYearSitemaps = webSeriesYears.map((year) => ({
    url: `${baseUrl}/sitemap/web-series/${year}.xml`,
    lastModified: new Date(`${year}-12-31`),
  }));

  // ---------- Web Stories ----------
  const webStoryYears = await fetchYearsFromEndpoint('/api/web-stories', true);
  const webStoryYearSitemaps = webStoryYears.map((year) => ({
    url: `${baseUrl}/sitemap/web-stories/${year}.xml`,
    lastModified: new Date(`${year}-12-31`),
  }));

  // ---------- Photos ----------
  const photoYears = await fetchYearsFromEndpoint('/api/galleries', false); // no language filter
  const photoYearSitemaps = photoYears.map((year) => ({
    url: `${baseUrl}/sitemap/photos/${year}.xml`,
    lastModified: new Date(`${year}-12-31`),
  }));

  // ---------- Videos ----------
  const videoYears = await fetchYearsFromEndpoint('/api/videos', false); // no language filter
  const videoYearSitemaps = videoYears.map((year) => ({
    url: `${baseUrl}/sitemap/videos/${year}.xml`,
    lastModified: new Date(`${year}-12-31`),
  }));
// ---------- Celebrities ----------
const celebrityYears = await fetchYearsFromEndpoint('/api/celebrities-profiles', true);
const celebrityYearSitemaps = celebrityYears.map((year) => ({
  url: `${baseUrl}/sitemap/celebrities/${year}.xml`,
  lastModified: new Date(`${year}-12-31`),
}));
  // ---------- Static sitemaps (index entries) ----------
  const staticSitemaps = [
    { url: `${baseUrl}/sitemap/pages.xml`, lastModified: new Date() },
    { url: `${baseUrl}/news-sitemap.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemap/articles.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemap/news.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemap/videos.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemap/photos.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemap/web-stories.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemap/celebrities.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemap/movies.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemap/tags.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemap/authors.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemap/music.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemap/web-series.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemap/tv-shows.xml`, lastModified: new Date() },
  ];

  // ---------- Combine all ----------
  return [
    ...staticSitemaps,
    ...articleYearSitemaps,
    ...movieYearSitemaps,
    ...musicYearSitemaps,
    ...tvShowYearSitemaps,
    ...webSeriesYearSitemaps,
    ...webStoryYearSitemaps,
    ...photoYearSitemaps,
    ...videoYearSitemaps,
  ];
}