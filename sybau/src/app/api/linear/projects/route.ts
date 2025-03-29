import { NextResponse } from "next/server";
import { LinearController } from "@/api/controllers/linear/linearController";

const linearController = new LinearController(process.env.LINEAR_API_KEY || "");

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    const projects = await linearController.getProjects(teamId);
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error in GET /api/linear/projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch Linear projects", details: String(error) },
      { status: 500 }
    );
  }
} 