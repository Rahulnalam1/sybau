import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/api/middleware/authMiddleware"
import { DraftController } from "@/api/controllers/drafts/draftController"
import { GeminiOutput, SupportedPlatform, Task } from "@/types/types"

const draftController = new DraftController()

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth(req)
  if (session instanceof NextResponse) return session

  const { platform, tasks, teamId }: { platform: SupportedPlatform; tasks: GeminiOutput[]; teamId: string } =
    await req.json()

  try {
    await draftController.submitDraftToPlatform(
      params.id,
      platform,
      session.user.id,
      tasks,
      teamId
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Submit error:", err)
    return NextResponse.json({ error: "Failed to submit draft" }, { status: 500 })
  }
}
