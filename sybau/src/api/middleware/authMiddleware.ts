import { getServerSession } from "next-auth"
import { authOptions } from "@/api/auth/options"
import { NextRequest, NextResponse } from "next/server"

export async function requireAuth(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return session
}
