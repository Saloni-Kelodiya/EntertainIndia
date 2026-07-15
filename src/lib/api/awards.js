import apiClient from './client';

const normalizeAwards = (data = []) =>
  data.map((item) => {
    const d = item.attributes || item;
    return {
      id: item.id,
      documentId: d.documentId || item.documentId,
      title: d.title,
      slug: d.slug,
      subTitle: d.subTitle,
      description: d.description || [], // BlocksRenderer ke liye
      date: d.date,
      location: d.location,
      host: d.host,
      categoryCount: d.categories || d.categoryCount,
      totalNominations: d.totalNominations,
      countriesRepresented: d.countriesRepresented,
      firstTimeWinners: d.firstTimeWinners,
      viewership: d.viewership,
      industry: getDisplayValue(d.industry),
      year: d.year,
      language:d.language,
      //  Industry Categories
      industryCategories: Array.isArray(d.industry_category)
        ? d.industry_category.map((ind) => {
          const indData = ind.attributes || ind;
          return {
            id: ind.id,
            documentId: indData.documentId,
            name: indData.name,
            slug: indData.slug,
            description: indData.description,
          };
        })
        : [],

      // 
      image: d.image?.url || d.image?.data?.attributes?.url ? {
        url: getMediaUrl(d.image?.data?.attributes || d.image),
        alt: d.image?.data?.attributes?.alternativeText || d.image?.alternativeText || d.title,
      } : null,

      //  Award Categories
      awardCategories: (d.awardCategories || d.award_categories)?.map((cat) => {
        const cd = cat.attributes || cat;
        return {
          id: cat.id,
          categoryName: cd.categoryName,
          description: cd.categoryDescription || "",
          winner: {
            title: cd.winnerTitle,
            subTitle: cd.winnerSubTitle,
            image: cd.winnerImage?.url || cd.winnerImage?.data?.attributes?.url ? {
              url: getMediaUrl(cd.winnerImage?.data?.attributes || cd.winnerImage),
              alt: cd.winnerImage?.data?.attributes?.alternativeText || cd.winnerImage?.alternativeText || cd.winnerTitle,
            } : null,
          },
          //  Nominees List
          nominees: (cd.NomineesList || cd.nominees_list)?.map((nominee) => {
            const nd = nominee.attributes || nominee;
            return {
              id: nominee.id,
              name: nd.Name || nd.name,
              subTitle: nd.SubTitle || nd.subTitle,
              image: nd.Image?.url || nd.Image?.data?.attributes?.url ? {
                url: getMediaUrl(nd.Image?.data?.attributes || nd.Image),
                alt: nd.Image?.data?.attributes?.alternativeText || nd.Image?.alternativeText || (nd.Name || nd.name),
              } : null,
            };
          }) || [],
        };
      }) || [],
    };
  });
export const AwardsAPI = {
  //  Get all awards with full population
  getAll: async (params = {}) => {
    try {
      // Build query string
      const q = new URLSearchParams( );
      
      // Always populate everything
      q.append("populate", "*");
      q.append("filters[language][$eq]", "hi");
      
      // Pagination
      if (params.page) {
        q.append("pagination[page]", params.page);
      }
      if (params.pageSize) {
        q.append("pagination[pageSize]", params.pageSize);
      }

      // Sorting
      if (params.sort) {
        q.append("sort[0]", params.sort);
      } else {
        q.append("sort[0]", "createdAt:desc");
      }

      // Filter by industry category (Bollywood, Hollywood, etc.)
      if (params.category && params.category !== "all") {
        q.append("filters[industry_category][slug][$containsi]", params.category);
      }

      // Filter by industry field (direct industry string)
      if (params.industry) {
        q.append("filters[industry][$containsi]", params.industry);
      }

      // Filter by year
      if (params.year) {
        q.append("filters[year][$eq]", params.year);
      }

      // Filter by title/search
      if (params.search) {
        q.append("filters[title][$containsi]", params.search);
      }

      const response = await apiClient.get(`/awards?${q.toString()}`);
      const result = response.data;

      // Use your existing normalizeAwards function
      const normalizedData = normalizeAwards(result.data || []);

      return {
        data: normalizedData,
        pagination: result.meta?.pagination || {
          page: 1,
          pageSize: 25,
          pageCount: 1,
          total: normalizedData.length
        }
      };

    } catch (error) {
      return { data: [], pagination: {} };
    }
  },//  Get single award by slug
getBySlug: async (slug) => {
  try {
    const q = new URLSearchParams();

    q.append("filters[slug][$eq]", slug);
    q.append("filters[language][$eq]", "hi");
    q.append("populate[awardCategories][populate][winnerImage]", "true");
    q.append("populate[awardCategories][populate][NomineesList][populate]", "*");

    q.append("populate[industry_category]", "true");
    q.append("populate[image]", "true");

    const response = await apiClient.get(`/awards?${q.toString()}`);
    const result = response.data;

    if (result.data && result.data.length > 0) {
      const normalized = normalizeAwards([result.data[0]]);
      return normalized[0] || null;
    }

    return null;

  } catch (error) {
    console.error("Error fetching award by slug:", error);
    return null;
  }
}
,

  //  Get awards by industry (using industry_category relation)
  getByIndustry: async (industrySlug) => {
    try {
      const q = new URLSearchParams({
        "filters[industry_category][slug][$eq]": industrySlug,
        "populate": "*"
      });

      const response = await apiClient.get(`/awards?${q.toString()}`);
      const result = response.data;

      const normalizedData = normalizeAwards(result.data || []);

      return {
        data: normalizedData,
        pagination: result.meta?.pagination || {}
      };

    } catch (error) {
      return { data: [], pagination: {} };
    }
  },

  //  Get unique industry categories for filter UI
  getIndustryCategories: async () => {
    try {
      // Fetch all awards first
      const result = await AwardsAPI.getAll({ pageSize: 100 });

      const industries = new Map();

      // Extract unique industries from industry_category (singular)
      result.data.forEach(award => {
        // Check for industry_category (singular)
        if (award.industry_category) {
          const ind = award.industry_category;
          if (!industries.has(ind.slug)) {
            industries.set(ind.slug, {
              id: ind.id,
              slug: ind.slug,
              name: ind.name,
              count: 1
            });
          } else {
            const existing = industries.get(ind.slug);
            industries.set(ind.slug, { ...existing, count: existing.count + 1 });
          }
        }

        // Also check the direct industry field
        if (award.industry && award.industry.trim()) {
          const industrySlug = award.industry.toLowerCase().replace(/\s+/g, '-');
          if (!industries.has(industrySlug)) {
            industries.set(industrySlug, {
              slug: industrySlug,
              name: award.industry,
              count: 1
            });
          } else {
            const existing = industries.get(industrySlug);
            industries.set(industrySlug, { ...existing, count: existing.count + 1 });
          }
        }
      });

      const industryList = Array.from(industries.values());
      return industryList;

    } catch (error) {
      return [];
    }
  },

  //  Get unique years for filter UI
  getYears: async () => {
    try {
      const result = await AwardsAPI.getAll({ pageSize: 100 });

      const years = new Set();

      result.data.forEach(award => {
        if (award.year) {
          years.add(award.year);
        }
      });

      const yearList = Array.from(years).sort().reverse();
      return yearList;

    } catch (error) {
      return [];
    }
  }
};
