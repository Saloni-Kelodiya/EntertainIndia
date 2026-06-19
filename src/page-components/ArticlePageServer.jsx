"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { formatDate } from "../lib/helpers";
import Badge from "../components/ui/Badge";
import ArticlePageClient from "./ArticlePageClient";
import { ArticleShareBar, ArticleSidebar } from "./ArticleClientComponents";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Eye,
  User,
  Tag,
  ChevronLeft,
  Camera,
  AlertCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import Script from "next/script";

// ✅ Browser ID Generate / Get karo
function getBrowserId() {
  if (typeof window === "undefined") return null;
  let id = localStorage.getItem("browser_id");
  if (!id) {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    id = "brws_" + randomStr + "_" + timestamp;
    localStorage.setItem("browser_id", id);
  }
  return id;
}

// ✅ View track karne ke liye API call
async function trackArticleView(articleId, browserId) {
  try {
    const apiUrl = process.env.STRAPI_BACKEND_URL || "http://13.201.143.7:1337";
    const url = `${apiUrl}/api/articles/${articleId}/view`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-system-id": browserId,
      },
      body: JSON.stringify({}),
    });
    return await response.json();
  } catch (error) {
    console.error("Tracking error:", error);
    return null;
  }
}

export default function ArticlePageServer({ article, related = [] }) {
  const [viewTracked, setViewTracked] = useState(false);
  const [currentViews, setCurrentViews] = useState(article?.views || 0);

  // ✅ View tracking useEffect
  useEffect(() => {
    if (!viewTracked && article?.id) {
      const browserId = getBrowserId();
      if (browserId) {
        trackArticleView(article.id, browserId)
          .then((result) => {
            if (result?.success !== undefined) {
              setViewTracked(true);
              setCurrentViews(result.views);
            }
          })
          .catch((err) => console.error("Tracking error:", err));
      }
    }
  }, [article?.id, viewTracked]);

  // ✅ YOUTUBE, TWITTER & INSTAGRAM RELOAD FIX (unchanged)
  useEffect(() => {
    const reloadEmbeds = () => {
      try {
        if (window.instgrm) window.instgrm.Embeds.process();
        if (window.twttr && window.twttr.widgets) window.twttr.widgets.load();
      } catch (err) {
        console.error("Embed load error:", err);
      }
    };
    const timer = setTimeout(reloadEmbeds, 1000);
    return () => clearTimeout(timer);
  }, [article?.id, article?.body]);

  // ✅ Memoized markdown components for performance
  const markdownComponents = useMemo(
    () => ({
      h5: ({ node, ...props }) => (
        <h5
          className="font-extrabold text-lg mt-6 mb-2 text-gray-900 dark:text-gray-100"
          {...props}
        />
      ),
      h6: ({ node, ...props }) => (
        <h6
          className="font-extrabold text-base mt-6 mb-2 text-gray-900 dark:text-gray-100"
          {...props}
        />
      ),
      ul: ({ node, ...props }) => (
        <ul className="list-disc pl-5 my-3 space-y-1" {...props} />
      ),
      ol: ({ node, ...props }) => (
        <ol className="list-decimal pl-5 my-3 space-y-1" {...props} />
      ),
      li: ({ node, ...props }) => <li className="m-0 p-0" {...props} />,
      p: ({ node, children }) => {
        const hasEmbed = node.children?.some(
          (child) =>
            child.tagName === "iframe" ||
            child.tagName === "blockquote" ||
            (child.properties?.className &&
              String(child.properties.className).includes("instagram-media"))
        );
        if (hasEmbed) return <div className="w-full my-6">{children}</div>;

        if (
          node.children?.length === 1 &&
          node.children[0].tagName === "img"
        ) {
          const image = node.children[0];
          const src = image.properties.src;
          const alt = image.properties.alt || "";
          const caption = image.properties.title || "";
          return (
            <figure className="w-full my-6 mx-0">
              <div className="relative aspect-video w-full rounded-2xl shadow-md overflow-hidden">
                <Image
                  src={
                    src.startsWith("http")
                      ? src
                      : `${
                          process.env.NEXT_PUBLIC_SITE_URL ||
                          "https://admin.entertainindia.com"
                        }${src}`
                  }
                  alt={alt || "Article Image"}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-contain"
                  loading="lazy"
                />
              </div>
              {caption && (
                <figcaption className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2 px-2 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-md mx-0">
                  <span className="font-semibold">Image Source:</span> {caption}
                </figcaption>
              )}
            </figure>
          );
        }
        return (
          <p
            style={{ marginBottom: "1rem" }}
            className="mx-0 leading-relaxed text-gray-800 dark:text-gray-200"
          >
            {children}
          </p>
        );
      },
      blockquote: ({ node, children, className, ...props }) => {
        const isInstagram =
          className?.includes("instagram-media") ||
          String(node?.properties?.className || "").includes("instagram-media");
        const isTwitter =
          className?.includes("twitter-tweet") ||
          String(node?.properties?.className || "").includes("twitter-tweet");
        const isReddit =
          className?.includes("reddit-embed-bq") ||
          String(node?.properties?.className || "").includes("reddit-embed-bq");

        if (isInstagram || isTwitter || isReddit) {
          return (
            <div className="flex justify-center w-full my-6">
              <blockquote
                className={
                  isInstagram
                    ? "instagram-media"
                    : isTwitter
                    ? "twitter-tweet"
                    : "reddit-embed-bq"
                }
                {...props}
              >
                {children}
              </blockquote>
            </div>
          );
        }
        return (
          <blockquote className="relative my-5 mx-0 px-5 py-4 border-l-4 border-gray-800 dark:border-gray-300 bg-gray-100 dark:bg-gray-800/80 rounded-r-lg shadow-sm">
            <div className="text-xl font-medium text-gray-900 dark:text-gray-100 italic leading-snug tracking-wide">
              <span className="text-gray-500 dark:text-gray-400 font-serif text-2xl -ml-1.5">
                "
              </span>
              <span className="[&>p]:inline">{children}</span>
              <span className="text-gray-500 dark:text-gray-400 font-serif text-2xl -ml-1.5">
                "
              </span>
            </div>
          </blockquote>
        );
      },
      iframe: (props) => (
        <div className="flex justify-center w-full my-6">
          <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-900">
            <iframe
              {...props}
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>
        </div>
      ),
    }),
    []
  );

  if (!article) {
    return (
      <div className="container-custom py-20 text-center">
        <AlertCircle
          size={48}
          className="text-gray-400 dark:text-gray-500 mb-4 mx-auto"
        />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Article not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The article you are looking for does not exist.
        </p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <ChevronLeft size={18} /> Return to Home
        </Link>
      </div>
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://entertainindia.in";
  const categoryPath =
    article.mainCategory?.toLowerCase() === "news" ? "news" : "article";
  const currentUrl = `${baseUrl}/${categoryPath}/${article.slug}`;

  return (
    <>
      {/* ✅ EMBED SCRIPTS - now lazyOnload for better performance */}
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
      />
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="lazyOnload"
      />
      <Script
        src="https://embed.reddit.com/widgets.js"
        strategy="lazyOnload"
        async
      />

      <div className="container-custom py-6 bg-[#f6f6f6] px-4 rounded-2xl dark:bg-gray-800">
        {/* Breadcrumb - unchanged */}
        <nav
          className="flex text-sm text-gray-500 pl-2 py-4 w-full"
          aria-label="Breadcrumb"
        >
          <ol className="flex items-center list-none p-0 overflow-x-auto whitespace-nowrap pb-1 w-full">
            <li className="flex items-center shrink-0">
              <Link
                href="/"
                className="hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Home
              </Link>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li className="flex items-center shrink-0">
              <Link
                href={`/${article.mainCategory?.toLowerCase()}`}
                className="hover:text-gray-900 dark:hover:text-white transition-colors capitalize"
              >
                {article.mainCategory}
              </Link>
              <span className="mx-2 text-gray-400">/</span>
            </li>
            <li className="text-gray-900 dark:text-white font-semibold truncate max-w-[150px] sm:max-w-[250px] md:max-w-md lg:max-w-lg shrink-0">
              {article.title}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <article className="lg:col-span-8 card-theme">
            <header className="mb-4">
              <div className="mb-6 px-4 pt-4">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-gray-900 dark:text-gray-50 leading-tight">
                  {article.title}
                </h1>
              </div>

              <div className="p-2 rounded-md bg-[#F8F8FB] dark:bg-gray-900 border-gray-200/50 dark:border-gray-800">
                <div className="flex flex-col gap-3 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 px-1 pt-1">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        By{" "}
                        {(() => {
                          const author =
                            Array.isArray(article.Authors) &&
                            article.Authors.length > 0
                              ? article.Authors[0]
                              : article.Authors;
                          const authorSlug =
                            author?.slug ||
                            author?.username ||
                            "EntertainIndia-Team";
                          const displayName =
                            author?.name ||
                            author?.username ||
                            "EntertainIndia-Team";
                          return (
                            <Link
                              href={`/author/${authorSlug}`}
                              className="text-sm font-semibold text-[#EC4899] hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                              {displayName}
                            </Link>
                          );
                        })()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {article.category && (
                        <Badge
                          variant={article.category.slug}
                          className="text-[10px] px-2 py-0.5 font-bold uppercase"
                        >
                          {article.category.name}
                        </Badge>
                      )}
                      {article.featured && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 text-[10px] font-bold uppercase">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex pl-1 flex-wrap items-center gap-x-3 text-[13px] text-gray-500 dark:text-gray-400">
                    <p className="w-100 xsmall-text font-semi mb-0 flex flex-wrap items-center gap-x-2 text-[13px] text-gray-500 dark:text-gray-400">
                      <time
                        className="op-published"
                        dateTime={article.publishDate}
                      >
                        Published -{" "}
                        {formatDate(
                          article.publishDate,
                          "DD MMM YYYY, hh:mm A"
                        )}{" "}
                        IST |{" "}
                      </time>
                      {article.updatedDate &&
                        article.updatedDate !== article.publishDate && (
                          <time
                            className="op-modified"
                            dateTime={article.updatedDate}
                          >
                            Updated -{" "}
                            {formatDate(
                              article.updatedDate,
                              "DD MMM YYYY, hh:mm A"
                            )}{" "}
                            IST
                          </time>
                        )}
                    </p>
                    {article.readingTime && (
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{article.readingTime} min read</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye size={12} />
                      <span>{currentViews.toLocaleString()} views</span>
                      {!viewTracked && (
                        <span className="text-xs text-green-500 ml-1 animate-pulse">
                          ...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {article.heroImage && (
              <figure className="mb-10 w-full overflow-hidden rounded-2xl shadow-lg">
                <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-700">
                  <Image
                    src={article.heroImage.url}
                    alt={
                      article.heroImage.alternativeText ||
                      article.title ||
                      "Article Hero Image"
                    }
                    fill
                    sizes="(max-width: 768px) 100vw, 100vw"
                    className="object-cover rounded-2xl"
                    priority={true} // ✅ LCP boost
                    unoptimized={false}
                  />
                </div>
                {article.heroImage.caption && (
                  <figcaption className="text-xs text-center text-black-500 m-2 px-2">
                    <span className="font-semibold">Image Source:</span>{" "}
                    {article.heroImage.caption}
                  </figcaption>
                )}
              </figure>
            )}

            {article.summary && (
              <div className="mb-10 p-6 bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500 rounded-xl text-lg text-gray-700 dark:text-gray-300 font-serif">
                {article.summary}
              </div>
            )}

            <section className="mt-8">
              <div className="article-body prose dark:prose-invert max-w-none prose-headings:mt-6 prose-headings:mb-3 prose-p:my-0">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={markdownComponents} // ✅ memoized
                >
                  {article.body}
                </ReactMarkdown>
              </div>
            </section>

            <div className="border-t pt-8 mt-12">
              {article.tags?.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="flex items-center gap-2 text-sm text-gray-500">
                    <Tag size={16} /> Tags:
                  </span>
                  {article.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tag/${tag.slug}`}
                      className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              )}
              <ArticleShareBar url={currentUrl} title={article.title} />
            </div>

            {(article.documentId || article.id) && (
              <ArticlePageClient articleId={article.documentId || article.id} />
            )}
          </article>

          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              <ArticleSidebar
                related={related}
                title={
                  article?.mainCategory?.toLowerCase() === "news"
                    ? "RELATED NEWS"
                    : "RELATED ARTICLES"
                }
              />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}