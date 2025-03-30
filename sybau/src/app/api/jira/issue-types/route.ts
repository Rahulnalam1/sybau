import { NextRequest, NextResponse } from "next/server";
import { JiraOAuthService } from "@/api/services/jira/jiraOAuthService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cloudId = searchParams.get('cloudId');
    const projectId = searchParams.get('projectId');
    
    if (!cloudId || !projectId) {
      return NextResponse.json({ 
        error: "Missing required parameters: cloudId and projectId" 
      }, { status: 400 });
    }
    
    const jiraService = new JiraOAuthService();
    
    // Get issue types for the specified project
    const issueTypes = await jiraService.getProjectIssueTypes(cloudId, projectId);
    
    return NextResponse.json(issueTypes);
  } catch (error) {
    console.error('Error fetching JIRA issue types:', error);
    return NextResponse.json({ 
      error: "Failed to fetch issue types",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 