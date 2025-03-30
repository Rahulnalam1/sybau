# JIRA Integration Usage Examples

This document provides practical examples of how to use the JIRA integration in Sybau.

## Authentication

### Connecting a JIRA Account

To allow users to connect their JIRA account:

```tsx
// In a React component
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function ConnectJiraButton() {
  return (
    <Button asChild>
      <Link href="/integrate/jira">
        Connect JIRA Account
      </Link>
    </Button>
  );
}
```

### Checking Authentication Status

To check if a user is authenticated with JIRA:

```tsx
// In a server component
import { isJiraAuthenticated } from "@/lib/jira-auth";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  if (!(await isJiraAuthenticated())) {
    redirect('/integrate/jira');
  }
  
  // Component content for authenticated users
  return <div>Protected content</div>;
}
```

## Fetching JIRA Data

### Fetching Cloud Resources

To fetch and display JIRA Cloud instances:

```tsx
// In a server component
import { JiraOAuthService } from "@/api/services/jira/jiraOAuthService";

export default async function CloudInstancesPage() {
  try {
    const jiraService = new JiraOAuthService();
    const resources = await jiraService.getAccessibleResources();
    
    return (
      <div>
        <h1>Your JIRA Cloud Instances</h1>
        <ul>
          {resources.map(resource => (
            <li key={resource.id}>
              {resource.name} ({resource.url})
            </li>
          ))}
        </ul>
      </div>
    );
  } catch (error) {
    return <div>Error loading JIRA instances: {String(error)}</div>;
  }
}
```

### Fetching Projects

To fetch and display projects for a specific cloud instance:

```tsx
// In a server component
import { JiraOAuthService } from "@/api/services/jira/jiraOAuthService";

export default async function ProjectsPage({ params: { cloudId } }) {
  try {
    const jiraService = new JiraOAuthService();
    const projects = await jiraService.getProjects(cloudId);
    
    return (
      <div>
        <h1>JIRA Projects</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="card">
              <h2>{project.name}</h2>
              <p>Key: {project.key}</p>
              <p>{project.description || "No description"}</p>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    return <div>Error loading projects: {String(error)}</div>;
  }
}
```

## Creating Issues

### Creating a Test Issue (Server Component)

To create a test issue from a server component:

```tsx
// In a server action
import { JiraOAuthService } from "@/api/services/jira/jiraOAuthService";

export async function createTestIssue(formData: FormData) {
  'use server';
  
  const cloudId = formData.get('cloudId') as string;
  const projectId = formData.get('projectId') as string;
  const issueTypeId = formData.get('issueTypeId') as string;
  
  try {
    const jiraService = new JiraOAuthService();
    const issue = await jiraService.createTestIssue(cloudId, projectId, issueTypeId);
    
    return { success: true, issue };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}
```

### Creating a Test Issue (Client Component)

To create a test issue from a client component:

```tsx
// In a client component
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CreateIssueForm({ cloudId, projectId, issueTypeId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/jira/create-test-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cloudId, projectId, issueTypeId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create issue');
      }
      
      setResult({ success: true, issue: data.issue });
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <Button 
        onClick={handleSubmit} 
        disabled={isLoading}
      >
        {isLoading ? 'Creating...' : 'Create Test Issue'}
      </Button>
      
      {result && (
        <div className="mt-4">
          {result.success ? (
            <p className="text-green-600">
              Issue created: {result.issue.key}
            </p>
          ) : (
            <p className="text-red-600">
              Error: {result.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

## Complete Examples

### JIRA Projects Page

A complete example of a page that lists JIRA projects and allows creating test issues:

```tsx
// src/app/integrate/jira/projects/page.tsx
import { JiraOAuthService } from "@/api/services/jira/jiraOAuthService";
import { isJiraAuthenticated } from "@/lib/jira-auth";
import { redirect } from "next/navigation";
import { CreateJiraTestIssueButton } from "@/components/jira/create-test-issue-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function JiraProjectsPage() {
  // Check if user is authenticated with JIRA
  if (!(await isJiraAuthenticated())) {
    redirect('/integrate/jira');
  }
  
  try {
    const jiraService = new JiraOAuthService();
    
    // First, get accessible resources (Jira Cloud instances)
    const resources = await jiraService.getAccessibleResources();
    
    if (!resources || resources.length === 0) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">No JIRA Cloud Instances Found</h1>
          <p>We couldn't find any JIRA Cloud instances that you have access to.</p>
          <div className="mt-4">
            <Link href="/integrate/jira" className="text-blue-500 hover:underline">
              Return to JIRA Integration
            </Link>
          </div>
        </div>
      );
    }
    
    // Use the first available resource (cloud instance)
    const cloudResource = resources[0];
    const cloudId = cloudResource.id;
    
    // Get projects for this cloud instance
    const projects = await jiraService.getProjects(cloudId);
    
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Your JIRA Projects</h1>
            <p className="text-gray-600">
              Connected to JIRA Cloud: {cloudResource.name} ({cloudResource.url})
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">
              Back to Dashboard
            </Link>
          </Button>
        </div>
        
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <div className="flex items-center mb-4">
                  {project.avatarUrls && project.avatarUrls["48x48"] ? (
                    <img 
                      src={project.avatarUrls["48x48"]} 
                      alt={project.name} 
                      className="w-10 h-10 mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium">{project.name.substring(0, 2)}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-lg">{project.name}</h3>
                    <p className="text-sm text-gray-500">Key: {project.key}</p>
                  </div>
                </div>
                
                <div className="mt-2 mb-4">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {project.description || "No description available"}
                  </p>
                </div>
                
                <div className="mt-4 space-x-2 flex">
                  <a
                    href={`${cloudResource.url}/browse/${project.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    Open in JIRA
                  </a>
                  
                  <CreateJiraTestIssueButton
                    cloudId={cloudId}
                    projectId={project.id}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <p>No projects found in this JIRA instance.</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching JIRA projects:", error);
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Error Loading JIRA Projects</h1>
        <p className="text-red-600">
          {error instanceof Error ? error.message : "An unexpected error occurred while loading your JIRA projects."}
        </p>
        <div className="mt-4">
          <Link href="/integrate/jira" className="text-blue-500 hover:underline">
            Return to JIRA Integration
          </Link>
        </div>
      </div>
    );
  }
}
```

### Create Test Issue Button

A complete example of the client-side component for creating test issues:

```tsx
// src/components/jira/create-test-issue-button.tsx
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CreateJiraTestIssueButtonProps {
  cloudId: string;
  projectId: string;
}

export function CreateJiraTestIssueButton({ cloudId, projectId }: CreateJiraTestIssueButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; issueKey?: string; issueUrl?: string } | null>(null);
  
  const handleCreateTestIssue = async () => {
    setIsLoading(true);
    setResult(null);
    
    console.log('Starting test issue creation with:', { cloudId, projectId });
    
    try {
      // First, get the issue types for this project to identify a standard issue type
      console.log('Fetching issue types for project:', projectId);
      const issueTypesResponse = await fetch(`/api/jira/issue-types?cloudId=${cloudId}&projectId=${projectId}`);
      
      if (!issueTypesResponse.ok) {
        const errorText = await issueTypesResponse.text();
        console.error('Failed to fetch issue types:', errorText);
        throw new Error('Failed to fetch issue types');
      }
      
      const issueTypes = await issueTypesResponse.json();
      console.log('Retrieved issue types:', issueTypes);
      
      // Find a standard issue type (usually "Task" or the first available)
      const taskIssueType = issueTypes.find((type: any) => type.name === "Task") || issueTypes[0];
      
      if (!taskIssueType) {
        console.error('No issue types available for this project');
        throw new Error('No issue types available for this project');
      }
      
      console.log('Selected issue type for test issue:', taskIssueType);
      
      // Create the test issue
      const requestData = {
        cloudId,
        projectId,
        issueTypeId: taskIssueType.id
      };
      
      console.log('Sending create test issue request with data:', requestData);
      
      const response = await fetch('/api/jira/create-test-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      const data = await response.json();
      console.log('Received response from create test issue API:', data);
      
      if (!response.ok) {
        console.error('API error:', data);
        throw new Error(data.error || 'Failed to create test issue');
      }
      
      // Success - set the result with the issue key and URL
      const issueUrl = `${data.issue.self.split('/rest/api/')[0]}/browse/${data.issue.key}`;
      console.log('Created issue successfully:', { 
        key: data.issue.key, 
        url: issueUrl,
        fullResponse: data
      });
      
      setResult({
        success: true,
        message: 'Test issue created successfully!',
        issueKey: data.issue.key,
        issueUrl
      });
    } catch (error) {
      console.error('Error creating test issue:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred creating the test issue'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      {!result ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCreateTestIssue} 
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Post Test Issue'}
        </Button>
      ) : (
        <div className="mt-2">
          {result.success ? (
            <div className="text-sm space-y-2">
              <p className="text-green-600">{result.message}</p>
              {result.issueKey && result.issueUrl && (
                <a
                  href={result.issueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline block"
                >
                  View {result.issueKey}
                </a>
              )}
            </div>
          ) : (
            <div className="text-sm text-red-600">{result.message}</div>
          )}
        </div>
      )}
    </div>
  );
}
``` 