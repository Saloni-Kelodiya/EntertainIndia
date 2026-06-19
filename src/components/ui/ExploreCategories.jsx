"use client";

import Link from "next/link";
import {
  Film,
  Clapperboard,
  Tv,
  Music,
  Star,
  Newspaper, // News ke liye icon
  Trophy,
  Globe,
  PlayCircle,
  FileText, // Articles ke liye icon
} from "lucide-react";

const categories = [
  {
    title: "बॉलीवुड",
    subtitle: "हिंदी सिनेमा",
    icon: Film,
    color: "bg-orange-500",
    slug: "/bollywood",
  },
  {
    title: "हॉलीवुड",
    subtitle: "वैश्विक फिल्में",
    icon: Clapperboard,
    color: "bg-blue-500",
    slug: "/hollywood",
  },
   {
    title: "लेख", // Reviews की जगह लेख
    subtitle: "गहन कहानियाँ",
    icon: FileText,
    color: "bg-yellow-600",
    slug: "/article",
  },
  {
    title: "समाचार", // Videos की जगह समाचार
    subtitle: "ताजा अपडेट",
    icon: Newspaper,
    color: "bg-rose-500",
    slug: "/news",
  },
    {
    title: "ओटीटी",
    subtitle: "ओटीटी कंटेंट",
    icon: PlayCircle,
    color: "bg-green-500",
    slug: "/ott",
  },
    {
    title: "टीवी शो",
    subtitle: "टेलीविजन",
    icon: Tv,
    color: "bg-sky-500",
    slug: "/tv",
  },
  {
    title: "फोटो",
    subtitle: "फोटो और गैलरी",
    icon: Globe,
    color: "bg-pink-500",
    slug: "/photos",
  },
  {
    title: "वेब स्टोरीज",
    subtitle: "दृश्य कहानियाँ",
    icon: Star,
    color: "bg-purple-500",
    slug: "/web-stories",
  },
  {
    title: "संगीत",
    subtitle: "गाने और एल्बम",
    icon: Music,
    color: "bg-emerald-500",
    slug: "bollywood/music",
  },
  {
    title: "बॉक्स ऑफिस",
    subtitle: "कलेक्शन",
    icon: Trophy,
    color: "bg-amber-500",
    slug: "bollywood/box-office",
  },
];

export default function ExploreCategories() {
  return (
    <div className="py-4">
      <div className="max-w-7xl mx-auto ">
        {/* Page Heading */}
       <div className="text-center mb-12">
  <h2 className="text-3xl md:text-4xl font-bold tracking-wide bg-gradient-to-r bg-clip-text text-transparent from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
    श्रेणियाँ एक्सप्लोर करें
  </h2>

  <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
    सभी मनोरंजन श्रेणियों में मौजूद कंटेंट को खोजें
  </p>
</div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <Link
                key={index}
                href={cat.slug}
                className="
                  bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
                  rounded-xl p-6
                  hover:shadow-xl hover:-translate-y-1 hover:border-gray-300 dark:hover:border-gray-600
                  transition-all duration-300
                  group
                "
              >
                <div
                  className={`w-12 h-12 ${cat.color} rounded-lg flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">
                  {cat.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {cat.subtitle}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}