# JIRA Integration Documentation

## Overview

This documentation covers the JIRA integration implemented in Sybau. JIRA is a project management tool by Atlassian that helps teams plan, track, and manage work.

Our integration enables users to:
- Connect their JIRA account using OAuth
- View their JIRA cloud instances and projects
- Create test issues directly from Sybau
- Navigate between JIRA projects and the main application

## Table of Contents

1. [OAuth Authentication](./oauth-authentication.md)
   - Authentication process
   - Environment configuration
   - Security considerations

2. [API Services](./api-services.md)
   - JiraOAuthService
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

To get started with the JIRA integration:

1. Set up a JIRA developer account at [developer.atlassian.com](https://developer.atlassian.com)
2. Create an OAuth application in the Atlassian developer portal
3. Configure the required environment variables:
   ```
   JIRA_CLIENT_ID=your-client-id
   JIRA_CLIENT_SECRET=your-client-secret
   NEXT_PUBLIC_JIRA_CLIENT_ID=your-client-id
   NEXT_PUBLIC_JIRA_REDIRECT_URI=http://localhost:3000/api/auth/jira/callback
   ```
4. Use the integration components to connect users' JIRA accounts

## Quick Links

- [Atlassian OAuth 2.0 Documentation](https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/)
- [JIRA REST API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)
- [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/)

## Security Considerations

The implementation follows security best practices:
- OAuth tokens are stored in HTTP-only cookies
- Authentication state is verified server-side
- CSRF protection implemented
- Only necessary scopes are requested

## Future Enhancements

Planned improvements for the JIRA integration:
- Support for webhooks to receive real-time updates
- Enhanced issue management with full field support
- Project creation and workflow management
- Expanded team management capabilities
- Integration with Sybau's notification system 