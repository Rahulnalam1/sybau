import { Task, SupportedPlatform } from "@/types/types"
import { LinearService } from "../linear/linearServices"
import { getLinearApiKeyForUser } from "@/api/utils/userKeys" // or wherever you store the key

export async function sendTasksToPlatform(
  tasks: Task[],
  platform: SupportedPlatform,
  userId: string,
  options?: {
    teamId: string
    projectId?: string
    assigneeId?: string
    priority?: number
  }
): Promise<void> {
  if (platform !== "linear") {
    throw new Error(`Platform ${platform} is not supported yet.`)
  }

  if (!options?.teamId) {
    throw new Error("Missing teamId for Linear")
  }

  const apiKey = await getLinearApiKeyForUser(userId)
  if (!apiKey) {
    throw new Error("No Linear API key found for user")
  }

  const linear = new LinearService(apiKey)

  for (const task of tasks) {
    await linear.createIssue({
      title: task.title,
      description: task.body,
      teamId: options.teamId,
      projectId: options.projectId,
      assigneeId: options.assigneeId,
      priority: options.priority,
    })
  }
}
