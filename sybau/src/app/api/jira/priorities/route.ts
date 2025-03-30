import { NextRequest, NextResponse } from "next/server";
import { JiraOAuthService } from "@/api/services/jira/jiraOAuthService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cloudId = searchParams.get('cloudId');
    
    if (!cloudId) {
      return NextResponse.json({ 
        error: "Missing required parameter: cloudId" 
      }, { status: 400 });
    }
    
    console.log('API: Fetching JIRA priorities for cloudId:', cloudId);
    const jiraService = new JiraOAuthService();
    const priorities = await jiraService.getPriorities(cloudId);
    
    console.log('API: Retrieved priorities:', priorities);
    return NextResponse.json(priorities);
  } catch (error) {
    console.error('API: Error fetching JIRA priorities:', error);
    return NextResponse.json({ 
      error: "Failed to fetch priorities",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 