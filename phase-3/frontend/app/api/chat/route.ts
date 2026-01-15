import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge'; // Optional: Use Edge Runtime for lower latency

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");
    const cookieHeader = req.headers.get("cookie");
    
    // Production API URL
    const apiUrl = "https://todo-api-phase3.vercel.app/chat";
    
    console.log(`Proxying chat request to: ${apiUrl}`);

    const backendResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Forward auth headers if present
        ...(authHeader && { "Authorization": authHeader }),
        // Forward cookies (important for session-based auth if used)
        ...(cookieHeader && { "Cookie": cookieHeader }),
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Backend error (${backendResponse.status}):`, errorText);
      try {
         const errorJson = JSON.parse(errorText);
         return NextResponse.json(errorJson, { status: backendResponse.status });
      } catch {
         return NextResponse.json({ error: errorText }, { status: backendResponse.status });
      }
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Chat API Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
