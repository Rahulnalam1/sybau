import { getServerSession } from "next-auth"
import { authOptions } from "./options"
import { NextRequest } from "next/server"

export async function requireAuth(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return null
  return session
}
