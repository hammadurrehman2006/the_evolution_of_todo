import { NextRequest, NextResponse } from "next/server";

// Extend Vercel Serverless Function timeout to maximum (60s for Hobby, 900s for Pro)
// This prevents 504 Gateway Timeout during long-running MCP tool executions
export const maxDuration = 300; // 5 minutes - adjust based on your Vercel plan

export const runtime = 'nodejs'; // Use Node.js runtime for maxDuration support (Edge doesn't support it)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Get cookies from the request
    const cookieHeader = req.headers.get("cookie") || "";

    // Production API URL - use /chatbot/stream for streaming support
    const apiUrl = "https://teot-p3-api.vercel.app/chatbot/stream";

    console.log(`[Chat API] Proxying chat request to: ${apiUrl}`);
    console.log(`[Chat API] Cookies received: ${cookieHeader ? 'Yes' : 'No'}`);
    console.log(`[Chat API] Cookie header: ${cookieHeader.substring(0, 100)}...`);

    // Forward request to backend with streaming support
    const backendResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
        "Accept": "text/event-stream", // Request streaming response
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`[Chat API] Backend error (${backendResponse.status}):`, errorText);

      // Handle 401 - not authenticated
      if (backendResponse.status === 401) {
        return NextResponse.json(
          { error: "Authentication required. Please log in to use the chatbot." },
          { status: 401 }
        );
      }

      try {
         const errorJson = JSON.parse(errorText);
         return NextResponse.json(errorJson, { status: backendResponse.status });
      } catch {
         return NextResponse.json({ error: errorText }, { status: backendResponse.status });
      }
    }

    // Stream the response from backend to frontend using SSE
    const stream = new ReadableStream({
      async start(controller) {
        const reader = backendResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            // Forward chunk to client
            controller.enqueue(value);
          }
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no", // Disable nginx buffering
      },
    });

  } catch (error) {
    console.error("[Chat API] Chat API Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
