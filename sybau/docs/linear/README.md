# Linear Integration Documentation

## Overview

This documentation covers the Linear integration implemented in Sybau. Linear is a project management tool that helps teams streamline software projects, sprints, tasks, and bug tracking.

Our integration enables users to:
- Connect their Linear account using OAuth
- View their Linear teams
- Create test issues directly from Sybau
- (Future capabilities: manage projects, issues, and workflows)

## Table of Contents

1. [OAuth Authentication](./oauth-authentication.md)
   - Authentication process
   - Environment configuration
   - Security considerations

2. [API Services](./api-services.md)
   - LinearService and LinearOAuthService
   - Authentication utilities
   - API endpoints

3. [UI Components](./ui-components.md)
   - Authentication components
   - Data display components
   - Interactive components

4. [Usage Examples](./usage-examples.md)
   - Authentication flow
   - Fetching data
   - Creating issues
   - Complete examples

5. [Troubleshooting](./troubleshooting.md)
   - Common issues
   - Solutions
   - Debugging tips

## Getting Started

To get started with the Linear integration:

1. Set up a Linear developer account at [linear.app](https://linear.app)
2. Create an OAuth application in the Linear developer portal
3. Configure the required environment variables:
   ```
   LINEAR_CLIENT_ID=your-client-id
   LINEAR_CLIENT_SECRET=your-client-secret
   ```
4. Use the integration components to connect users' Linear accounts

## Quick Links

- [Linear API Documentation](https://developers.linear.app/docs/)
- [OAuth 2.0 Authorization Code Flow](https://developers.linear.app/docs/oauth/authorization-flow)
- [Linear GraphQL API Explorer](https://linear.app/graphql)

## Security Considerations

The implementation follows security best practices:
- OAuth tokens are stored in HTTP-only cookies
- Authentication state is verified server-side
- CSRF protection implemented
- Only necessary scopes are requested

## Future Enhancements

Planned improvements for the Linear integration:
- Support for webhooks to receive real-time updates
- Enhanced issue management
- Project creation and workflow management
- Expanded team management capabilities
- Integration with Sybau's notification system 