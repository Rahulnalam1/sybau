# JIRA Integration Troubleshooting

This document provides solutions for common issues that may occur when using the JIRA integration in Sybau.

## Authentication Issues

### OAuth Authorization Fails

**Symptoms:**
- Redirected to the error page after authorization attempt
- Error message about invalid redirect URI or client ID

**Solutions:**
1. Verify that your redirect URI in the Atlassian developer portal exactly matches your application's callback URL
   - In Atlassian: Go to [developer.atlassian.com](https://developer.atlassian.com/console/myapps/)
   - Ensure the redirect URI is set to `https://your-domain.com/api/auth/jira/callback`
   - For local development: `http://localhost:3000/api/auth/jira/callback`

2. Check that your environment variables are correctly set in `.env`:
   ```
   JIRA_CLIENT_ID=your-client-id
   JIRA_CLIENT_SECRET=your-client-secret
   NEXT_PUBLIC_JIRA_CLIENT_ID=your-client-id
   NEXT_PUBLIC_JIRA_REDIRECT_URI=http://localhost:3000/api/auth/jira/callback
   ```

3. Ensure your JIRA application has the required scopes:
   - `offline_access`
   - `read:jira-work`
   - `write:jira-work`
   - `manage:jira-project`

### Token Exchange Failures

**Symptoms:**
- Error in the console about token exchange failure
- Unable to complete authentication after JIRA approval

**Solutions:**
1. Verify your client secret is correct
2. Check the callback route for errors:
   - Inspect the server logs for detailed error information
   - Ensure the authorization code is being properly received and used

3. Verify correct content types in API requests:
   ```typescript
   const response = await fetch('https://auth.atlassian.com/oauth/token', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       grant_type: 'authorization_code',
       client_id: process.env.JIRA_CLIENT_ID,
       client_secret: process.env.JIRA_CLIENT_SECRET,
       code,
       redirect_uri: redirectUri
     })
   });
   ```

### Authentication Lost After Working Before

**Symptoms:**
- User was previously authenticated but is now redirected to login again
- "Not authenticated" errors in API calls

**Solutions:**
1. Check if cookies are being properly set and stored:
   ```typescript
   // In a server component
   const accessToken = await getJiraAccessToken();
   console.log('Has access token:', !!accessToken);
   ```

2. Ensure cookies have proper expiration dates and are not being cleared:
   ```typescript
   response.cookies.set({
     name: 'jira_access_token',
     value: access_token,
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'lax',
     path: '/',
     maxAge: 60 * 60 * 24 * 7, // 1 week
   });
   ```

3. Try refreshing the token:
   ```typescript
   try {
     const newToken = await refreshJiraToken();
     // Use the new token
   } catch (error) {
     // Handle refresh error
     console.error('Token refresh failed:', error);
   }
   ```

## API Issues

### No JIRA Cloud Instances Found

**Symptoms:**
- Message "No JIRA Cloud Instances Found" on the projects page
- Cannot access JIRA projects

**Solutions:**
1. Verify the user has access to at least one JIRA Cloud instance
2. Check that the OAuth token has the required scopes
3. Inspect the network requests to identify any API errors:
   ```typescript
   const resources = await jiraService.getAccessibleResources();
   console.log('Resources:', resources);
   ```

### Cannot Create Issues

**Symptoms:**
- Error when clicking "Post Test Issue" button
- Failed API calls to create issues

**Solutions:**
1. Check console logs for API errors
2. Verify the issue type ID is correct:
   ```typescript
   // Get available issue types first
   const issueTypes = await jiraService.getProjectIssueTypes(cloudId, projectId);
   console.log('Available issue types:', issueTypes);
   ```

3. Ensure the description format follows JIRA's Atlassian Document Format (ADF):
   ```typescript
   // Correct ADF format for description
   const description = {
     version: 1,
     type: "doc",
     content: [
       {
         type: "paragraph",
         content: [
           {
             type: "text",
             text: "Your description text here"
           }
         ]
       }
     ]
   };
   ```

4. Add debug logging to see the complete request and response:
   ```typescript
   console.log('Request payload:', JSON.stringify(requestData, null, 2));
   console.log('Response status:', response.status);
   console.log('Response body:', await response.text());
   ```

### "Open in JIRA" Links Not Working

**Symptoms:**
- Clicking "Open in JIRA" takes you to an invalid URL
- Project not found errors in JIRA

**Solutions:**
1. Check the URL format being used:
   ```typescript
   // Correct format
   const jiraUrl = `${cloudResource.url}/browse/${project.key}`;
   ```

2. Ensure the project key is correct:
   ```typescript
   console.log('Project key:', project.key);
   ```

3. Verify the cloud resource URL is correct:
   ```typescript
   console.log('Cloud resource:', cloudResource);
   ```

## Component Issues

### Test Issue Button Not Displaying Results

**Symptoms:**
- Clicking the button has no effect
- No error or success message appears

**Solutions:**
1. Check that state updates are working correctly:
   ```typescript
   // Add this to see if state is updating
   useEffect(() => {
     console.log('Current result state:', result);
   }, [result]);
   ```

2. Verify that the component is rerendering after state changes
3. Ensure error handling is capturing and displaying errors:
   ```typescript
   try {
     // API call logic
   } catch (error) {
     console.error('Complete error:', error);
     setResult({
       success: false,
       message: error instanceof Error ? error.message : String(error)
     });
   }
   ```

### Projects Not Showing Up

**Symptoms:**
- Empty projects grid after authentication
- "No projects found" message

**Solutions:**
1. Check if the user has projects in their JIRA instance
2. Verify the projects API call is working:
   ```typescript
   try {
     const projects = await jiraService.getProjects(cloudId);
     console.log('Projects from API:', projects);
   } catch (error) {
     console.error('Error fetching projects:', error);
   }
   ```

3. Ensure you're using the correct cloud ID for API calls

## Environment and Configuration Issues

### CORS Errors

**Symptoms:**
- Console errors about CORS policy
- API requests failing from the client

**Solutions:**
1. Use Next.js API routes as proxies for all JIRA API calls
2. Ensure proper headers are set in API responses:
   ```typescript
   return NextResponse.json(data, {
     headers: {
       'Access-Control-Allow-Origin': '*',
       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
     }
   });
   ```

### Missing Environment Variables

**Symptoms:**
- "Client ID is missing" errors
- Authentication fails immediately

**Solutions:**
1. Verify all required environment variables are set in `.env`
2. Check that Next.js is loading the environment variables:
   ```typescript
   console.log('Environment variables loaded:', {
     clientId: process.env.JIRA_CLIENT_ID ? 'Set' : 'Missing',
     clientSecret: process.env.JIRA_CLIENT_SECRET ? 'Set' : 'Missing',
     redirectUri: process.env.NEXT_PUBLIC_JIRA_REDIRECT_URI || 'Default'
   });
   ```

3. Restart the development server after changing environment variables

## Advanced Troubleshooting

### Enabling Debug Logs

To get more detailed information about what's happening with the JIRA integration, add debug logs to the key components:

1. **API Endpoints**:
   ```typescript
   console.log('API: Request received:', request.method, request.url);
   console.log('API: Request body:', await request.json());
   // Process request
   console.log('API: Response:', response);
   ```

2. **OAuth Service**:
   ```typescript
   console.log('JiraService: Making request to:', url);
   console.log('JiraService: With options:', options);
   // Make request
   console.log('JiraService: Response status:', response.status);
   console.log('JiraService: Response data:', await response.json());
   ```

3. **Client Components**:
   ```typescript
   console.log('Component: Starting operation with props:', props);
   console.log('Component: Current state:', { isLoading, result });
   // User action
   console.log('Component: Action completed with result:', newResult);
   ```

### Checking Network Requests

Use the browser's developer tools to inspect network requests:

1. Open the Network tab in browser developer tools
2. Filter for fetch/XHR requests
3. Look for calls to JIRA API endpoints
4. Examine the request headers, payload, and response

### Testing with Curl

Test the JIRA API endpoints directly using curl:

```bash
# Test the create issue endpoint
curl -X POST http://localhost:3000/api/jira/create-test-issue \
  -H "Content-Type: application/json" \
  -d '{"cloudId":"your-cloud-id","projectId":"your-project-id","issueTypeId":"your-issue-type-id"}'
```

### Getting Support

If you're still experiencing issues:

1. Check the [Atlassian Developer Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)
2. Look for similar issues in the [Atlassian Community](https://community.atlassian.com/)
3. File a detailed bug report with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Console logs
   - Network request/response details 