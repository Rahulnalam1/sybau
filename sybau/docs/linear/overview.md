# Linear Integration Overview

## Introduction

The Linear integration in Sybau enables users to connect their Linear accounts and interact with Linear data directly within our application. This integration uses OAuth 2.0 for secure authentication and provides a seamless experience for users to view and manage their Linear teams, projects, and issues.

## Key Features

- **OAuth Authentication**: Secure authentication with Linear using OAuth 2.0
- **Team Management**: View and manage Linear teams
- **Issue Creation**: Create issues in Linear directly from Sybau
- **Data Synchronization**: View Linear data within Sybau's interface

## Architecture Overview

The Linear integration consists of several components:

1. **OAuth Flow**: Handles authentication with Linear and token management
2. **API Services**: JavaScript services that interact with Linear's API
3. **UI Components**: React components for displaying and interacting with Linear data
4. **API Routes**: NextJS API routes that serve as a bridge between the frontend and Linear's API

### Integration Flow

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│             │      │             │      │             │
│   Sybau UI  │ ──── │  Sybau API  │ ──── │  Linear API │
│             │      │             │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
       │                                         │
       │                                         │
       │          ┌─────────────┐                │
       └────────► │  Linear UI  │ ◄──────────────┘
                  └─────────────┘
```

### Integration Components

- **OAuth Authentication**: Implemented through the `/integrate/linear` page and API routes
- **Linear Service**: `LinearOAuthService` class that handles API interactions
- **UI Components**: Pages and components for displaying Linear data
- **API Routes**: Server endpoints for proxying requests to Linear's API

## Technical Stack

- **Frontend**: React, NextJS, TailwindCSS
- **Authentication**: OAuth 2.0 with HTTP-only cookies
- **API Communication**: Fetch API, Linear SDK
- **API Gateway**: NextJS API routes

## Related Documentation

- [OAuth Authentication](./oauth-authentication.md)
- [API Services](./api-services.md)
- [UI Components](./ui-components.md)
- [Usage Examples](./usage-examples.md)
- [Linear API Documentation](https://developers.linear.app/docs/) 