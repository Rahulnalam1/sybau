'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CreateJiraTestIssueButtonProps {
  cloudId: string;
  projectId: string;
}

export function CreateJiraTestIssueButton({ cloudId, projectId }: CreateJiraTestIssueButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; issueKey?: string; issueUrl?: string } | null>(null);
  
  const handleCreateTestIssue = async () => {
    setIsLoading(true);
    setResult(null);
    
    console.log('Starting test issue creation with:', { cloudId, projectId });
    
    try {
      // First, get the issue types for this project to identify a standard issue type
      console.log('Fetching issue types for project:', projectId);
      const issueTypesResponse = await fetch(`/api/jira/issue-types?cloudId=${cloudId}&projectId=${projectId}`);
      
      if (!issueTypesResponse.ok) {
        const errorText = await issueTypesResponse.text();
        console.error('Failed to fetch issue types:', errorText);
        throw new Error('Failed to fetch issue types');
      }
      
      const issueTypes = await issueTypesResponse.json();
      console.log('Retrieved issue types:', issueTypes);
      
      // Find a standard issue type (usually "Task" or the first available)
      const taskIssueType = issueTypes.find((type: any) => type.name === "Task") || issueTypes[0];
      
      if (!taskIssueType) {
        console.error('No issue types available for this project');
        throw new Error('No issue types available for this project');
      }
      
      console.log('Selected issue type for test issue:', taskIssueType);
      
      // Create the test issue
      const requestData = {
        cloudId,
        projectId,
        issueTypeId: taskIssueType.id
      };
      
      console.log('Sending create test issue request with data:', requestData);
      
      const response = await fetch('/api/jira/create-test-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      const data = await response.json();
      console.log('Received response from create test issue API:', data);
      
      if (!response.ok) {
        console.error('API error:', data);
        throw new Error(data.error || 'Failed to create test issue');
      }
      
      // Success - set the result with the issue key and URL
      const issueUrl = `${data.issue.self.split('/rest/api/')[0]}/browse/${data.issue.key}`;
      console.log('Created issue successfully:', { 
        key: data.issue.key, 
        url: issueUrl,
        fullResponse: data
      });
      
      setResult({
        success: true,
        message: 'Test issue created successfully!',
        issueKey: data.issue.key,
        issueUrl
      });
    } catch (error) {
      console.error('Error creating test issue:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred creating the test issue'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      {!result ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCreateTestIssue} 
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Post Test Issue'}
        </Button>
      ) : (
        <div className="mt-2">
          {result.success ? (
            <div className="text-sm space-y-2">
              <p className="text-green-600">{result.message}</p>
              {result.issueKey && result.issueUrl && (
                <a
                  href={result.issueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline block"
                >
                  View {result.issueKey}
                </a>
              )}
            </div>
          ) : (
            <div className="text-sm text-red-600">{result.message}</div>
          )}
        </div>
      )}
    </div>
  );
} 