'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function JiraSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirecting, setRedirecting] = useState(false);
  
  useEffect(() => {
    // Check if there's a draft_id in the state parameter
    const stateParam = searchParams.get('state');
    
    if (stateParam) {
      try {
        const stateData = JSON.parse(stateParam);
        
        if (stateData.draft_id) {
          setRedirecting(true);
          
          // Redirect to the projects page with the draft_id as a query parameter
          setTimeout(() => {
            router.push(`/integrate/jira/projects?draft_id=${stateData.draft_id}`);
          }, 1500); // Short delay to show success message
          
          return;
        }
      } catch (e) {
        console.error('Error parsing state parameter:', e);
      }
    }
  }, [searchParams, router]);

  if (redirecting) {
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
          
          <div className="pt-4 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
            <span>Redirecting to JIRA projects...</span>
          </div>
        </div>
      </div>
    );
  }

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