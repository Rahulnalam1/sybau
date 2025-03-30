import { NextResponse } from "next/server";
import { LinearController } from "@/api/controllers/linear/linearController";

const linearController = new LinearController(process.env.LINEAR_API_KEY || "");

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const issueId = searchParams.get("issueId");

    if (!issueId) {
      return NextResponse.json(
        { error: "Issue ID is required" },
        { status: 400 }
      );
    }

    const issue = await linearController.getIssueById(issueId);
    return NextResponse.json(issue);
  } catch (error) {
    console.error("Error in GET /api/linear/issue:", error);
    return NextResponse.json(
      { error: "Failed to fetch Linear issue", details: String(error) },
      { status: 500 }
    );
  }
} 