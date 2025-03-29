# Linear Integration Usage Examples

This document provides practical examples of how to use the Linear integration in Sybau.

## Authentication

### Connecting a Linear Account

To allow users to connect their Linear account:

```tsx
// In a React component
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function ConnectLinearButton() {
  return (
    <Button asChild>
      <Link href="/integrate/linear">
        Connect Linear Account
      </Link>
    </Button>
  );
}
```

### Checking Authentication Status

To check if a user is authenticated with Linear:

```tsx
// In a server component
import { isLinearAuthenticated } from "@/lib/linear-auth";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  if (!(await isLinearAuthenticated())) {
    redirect('/integrate/linear');
  }
  
  // Component content for authenticated users
  return <div>Protected content</div>;
}
```

## Fetching Linear Data

### Fetching Teams

To fetch and display Linear teams:

```tsx
// In a server component
import { LinearOAuthService } from "@/api/services/linear/linearOAuthService";

export default async function TeamsPage() {
  try {
    const linearService = new LinearOAuthService();
    const teams = await linearService.getTeams();
    
    return (
      <div>
        <h1>Your Linear Teams</h1>
        <ul>
          {teams.map(team => (
            <li key={team.id}>{team.name}</li>
          ))}
        </ul>
      </div>
    );
  } catch (error) {
    return <div>Error loading teams: {String(error)}</div>;
  }
}
```

### Fetching Issues for a Team

To fetch and display issues for a specific team:

```tsx
// In a server component
import { LinearOAuthService } from "@/api/services/linear/linearOAuthService";

export default async function TeamIssuesPage({ params }: { params: { teamId: string } }) {
  const { teamId } = params;
  
  try {
    const linearService = new LinearOAuthService();
    const issues = await linearService.getIssuesByTeam(teamId);
    
    return (
      <div>
        <h1>Team Issues</h1>
        <ul>
          {issues.map(issue => (
            <li key={issue.id}>
              <a href={issue.url} target="_blank" rel="noopener noreferrer">
                {issue.identifier}: {issue.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  } catch (error) {
    return <div>Error loading issues: {String(error)}</div>;
  }
}
```

## Creating Linear Issues

### Creating an Issue from a Form

To create an issue from a user form:

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function IssueForm({ teamId }: { teamId: string }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/linear/issues/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          teamId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create issue');
      }
      
      setResult({ success: true, message: 'Issue created successfully!' });
      setTitle('');
      setDescription('');
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">Title</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Issue'}
      </Button>
      
      {result && (
        <div className={`p-2 rounded ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {result.success ? result.message : result.error}
        </div>
      )}
    </form>
  );
}
```

### Using the Test Issue Button

To use the pre-built test issue button:

```tsx
import { CreateTestIssueButton } from "@/components/linear/create-test-issue-button";

export function TeamDetails({ team }: { team: any }) {
  return (
    <div>
      <h2>{team.name}</h2>
      <p>Key: {team.key}</p>
      <CreateTestIssueButton teamId={team.id} teamName={team.name} />
    </div>
  );
}
```

## API Requests

### Direct API Calls

To make direct API calls to Linear (bypassing our services):

```tsx
'use client';

import { useState, useEffect } from 'react';

export function DirectLinearExample() {
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // This uses our fetchFromLinear utility which handles authentication
        const response = await fetch('/api/linear/teams');
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };
    
    fetchData();
  }, []);
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  if (!data) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h2>Linear Teams</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

## Complete Examples

### Teams Dashboard with Issue Creation

A complete example of a teams dashboard with issue creation:

```tsx
// src/app/dashboard/linear/page.tsx
import { LinearOAuthService } from "@/api/services/linear/linearOAuthService";
import { Button } from "@/components/ui/button";
import { CreateTestIssueButton } from "@/components/linear/create-test-issue-button";
import { isLinearAuthenticated } from "@/lib/linear-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LinearDashboard() {
  // Check authentication
  if (!(await isLinearAuthenticated())) {
    redirect('/integrate/linear');
  }

  let teams = [];
  let error = null;

  try {
    const linearService = new LinearOAuthService();
    teams = await linearService.getTeams();
  } catch (err) {
    error = "Failed to fetch teams";
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Linear Dashboard</h1>
        <Button asChild variant="outline">
          <Link href="/integrate/linear">
            Manage Integration
          </Link>
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {teams.length === 0 && !error ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-600 mb-2">No teams found</h2>
          <p className="text-gray-500 mb-6">
            You don't have any teams in your Linear account yet.
          </p>
          <Button asChild>
            <a href="https://linear.app/teams" target="_blank" rel="noopener noreferrer">
              Create a Team in Linear
            </a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <span 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: team.color || '#6366F1' }} 
                />
                <h2 className="text-xl font-semibold">{team.name}</h2>
              </div>
              
              <div className="text-sm text-gray-500 mb-3">
                <div className="flex justify-between mb-1">
                  <span>Key:</span>
                  <span className="font-medium text-gray-700">{team.key}</span>
                </div>
                <div className="flex justify-between">
                  <span>Issues:</span>
                  <span className="font-medium text-gray-700">{team.issueCount}</span>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <Button asChild variant="outline" className="w-full" size="sm">
                  <a href={`https://linear.app/team/${team.key}`} target="_blank" rel="noopener noreferrer">
                    Open in Linear
                  </a>
                </Button>
                <CreateTestIssueButton teamId={team.id} teamName={team.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 