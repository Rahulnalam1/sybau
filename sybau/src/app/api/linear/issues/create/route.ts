import { NextResponse } from "next/server";
import { LinearController } from "@/api/controllers/linear/linearController";

const linearController = new LinearController(process.env.LINEAR_API_KEY || "");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.teamId) {
      return NextResponse.json(
        { error: "Title and teamId are required fields" },
        { status: 400 }
      );
    }
    
    const issue = await linearController.createIssue({
      title: body.title,
      description: body.description,
      teamId: body.teamId,
      projectId: body.projectId,
      assigneeId: body.assigneeId,
      priority: body.priority,
    });
    
    return NextResponse.json(issue);
  } catch (error) {
    console.error("Error in POST /api/linear/issues/create:", error);
    return NextResponse.json(
      { error: "Failed to create Linear issue", details: String(error) },
      { status: 500 }
    );
  }
} 