import { NextResponse } from "next/server";
import { isJiraAuthenticated } from "@/lib/jira-auth";

export async function GET() {
  try {
    const isAuthenticated = await isJiraAuthenticated();
    
    return NextResponse.json({
      authenticated: isAuthenticated,
    });
  } catch (error) {
    console.error("Error checking JIRA authentication status:", error);
    return NextResponse.json(
      { error: "Failed to check authentication status" },
      { status: 500 }
    );
  }
} 