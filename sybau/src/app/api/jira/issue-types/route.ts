import { NextRequest, NextResponse } from "next/server";
import { JiraOAuthService } from "@/api/services/jira/jiraOAuthService";
import { requireAuth } from "@/api/middleware/authMiddleware";

export async function GET(req: NextRequest) {
  // First, authenticate the user
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  // Get query parameters
  const url = new URL(req.url);
  const cloudId = url.searchParams.get("cloudId");
  const projectId = url.searchParams.get("projectId");
  
  if (!cloudId || !projectId) {
    return NextResponse.json(
      { error: "Missing required parameters (cloudId or projectId)" },
      { status: 400 }
    );
  }

  try {
    const jiraService = new JiraOAuthService();
    const issueTypes = await jiraService.getProjectIssueTypes(cloudId, projectId);
    
    return NextResponse.json(issueTypes);
  } catch (error) {
    console.error("Error fetching JIRA issue types:", error);
    return NextResponse.json(
      { error: "Failed to fetch issue types" },
      { status: 500 }
    );
  }
} 