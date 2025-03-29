import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function LinearIntegrationErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  // Using optional chaining and nullish coalescing for safety
  const errorType = searchParams?.error ?? 'unknown_error';
  
  const errorMessages: Record<string, string> = {
    'invalid_state': 'Invalid state parameter. Please try again to ensure a secure connection.',
    'no_code': 'No authorization code received from Linear.',
    'token_exchange_failed': 'Failed to exchange authorization code for access token. Please check your client credentials and try again.',
    'server_error': 'An unexpected error occurred on our server.',
    'unknown_error': 'An unknown error occurred during integration.',
  };
  
  const errorMessage = errorMessages[errorType] || errorMessages.unknown_error;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Connection Failed</h1>
          <p className="mt-2 text-gray-600">
            We encountered an issue connecting your Linear account.
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-xl font-medium text-red-600">Error Details:</h2>
            <p className="text-gray-700">{errorMessage}</p>
            
            {/* Debug information */}
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
              <p><strong>Error Type:</strong> {errorType}</p>
            </div>
            
            <div className="pt-4 flex flex-col space-y-3">
              <Button className="w-full" asChild>
                <Link href="/integrate/linear">
                  Try Again
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/">
                  Return to Home
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 