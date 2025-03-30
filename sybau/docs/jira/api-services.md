# JIRA API Services

## Overview

The JIRA API services in Sybau provide a structured interface for interacting with JIRA's API. These services handle authentication, data fetching, and mutation operations against the JIRA API.

## Service Structure

The main service implementation is the `JiraOAuthService` which uses OAuth tokens for authentication. It provides methods for common JIRA operations.

## JiraOAuthService

The `JiraOAuthService` class uses OAuth tokens stored in cookies to authenticate with JIRA's API. It provides methods for common JIRA operations.

### Service Initialization

```typescript
import { JiraOAuthService } from "@/api/services/jira/jiraOAuthService";

// Initialize the service
const jiraService = new JiraOAuthService();
```

### Available Methods

#### Get Accessible Resources

Retrieves all JIRA Cloud instances the authenticated user has access to.

```typescript
const resources = await jiraService.getAccessibleResources();
```

This returns an array of cloud resources, each containing:
- `id`: The cloud ID (important for all subsequent API calls)
- `name`: The name of the JIRA instance
- `url`: The URL of the JIRA instance
- Other metadata about the instance

#### Get Projects for a Cloud Instance

Retrieves all projects for a specific JIRA Cloud instance.

```typescript
const projects = await jiraService.getProjects(cloudId);
```

#### Get Issue Types

Retrieves all issue types available in a JIRA Cloud instance.

```typescript
const issueTypes = await jiraService.getIssueTypes(cloudId);
```

#### Get Project Issue Types

Retrieves issue types available for a specific project.

```typescript
const projectIssueTypes = await jiraService.getProjectIssueTypes(cloudId, projectId);
```

#### Get Issues for a Project

Retrieves issues for a specific project.

```typescript
const issues = await jiraService.getIssues(cloudId, projectKey);
```

#### Get a Specific Issue

Retrieves details for a specific issue.

```typescript
const issue = await jiraService.getIssue(cloudId, issueKey);
```

#### Create an Issue

Creates a new issue in JIRA.

```typescript
const issue = await jiraService.createIssue(cloudId, {
  projectId: "project-id",
  summary: "Issue Title",
  description: "Issue Description",
  issueTypeId: "issue-type-id",
  // Optional parameters
  assigneeId: "user-id",
  priorityId: "priority-id"
});
```

#### Create a Test Issue

Creates a test issue in JIRA with predefined content.

```typescript
const issue = await jiraService.createTestIssue(cloudId, projectId, issueTypeId);
```

## JIRA Authentication Utilities

The `jira-auth.ts` utility file provides functions for working with JIRA authentication:

```typescript
// Get the JIRA access token
const accessToken = await getJiraAccessToken();

// Check if the user is authenticated with JIRA
const isAuthenticated = await isJiraAuthenticated();

// Make an authenticated request to the JIRA API
const data = await fetchFromJira('/ex/jira/{cloudId}/rest/api/3/project');

// Refresh the JIRA access token
const newToken = await refreshJiraToken();
```

## API Implementation Details

### Fetching Data

The service uses standard fetch API calls to interact with JIRA's REST API:

```typescript
private async fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = await this.getHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...headers
    }
  });

  if (!response.ok) {
    throw new Error(`JIRA API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
```

### Error Handling

The service includes robust error handling to capture and report JIRA API errors:

```typescript
try {
  const data = await jiraService.getProjects(cloudId);
  // Handle success
} catch (error) {
  console.error("Error fetching JIRA projects:", error);
  // Handle error
}
```

## API Endpoints

The integration exposes several API endpoints to interact with JIRA:

### Authentication Status

`GET /api/auth/jira/status`

Checks if the user is authenticated with JIRA.

### Issue Types

`GET /api/jira/issue-types?cloudId={cloudId}&projectId={projectId}`

Gets issue types for a specific project.

### Create Test Issue

`POST /api/jira/create-test-issue`

Creates a test issue with the following request body:

```json
{
  "cloudId": "cloud-id",
  "projectId": "project-id",
  "issueTypeId": "issue-type-id"
}
```

## Using the Services in Components

### Server Components

In server components, you can directly use the service:

```typescript
import { JiraOAuthService } from "@/api/services/jira/jiraOAuthService";

export default async function JiraProjectsPage() {
  const jiraService = new JiraOAuthService();
  const resources = await jiraService.getAccessibleResources();
  // ...
}
```

### Client Components

In client components, you should use the API endpoints via fetch:

```typescript
// In a client component
const fetchProjects = async (cloudId) => {
  const response = await fetch(`/api/jira/projects?cloudId=${cloudId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return response.json();
};
```

## Error Logging

The services include comprehensive error logging to help diagnose issues:

```typescript
console.error('JiraService: Error creating JIRA issue:', error);
```

This helps in debugging issues related to the JIRA API integration. 