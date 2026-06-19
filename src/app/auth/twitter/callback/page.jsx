"use client";

import { useEffect, useRef, Suspense } from "react"; // Suspense import kiya
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "../../../../lib/constants"; 
import { useStore } from "../../../../store/useStore"; 

// 1. Sara logic is internal component mein rahega
function TwitterCallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useStore();
  const hasCalled = useRef(false);

  useEffect(() => {
    const accessToken = params.get("access_token");

    if (!accessToken) {
      console.error("Twitter token not found");
      router.replace("/login");
      return;
    }

    if (hasCalled.current) return;
    hasCalled.current = true;

    // Strapi Endpoint for Twitter
    fetch(`${API_URL}/api/auth/twitter/callback?access_token=${accessToken}`)
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
        console.error("Twitter Auth Error:", err);
        router.replace("/login");
      });
  }, [params, router, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <p className="animate-pulse text-blue-400">Authenticating with Twitter (X)...</p>
    </div>
  );
}

// 2. Main export ko Suspense mein wrap karna zaroori hai build pass karne ke liye
export default function TwitterCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Connecting to Twitter...</p>
      </div>
    }>
      <TwitterCallbackHandler />
    </Suspense>
  );
}