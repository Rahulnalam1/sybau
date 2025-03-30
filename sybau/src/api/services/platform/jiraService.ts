import { JiraOAuthService } from "@/api/services/jira/jiraOAuthService";
import { GeminiOutput, JiraInput } from "@/types/types";

export class JiraController {
    jiraService = new JiraOAuthService();

    async getProjects() {
        const resources = await this.jiraService.getAccessibleResources();
        if (!resources || resources.length === 0) {
            console.error("Error accessing Jira Resources in jiraService.ts");
            return;
        }

        try {
            this.jiraService.getProjects(resources[0].id);
        } catch (error) {
            console.error(error);
            return;
        }
    }

    async createIssues(tasks: GeminiOutput[], projectId: string) {
        const resources = await this.jiraService.getAccessibleResources();
        if (!resources || resources.length === 0) {
            console.error("Error accessing Jira Resources in jiraService.ts");
            return;
        }

        try {
            tasks.forEach((task) => {
                let desc = task.description;
                desc += task.dueDate ? "Due Date: task.dueDate" : "";
                const JiraTask: JiraInput = {
                    summary: task.title,
                    description: desc,
                    projectId: projectId,
                    issueTypeId: "Task",
                };
                this.jiraService.createIssue(resources[0].id, { ...JiraTask });
            });
        } catch (error) {
            console.error(error);
            return;
        }
    }
}
