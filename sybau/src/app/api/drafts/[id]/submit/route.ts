// POST api/drafts/:id/submit

import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/api/middleware/authMiddleware"
import { DraftController } from "@/api/controllers/drafts/draftController"

const draftController = new DraftController();
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await requireAuth(req)
    if (session instanceof NextResponse) return session
  
    const { platform } = await req.json()
  
    try {
      const tasks = await draftController.submitDraftToPlatform(
        params.id,
        platform,
        session.user.id
      )
      return NextResponse.json({ tasks })
    } catch (err) {
      return NextResponse.json({ error: "Failed to submit draft" }, { status: 500 })
    }
  }
  