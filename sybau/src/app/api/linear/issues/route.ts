import { NextResponse } from "next/server";
import { LinearController } from "@/api/controllers/linear/linearController";

const linearController = new LinearController(process.env.LINEAR_API_KEY || "");

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const issues = await linearController.getIssues(projectId);
    return NextResponse.json(issues);
  } catch (error) {
    console.error("Error in GET /api/linear/issues:", error);
    return NextResponse.json(
      { error: "Failed to fetch Linear issues", details: String(error) },
      { status: 500 }
    );
  }
} 