import { NextResponse } from "next/server";
import { isLinearAuthenticated } from "@/lib/linear-auth";

export async function GET() {
  try {
    const isAuthenticated = isLinearAuthenticated();
    
    return NextResponse.json({
      authenticated: isAuthenticated,
    });
  } catch (error) {
    console.error("Error checking Linear authentication status:", error);
    return NextResponse.json(
      { error: "Failed to check authentication status" },
      { status: 500 }
    );
  }
} 