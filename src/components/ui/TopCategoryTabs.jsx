"use client";

import Link from "next/link";
import { usePathname, notFound } from "next/navigation";
import { useEffect, useRef, useMemo } from "react";

 const CATEGORIES = [
  { name: 'होम', slug: '/', path: '/' },
  { name: 'बॉलीवुड', slug: 'bollywood', path: '/bollywood' },
  { name: 'हॉलीवुड', slug: 'hollywood', path: '/hollywood' },
   { name: 'टॉलीवुड', slug: 'tollywood', path: '/tollywood' },
  { name: 'भोजीवुड', slug: 'bhojiwood', path: '/bhojiwood' },
  {name:'कोरियाई',slug:'korean',path:'/korean'},
  { name: 'ओटीटी', slug: 'ott', path: '/ott' },
  { name: 'टीवी', slug: 'tv', path: '/tv' },
  { name: 'सेलिब्रिटी प्रोफाइल', slug: 'celebrities-profile', path: '/celebrities' },
];
const BASE_TABS = [
  { label: "सभी", slug: null },
  { label: "ताजा खबरें", slug: "latest-news" },
  { label: "क्या देखें", slug: "what-to-watch" },
  { label: "बॉक्स ऑफिस", slug: "box-office" },
  { label: "फिल्में", slug: "movies" },
  { label: "समीक्षाएं", slug: "reviews" },
  { label: "फैशन", slug: "fashion" },
  { label: "संगीत", slug: "music" },
  { label: "सेलिब्रिटीज", slug: "celebrities" },
  { label: "अवार्ड्स", slug: "awards" },
];

export default function TopCategoryTabs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  const category = parts[0] || null;
  const section = parts[1] || null;

  const activeRef = useRef(null);

  /* ---------------- PAGE DETECTION ---------------- */
  const isTVPage = category === "tv";

  const isOTTPage =
    category === "ott" ||
    section === "ott" ||
    section === "web-series" ||
    section === "series";

  /* ---------------- BUILD DYNAMIC TABS ---------------- */
  const TABS = useMemo(() => {
    let tabsList = [...BASE_TABS];

    // 👉 TV PAGE RULE - Remove Music tab and Movies tab, add Shows
    if (isTVPage) {
      tabsList = tabsList.filter(tab =>
        tab.slug !== "movies" && tab.slug !== "music" && tab.slug !== "box-office"
      );
      tabsList.splice(4, 0, { label: "शो", slug: "shows" });
    }

    // 👉 OTT PAGE RULE - Remove Music tab, add Web Series
    if (isOTTPage && !isTVPage) {
      tabsList = tabsList.filter(tab => tab.slug !== "music");
      tabsList = tabsList.filter(tab => tab.slug !== "movies");
        tabsList = tabsList.filter(tab => tab.slug !== "box-office");
      tabsList.push({ label: "वेब सीरीज", slug: "web-series" });
    }

    return tabsList;
  }, [isTVPage, isOTTPage]);

  /* ---------------- VALIDATION ---------------- */

  const isHomePage = parts.length === 0;
  const isValidCategory = !category || CATEGORIES.some(cat => cat.slug === category);
  const isValidSection = !section || TABS.some(tab => tab.slug === section);

  if ((!isHomePage && !isValidCategory) || (isValidCategory && !isValidSection)) {
    return notFound();
  }

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [pathname]);

  /* ---------------- BUILD LINK ---------------- */
  const buildHref = (tab) => {
    if (category && tab.slug) return `/${category}/${tab.slug}`;
    if (category && !tab.slug) return `/${category}`;
    if (!category && tab.slug) return `/${tab.slug}`;
    return "/";
  };

  /* ---------------- ACTIVE CHECK ---------------- */
  const isActive = (tab) => {
    // 1. All tab is active on industry home (/[industry]) or site home (/)
    if (!tab.slug && !section && !BASE_TABS.some(t => t.slug === category)) return true;

    // 2. Tab slug matches the second part of URL (/[industry]/[tab])
    if (tab.slug && tab.slug === section) return true;

    // 3. Tab slug matches the first part of URL when no second part exists (/[tab])
    if (tab.slug && !section && tab.slug === category) return true;

    return false;
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="mb-4">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const active = isActive(tab);

          return (
            <Link
              key={tab.label}
              href={buildHref(tab)}
              ref={active ? activeRef : null}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                ${active
                  ? "bg-pink-600 text-white shadow"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-neutral-800"
                }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}