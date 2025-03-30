import { NextResponse } from "next/server";
import { LinearController } from "@/api/controllers/linear/linearController";

const linearController = new LinearController(process.env.LINEAR_API_KEY || "");

export async function GET() {
  try {
    console.log("API Key provided:", process.env.LINEAR_API_KEY ? "Yes" : "No");
    const teams = await linearController.getTeams();
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error in GET /api/linear/teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch Linear teams", details: String(error) },
      { status: 500 }
    );
  }
} 