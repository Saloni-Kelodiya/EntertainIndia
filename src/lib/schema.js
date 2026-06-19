// =============================================
// 1. आर्टिकल/न्यूज स्कीमा (पूरी तरह हिंदी में)
// =============================================
export function generateUniversalSchemas(article, siteUrl = 'https://entertainindia.in') {
  if (!article) return null;

  const author = article.Authors;
  const articleUrl = `${siteUrl}/article/${article.slug}`;
  const imageUrl = article.heroImage?.url || article.hero_image?.url || `${siteUrl}/default-share-image.jpg`;
  const isNews = (article.MainCategory || article.mainCategory)?.toLowerCase() === 'news';
  const mainCategory = article.MainCategory || article.mainCategory || "ब्लॉग";
  const categorySlug = (article.MainCategory || article.mainCategory || "blog").toLowerCase().replace(/\s+/g, '-');

  const schemas = [];

  // 1️⃣ संगठन स्कीमा
  schemas.push({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    "name": "एंटरटेनइंडिया",
    "url": siteUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${siteUrl}/logo.png`,
      "width": 120,
      "height": 120
    },
    "sameAs": [
      "https://www.instagram.com/entertainindiaofficial",
      "https://x.com/EIndia99460",
      " https://www.facebook.com/profile.php?id=61584375938569"
    ]
  });

  // 2️⃣ वेबपेज स्कीमा
  schemas.push({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${articleUrl}#webpage`,
    "url": articleUrl,
    "name": article.h1_title || article.title,
    "inLanguage": "hi-IN",
    "isPartOf": {
      "@id": `${siteUrl}/#website`
    }
  });

  // 3️⃣ ब्रेडक्रंब स्कीमा (हिंदी - सही स्ट्रक्चर के साथ)
  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${articleUrl}#breadcrumb`,
    "itemListElement": [
      { 
        "@type": "ListItem", 
        "position": 1, 
        "name": "होम", 
        "item": siteUrl 
      },
      { 
        "@type": "ListItem", 
        "position": 2, 
        "name": mainCategory, 
        "item": `${siteUrl}/category/${categorySlug}` 
      },
      { 
        "@type": "ListItem", 
        "position": 3, 
        "name": article.title, 
        "item": articleUrl 
      }
    ]
  });

  // 4️⃣ आर्टिकल स्कीमा (हिंदी में)
  schemas.push({
    "@context": "https://schema.org",
    "@type": isNews ? "NewsArticle" : "Article",
    "@id": `${articleUrl}#article`,
    "headline": article.h1_title || article.title,
    "alternativeHeadline": article.metaDescription || article.meta_description || article.summary,
    "description": article.metaDescription || article.meta_description || article.summary,
    "datePublished": article.publishDate || article.publish_datetime || article.createdAt,
    "dateModified": article.updatedAt || article.publishDate || article.createdAt,
    "dateCreated": article.createdAt || article.publishDate,
    "isAccessibleForFree": true,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${articleUrl}#webpage`
    },
    "image": {
      "@type": "ImageObject",
      "url": imageUrl,
      "width": 1280,
      "height": 720
    },
    "author": {
      "@type": "Person",
      "name": author?.name || author?.username || "एंटरटेनइंडिया टीम",
      "url": author?.username ? `${siteUrl}/author/${author.username}` : siteUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "एंटरटेनइंडिया",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`,
        "width": 120,
        "height": 120
      }
    },
    "articleSection": mainCategory,
    "keywords": article.tags?.join(", ") || article.seo_keywords || "",
    "inLanguage": "hi-IN"
  });

  // 5️⃣ वेबसाइट स्कीमा (हिंदी)
  schemas.push({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    "url": siteUrl,
    "name": "एंटरटेनइंडिया",
    "description": "एंटरटेनइंडिया - मनोरंजन जगत की ताज़ा खबरें, बॉलीवुड गपशप, और ओटीटी अपडेट्स हिंदी में",
    "inLanguage": "hi-IN",
    "publisher": {
      "@id": `${siteUrl}/#organization`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  });

  return schemas;
}

// =============================================
// 2. सेलिब्रिटी स्कीमा (हिंदी में)
// =============================================
export function generateCelebritySchema(celeb, slug) {
  const domain = "https://entertainindia.in";
  const pageUrl = `${domain}/celebrities/${slug}`;

  const imageUrl = celeb.profile_bg_poster?.url || 
                   celeb.avatar?.url || 
                   celeb.Avatar?.url || 
                   `${domain}/default-celeb.jpg`;

  const socialLinks = (celeb.social_account || []).map(acc => {
    if (acc.url) return acc.url;
    const handle = acc.username ? acc.username.replace('@', '').trim() : '';
    if (!handle) return null;
    const platform = acc.platform ? acc.platform.toLowerCase() : '';
    if (platform.includes('instagram')) return `https://www.instagram.com/${handle}`;
    if (platform.includes('twitter') || platform.includes('x')) return `https://x.com/${handle}`;
    if (platform.includes('facebook')) return `https://www.facebook.com/${handle}`;
    if (platform.includes('youtube')) return `https://www.youtube.com/@${handle}`;
    return null;
  }).filter(Boolean);

  const familyMembers = [];
  const fam = celeb.familyDetails || {};
  
  const addFamily = (name, relation) => {
    if (name && name !== "None" && name.trim() !== "") {
      familyMembers.push({
        "@type": "Person",
        "name": name.trim(),
        "description": relation
      });
    }
  };

  addFamily(fam.father, "पिता");
  addFamily(fam.mother, "माता");
  addFamily(fam.spouse, "पति/पत्नी");
  addFamily(fam.brother, "भाई");
  addFamily(fam.sister, "बहन");
  addFamily(fam.children, "बच्चे");

  const pLife = celeb.personalLife || {};
  let heightSpec = undefined;
  if (pLife.height) {
    const heightNum = pLife.height.match(/\d+/);
    if (heightNum) {
      heightSpec = {
        "@type": "QuantitativeValue",
        "value": heightNum[0],
        "unitText": "CMT"
      };
    }
  }

  const jobList = (celeb.professions || []).map(p => p.name).join(", ");
  const nicknames = celeb.popularname ? celeb.popularname.split(',').map(n => n.trim()) : [];
  
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "होम", "item": domain },
          { "@type": "ListItem", "position": 2, "name": "सेलिब्रिटीज", "item": `${domain}/celebrities` },
          { "@type": "ListItem", "position": 3, "name": celeb.name, "item": pageUrl }
        ]
      },
      {
        "@type": "ProfilePage",
        "dateCreated": celeb.createdAt,
        "dateModified": celeb.updatedAt || new Date().toISOString(),
        "inLanguage": "hi-IN",
        "mainEntity": {
          "@type": "Person",
          "name": celeb.name,
          "alternateName": nicknames.length > 0 ? nicknames : undefined,
          "description": celeb.tagline || celeb.bio || `${celeb.name} की प्रोफ़ाइल विवरण।`,
          "image": imageUrl,
          "jobTitle": jobList || "सेलिब्रिटी",
          "url": pageUrl,
          "sameAs": socialLinks.length > 0 ? socialLinks : undefined,
          "gender": celeb.gender || pLife.gender || undefined,
          "nationality": { 
            "@type": "Country", 
            "name": pLife.nationality || "भारत" 
          },
          "birthDate": celeb.birthdate || celeb.dob || undefined,
          "deathDate": celeb.deathDate || undefined,
          "height": heightSpec,
          "netWorth": pLife.netWorth ? {
            "@type": "PriceSpecification",
            "priceCurrency": "INR",
            "price": pLife.netWorth
          } : undefined,
          "alumniOf": pLife.education ? {
            "@type": "EducationalOrganization",
            "name": pLife.education
          } : undefined,
          "relatedTo": familyMembers.length > 0 ? familyMembers : undefined,
          "memberOf": (celeb.industry || []).map(ind => ({
            "@type": "Organization",
            "name": ind.name
          })),
          "knowsAbout": [
            ...(celeb.professions || []).map(p => p.name),
            ...(celeb.industry || []).map(i => i.name)
          ]
        }
      }
    ]
  };
}

// =============================================
// 3. सिंगल मूवी स्कीमा (हिंदी में)
// =============================================
export function generateSingleMovieSchema(movie, category, slug) {
  const domain = "https://entertainindia.in";
  const pageUrl = `${domain}/${category}/movies/${slug}`;

  // भाषा लॉजिक
  let movieLang = "हिंदी";
  if (movie.language) {
    movieLang = movie.language;
  } else if (movie.languages && movie.languages.length > 0) {
    if (typeof movie.languages[0] === 'string') {
      movieLang = movie.languages.join(", ");
    } else if (movie.languages[0].name) {
      movieLang = movie.languages.map(l => l.name).join(", ");
    }
  } else if (movie.industry) {
    const ind = movie.industry.toLowerCase();
    if (ind.includes('hollywood')) movieLang = "अंग्रेजी";
    else if (ind.includes('tollywood')) movieLang = "तेलुगु";
    else if (ind.includes('kollywood')) movieLang = "तमिल";
    else if (ind.includes('mollywood')) movieLang = "मलयालम";
  }

  // अवधि लॉजिक
  let isoDuration = undefined;
  if (movie.duration && movie.duration !== "") {
    const durationStr = String(movie.duration).toLowerCase();
    let totalMinutes = 0;
    const hoursMatch = durationStr.match(/(\d+)\s*(h|hour|घंटा)/);
    if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60;
    const minutesMatch = durationStr.match(/(\d+)\s*(m|min|मिनट)/);
    if (minutesMatch) totalMinutes += parseInt(minutesMatch[1]);
    if (totalMinutes === 0) {
      const plainNumber = durationStr.match(/\d+/);
      if (plainNumber) {
        const val = parseInt(plainNumber[0]);
        totalMinutes = val <= 5 ? val * 60 : val;
      }
    }
    if (totalMinutes > 0) isoDuration = `PT${totalMinutes}M`;
  }

  // निर्देशक
  const directors = (movie.crew || [])
    .filter(p => p.role && p.role.trim().toLowerCase() === 'director')
    .map(p => ({ "@type": "Person", "name": p.name ? p.name.trim() : "निर्देशक" }));

  // लेखक
  const writers = (movie.crew || [])
    .filter(p => p.role && p.role.trim().toLowerCase() === 'writer')
    .map(p => ({ "@type": "Person", "name": p.name ? p.name.trim() : "लेखक" }));

  // अभिनेता
  const actors = (movie.cast || []).map(actor => ({
    "@type": "Person",
    "name": actor.name ? actor.name.trim() : "अभिनेता",
    "url": actor.slug ? `${domain}/celebrities/${actor.slug}` : undefined
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "होम", "item": domain },
          { "@type": "ListItem", "position": 2, "name": movie.industry || category.toUpperCase(), "item": `${domain}/${category}` },
          { "@type": "ListItem", "position": 3, "name": movie.title, "item": pageUrl }
        ]
      },
      {
        "@type": "Movie",
        "name": movie.title,
        "url": pageUrl,
        "image": movie.poster?.url || movie.backdrop?.url || `${domain}/default-movie.jpg`,
        "description": movie.description || movie.synopsis || `${movie.title} फिल्म की पूरी जानकारी हिंदी में।`,
        "datePublished": movie.releaseDate,
        "duration": isoDuration,
        "inLanguage": movieLang,
        "genre": (movie.genres || []).map(g => g.name),
        "director": directors.length > 0 ? directors : undefined,
        "author": writers.length > 0 ? writers : undefined,
        "actor": actors.length > 0 ? actors : undefined,
        "inLanguage": "hi-IN"
      }
    ]
  };
}

// =============================================
// 4. कैटेगरी स्कीमा (ब्रेडक्रंब + कलेक्शन पेज) - पूरी तरह ठीक किया हुआ
// =============================================
export function generateCategorySchema(categoryData, movies = [], articles = [], categorySlug) {
  const domain = "https://entertainindia.in";
  
  // कैटेगरी का हिंदी नाम
  let catName = "";
  let subFolder = "movies";
  let schemaType = "Movie";
  let categoryDisplay = "";

  // कैटेगरी के हिसाब से हिंदी नाम सेट करें
  switch(categorySlug) {
    case 'bollywood':
      catName = "बॉलीवुड";
      categoryDisplay = "बॉलीवुड";
      subFolder = "movies";
      schemaType = "Movie";
      break;
    case 'hollywood':
      catName = "हॉलीवुड";
      categoryDisplay = "हॉलीवुड";
      subFolder = "movies";
      schemaType = "Movie";
      break;
    case 'tv':
      catName = "टीवी शोज";
      categoryDisplay = "टीवी";
      subFolder = "shows";
      schemaType = "TVSeries";
      break;
    case 'ott':
      catName = "वेब सीरीज";
      categoryDisplay = "ओटीटी";
      subFolder = "web-series";
      schemaType = "TVSeries";
      break;
    default:
      catName = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
      categoryDisplay = catName;
      subFolder = "movies";
      schemaType = "Movie";
  }

  const categoryUrl = `${domain}/${categorySlug}`;
  const graph = [];

  // ✅ 1️⃣ ब्रेडक्रंब स्कीमा (अब सही से काम करेगा)
  graph.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${categoryUrl}#breadcrumb`,
    "itemListElement": [
      { 
        "@type": "ListItem", 
        "position": 1, 
        "name": "होम", 
        "item": domain 
      },
      { 
        "@type": "ListItem", 
        "position": 2, 
        "name": catName, 
        "item": categoryUrl 
      }
    ]
  });

  // ✅ 2️⃣ कंटेंट लिस्ट स्कीमा (मूवीज/शोज)
  if (movies && movies.length > 0) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${categoryUrl}#movies-list`,
      "name": `टॉप ${catName} फिल्में/शोज`,
      "description": `${catName} की सबसे लोकप्रिय फिल्में और सीरीज की सूची`,
      "numberOfItems": movies.length,
      "itemListElement": movies.slice(0, 10).map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": schemaType,
          "name": item.title,
          "url": `${domain}/${categorySlug}/${subFolder}/${item.slug}`,
          "image": item.poster?.url || item.backdrop?.url,
          "datePublished": item.releaseDate,
        }
      }))
    });
  }

  // ✅ 3️⃣ आर्टिकल लिस्ट स्कीमा (हिंदी)
  if (articles && articles.length > 0) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${categoryUrl}#articles-list`,
      "name": `नवीनतम ${catName} समाचार`,
      "description": `${catName} से जुड़ी ताज़ा खबरें, अपडेट्स और गपशप`,
      "numberOfItems": articles.length,
      "itemListElement": articles.slice(0, 10).map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "NewsArticle",
          "headline": article.title,
          "url": `${domain}/${categorySlug}/${article.slug}`,
          "image": article.heroImage?.url || article.image?.url,
          "datePublished": article.publishedAt || article.publish_datetime,
          "dateModified": article.updatedAt || article.publishedAt,
          "author": {
            "@type": "Person",
            "name": article.author?.name || "एंटरटेनइंडिया टीम"
          },
          "publisher": {
            "@type": "Organization",
            "name": "एंटरटेनइंडिया",
            "logo": {
              "@type": "ImageObject",
              "url": `${domain}/logo.png`
            }
          }
        }
      }))
    });
  }

  // ✅ 4️⃣ कलेक्शन पेज स्कीमा (हिंदी)
  graph.push({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${categoryUrl}#collection-page`,
    "name": categoryData?.seo?.title || `${catName} समाचार और समीक्षाएँ | एंटरटेनइंडिया`,
    "description": categoryData?.seo?.description || `EntertainIndia पर नवीनतम ${catName} फिल्मों, वेब सीरीज और समाचार के अपडेट्स हिंदी में देखें।`,
    "url": categoryUrl,
    "inLanguage": "hi-IN",
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${domain}/#website`
    },
    "publisher": {
      "@type": "Organization",
      "name": "एंटरटेनइंडिया",
      "@id": `${domain}/#organization`
    }
  });

  // ✅ 5️⃣ वेबसाइट स्कीमा भी जोड़ें (पूरी साइट के लिए)
  graph.push({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${domain}/#website`,
    "url": domain,
    "name": "एंटरटेनइंडिया",
    "description": "एंटरटेनइंडिया - बॉलीवुड, हॉलीवुड, भोजपुरी, टीवी और ओटीटी की ताज़ा खबरें हिंदी में",
    "inLanguage": "hi-IN",
    "publisher": {
      "@id": `${domain}/#organization`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${domain}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  });

  // ✅ 6️⃣ फाइनल रिटर्न - @graph के साथ
  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}

// =============================================
// 5. अलग से ब्रेडक्रंब जनरेटर (अगर सिर्फ ब्रेडक्रंब चाहिए)
// =============================================
export function generateBreadcrumbSchema(items) {
  if (!items || items.length === 0) return null;
  
  const domain = "https://entertainindia.in";
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url || `${domain}${item.item}`
    }))
  };
}