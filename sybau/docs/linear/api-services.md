# Linear API Services

## Overview

The Linear API services in Sybau provide a structured interface for interacting with Linear's API. These services handle authentication, data fetching, and mutation operations against the Linear API.

## Service Structure

There are two main service implementations:

1. **LinearService**: Uses a Linear API key for authentication (simpler, less secure)
2. **LinearOAuthService**: Uses OAuth tokens for authentication (more secure, user-specific)

We recommend using the OAuth version for production use.

## LinearOAuthService

The `LinearOAuthService` class uses OAuth tokens stored in cookies to authenticate with Linear's API. It provides methods for common Linear operations.

### Service Initialization

```typescript
import { LinearOAuthService } from "@/api/services/linear/linearOAuthService";

// Initialize the service
const linearService = new LinearOAuthService();
```

### Available Methods

#### Get Teams

Retrieves all teams the authenticated user has access to.

```typescript
const teams = await linearService.getTeams();
```

#### Get Projects for a Team

Retrieves all projects for a specific team.

```typescript
const projects = await linearService.getProjects(teamId);
```

#### Get Issues for a Project

Retrieves all issues for a specific project.

```typescript
const issues = await linearService.getIssues(projectId);
```

#### Get Issues for a Team

Retrieves all issues for a specific team.

```typescript
const issues = await linearService.getIssuesByTeam(teamId);
```

#### Get a Specific Issue

Retrieves details for a specific issue.

```typescript
const issue = await linearService.getIssueById(issueId);
```

#### Create an Issue

Creates a new issue in Linear.

```typescript
const issue = await linearService.createIssue({
  title: "Issue Title",
  description: "Issue Description",
  teamId: "team-id",
  // Optional parameters
  projectId: "project-id",  
  assigneeId: "user-id",
  priority: 1,
});
```

## Linear Authentication Utilities

The `linear-auth.ts` utility file provides functions for working with Linear authentication:

```typescript
import { 
  getLinearAccessToken, 
  isLinearAuthenticated,
  fetchFromLinear,
  refreshLinearToken
} from "@/lib/linear-auth";
```

### Authentication Status

Check if a user is authenticated with Linear:

```typescript
const isAuthenticated = await isLinearAuthenticated();
```

### Making Authenticated Requests

Make an authenticated request to Linear's API:

```typescript
const data = await fetchFromLinear('/api/endpoint');
```

### Token Refreshing

Refresh an expired access token:

```typescript
const newToken = await refreshLinearToken();
```

## API Routes

The following Next.js API routes are available for Linear integration:

| Route | Description |
|-------|-------------|
| `/api/auth/linear/callback` | OAuth callback handler |
| `/api/auth/linear/status` | Check authentication status |
| `/api/linear/teams` | Get all teams |
| `/api/linear/projects` | Get projects for a team |
| `/api/linear/issues` | Get issues for a project |
| `/api/linear/team-issues` | Get issues for a team |
| `/api/linear/issue` | Get a specific issue |
| `/api/linear/issues/create` | Create a new issue |
| `/api/linear/create-test-issue` | Create a test issue |

## Example: Creating an Issue

```typescript
// Client-side example
const createIssue = async () => {
  const response = await fetch('/api/linear/issues/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'New Issue',
      description: 'Issue description',
      teamId: 'team-id',
    }),
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('Issue created:', data.issue);
  }
};
```

## Error Handling

All service methods include try/catch blocks to handle errors consistently:

```typescript
try {
  const data = await linearService.someMethod();
  // Handle success
} catch (error) {
  console.error('Error from Linear service:', error);
  // Handle error
}
```

## Implementation Considerations

1. **Rate Limiting**: Be aware of Linear's API rate limits
2. **Error Handling**: Always handle errors from Linear's API
3. **Token Expiration**: Consider implementing automatic token refresh logic
4. **Pagination**: For methods that might return large amounts of data, implement pagination

## Testing Endpoint Status

Use the `/api/auth/linear/status` endpoint to check if a user is authenticated:

```typescript
const checkAuth = async () => {
  const response = await fetch('/api/auth/linear/status');
  const data = await response.json();
  return data.authenticated;
};
``` 