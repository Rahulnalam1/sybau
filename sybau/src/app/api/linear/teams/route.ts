import { NextResponse } from "next/server"
import { LinearOAuthService } from "@/api/services/linear/linearOAuthService"

export async function GET() {
  try {
    const service = new LinearOAuthService()
    const teams = await service.getTeams()

    return NextResponse.json({ teams })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}
