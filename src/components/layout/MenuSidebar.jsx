"use client";

import {
  X,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Folder,
  FileText,
  Info,
  Phone,
  ShieldCheck,
  ScrollText,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { SOCIAL_LINKS } from "../../lib/constants";

export default function MenuSidebar({
  isOpen,
  onClose,
  categories = [],
}) {
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("Menu-open");
    } else {
      document.body.classList.remove("Menu-open");
    }

    return () => {
      document.body.classList.remove("Menu-open");
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-screen w-90 z-[1000] p-6
        bg-white dark:bg-[#071028]
        shadow-2xl border-l border-gray-200 dark:border-[#0b1220]
        transform transition-transform duration-300 ease-out
        overflow-y-auto
        scrollbar-thin scrollbar-thumb-primary/30
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div 
            id="sidebar-title" 
            className="text-xl font-bold text-gray-800 dark:text-gray-100"
          >
            मेनू
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="मेनू बंद करें"
            className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-[#0b1220] transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Categories Section */}
        <Section title="श्रेणियाँ" icon={<Folder className="w-4 h-4" aria-hidden="true" />}>
          <nav aria-label="श्रेणी नेविगेशन" className="contents">
            {categories.length ? (
              categories.map((cat) => (
                <MenuItem
                  key={cat.slug}
                  href={cat.path}
                  label={cat.name}
                  icon={<ChevronRight className="w-4 h-4" aria-hidden="true" />}
                  onClose={onClose}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 col-span-2">
                कोई श्रेणियाँ उपलब्ध नहीं हैं
              </p>
            )}
          </nav>
        </Section>

        {/* Pages Section */}
        <Section title="पेज" icon={<FileText className="w-4 h-4" aria-hidden="true" />}>
          <nav aria-label="महत्वपूर्ण लिंक्स" className="contents">
            <MenuItem href="/about" label="हमारे बारे में" icon={<Info className="w-4 h-4" aria-hidden="true" />} onClose={onClose} />
            <MenuItem href="/contact" label="संपर्क करें" icon={<Phone className="w-4 h-4" aria-hidden="true" />} onClose={onClose} />
            <MenuItem href="/privacy-policy" label="गोपनीयता नीति" icon={<ShieldCheck className="w-4 h-4" aria-hidden="true" />} onClose={onClose} />
            <MenuItem href="/terms-services" label="नियम और शर्तें" icon={<ScrollText className="w-4 h-4" aria-hidden="true" />} onClose={onClose} />
          </nav>
        </Section>

        {/* Social Links */}
        <div className="mt-8">
          <div className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-400 mb-3">
            हमें फॉलो करें
          </div>

          <div className="flex gap-4">
            <SocialIcon href={SOCIAL_LINKS.facebook} icon={<Facebook className="w-5 h-5" />} label="फेसबुक पर हमें फॉलो करें" color="hover:text-blue-500" />
            <SocialIcon href={SOCIAL_LINKS.twitter} icon={<Twitter className="w-5 h-5" />} label="ट्विटर (X) पर हमें फॉलो करें" color="hover:text-sky-400" />
            <SocialIcon href={SOCIAL_LINKS.instagram} icon={<Instagram className="w-5 h-5" />} label="इंस्टाग्राम पर हमें फॉलो करें" color="hover:text-pink-500" />
            <SocialIcon href={SOCIAL_LINKS.youtube} icon={<Youtube className="w-5 h-5" />} label="यूट्यूब पर हमें सब्सक्राइब करें" color="hover:text-red-500" />
          </div>
        </div>
      </aside>
    </>
  );
}

function Section({ title, icon, children }) {
  const sectionId = `sec-${title.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <section className="mb-6" aria-labelledby={sectionId}>
      <div className="flex items-center gap-2 mb-3 text-gray-500 dark:text-gray-400">
        {icon}
        <div id={sectionId} className="text-sm uppercase font-semibold">
          {title}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-2">
        {children}
      </div>

      <hr className="border-dashed border-gray-300 dark:border-gray-700 mt-4" aria-hidden="true" />
    </section>
  );
}

function MenuItem({ href, label, icon, onClose }) {
  return (
    <Link
      href={href}
      onClick={onClose}
      title={label}
      className="
        flex items-center gap-2
        px-3 py-2 rounded-lg
        text-sm
        text-gray-700 dark:text-gray-200
        hover:bg-gray-100 dark:hover:bg-[#0b1220]
        hover:text-yellow-400
        transition-all
      "
    >
      <span className="text-gray-400 shrink-0">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SocialIcon({ href, icon, color, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={label}
      className={`p-2 rounded-full bg-gray-100 dark:bg-[#0b1220]
                  text-gray-500 dark:text-gray-400
                  hover:scale-110 transition-all ${color}`}
    >
      {icon}
    </a>
  );
}