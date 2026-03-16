import { NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/auth-client";

export const runtime = 'edge'; // Optional: Use Edge Runtime for lower latency

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Get JWT token from better-auth client
    const { data: tokenData } = await authClient.token();
    const jwtToken = tokenData?.token;

    // Production API URL - use /chatbot/ which requires authentication
    const apiUrl = "https://teot-p3-api.vercel.app/chatbot/";

    console.log(`Proxying chat request to: ${apiUrl}`);

    // If no token, return 401
    if (!jwtToken) {
      return NextResponse.json(
        { error: "Authentication required. Please log in to use the chatbot." },
        { status: 401 }
      );
    }

    const backendResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwtToken}`,
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
