// app/ClearStorageOnReload.jsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ClearStorageOnReload() {
  const pathname = usePathname();

  useEffect(() => {
    // Clear storage on initial load
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  // ✅ Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}