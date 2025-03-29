// src/api/controllers/input/inputController.ts
import { Task } from "@/types/types"
import { parseMarkdownInput } from "@/api/services/input/inputService"

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
}