import { NextRequest, NextResponse } from "next/server";
import { getJiraAccessToken, getJiraRefreshToken } from "@/lib/jira-auth";
import { requireAuth } from "@/api/middleware/authMiddleware";

export async function GET(req: NextRequest) {
  // First, authenticate the user
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;
  
  try {
    const accessToken = await getJiraAccessToken();
    const refreshToken = await getJiraRefreshToken();
    
    // Check both tokens
    const authenticated = !!accessToken;
    const hasRefreshToken = !!refreshToken;
    
    // Try to validate the token by making a simple API call
    let tokenValid = false;
    if (authenticated) {
      try {
        const response = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });
        tokenValid = response.ok;
      } catch (tokenError) {
        console.error("Error validating JIRA token:", tokenError);
      }
    }
    
    return NextResponse.json({
      authenticated,
      hasRefreshToken,
      tokenValid,
      accessTokenLength: accessToken ? accessToken.length : 0,
      refreshTokenLength: refreshToken ? refreshToken.length : 0
    });
  } catch (error) {
    console.error("Error checking JIRA authentication:", error);
    return NextResponse.json({ 
      authenticated: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 