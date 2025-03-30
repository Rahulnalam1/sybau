// POST api/drafts
// GET api/drafts

import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/api/middleware/authMiddleware"
import { DraftController } from "@/api/controllers/drafts/draftController"

const draftController = new DraftController();

export async function POST(req: NextRequest) {
  const session = await requireAuth(req)
  if (session instanceof NextResponse) return session

  const { markdown, platform } = await req.json()

  try {
    await draftController.saveDraft(session.user.id, markdown, platform)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 })
  }
}

// 
export async function GET(req: NextRequest) {
  const session = await requireAuth(req)
  if (session instanceof NextResponse) return session

  try {
    const drafts = await draftController.getUserDrafts(session.user.id)
    return NextResponse.json({ drafts })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 })
  }
}



