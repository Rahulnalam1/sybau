// hooks/useDrafts.ts
import { useEffect, useState } from "react"
import { Draft } from "@/types/types"
import { supabase } from "@/api/lib/supabase-browser"

export function useDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDrafts() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const res = await fetch("/api/drafts", {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        })
        const data = await res.json()
        setDrafts(data.drafts || [])
      } catch (err) {
        console.error("Failed to load drafts", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDrafts()
  }, [])

  return { drafts, loading }
}
