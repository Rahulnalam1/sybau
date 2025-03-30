import { NextRequest, NextResponse } from "next/server"
import { LinearOAuthService } from "@/api/services/linear/linearOAuthService"
import { GeminiOutput } from "@/types/types"

export async function POST(req: NextRequest) {
  try {
    const { tasks, teamId, draftId } = await req.json()
    
    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: "Invalid tasks data" },
        { status: 400 }
      )
    }
    
    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      )
    }
    
    const linearService = new LinearOAuthService()
    const createdIssues = []
    
    // Process each task and create issues in Linear
    for (const task of tasks) {
      try {
        const issue = await linearService.createIssue({
          title: task.title,
          description: task.description,
          teamId,
          priority: task.priority || 0
        })
        
        createdIssues.push({
          id: issue.id,
          title: issue.title,
          url: issue.url
        })
      } catch (error) {
        console.error("Error creating Linear issue:", error)
        // Continue with other tasks even if one fails
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      createdIssues,
      message: `Created ${createdIssues.length} tasks in Linear`
    })
  } catch (error) {
    console.error("Error in Linear tasks API:", error)
    return NextResponse.json(
      { error: "Failed to process tasks" },
      { status: 500 }
    )
  }
} 