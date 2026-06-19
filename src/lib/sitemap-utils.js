/**
 * Sitemap Utilities
 * Helper functions for generating sitemaps with year-wise splitting support
 */

/**
 * Fetch paginated data from Strapi API
 * @param {string} endpoint - Strapi API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<Array>} - Array of items
 */
export async function fetchAllFromStrapi(endpoint, options = {}) {
  const { fields = [], filters = {}, sort = 'updatedAt:desc', pageSize = 100 } = options;
  
  let allItems = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const params = new URLSearchParams({
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      sort,
    });
    
    // Add fields
    fields.forEach((field, index) => {
      params.append(`fields[${index}]`, field);
    });
    
    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      params.append(key, value);
    });
    
    const response = await fetch(`${endpoint}?${params.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from ${endpoint}: ${response.status}`);
    }
    
    const data = await response.json();
    const items = data.data || [];
    
    allItems = allItems.concat(items);
    
    const pagination = data.meta?.pagination;
    hasMore = pagination && pagination.page < pagination.pageCount;
    page++;
  }
  
  return allItems;
}

/**
 * Group items by year for year-wise sitemap splitting
 * @param {Array} items - Array of items with date field
 * @param {string} dateField - Field name for date (e.g., 'publish_datetime', 'updatedAt')
 * @returns {Object} - Object with years as keys and items as values
 */
export function groupByYear(items, dateField = 'updatedAt') {
  const grouped = {};
  
  items.forEach(item => {
    const date = item.attributes?.[dateField];
    if (!date) return;
    
    const year = new Date(date).getFullYear();
    if (!grouped[year]) {
      grouped[year] = [];
    }
    grouped[year].push(item);
  });
  
  return grouped;
}

/**
 * Generate XML sitemap string
 * @param {Array} urls - Array of URL objects
 * @returns {string} - XML sitemap string
 */
export function generateSitemapXML(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq || 'weekly'}</changefreq>
    <priority>${url.priority || 0.7}</priority>
  </url>`).join('\n')}
</urlset>`;
}

/**
 * Generate sitemap index XML
 * @param {Array} sitemaps - Array of sitemap URLs
 * @returns {string} - XML sitemap index string
 */
export function generateSitemapIndexXML(sitemaps) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
}

/**
 * Create Response with XML headers
 * @param {string} xml - XML content
 * @param {number} status - HTTP status code
 * @returns {Response} - Response object
 */
export function createXMLResponse(xml, status = 200) {
  return new Response(xml, {
    status,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

/**
 * Create empty sitemap for error cases
 * @returns {Response} - Empty sitemap Response
 */
export function createEmptySitemap() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
  
  return createXMLResponse(xml, 500);
}
