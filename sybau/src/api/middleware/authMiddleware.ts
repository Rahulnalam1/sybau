import { createClient } from "@/api/lib/supabase"
import { NextResponse, type NextRequest } from "next/server"

export async function requireAuth(req: NextRequest) {
    const authHeader = req.headers.get("authorization")
  
    const token = authHeader?.split(" ")[1]
    if (!token) {
      console.log("No token found in Authorization header")
      return NextResponse.json({ error: "Unauthorized - No token" }, { status: 401 })
    }
  
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)
  
    if (error || !user) {
      console.log("Invalid token", error)
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 })
    }
  
    console.log("User authenticated:", user.id)
    return { user }
  }
