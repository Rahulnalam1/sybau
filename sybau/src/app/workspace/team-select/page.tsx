"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

type LinearTeam = {
  id: string
  name: string
}

export default function TeamSelectPage() {
  const [teams, setTeams] = useState<LinearTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const searchParams = useSearchParams()
  const draftId = searchParams.get("draftId")
  const platform = searchParams.get("platform")
  const router = useRouter()

  useEffect(() => {
    async function fetchTeams() {
      try {
        setLoading(true)
        const res = await fetch("/api/linear/teams")
        
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message || "Failed to fetch teams")
        }

        const data = await res.json()
        setTeams(data) // Directly use the array if API returns array
      } catch (err: any) {
        console.error(err)
        toast.error(err.message || "Failed to load Linear teams")
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [])

  const handleSelect = async (teamId: string) => {
    if (!draftId || !platform) {
      toast.error("Missing required parameters")
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch(`/api/input/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draftId,
          platform,
          teamId
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Task processing failed")
      }

      toast.success("Tasks submitted successfully!")
      router.push(`/workspace/${draftId}`)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Failed to submit tasks")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Loading Linear teams...</h1>
        <p>Please wait while we fetch your available teams</p>
      </div>
    )
  }

  if (teams.length === 0 && !loading) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">No Teams Available</h1>
        <p>You don't have access to any Linear teams or there was an error loading them.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Select a Linear Team</h1>
      <ul className="space-y-2">
        {teams.map((team) => (
          <li key={team.id}>
            <button
              onClick={() => handleSelect(team.id)}
              disabled={submitting}
              className="w-full text-left p-3 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              {team.name}
              {submitting && " (Processing...)"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}