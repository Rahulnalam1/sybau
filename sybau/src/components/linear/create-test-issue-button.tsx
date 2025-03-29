'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface IssueResult {
  id?: string;
  url?: string;
  title?: string;
  identifier?: string;
  teamId?: string;
}

interface Result {
  success?: boolean;
  message?: string;
  error?: string;
  issue?: IssueResult;
  rawResponse?: any;
  verificationError?: string;
}

export function CreateTestIssueButton({ teamId, teamName }: { teamId: string, teamName: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const handleCreateTestIssue = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/linear/create-test-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamId, teamName }),
      });
      
      const data = await response.json();
      console.log('Response from create-test-issue:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create test issue');
      }
      
      setResult(data);
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleCreateTestIssue} 
        className="w-full" 
        size="sm"
        disabled={isLoading}
      >
        {isLoading ? 'Creating...' : 'Post Test Issue'}
      </Button>
      
      {result && (
        <div className={`text-xs p-2 rounded ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <p className="font-medium">{result.success ? result.message : result.error}</p>
          
          {result.success && result.issue && (
            <div className="mt-1 space-y-1">
              {result.issue.identifier && (
                <p><strong>Issue:</strong> {result.issue.identifier}</p>
              )}
              {result.issue.title && (
                <p><strong>Title:</strong> {result.issue.title}</p>
              )}
              {result.issue.url && (
                <p className="pt-1">
                  <a 
                    href={result.issue.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-green-900"
                  >
                    View in Linear
                  </a>
                </p>
              )}
            </div>
          )}
          
          {result.verificationError && (
            <p className="mt-1 text-orange-600"><strong>Note:</strong> {result.verificationError}</p>
          )}
        </div>
      )}
    </div>
  );
} 