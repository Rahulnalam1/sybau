import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LinearIntegrationPage() {
  // Get the redirect URI from env or use a default
  const redirectUri = process.env.NEXT_PUBLIC_LINEAR_REDIRECT_URI || 'http://localhost:3000/api/auth/linear/callback';
  const clientId = process.env.NEXT_PUBLIC_LINEAR_CLIENT_ID || 'missing';
  
  // Construct the authorization URL
  const linearAuthUrl = `https://linear.app/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read,write,issues:create&response_type=code&state=random-state-value`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Connect with Linear</h1>
          <p className="mt-2 text-gray-600">
            Connect your Linear account to manage your tasks seamlessly.
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-xl font-medium">What you can do with Linear integration:</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>View all your teams and projects</li>
              <li>Create and manage issues directly</li>
              <li>Sync your tasks between platforms</li>
              <li>Track progress on your Linear workflows</li>
            </ul>
            
            {/* Debug information */}
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
              <p><strong>Client ID:</strong> {clientId}</p>
              <p><strong>Redirect URI:</strong> {redirectUri}</p>
              <p><strong>Full Auth URL:</strong> {linearAuthUrl}</p>
            </div>
            
            <div className="pt-4">
              <Button className="w-full" asChild>
                <a href={linearAuthUrl}>
                  Connect Linear Account
                </a>
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                You'll be redirected to Linear to authorize access
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 