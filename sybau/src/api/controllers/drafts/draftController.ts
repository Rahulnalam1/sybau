// src/api/controllers/drafts/draftController.ts
import { Task } from "@/types/types"
import { parseMarkdownInput } from "@/api/services/input/inputService"
import { createClient } from "@/api/lib/supabase"

type SupportedPlatform = "trello" | "jira" | "linear"

export class DraftController {
  async saveDraft(
    userId: string,
    markdown: string,
    platform: SupportedPlatform
  ): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.from("drafts").insert({
      user_id: userId,
      markdown,
      platform,
    })

    if (error) {
      throw new Error("Failed to save draft: " + error.message)
    }
  }

  async getUserDrafts(userId: string): Promise<any[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("drafts")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) {
      throw new Error("Failed to fetch drafts: " + error.message)
    }

    return data
  }

  async updateDraft(
    draftId: string,
    userId: string,
    markdown: string
  ): Promise<void> {
    const supabase = await createClient()
  
    const { error } = await supabase
      .from("drafts")
      .update({ markdown, updated_at: new Date().toISOString() })
      .match({ id: draftId, user_id: userId })
  
    if (error) {
      throw new Error("Failed to update draft: " + error.message)
    }
  }

  async submitDraftToPlatform(
    draftId: string,
    platform: SupportedPlatform,
    userId: string,
    tasks: Task[],
    teamId: string
  ): Promise<void> {
    const supabase = await createClient()

    // Optional: validate ownership
    const { error: findError } = await supabase
      .from("drafts")
      .select("id")
      .match({ id: draftId, user_id: userId })
      .single()

    if (findError) {
      throw new Error("Draft not found or unauthorized")
    }

    // Send tasks to the chosen platform
    await sendTasksToPlatform(tasks, platform, userId, teamId)

    // Mark draft as submitted
    const { error: updateError } = await supabase
      .from("drafts")
      .update({ platform, updated_at: new Date().toISOString() })
      .eq("id", draftId)

    if (updateError) {
      throw new Error("Failed to update draft with platform info")
    }
  }
}