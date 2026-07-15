import { MEDIA_URL } from '../constants';
import { getStrapiMedia } from "../constants";

//  Simple image url resolver (string ya {url} / {attributes:{url}} object)
export const getImageUrl = (img) => {
  if (!img) return null;
  const url = typeof img === 'string' ? img : (img.attributes?.url || img.url);
  if (!url) return null;
  return url.startsWith('http') ? url : `${MEDIA_URL}${url}`;
};

//  Best-quality media url resolver (formats.large > medium > small > thumbnail)
export const getMediaUrl = (media) => {
  if (!media) return null;

  const url =
    media.formats?.large?.url ||
    media.formats?.medium?.url ||
    media.formats?.small?.url ||
    media.formats?.thumbnail?.url ||
    media.url;

  if (!url) return null;

  return url.startsWith("http") ? url : `${MEDIA_URL}${url}`;
};

//  Default team author (jab article par koi author na ho)
export const DEFAULT_TEAM_AUTHOR = {
  id: 'team',
  name: 'EntertainIndia Team',
  username: 'entertainindiateam',
  avatar: null
};

//  Full media object normalizer (formats ke saath)
export const normalizeMedia = (media) => {
  if (!media) return null;
  const data = media.attributes || media;

  const normalizeUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${MEDIA_URL}${url}`;
  };

  const formats = {};
  if (data.formats) {
    Object.keys(data.formats).forEach(key => {
      formats[key] = {
        ...data.formats[key],
        url: normalizeUrl(data.formats[key].url)
      };
    });
  }

  return {
    id: media.id,
    url: normalizeUrl(data.url),
    alternativeText: data.alternativeText || '',
    caption: data.caption || '',
    width: data.width,
    height: data.height,
    formats: formats,
  };
};

//  Author normalizer (articles ke liye)
export const normalizeAuthor = (author) => {
  if (!author) return null;
  const data = author.attributes || author;

  const rawName = data.name || data.username || data.fullName || data.display_name || data.displayName;
  let displayName = rawName;
  const lowerName = (rawName || "").toLowerCase().replace(/\s/g, "");
  let username = data.username || data.name || data.slug;

  if (lowerName === "entertainindiateam" || lowerName === "entertainindiaofficial") {
    displayName = "EntertainIndia Team";
    username = "entertainindiateam";
  }

  const slugify = (str) => str?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const finalizedUsername = slugify(username);

  return {
    id: author.id,
    name: displayName,
    username: finalizedUsername,
    bio: data.bio,
    avatar: data.avatar ? normalizeMedia(data.avatar) : null,
    socialLinks: data.social_links,
  };
};

//  Date -> IST formatted string
export const toIST = (dateStr) => {
  if (!dateStr) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(dateStr));
};

//  Strapi rich text blocks -> plain text
export const normalizeRichText = (blocks = []) =>
  blocks
    .map((b) =>
      Array.isArray(b.children)
        ? b.children.map((c) => c.text).join("")
        : ""
    )
    .join("\n\n");

//  Strapi relation object se display value nikalne ke liye
export const getDisplayValue = (val) => {
  if (!val) return null;
  const target = val.data ? (val.data.attributes || val.data) : (val.attributes || val);

  if (typeof target === 'object' && !Array.isArray(target)) {
    return target.language || target.name || target.title || target.value || target.slug || target.language_name || target.LanguageName || target.Name || target.lang || target.Lang || null;
  }
  return target;
};
export const getResponsiveImageUrl = (article, size = "medium") => {
  const img = article?.heroImage || article?.hero_image || article?.image;
  if (!img) return null;

  // अगर साइज स्पेसिफाइड है तो पहले उसे ढूंढो, नहीं तो फॉलबैक करो
  const rawUrl = img?.formats?.[size]?.url || 
                 img?.formats?.medium?.url || 
                 img?.formats?.small?.url || 
                 img?.url;

  return rawUrl ? getStrapiMedia(rawUrl) : null;
};