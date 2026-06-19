export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in';
  
  return [
    {
      url: `${baseUrl}/sitemap/pages.xml`,
      lastModified: new Date(),
    },
      {
      url: `${baseUrl}/news-sitemap.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap/articles.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap/news.xml`,
      lastModified: new Date(),
    },
  
    {
      url: `${baseUrl}/sitemap/videos.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap/photos.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap/web-stories.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap/celebrities.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap/movies.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap/tags.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap/authors.xml`,
      lastModified: new Date(),
    },
     {
      url: `${baseUrl}/sitemap/music.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap/web-series.xml`,
      lastModified: new Date(),
    },
     {
      url: `${baseUrl}/sitemap/tv-shows.xml`,
      lastModified: new Date(),
    },
     
  ];
}
