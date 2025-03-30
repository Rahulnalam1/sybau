import { Task, SupportedPlatform, GeminiOutput } from "@/types/types";
import { LinearOAuthService } from "../linear/linearOAuthService";

type SubmissionOptions = {
    teamId: string;
    projectId?: string;
    assigneeId?: string;
    priority?: number;
};

export async function sendTasksToPlatform(
    tasks: GeminiOutput[],
    platform: SupportedPlatform,
    userId: string, // still useful for logs or future per-user metadata
    teamId: string
): Promise<void> {
    if (platform !== "linear") {
        throw new Error(`Unsupported platform: ${platform}`);
    }

    if (!teamId) throw new Error("Missing teamId for Linear submission");

    const linear = new LinearOAuthService();

    for (const task of tasks) {
        await linear.createIssue({
            title: task.title,
            description: task.description,
            teamId,
            priority: task.priority
        });
    }
}
