import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function JiraIntegrationPage() {
  // Get the redirect URI from env or use a default
  const redirectUri = process.env.NEXT_PUBLIC_JIRA_REDIRECT_URI || 'http://localhost:3000/api/auth/jira/callback';
  const clientId = process.env.NEXT_PUBLIC_JIRA_CLIENT_ID || '5Ruf42z2OB9cSIcnQ3El3ytnOQCD89ng';
  
  // Construct the authorization URL for JIRA (Atlassian)
  // Note: JIRA uses a different OAuth endpoint and requires a specific set of scopes
  const jiraAuthUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=offline_access%20read%3Ajira-work%20write%3Ajira-work%20manage%3Ajira-project&redirect_uri=${encodeURIComponent(redirectUri)}&state=random-state-value&response_type=code&prompt=consent`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Connect with JIRA</h1>
          <p className="mt-2 text-gray-600">
            Connect your JIRA account to manage your tasks seamlessly.
          </p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-medium mb-4">What you can do with JIRA integration:</h2>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>View your JIRA projects</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Create issues in your JIRA projects</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Manage your JIRA tasks directly from Sybau</span>
            </li>
          </ul>
          
          <Button className="w-full" asChild>
            <Link href={jiraAuthUrl}>
              Connect JIRA Account
            </Link>
          </Button>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>By connecting your JIRA account, you grant Sybau access to view and manage JIRA resources on your behalf.</p>
        </div>
      </div>
    </div>
  );
} 