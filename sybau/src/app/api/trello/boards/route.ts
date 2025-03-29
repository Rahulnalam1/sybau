import { requireAuth } from "@/api/middleware/authMiddleware"
import { NextRequest, NextResponse } from "next/server"
import { TrelloController } from "@/api/controllers/trello/trelloController"

const trelloController = new TrelloController()

export async function GET(req: NextRequest) {
  const session = await requireAuth(req)
  if (session instanceof NextResponse) return session

  try {
    const boards = await trelloController.getBoards(session.user.id)
    return NextResponse.json(boards)
  } catch (error) {
    console.error("Failed to fetch boards:", error)
    return NextResponse.json({ error: "Failed to fetch boards" }, { status: 500 })
  }
}