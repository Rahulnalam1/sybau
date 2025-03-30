import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    // Extract draft_id from state if it's in JSON format
    let stateObj: any = null;
    let validState = false;
    let draftId: string | null = null;
    
    try {
      if (state) {
        // Decode URI component and parse JSON
        const decodedState = decodeURIComponent(state);
        stateObj = JSON.parse(decodedState);
        
        if (stateObj && stateObj.original === 'random-state-value') {
          validState = true;
          draftId = stateObj.draft_id || null;
          console.log("Extracted draft ID from state:", draftId);
        }
      }
    } catch (e) {
      // If not JSON or invalid, check if it's the simple state string
      validState = state === 'random-state-value';
      console.log("State is not in JSON format, using direct comparison");
    }

    if (!validState) {
      console.log("Invalid state:", state);
      return NextResponse.redirect(new URL('/workspace?error=invalid_state', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/workspace?error=no_code', request.url));
    }

    const formData = new URLSearchParams();
    formData.append('client_id', process.env.LINEAR_CLIENT_ID || '');
    formData.append('client_secret', process.env.LINEAR_CLIENT_SECRET || '');
    formData.append('redirect_uri', process.env.NEXT_PUBLIC_LINEAR_REDIRECT_URI || 'http://localhost:3000/api/auth/linear/callback');
    formData.append('code', code);
    formData.append('grant_type', 'authorization_code');

    const tokenResponse = await fetch('https://api.linear.app/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to exchange code for token:', errorText);
      return NextResponse.redirect(new URL('/workspace?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token } = tokenData;

    // Get draft_id from the parsed state object
    console.log("Draft ID for redirection:", draftId);
    
    // Redirect to team selection with draft ID if available
    const redirectUrl = draftId 
      ? new URL(`/team-selection?draft_id=${draftId}`, request.url)
      : new URL('/team-selection', request.url);
      
    console.log("Redirecting to:", redirectUrl.toString());
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set({
      name: 'linear_access_token',
      value: access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    if (refresh_token) {
      response.cookies.set({
        name: 'linear_refresh_token',
        value: refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    console.error('Error in Linear OAuth callback:', error);
    return NextResponse.redirect(new URL('/workspace?error=server_error', request.url));
  }
}