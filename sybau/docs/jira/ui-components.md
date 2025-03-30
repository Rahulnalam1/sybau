# JIRA UI Components

## Overview

Sybau provides several UI components for integrating with JIRA. These components handle authentication, displaying JIRA data, and interacting with the JIRA API.

## Authentication Components

### JIRA Integration Page

Located at `/integrate/jira`, this page allows users to connect their JIRA account.

**File Path**: `src/app/integrate/jira/page.tsx`

**Key Features**:
- Displays information about JIRA integration
- Provides a "Connect JIRA Account" button
- Initiates the OAuth flow

```tsx
// Example usage in another component
import Link from 'next/link';

function SomeComponent() {
  return (
    <Link href="/integrate/jira">
      Connect JIRA Account
    </Link>
  );
}
```

### JIRA Success Page

Located at `/integrate/jira/success`, this page is shown after successful authentication.

**File Path**: `src/app/integrate/jira/success/page.tsx`

**Key Features**:
- Confirms successful connection
- Provides navigation options to view projects or go to dashboard

### JIRA Error Page

Located at `/integrate/jira/error`, this page is shown when authentication fails.

**File Path**: `src/app/integrate/jira/error/page.tsx`

**Key Features**:
- Displays error details
- Provides retry options
- Handles different error types

## Data Display Components

### JIRA Projects Page

Located at `/integrate/jira/projects`, this page displays all JIRA projects the user has access to.

**File Path**: `src/app/integrate/jira/projects/page.tsx`

**Key Features**:
- Lists all available JIRA projects with key information
- Shows the JIRA cloud instance being used
- Provides links to open projects in JIRA
- Includes test issue creation functionality
- Has a "Back to Dashboard" navigation button

```tsx
// Component structure
<div className="p-8">
  <div className="flex justify-between items-center mb-6">
    <div>
      <h1 className="text-2xl font-bold mb-2">Your JIRA Projects</h1>
      <p className="text-gray-600">Connected to JIRA Cloud: {cloudName}</p>
    </div>
    <Button asChild variant="outline">
      <Link href="/">Back to Dashboard</Link>
    </Button>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {projects.map(project => (
      <ProjectCard key={project.id} project={project} cloudId={cloudId} />
    ))}
  </div>
</div>
```

### Project Card Component

Displays a JIRA project with associated actions.

**File Path**: Part of `src/app/integrate/jira/projects/page.tsx`

**Key Features**:
- Displays project name, key, and description
- Shows project avatar (if available)
- Includes "Open in JIRA" button
- Includes "Post Test Issue" button

## Interactive Components

### Create Test Issue Button

A client component that allows creating test issues in JIRA.

**File Path**: `src/components/jira/create-test-issue-button.tsx`

**Key Features**:
- Creates test issues in JIRA
- Displays loading state
- Shows success/error feedback
- Provides a link to the created issue

```tsx
// Example usage
import { CreateJiraTestIssueButton } from "@/components/jira/create-test-issue-button";

function ProjectCard({ project, cloudId }) {
  return (
    <div className="card">
      <h3>{project.name}</h3>
      <CreateJiraTestIssueButton 
        cloudId={cloudId} 
        projectId={project.id} 
      />
    </div>
  );
}
```

## Component Architecture

The components follow a client/server architecture:

### Server Components

- `page.tsx` files that fetch data from JIRA services
- Handle initial data loading and authentication checks
- Use the `JiraOAuthService` directly

### Client Components

- Interactive elements like the `CreateJiraTestIssueButton`
- Handle user interactions and state management
- Use the JIRA API endpoints via fetch calls

## State Management

The JIRA integration uses React's built-in state management for client components:

```tsx
// In the CreateJiraTestIssueButton component
const [isLoading, setIsLoading] = useState(false);
const [result, setResult] = useState(null);
```

## Error Handling

Components include comprehensive error handling to provide feedback to users:

```tsx
try {
  // API call logic
} catch (error) {
  console.error('Error creating test issue:', error);
  setResult({
    success: false,
    message: error instanceof Error ? error.message : 'An error occurred'
  });
}
```

## Styling

The components use TailwindCSS for styling, with consistent design patterns:

- Cards for individual projects
- Responsive grid layouts
- Accessible color schemes
- Clear visual feedback for actions

## Navigation Flow

The navigation flow between components is as follows:

1. User starts from the main dashboard with a "Connect JIRA Account" button
2. After clicking, they're taken to the JIRA integration page (`/integrate/jira`)
3. Authentication redirects to Atlassian and back to the success page
4. Success page links to the projects page
5. Projects page displays all projects and allows interaction
6. "Back to Dashboard" button returns to the main application

## Component Dependencies

The components have the following dependencies:

- JIRA OAuth service for API communication
- Authentication utilities for token management
- UI components from the design system (Button, Card, etc.)
- Next.js for routing and server component functionality 