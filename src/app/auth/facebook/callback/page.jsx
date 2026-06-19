"use client";

import { useEffect, useRef, Suspense } from "react"; // Suspense import karein
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "../../../../lib/constants"; 
import { useStore } from "../../../../store/useStore"; 

// 1. Ek alag component banayein jo logic handle karega
function FacebookCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useStore();
  const hasCalled = useRef(false);

  useEffect(() => {
    const accessToken = params.get("access_token");

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    if (hasCalled.current) return;
    hasCalled.current = true;

    fetch(`${API_URL}/api/auth/facebook/callback?access_token=${accessToken}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.jwt) {
          localStorage.setItem("token", data.jwt);
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user, data.jwt);
          router.replace("/");
        } else {
          router.replace("/login");
        }
      })
      .catch((err) => {
        console.error("Facebook Auth Error:", err);
        router.replace("/login");
      });
  }, [params, router, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <p className="animate-pulse text-blue-600">Authenticating with Facebook...</p>
    </div>
  );
}

// 2. Exported default component mein Suspense wrap karein
export default function FacebookCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FacebookCallbackContent />
    </Suspense>
  );
}