"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronRight, X, CheckCircle } from "lucide-react"
import { toast, Toaster } from "sonner"
import { LinearOAuthServiceClient } from "@/api/services/linear/linearOAuthServiceClient"
import { GeminiOutput } from "@/types/types"

interface Team {
  id: string
  name: string
  key: string
}

export default function TeamSelectionPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [processingTasks, setProcessingTasks] = useState(false)
  const [draftContent, setDraftContent] = useState("")
  const [manualInputMode, setManualInputMode] = useState(false)
  const [generatedTasks, setGeneratedTasks] = useState<GeminiOutput[] | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const draftId = searchParams.get("draft_id")

  useEffect(() => {
    async function fetchTeams() {
      try {
        const linearService = new LinearOAuthServiceClient()
        const teamsData = await linearService.getTeams()
        setTeams(teamsData)
      } catch (error) {
        console.error("Error fetching teams:", error)
        toast.error("Failed to load teams from Linear")
      } finally {
        setLoading(false)
      }
    }

    async function fetchDraftContent() {
      setLoading(true)
      
      if (!draftId) {
        console.log("No draft ID found in URL")
        toast.error("No draft ID found. You can enter text manually.")
        setManualInputMode(true)
        setLoading(false)
        return
      }

      console.log("Fetching draft content for ID:", draftId)

      try {
        const supabase = createClientComponentClient()
        const { data, error } = await supabase
          .from("drafts")
          .select("markdown")
          .eq("id", draftId)
          .single()

        if (error) {
          console.error("Supabase error:", error)
          throw error
        }
        
        console.log("Draft data received:", data)
        
        if (data?.markdown) {
          setDraftContent(data.markdown)
        } else {
          // Try to load from localStorage as fallback
          const savedContent = localStorage.getItem('editor_content')
          if (savedContent) {
            console.log("Found content in localStorage")
            setDraftContent(savedContent)
          } else {
            toast.error("Draft content is empty")
          }
        }
      } catch (error) {
        console.error("Error fetching draft content:", error)
        toast.error("Failed to load draft content")
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
    fetchDraftContent()
  }, [draftId])

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
  }

  const handleGenerateTasks = async () => {
    if (!selectedTeam) {
      toast.error("Please select a team first")
      return
    }

    if (!draftContent) {
      console.log("Draft content is empty. Current state:", { draftId, contentLength: 0 })
      toast.error("No content to process. Please go back to the workspace and try again.")
      return
    }

    console.log("Generating tasks with content length:", draftContent.length)
    setProcessingTasks(true)

    try {
      // Generate tasks using Gemini API
      const tasksRes = await fetch("/api/input/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: draftContent,
        }),
      })
      
      if (!tasksRes.ok) {
        throw new Error("Failed to generate tasks")
      }
      
      const { tasks } = await tasksRes.json()
      
      setGeneratedTasks(tasks)
      setShowPreview(true)
    } catch (error) {
      console.error("Error generating tasks:", error)
      toast.error("Failed to generate tasks")
    } finally {
      setProcessingTasks(false)
    }
  }
  
  const handlePushTasks = async () => {
    if (!selectedTeam || !generatedTasks) {
      return
    }
    
    setProcessingTasks(true)
    
    try {
      // Push the tasks to Linear
      const response = await fetch("/api/linear/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks: generatedTasks,
          teamId: selectedTeam,
          draftId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to push tasks to Linear")
      }

      const result = await response.json()
      toast.success("Tasks successfully created in Linear!")
      
      // Redirect back to workspace after a short delay
      setTimeout(() => {
        router.push("/workspace")
      }, 2000)
    } catch (error) {
      console.error("Error pushing tasks:", error)
      toast.error("Failed to push tasks to Linear")
    } finally {
      setProcessingTasks(false)
    }
  }
  
  const closePreview = () => {
    setShowPreview(false)
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 0:
        return "No Priority"
      case 1:
        return "Urgent"
      case 2:
        return "High"
      case 3:
        return "Medium"
      case 4:
        return "Low"
      default:
        return "Unknown"
    }
  }
  
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 0:
        return "bg-gray-200"
      case 1:
        return "bg-red-500"
      case 2:
        return "bg-orange-500"
      case 3:
        return "bg-blue-500"
      case 4:
        return "bg-green-500"
      default:
        return "bg-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">Select a Linear Team</h1>
      
      {manualInputMode ? (
        <div className="mb-8">
          <p className="text-gray-500 mb-4">
            No saved draft found. Enter your tasks below:
          </p>
          <textarea
            className="w-full min-h-[200px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your task descriptions here..."
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
          />
        </div>
      ) : (
        <p className="text-gray-500 mb-8">
          Choose which Linear team you want to push the generated tasks to:
        </p>
      )}

      <div className="grid gap-4">
        {teams.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-lg font-medium text-gray-700">No teams found</p>
            <p className="text-gray-500 mt-2">
              You don't have any teams in your Linear account.
            </p>
            <Button className="mt-4" asChild>
              <a
                href="https://linear.app/teams"
                target="_blank"
                rel="noopener noreferrer"
              >
                Create a Team in Linear
              </a>
            </Button>
          </div>
        ) : (
          teams.map((team) => (
            <div
              key={team.id}
              className={`border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors 
                ${
                  selectedTeam === team.id
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              onClick={() => handleTeamSelect(team.id)}
            >
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-full mr-4 flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: "#5E6AD2" }}
                >
                  {team.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium">{team.name}</h3>
                  <p className="text-sm text-gray-500">Key: {team.key}</p>
                </div>
              </div>
              {selectedTeam === team.id && (
                <ChevronRight className="h-5 w-5 text-blue-500" />
              )}
            </div>
          ))
        )}
      </div>

      {!showPreview ? (
        <div className="mt-8 flex justify-end">
          <Button
            className="mr-4"
            variant="outline"
            onClick={() => router.push("/workspace")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerateTasks}
            disabled={!selectedTeam || processingTasks}
          >
            {processingTasks ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating tasks...
              </>
            ) : (
              "Generate Tasks"
            )}
          </Button>
        </div>
      ) : null}
      
      {/* Task Preview Modal */}
      {showPreview && generatedTasks && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Task Preview</h2>
              <button onClick={closePreview} className="p-1 rounded-full hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-grow">
              <p className="text-gray-600 mb-4">
                Review the tasks that will be created in Linear:
              </p>
              
              <div className="space-y-4">
                {generatedTasks.map((task, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg">{task.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full text-white ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-line">{task.description}</p>
                    {task.dueDate && (
                      <p className="text-xs text-gray-500 mt-2">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end space-x-4">
              <Button variant="outline" onClick={closePreview}>
                Cancel
              </Button>
              <Button onClick={handlePushTasks} disabled={processingTasks}>
                {processingTasks ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Pushing to Linear...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirm & Push to Linear
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <Toaster position="bottom-right" />
    </div>
  )
} 