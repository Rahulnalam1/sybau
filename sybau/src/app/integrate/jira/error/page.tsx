import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function JiraErrorPage({ searchParams }: { searchParams: { error?: string } }) {
  // Get the error message from the query parameters
  const error = searchParams.error || 'unknown_error';
  
  // Map error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    'invalid_state': 'Invalid state parameter. This could be due to a CSRF attack or an expired session.',
    'no_code': 'No authorization code received from JIRA.',
    'token_exchange_failed': 'Failed to exchange authorization code for access token.',
    'server_error': 'An unexpected server error occurred.',
    'unknown_error': 'An unknown error occurred during JIRA authentication.',
  };
  
  const errorMessage = errorMessages[error] || errorMessages.unknown_error;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50 px-4">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mx-auto">
          <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>

        <h1 className="text-3xl font-bold">Connection Failed</h1>
        <p className="text-gray-600">
          We couldn't connect your JIRA account.
        </p>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-left">
          <h3 className="text-sm font-medium text-red-800">Error details:</h3>
          <p className="mt-2 text-sm text-red-700">{errorMessage}</p>
        </div>
        
        <div className="pt-4 space-y-4">
          <Button asChild className="w-full">
            <Link href="/integrate/jira">
              Try Again
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 