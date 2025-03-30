# Linear UI Components

## Overview

Sybau provides several UI components for integrating with Linear. These components handle authentication, displaying Linear data, and interacting with the Linear API.

## Authentication Components

### Linear Integration Page

Located at `/integrate/linear`, this page allows users to connect their Linear account.

**File Path**: `src/app/integrate/linear/page.tsx`

**Key Features**:
- Displays information about Linear integration
- Provides a "Connect Linear Account" button
- Initiates the OAuth flow

```tsx
// Example usage in another component
import Link from 'next/link';

function SomeComponent() {
  return (
    <Link href="/integrate/linear">
      Connect Linear Account
    </Link>
  );
}
```

### Linear Success Page

Located at `/integrate/linear/success`, this page is shown after successful authentication.

**File Path**: `src/app/integrate/linear/success/page.tsx`

**Key Features**:
- Confirms successful connection
- Provides navigation options to view teams or go to dashboard

### Linear Error Page

Located at `/integrate/linear/error`, this page is shown when authentication fails.

**File Path**: `src/app/integrate/linear/error/page.tsx`

**Key Features**:
- Displays error details
- Provides retry options
- Handles different error types

## Data Display Components

### Linear Teams Page

Located at `/integrate/linear/teams`, this page displays all Linear teams the user has access to.

**File Path**: `src/app/integrate/linear/teams/page.tsx`

**Key Features**:
- Lists teams with key information
- Provides links to open teams in Linear
- Includes test issue creation functionality

```tsx
// Example of rendering teams
function TeamsDisplay({ teams }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
```

### Team Card Component

Displays a Linear team with associated actions.

**File Path**: Part of `src/app/integrate/linear/teams/page.tsx`

**Key Features**:
- Displays team name, key, and issue count
- Includes "Open in Linear" button
- Includes "Post Test Issue" button

## Interactive Components

### Create Test Issue Button

A client component that allows creating test issues in Linear.

**File Path**: `src/components/linear/create-test-issue-button.tsx`

**Key Features**:
- Creates test issues in Linear
- Displays loading state
- Shows success/error feedback
- Provides a link to the created issue

```tsx
// Example usage
import { CreateTestIssueButton } from "@/components/linear/create-test-issue-button";

function SomeComponent({ team }) {
  return (
    <div>
      <h2>{team.name}</h2>
      <CreateTestIssueButton teamId={team.id} teamName={team.name} />
    </div>
  );
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `teamId` | `string` | The ID of the Linear team to create the issue in |
| `teamName` | `string` | The name of the Linear team (for display purposes) |

## Component Architecture

The components follow a specific architecture to work with Next.js:

1. **Server Components**: Used for data fetching and rendering
2. **Client Components**: Used for interactivity
3. **Hybrid Approach**: Server components contain client components where needed

```
├── Server Component (teams page)
│   ├── Server Component (team card)
│   │   └── Client Component (create test issue button)
```

### Authentication Flow in Components

1. Server components check authentication status using `isLinearAuthenticated()`
2. If not authenticated, they redirect to the authentication page
3. If authenticated, they fetch and display Linear data

```tsx
// Example of authentication check in a server component
export default async function SomeServerComponent() {
  if (!(await isLinearAuthenticated())) {
    redirect('/integrate/linear');
  }
  
  // Fetch and display data
}
```

## Styling

All components use TailwindCSS for styling, with a consistent design language:

- Primary buttons: Blue background with white text
- Secondary buttons: White background with border
- Cards: White background with rounded corners and subtle shadow
- Status indicators: Green for success, red for errors

## Best Practices

When using or extending these components:

1. **Error Handling**: Always include error states and feedback
2. **Loading States**: Show loading indicators during async operations
3. **Permissions**: Check user authentication before displaying sensitive data
4. **Progressive Enhancement**: Ensure core functionality works without JavaScript
5. **Accessibility**: Maintain proper ARIA attributes and keyboard navigation 