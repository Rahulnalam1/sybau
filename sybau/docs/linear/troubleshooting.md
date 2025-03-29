# Linear Integration Troubleshooting

This document provides solutions for common issues that may occur when using the Linear integration in Sybau.

## Authentication Issues

### OAuth Authorization Fails

**Symptoms:**
- Redirected to the error page after authorization attempt
- Error message about invalid redirect URI or client ID

**Solutions:**
1. Verify that your redirect URI in the Linear developer portal exactly matches your application's callback URL
   - In Linear: Go to your [developer applications](https://linear.app/settings/api/applications)
   - Ensure the redirect URI is set to `https://your-domain.com/api/linear/callback`
   - For local development: `http://localhost:3000/api/linear/callback`

2. Check that your environment variables are correctly set in `.env.local`:
   ```
   LINEAR_CLIENT_ID=your-client-id
   LINEAR_CLIENT_SECRET=your-client-secret
   NEXTAUTH_URL=http://localhost:3000 # or your production URL
   ```

3. Make sure the Linear application is set to "Public" if you're testing with multiple users

### Token Exchange Failures

**Symptoms:**
- Error in the console about token exchange failure
- Unable to complete authentication after Linear approval

**Solutions:**
1. Verify your client secret is correct
2. Check the callback route for errors:
   - Inspect the server logs for detailed error information
   - Ensure the authorization code is being properly received and used

3. Verify correct content types in API requests:
   ```typescript
   const response = await fetch('https://api.linear.app/oauth/token', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/x-www-form-urlencoded',
     },
     body: new URLSearchParams({
       client_id: LINEAR_CLIENT_ID,
       client_secret: LINEAR_CLIENT_SECRET,
       redirect_uri: redirectUri,
       code,
       code_verifier: verifier,
       grant_type: 'authorization_code',
     }),
   });
   ```

### Authentication Lost After Working Before

**Symptoms:**
- User was previously authenticated but is now redirected to login again
- "Not authenticated" errors in API calls

**Solutions:**
1. Check if tokens have expired
   - Linear access tokens expire after 24 hours
   - Implement token refresh if not already done

2. Verify cookie storage and retrieval
   - Cookies might be cleared or expired
   - Check that secure, HTTP-only cookies are being properly set and read

## API Issues

### Failed to Create Test Issue

**Symptoms:**
- "Post Test Issue" button shows error
- Network request succeeds but no issue appears in Linear

**Solutions:**
1. Check the API response for error details
   - Use browser developer tools to inspect the network response
   - Look for specific error messages from the Linear API

2. Verify team ID is correct
   - Make sure the team ID being passed to the API is valid
   - The team ID should be in UUID format

3. Check team permissions
   - Ensure the authenticated user has permission to create issues in the specified team

4. Inspect server logs for additional details
   - Look for errors in the server console or logs
   - Check for any JSON parsing or validation errors

### Missing or Incorrect Data

**Symptoms:**
- Teams or issues not appearing
- Data appearing differently than expected

**Solutions:**
1. Check API response data structure
   - Linear may have updated their API
   - Verify that response parsing is handling all fields correctly

2. Verify cache invalidation
   - If caching data, ensure it's refreshed appropriately
   - Consider adding a force refresh option for users

3. Check user permissions
   - User might not have access to certain teams or data
   - Verify scopes requested during OAuth are sufficient

## UI Component Issues

### Create Test Issue Button Not Working

**Symptoms:**
- Button click does nothing or shows loading indefinitely
- Error message appears briefly but no action is taken

**Solutions:**
1. Check for client-side errors
   ```javascript
   try {
     await fetch('/api/linear/create-test-issue', {...});
   } catch (error) {
     console.error('Issue creation failed:', error);
   }
   ```

2. Verify teamId is being passed correctly
   ```typescript
   <CreateTestIssueButton teamId={team.id} teamName={team.name} />
   ```

3. Ensure the component is properly mounted as a client component
   - Check for 'use client' directive at the top of the file
   - Verify that any server component dependencies are properly handled

### Teams Not Displaying

**Symptoms:**
- "No teams found" message when user has teams in Linear
- Empty or incomplete team list

**Solutions:**
1. Verify authentication status
   ```typescript
   if (!(await isLinearAuthenticated())) {
     // Handle unauthenticated state
   }
   ```

2. Check API permissions
   - Ensure the OAuth scopes include team read access
   - Check that the user has teams in their Linear account

3. Debug API response
   ```typescript
   try {
     const linearService = new LinearOAuthService();
     const teams = await linearService.getTeams();
     console.log('Teams response:', teams);
     // Handle teams
   } catch (error) {
     console.error('Failed to fetch teams:', error);
     // Handle error state
   }
   ```

## Environment Configuration Issues

### Server-Side Errors

**Symptoms:**
- 500 errors in server components or API routes
- Authentication works but API calls fail

**Solutions:**
1. Check server environment variables
   - Verify all required environment variables are set on the server
   - For Vercel: Check environment variables in the project settings

2. Verify proper API URL construction
   ```typescript
   const apiUrl = process.env.NODE_ENV === 'production'
     ? 'https://your-domain.com/api/linear/callback'
     : 'http://localhost:3000/api/linear/callback';
   ```

3. Check for CORS issues if making client-side API calls
   - Ensure API routes are properly handling CORS headers
   - Consider using Next.js API routes instead of direct Linear API calls from the client

## Advanced Troubleshooting

### Enabling Debug Logging

To get more detailed logging information:

1. Add debug logs to your Linear service:
   ```typescript
   console.log(`[LinearOAuthService] Making request to ${url}`);
   try {
     const response = await fetchFromLinear(url);
     console.log(`[LinearOAuthService] Response status: ${response.status}`);
     // Continue processing
   } catch (error) {
     console.error(`[LinearOAuthService] Error: ${error.message}`);
     throw error;
   }
   ```

2. Check for network errors in the browser console

3. Verify Linear API status at [Linear Status](https://status.linear.app)

### Debugging Token Storage

To debug issues with token storage:

1. Check cookie values (server-side only):
   ```typescript
   import { cookies } from 'next/headers';
   
   // In a server component or API route
   const cookieStore = cookies();
   const hasToken = cookieStore.has('linear_access_token');
   console.log('Has Linear token:', hasToken);
   ```

2. Ensure cookies are set with proper options:
   ```typescript
   cookies().set('linear_access_token', access_token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     maxAge: 60 * 60 * 24, // 24 hours
     path: '/',
   });
   ```

### Testing the Integration Locally

To test the entire flow locally:

1. Set up a Linear developer application with redirect to `http://localhost:3000/api/linear/callback`

2. Configure your local environment variables in `.env.local`

3. Use the Network tab in developer tools to inspect all requests and responses

4. Test with multiple accounts to verify permission handling

## Getting Additional Help

If you encounter issues not covered in this guide:

1. Check the [Linear API Documentation](https://developers.linear.app/docs/)

2. Review the Linear integration source code, particularly:
   - `/src/lib/linear-auth.ts` - For authentication utilities
   - `/src/app/api/linear/` - For API endpoints
   - `/src/components/linear/` - For UI components

3. Contact the development team for support through the appropriate channels 