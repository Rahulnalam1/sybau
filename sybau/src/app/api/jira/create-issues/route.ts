import { NextRequest, NextResponse } from "next/server";
import { JiraOAuthService } from "@/api/services/jira/jiraOAuthService";
import { requireAuth } from "@/api/middleware/authMiddleware";

export async function POST(req: NextRequest) {
  // First, authenticate the user
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  try {
    const { tasks, cloudId, projectId, issueTypeId, draftId } = await req.json();
    
    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: "Invalid tasks data" },
        { status: 400 }
      );
    }
    
    if (!cloudId || !projectId || !issueTypeId) {
      return NextResponse.json(
        { error: "Missing required parameters (cloudId, projectId, or issueTypeId)" },
        { status: 400 }
      );
    }
    
    console.log(`Creating ${tasks.length} JIRA issues in project ${projectId}`);
    
    const jiraService = new JiraOAuthService();
    const createdIssues = [];
    
    // Get priorities from JIRA to map our priority values
    let priorityMap: Record<number, string> = {};
    try {
      const priorities = await jiraService.getPriorities(cloudId);
      
      // Map our priorities (1-4) to JIRA priorities
      // JIRA typically has priorities like "Highest", "High", "Medium", "Low", "Lowest"
      // We'll map them in reverse order since JIRA usually puts "Highest" first
      if (priorities && priorities.length) {
        // Sort priorities based on their position if available
        const sortedPriorities = [...priorities].sort((a, b) => 
          (a.statusColor === b.statusColor) 
            ? 0 
            : (a.statusColor === "red") ? -1 : (b.statusColor === "red") ? 1 : 0
        );
        
        // Map our priorities to JIRA priorities
        // 1 = Highest/P1, 2 = High/P2, 3 = Medium/P3, 4 = Low/P4
        if (sortedPriorities.length >= 4) {
          priorityMap = {
            1: sortedPriorities[0].id, // Highest
            2: sortedPriorities[1].id, // High
            3: sortedPriorities[2].id, // Medium
            4: sortedPriorities[3].id, // Low
          };
        } else {
          // If less than 4 priorities, map as best we can
          sortedPriorities.forEach((priority, index) => {
            priorityMap[index + 1] = priority.id;
          });
        }
      }
    } catch (error) {
      console.error("Error fetching JIRA priorities:", error);
      // Continue without priority mapping
    }
    
    // Process each task and create issues in JIRA
    for (const task of tasks) {
      try {
        // Create a base request without priority
        const issueData = {
          projectId,
          summary: task.title,
          description: task.description,
          issueTypeId
        };
        
        // Skip priority mapping - many JIRA projects don't allow setting it directly
        // If you need to add priority back later, consider checking project metadata first
        
        const issue = await jiraService.createIssue(cloudId, issueData);
        
        createdIssues.push({
          id: issue.id,
          key: issue.key,
          self: issue.self,
          title: task.title
        });
      } catch (error) {
        console.error("Error creating JIRA issue:", error);
        // Continue with other tasks even if one fails
      }
    }
    
    // Update the draft's status in Supabase to indicate it's been processed if needed
    if (draftId) {
      try {
        // This would be implemented based on your Supabase schema and requirements
        // For example, marking the draft as "processed" or "pushed to JIRA"
      } catch (error) {
        console.error("Error updating draft status:", error);
        // Continue despite the error updating the draft
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      createdIssues,
      message: `Created ${createdIssues.length} tasks in JIRA`
    });
  } catch (error) {
    console.error("Error in JIRA create-issues API:", error);
    return NextResponse.json(
      { error: "Failed to process tasks" },
      { status: 500 }
    );
  }
} 