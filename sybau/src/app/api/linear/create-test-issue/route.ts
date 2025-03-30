import { NextResponse } from "next/server";
import { LinearOAuthService } from "@/api/services/linear/linearOAuthService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teamId, teamName } = body;
    
    if (!teamId) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }
    
    console.log(`Creating test issue for team ${teamName} (${teamId})...`);
    
    // Create a test issue
    const linearService = new LinearOAuthService();
    const issueResult = await linearService.createIssue({
      title: `Test Issue from Sybau ${new Date().toLocaleTimeString()}`,
      description: `This is a test issue created via the Sybau integration at ${new Date().toISOString()}`,
      teamId,
    });
    
    console.log("Linear API response:", JSON.stringify(issueResult, null, 2));
    
    // Check if the issue was actually created
    if (!issueResult || !issueResult._issue || !issueResult._issue.id) {
      console.error("Issue creation failed - no issue ID returned");
      return NextResponse.json({
        success: false,
        error: "Issue creation returned success but no issue was created",
        rawResponse: issueResult
      }, { status: 500 });
    }
    
    const issueId = issueResult._issue.id;
    const issueUrl = issueResult._issue.url;
    
    // Get the created issue to confirm it exists
    try {
      const createdIssue = await linearService.getIssueById(issueId);
      console.log("Created issue details:", JSON.stringify(createdIssue, null, 2));
      
      return NextResponse.json({
        success: true,
        message: `Test issue created for team ${teamName || teamId}`,
        issue: {
          id: issueId,
          url: issueUrl,
          title: createdIssue?.title || issueResult._issue.title,
          identifier: createdIssue?.identifier,
          teamId: teamId
        },
        rawResponse: issueResult
      });
    } catch (verificationError) {
      console.error("Error verifying created issue:", verificationError);
      // Even if verification fails, the issue might have been created
      return NextResponse.json({
        success: true,
        message: `Issue possibly created but verification failed`,
        issue: {
          id: issueId,
          url: issueUrl || `https://linear.app/issue/${issueId}`,
          teamId: teamId
        },
        verificationError: String(verificationError),
        rawResponse: issueResult
      });
    }
  } catch (error) {
    console.error("Error creating test issue:", error);
    return NextResponse.json(
      {
        error: "Failed to create test issue",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
} 