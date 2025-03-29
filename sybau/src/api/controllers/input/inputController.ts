// src/api/controllers/input/inputController.ts
import { Task } from "@/types/types"
import { parseMarkdownInput } from "@/api/services/input/inputService"
import { createClient } from "@/api/lib/supabase"

type SupportedPlatform = "trello" | "jira" | "linear"

export class InputController {
  async processInput(
    markdown: string,
    platform: SupportedPlatform,
    userId: string
  ): Promise<Task[]> {
    if (!markdown || !platform) {
      throw new Error("Missing markdown or platform")
    }

    return await parseMarkdownInput(markdown, platform, userId)
  }

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
}