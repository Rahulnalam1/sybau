import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function JiraSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50 px-4">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto">
          <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h1 className="text-3xl font-bold">Successfully Connected!</h1>
        <p className="text-gray-600">
          Your JIRA account has been successfully connected to Sybau.
        </p>
        
        <div className="pt-4 space-y-4">
          <Button asChild className="w-full">
            <Link href="/integrate/jira/projects">
              View Your JIRA Projects
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