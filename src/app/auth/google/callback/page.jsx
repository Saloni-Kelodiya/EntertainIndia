"use client";

import { useEffect, useRef, Suspense } from "react"; // 1. Suspense import kiya
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "../../../../lib/constants";
import { useStore } from "../../../../store/useStore";

// 2. Logic ko ek separate inner component mein rakha
function GoogleCallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useStore();
  const hasCalled = useRef(false);

useEffect(() => {
  // Dono params check karein
  const token = params.get("access_token") || params.get("id_token") || params.get("code");

  if (!token) {
    console.log("No token found in URL. URL Params:", params.toString());
    // router.replace("/login"); // Debugging ke liye ise thodi der comment karein
    return;
  }

  if (hasCalled.current) return;
  hasCalled.current = true;
fetch(`${API_URL}/auth/google/callback?access_token=${token}`)
  .then(async (res) => {
    const data = await res.json();

    // Strapi error check handling here:
    if (!res.ok) {
      const msg = data?.error?.message;
      
      // Specific case: already registered via email/password
      if (msg === "Internal Server Error") {
        alert("This email is already registered. Please log in using your email and password.");
        return router.replace("/login");
      }

      throw new Error(msg || "Strapi Auth Failed");
    }

    // Success Login
    if (data.jwt) {
      localStorage.setItem("token", data.jwt);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user, data.jwt);
      return router.replace("/");
    }
  })
  .catch((err) => {
    console.error("FULL AUTH ERROR:", err);
    alert(err.message || "Authentication failed!");
    router.replace("/login");
  });

}, [params]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <p className="animate-pulse">Authenticating with Strapi...</p>
    </div>
  );
}

// 3. Final Export jo Suspense use karta hai
export default function GoogleCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    }>
      <GoogleCallbackHandler />
    </Suspense>
  );
}