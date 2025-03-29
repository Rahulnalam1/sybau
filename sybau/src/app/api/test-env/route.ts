import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Don't do this in production as it exposes all env vars
  // This is just for debugging
  return NextResponse.json({
    clientId: process.env.LINEAR_CLIENT_ID,
    clientIdPublic: process.env.NEXT_PUBLIC_LINEAR_CLIENT_ID,
    redirectUri: process.env.NEXT_PUBLIC_LINEAR_REDIRECT_URI,
    nodeEnv: process.env.NODE_ENV,
    // Current server URL
    requestUrl: request.url,
  });
} 