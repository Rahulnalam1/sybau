import { createClient } from "@/api/lib/supabase"
import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"

export async function requireAuth(req: NextRequest) {
    const authHeader = req.headers.get("authorization")
  
    // First try using Authorization header
    if (authHeader) {
      const token = authHeader.split(" ")[1]
      if (token) {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser(token)
      
        if (!error && user) {
          console.log("User authenticated via token:", user.id)
          return { user }
        }
      }
    }
  
    // If no valid Authorization header, check for Linear auth cookies
    const cookieStore = await cookies()
    const linearToken = cookieStore.get("linear_access_token")
    
    if (linearToken) {
      // For Linear API operations, we can consider the user authenticated
      // and allow the operation to proceed
      return { user: { id: "linear-user" } }
    }
    
    // No valid authentication found
    console.log("No valid authentication found")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
