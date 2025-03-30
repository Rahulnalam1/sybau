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
    
    // This will fetch the full project metadata including available fields
    const response = await fetch(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/createmeta?projectIds=${projectId}&expand=projects.issuetypes.fields`,
      {
        headers: {
          Authorization: `Bearer ${await jiraService.getAccessToken()}`,
          Accept: "application/json"
        }
      }
    );
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch project metadata: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const metadata = await response.json();
    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Error fetching JIRA project metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch project metadata" },
      { status: 500 }
    );
  }
} 