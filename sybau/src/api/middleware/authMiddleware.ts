import { createClient } from "@/api/lib/supabase"
import { NextResponse, type NextRequest } from "next/server"

export async function requireAuth(req: NextRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return session
}
