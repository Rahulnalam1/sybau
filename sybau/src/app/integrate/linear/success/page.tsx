import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function LinearIntegrationSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Success!</h1>
          <p className="mt-2 text-gray-600">
            Your Linear account has been successfully connected.
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-xl font-medium">What you can do next:</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>View your Linear teams and projects</li>
              <li>Create and manage issues</li>
              <li>Track your work progress</li>
            </ul>
            
            <div className="pt-4 flex flex-col space-y-3">
              <Button className="w-full" asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/integrate/linear/teams">
                  View Linear Teams
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 