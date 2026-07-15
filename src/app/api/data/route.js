import { NextResponse } from 'next/server';

// 🛑 1. DOMAIN GUARD: Allowed Domains
const ALLOWED_DOMAINS = [
    'http://localhost:3000',
    'https://entertainindia.com',
    'https://entertainindia.in'
];

// ✅ THE MISSING PIECE: Is function ke bina aapka code crash ho raha tha
function isAuthorized(request) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    return ALLOWED_DOMAINS.some(domain => 
        (origin && origin.startsWith(domain)) || 
        (referer && referer.startsWith(domain))
    );
}

export async function POST(request) {
    try {
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

        const contentType = request.headers.get("content-type") || "";
        const authHeader = request.headers.get("authorization");
        
        let fetchOptions = {
            method: 'POST',
            cache: 'no-store',
            headers: {}
        };

        if (authHeader) {
            fetchOptions.headers['Authorization'] = authHeader;
        }

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            fetchOptions.body = formData;
        } 
        else {
            const body = await request.json();
            fetchOptions.headers['Content-Type'] = 'application/json';
            fetchOptions.body = JSON.stringify(body);
        }

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

        const headers = { 'Content-Type': 'application/json' };
        const authHeader = request.headers.get("authorization");
        const isGoogleAuth = endpoint.includes('auth/google/callback');
        
        if (authHeader) {
            headers['Authorization'] = authHeader;
        } else if (!isGoogleAuth && TOKEN) {
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

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint missing" }, { status: 400 });
    }

    const body = await request.json();
    const token = request.headers.get("authorization") || request.headers.get("Authorization");

    const STRAPI_URL = process.env.STRAPI_BACKEND_URL;
    
    const response = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': token } : {})
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error("Proxy PUT Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
    try {
        if (!isAuthorized(request)) {
            return NextResponse.json({ error: "Unauthorized Domain" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const endpoint = searchParams.get('endpoint');

        if (!endpoint) {
            return NextResponse.json({ error: "Endpoint missing" }, { status: 400 });
        }

        const token = request.headers.get("authorization") || request.headers.get("Authorization");
        const STRAPI_URL = process.env.STRAPI_BACKEND_URL;

        const headers = {};
        if (token) {
            headers['Authorization'] = token;
        }

        const response = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
            method: 'DELETE',
            headers: headers
        });

        const text = await response.text();
        let data = {};
        
        if (text) {
            try {
                data = JSON.parse(text);
            } catch (e) {
                data = { message: text };
            }
        } else {
            // Strapi ne 204 No Content bheja hai
            data = { success: true, message: "Deleted successfully" };
        }
        
        // 🌟 FIX: Agar status 204 hai, toh Next.js ko 200 bhejne ko bolo, 
        // warna body (JSON) ke sath 204 bhejne par Next.js crash hoke 500 de dega.
        const statusCode = response.status === 204 ? 200 : response.status;
        
        return NextResponse.json(data, { status: statusCode });

    } catch (error) {
        console.error("🔥 Proxy DELETE Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}