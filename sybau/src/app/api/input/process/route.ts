// POST api/input/process

import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/api/middleware/authMiddleware"
import { InputController } from "@/api/controllers/input/inputController"

const inputController = new InputController()

export async function POST(req: NextRequest) {
  const session = await requireAuth(req)
  if (session instanceof NextResponse) return session

  const body = await req.json()
  const { markdown, platform } = body

  try {
    const tasks = await inputController.processInput(markdown, platform, session.user.id)
    return NextResponse.json({ tasks })
  } catch (err) {
    console.error("Failed to process input:", err)
    return NextResponse.json({ error: "Failed to process input" }, { status: 500 })
  }
}