import { NextRequest, NextResponse } from "next/server";
import { JiraOAuthService } from "@/api/services/jira/jiraOAuthService";

export async function POST(request: NextRequest) {
  console.log('API: Received create test issue request');
  
  try {
    const body = await request.json();
    const { cloudId, projectId, issueTypeId } = body;
    
    console.log('API: Test issue request parameters:', { 
      cloudId, 
      projectId, 
      issueTypeId,
      fullBody: body 
    });
    
    if (!cloudId || !projectId || !issueTypeId) {
      console.error('API: Missing required parameters for test issue creation');
      return NextResponse.json({ 
        error: "Missing required parameters" 
      }, { status: 400 });
    }
    
    console.log('API: Initializing JIRA service');
    const jiraService = new JiraOAuthService();
    
    console.log('API: Calling JIRA service to create test issue');
    const issueResult = await jiraService.createTestIssue(cloudId, projectId, issueTypeId);
    
    console.log('API: Successfully created test issue:', issueResult);
    
    return NextResponse.json({
      success: true,
      issue: issueResult
    });
  } catch (error) {
    console.error('API: Error creating test JIRA issue:', error);
    return NextResponse.json({ 
      error: "Failed to create test issue",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 