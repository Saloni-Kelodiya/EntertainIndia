// lib/api/search.js

const DEFAULT_URL = 'https://13.201.143.7:1337';

function getStrapiURL() {
  return process.env.STRAPI_BACKEND_URL || DEFAULT_URL;
}

async function fetchStrapi(endpoint, params = {}) {
  const base = getStrapiURL();
  const url = new URL(`${base}/api/${endpoint}`);

  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Strapi error: ${res.status} ${res.statusText}`);
  return res.json();
}

// ─── 1. सेलिब्रिटी ───────────────────────────────────────
export async function searchCelebrities(query, { limit = 8, offset = 0 } = {}) {
  const data = await fetchStrapi('celebrities-profiles', {
    'filters[language][$eq]': 'hi',
    'filters[$or][0][name][$containsi]': query,
    'filters[$or][1][Slug][$containsi]': query,
    'fields[0]': 'name',
    'fields[1]': 'Slug',
    'sort[0]': 'createdAt:desc',  // ✅ FIX: latest pehle
    'populate[Avatar][fields][0]': 'url',
    'populate[professions][fields][0]': 'profession_Field',
    'pagination[pageSize]': limit,
    'pagination[page]': Math.floor(offset / limit) + 1,
  });

  return (data.data || []).map((item) => {
    const d = item.attributes || item;
    const avatarRaw = d.Avatar?.data ? d.Avatar.data.attributes : d.Avatar;
    const avatarUrl = avatarRaw?.url || null;

    const profList = Array.isArray(d.professions)
      ? d.professions
      : (d.professions?.data || []);
    const firstProf = profList[0];
    const profData = firstProf?.attributes || firstProf;

    return {
      id: item.id,
      name: d.name || '',
      slug: d.Slug || d.slug || '',
      avatar: avatarUrl,
      profession: profData?.profession_Field || null,
    };
  });
}

// ─── 2. फिल्में ───────────────────────────────────────────
export async function searchMovies(query, { limit = 8, offset = 0 } = {}) {
  const data = await fetchStrapi('movies', {
    'filters[language][$eq]': 'hi',
    'filters[$or][0][title][$containsi]': query,
    'filters[$or][1][slug][$containsi]': query,
    'fields[0]': 'title',
    'fields[1]': 'slug',
    'fields[2]': 'releaseDate',
    'sort[0]': 'createdAt:desc',  // ✅ FIX: latest pehle
    'populate[poster][fields][0]': 'url',
    'populate[category][fields][0]': 'slug',
    'pagination[pageSize]': limit,
    'pagination[page]': Math.floor(offset / limit) + 1,
  });

  return (data.data || []).map((item) => {
    const d = item.attributes || item;
    // Strapi v5 flat — poster.url directly
    const posterRaw = d.poster?.data ? d.poster.data.attributes : d.poster;

    return {
      id: item.id,
      title: d.title || '',
      slug: d.slug || '',
      releaseDate: d.releaseDate || null,
      poster: posterRaw?.url || null,
      categorySlug: (() => {
        const cat = d.category?.data?.attributes || d.category;
        return cat?.slug ;
      })(),
    };
  });
}

// ─── 3. गैलरी (फोटो) ─────────────────────────────────────
export async function searchGalleries(query, { limit = 8, offset = 0 } = {}) {
  const data = await fetchStrapi('galleries', {
    'filters[language][$eq]': 'hi',
    'filters[$or][0][title][$containsi]': query,
    'filters[$or][1][slug][$containsi]': query,
    'filters[$or][2][description][$containsi]': query,
    'fields[0]': 'title',
    'fields[1]': 'slug',
    'fields[2]': 'description',
    'sort[0]': 'createdAt:desc',
    // Populate the gallery's cover image, not photos
    'populate[image][fields][0]': 'url',
    // or just rely on the default population? but we need to include image fields.
    'pagination[pageSize]': limit,
    'pagination[page]': Math.floor(offset / limit) + 1,
  });

  return (data.data || []).map((item) => {
    const d = item.attributes || item;
    // Use the gallery's own image
    let coverUrl = null;
    const img = d.image;
    if (img?.url) {
      coverUrl = img.url;
    } else if (img?.formats?.thumbnail?.url) {
      coverUrl = img.formats.thumbnail.url;
    } else if (img?.data?.attributes?.url) {
      coverUrl = img.data.attributes.url;
    }

    return {
      id: item.id,
      title: d.title || '',
      slug: d.slug || d.Slug || '',
      image: coverUrl,
    };
  });
}

// ─── 4. लेख (articles) - सिर्फ MainCategory = 'article' ──
export async function searchArticles(query, { limit = 8, offset = 0 } = {}) {
  const params = {
    'filters[language][$eq]': 'hi',
    'filters[moderation_status][$eq]': 'published',
    'filters[$and][0][$or][0][title][$containsi]': query,
    'filters[$and][0][$or][1][summary][$containsi]': query,
    'filters[$and][0][$or][2][slug][$containsi]': query,
    // ← सिर्फ article type के articles
    'filters[$and][1][MainCategory][$eqi]': 'article',
    'fields[0]': 'title',
    'fields[1]': 'slug',
    'fields[2]': 'MainCategory',
    'fields[3]': 'createdAt',
    'fields[4]': 'h1_title',
    'sort[0]': 'createdAt:desc',  // ✅ FIX: latest pehle
    'populate[hero_image][fields][0]': 'url',
    'pagination[pageSize]': limit,
    'pagination[page]': Math.floor(offset / limit) + 1,
  };

  const res = await fetchStrapi('articles', params);

  return (res.data || []).map((item) => {
    const d = item.attributes || item;
    const imgRaw = d.hero_image?.data ? d.hero_image.data.attributes : d.hero_image;

    return {
      id: item.id,
      title: d.title || '',
      slug: d.slug || '',
      mainCategory: d.MainCategory || d.mainCategory,
      heroImage: imgRaw?.url || null,
      publishedAt: d.createdAt || null,
    };
  });
}

// ─── 5. समाचार - सिर्फ MainCategory = 'news' ─────────────
export async function searchNews(query, { limit = 8, offset = 0 } = {}) {
  const params = {
    'filters[language][$eq]': 'hi',
    'filters[moderation_status][$eq]': 'published',
    'filters[$and][0][$or][0][title][$containsi]': query,
    'filters[$and][0][$or][1][summary][$containsi]': query,
    'filters[$and][0][$or][2][slug][$containsi]': query,
    // ← सिर्फ news type के articles, $eqi = case-insensitive
    'filters[$and][1][MainCategory][$eqi]': 'news',
    'fields[0]': 'title',
    'fields[1]': 'slug',
    'fields[2]': 'MainCategory',
    'fields[3]': 'createdAt',
    'fields[4]': 'h1_title',
    'sort[0]': 'createdAt:desc',  // ✅ FIX: latest pehle
    'populate[hero_image][fields][0]': 'url',
    'pagination[pageSize]': limit,
    'pagination[page]': Math.floor(offset / limit) + 1,
  };

  const res = await fetchStrapi('articles', params);

  return (res.data || []).map((item) => {
    const d = item.attributes || item;
    const imgRaw = d.hero_image?.data ? d.hero_image.data.attributes : d.hero_image;

    return {
      id: item.id,
      title: d.title || '',
      slug: d.slug || '',
      mainCategory: d.MainCategory || d.mainCategory ,
      heroImage: imgRaw?.url || null,
      publishedAt: d.createdAt || null,
    };
  });
}

// ─── 6. टीवी शो ──────────────────────────────────────────
// ✅ Correct endpoint: /shows (from tvShowsAPI)
export async function searchTvShows(query, { limit = 8, offset = 0 } = {}) {
  const data = await fetchStrapi('shows', {
    'filters[language][$eq]': 'hi',
    'filters[$or][0][title][$containsi]': query,
    'filters[$or][1][slug][$containsi]': query,
    'fields[0]': 'title',
    'fields[1]': 'slug',
    'fields[2]': 'realeaseDate',   // ← typo in your Strapi schema (realeaseDate)
    'sort[0]': 'createdAt:desc',  // ✅ FIX: latest pehle
    'populate[poster][fields][0]': 'url',
    'pagination[pageSize]': limit,
    'pagination[page]': Math.floor(offset / limit) + 1,
  });

  return (data.data || []).map((item) => {
    const d = item.attributes || item;
    const posterRaw = d.poster?.data ? d.poster.data.attributes : d.poster;

    return {
      id: item.id,
      title: d.title || '',
      slug: d.slug || '',
      releaseDate: d.realeaseDate || null,
      poster: posterRaw?.url || null,
      categorySlug: 'tv',
    };
  });
}

// ─── 7. वेब सीरीज ────────────────────────────────────────
// ✅ Correct endpoint: /web-series-collections (from webSeriesAPI)
export async function searchWebSeries(query, { limit = 8, offset = 0 } = {}) {
  const data = await fetchStrapi('web-series-collections', {
    'filters[language][$eq]': 'hi',
    'filters[$or][0][title][$containsi]': query,
    'filters[$or][1][slug][$containsi]': query,
    'fields[0]': 'title',
    'fields[1]': 'slug',
    'fields[2]': 'releaseDate',
    'sort[0]': 'createdAt:desc',  // ✅ FIX: latest pehle
    'populate[poster][fields][0]': 'url',
    'pagination[pageSize]': limit,
    'pagination[page]': Math.floor(offset / limit) + 1,
  });

  return (data.data || []).map((item) => {
    const d = item.attributes || item;
    const posterRaw = d.poster?.data ? d.poster.data.attributes : d.poster;

    return {
      id: item.id,
      title: d.title || '',
      slug: d.slug || '',
      releaseDate: d.releaseDate || null,
      poster: posterRaw?.url || null,
      categorySlug: 'ott',
    };
  });
}

// ─── 8. वीडियो ────────────────────────────────────────────
export async function searchVideos(query, { limit = 8, offset = 0 } = {}) {
  const data = await fetchStrapi('videos', {
    'filters[language][$eq]': 'hi',
    'filters[$or][0][title][$containsi]': query,
    'filters[$or][1][slug][$containsi]': query,
    'fields[0]': 'title',
    'fields[1]': 'slug',
    'fields[2]': 'duration',
    'fields[3]': 'videotype',
    'fields[4]': 'video_id',     // ← YouTube ID to build thumbnail
    'sort[0]': 'createdAt:desc',  // ✅ FIX: latest pehle
    'pagination[pageSize]': limit,
    'pagination[page]': Math.floor(offset / limit) + 1,
  });

  return (data.data || []).map((item) => {
    const d = item.attributes || item;
    // thumbnail is a YouTube URL built from video_id, not a media relation
    const videoId = d.video_id || null;

    return {
      id: item.id,
      title: d.title || '',
      slug: d.slug || '',
      duration: d.duration || null,
      videotype: d.videotype || '',
      thumbnail: videoId
        ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
        : null,
    };
  });
}

export async function searchSongs(query, { limit = 8, offset = 0 } = {}) {
  

  const data = await fetchStrapi('songs', {
    'filters[$and][0][language][$eq]': 'hi',
    'filters[$and][1][$or][0][title][$containsi]': query,
    'filters[$and][1][$or][1][slug][$containsi]': query,
    'filters[$and][1][$or][2][album][$containsi]': query,
    'fields[0]': 'title',
    'fields[1]': 'slug',
    'fields[2]': 'duration',
    'sort[0]': 'createdAt:desc',
    'populate[thumbnail][fields][0]': 'url',
    'populate[thumbnail][fields][1]': 'formats',
    'populate[categories][fields][0]': 'name',
    'populate[categories][fields][1]': 'slug',
    'pagination[pageSize]': limit,
  });

  

  const mapped = (data.data || []).map((item) => {
    const d = item.attributes || item;



    const thumb = d.thumbnail;
    let thumbnailUrl = null;
    if (thumb?.url) {
      thumbnailUrl = thumb.url;
    } else if (thumb?.formats?.thumbnail?.url) {
      thumbnailUrl = thumb.formats.thumbnail.url;
    }

    // ✅ Extract categories from the current item (d.categories)
    const categories = d.categories || [];
    const categorySlug = Array.isArray(categories)
      ? categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
        }))
      : [];

    const result = {
      id: item.id,
      title: d.title || '',
      slug: d.slug || '',
      duration: d.duration || null,
      thumbnail: thumbnailUrl,
      categorySlug, // now correctly populated
    };

    return result;
  });

  return mapped;
}