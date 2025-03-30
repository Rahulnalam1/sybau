// PATCH api/drafts/:id

import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/api/middleware/authMiddleware"
import { DraftController } from "@/api/controllers/drafts/draftController"

const draftController = new DraftController();

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await requireAuth(req)
    if (session instanceof NextResponse) return session
  
    const { markdown } = await req.json()
    try {
      await draftController.updateDraft(params.id, session.user.id, markdown)
      return NextResponse.json({ success: true })
    } catch (err) {
      return NextResponse.json({ error: "Failed to update draft" }, { status: 500 })
    }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(req)
  if (session instanceof NextResponse) return session

  try {
    const draft = await draftController.getDraftById(params.id, session.user.id)
    return NextResponse.json(draft)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch draft" }, { status: 500 })
  }
}