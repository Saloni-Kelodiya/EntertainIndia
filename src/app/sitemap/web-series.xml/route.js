// app/web-series.xml/route.js
// Generates a sitemap of all "ott" category web series:
// https://entertainindia.com/ott/web-series/{slug}

// ⚠️ Adjust this import path to match where lib/api.js actually sits
// relative to app/web-series.xml/route.js in your project
import { webSeriesAPI } from "../../../lib/api/web-series";

const BASE_URL = "https://entertainindia.in";
const CATEGORY = "ott";
const PAGE_SIZE = 100; // fetch in batches to avoid huge single requests

export async function GET() {
  try {
    let allWebSeries = [];
    let page = 1;
    let pageCount = 1;

    do {
      const { data, pagination } = await webSeriesAPI.getAll({
        category: CATEGORY,
        page,
        pageSize: PAGE_SIZE,
      });

      allWebSeries = allWebSeries.concat(data);
      pageCount = pagination?.pageCount || 1;
      page++;
    } while (page <= pageCount);

    const urlEntries = allWebSeries
      .filter((ws) => ws?.slug)
      .map((ws) => {
        const lastModDate = ws.updatedAt || ws.publishedAt || ws.createdAt;
        const lastmod = lastModDate
          ? new Date(lastModDate).toISOString()
          : new Date().toISOString();

        return `  <url>
    <loc>${BASE_URL}/${CATEGORY}/web-series/${ws.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("❌ Error generating web-series.xml sitemap:", error);

    // Return an empty but valid sitemap on failure, so the URL never 500s
    // in a way crawlers choke on
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;

    return new Response(fallbackXml, {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  }
}

export const dynamic = "force-dynamic"; // or remove this if you want it cached at build/revalidate time