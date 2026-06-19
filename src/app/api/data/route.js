import { NextResponse } from 'next/server';

// 🛑 1. DOMAIN GUARD: Yahan Apne Allowed Domains Daalo
const ALLOWED_DOMAINS = [
    'http://localhost:3000',
    'https://entertainindia.com',
    'https://entertainindia.in'
];

// 🛑 2. RATE LIMITER: Settings (Optional, aage use karne ke liye)
const rateLimitMap = new Map();
const LIMIT_TIME_WINDOW = 60 * 5000;
const MAX_REQUESTS = 200;

export async function POST(request) {
    try {
        // Domain Check
        const origin = request.headers.get('origin');
        if (origin && !ALLOWED_DOMAINS.some(d => origin.startsWith(d))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const endpoint = searchParams.get('endpoint'); 
        
        if (!endpoint) {
            return NextResponse.json({ error: "Endpoint missing" }, { status: 400 });
        }

        const STRAPI_URL = process.env.STRAPI_BACKEND_URL;
        const finalUrl = `${STRAPI_URL}/api/${endpoint}`;

        // 👇 YAHAN FIX HAI: Headers pehle hi nikal liye taaki har request me jaye
        const contentType = request.headers.get("content-type") || "";
        const authHeader = request.headers.get("authorization");
        
        let fetchOptions = {
            method: 'POST',
            cache: 'no-store',
            headers: {}
        };

        // Agar user ka token hai, toh usko pakka set karo (chahe JSON ho ya Image)
        if (authHeader) {
            fetchOptions.headers['Authorization'] = authHeader;
        }

        // Agar form data (image upload jaise Avatar) hai
        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            fetchOptions.body = formData;
            // Note: Content-Type browser khud set karega boundary ke sath
        } 
        // Agar normal JSON (jaise Author Request, Login, Update Profile) hai
        else {
            const body = await request.json();
            fetchOptions.headers['Content-Type'] = 'application/json';
            fetchOptions.body = JSON.stringify(body);
        }

        // Strapi ko request bhejna
        const response = await fetch(finalUrl, fetchOptions);
        const data = await response.json();
        
        if (!response.ok) {
            console.error("❌ Strapi POST Error:", data);
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error("🔥 POST Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        // Domain Check
        const origin = request.headers.get('origin');
        const referer = request.headers.get('referer');

        if (origin || referer) {
            const isAllowed = ALLOWED_DOMAINS.some(domain => 
                (origin && origin.startsWith(domain)) || 
                (referer && referer.startsWith(domain))
            );
            if (!isAllowed) {
                return NextResponse.json({ error: "Access Denied. Unauthorized Domain." }, { status: 403 });
            }
        }

        const { searchParams } = new URL(request.url);
        const endpoint = searchParams.get('endpoint');
        
        if (!endpoint) {
            return NextResponse.json({ error: "Endpoint missing" }, { status: 400 });
        }

        searchParams.delete('endpoint');
        let queryString = decodeURIComponent(searchParams.toString());

        const STRAPI_URL = process.env.STRAPI_BACKEND_URL;
        const TOKEN = process.env.STRAPI_API_TOKEN;

        let finalUrl = `${STRAPI_URL}/api/${endpoint}`;
        if (queryString) {
            finalUrl += `?${queryString}`;
        }

        // 👇 YAHAN FIX HAI: Token Override logic theek kiya gaya hai
        const headers = { 'Content-Type': 'application/json' };
        const authHeader = request.headers.get("authorization");
        const isGoogleAuth = endpoint.includes('auth/google/callback');
        
        if (authHeader) {
            // Priority 1: Agar logged-in user apna token bhej raha hai, toh usi ko use karo
            headers['Authorization'] = authHeader;
        } else if (!isGoogleAuth && TOKEN) {
            // Priority 2: Agar user token nahi hai, tab Admin Token use karo
            headers['Authorization'] = `Bearer ${TOKEN}`;
        }

        const response = await fetch(finalUrl, {
            headers: headers,
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("❌ Strapi GET Error Response:", errorData);
            return NextResponse.json({ error: "Strapi fetch failed", details: errorData }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("🔥 Proxy Server Crash:", error);
        return NextResponse.json({ error: "Internal Proxy Server Error" }, { status: 500 });
    }
}