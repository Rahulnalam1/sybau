import { getJiraAccessToken, refreshJiraToken } from "@/lib/jira-auth";

export class JiraOAuthService {
    // JIRA doesn't have an official SDK like Linear's, so we'll use direct API calls

    private async getHeaders(refreshOnFailure = true) {
        const accessToken = await getJiraAccessToken();
        if (!accessToken) {
            throw new Error("No JIRA access token found");
        }

        return {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
        };
    }

    private async fetchWithAuth(url: string, options: RequestInit = {}) {
        let headers = await this.getHeaders();

        console.log(
            `JiraService: Making ${options.method || "GET"} request to: ${url}`
        );
        if (options.body) {
            console.log(
                "JiraService: Request payload:",
                JSON.parse(options.body as string)
            );
        }

        let response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                ...headers,
            },
        });

        // If we get a 401 Unauthorized, try to refresh the token and retry
        if (response.status === 401) {
            console.log("JiraService: Received 401, attempting to refresh token");
            try {
                // Attempt to refresh the token
                const newAccessToken = await refreshJiraToken();
                
                // Update headers with new token
                headers = {
                    ...headers,
                    Authorization: `Bearer ${newAccessToken}`,
                };
                
                // Retry the request with the new token
                console.log("JiraService: Retrying request with refreshed token");
                response = await fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        ...headers,
                    },
                });
            } catch (refreshError) {
                console.error("JiraService: Failed to refresh token:", refreshError);
                // Continue with original response if refresh fails
            }
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `JiraService: API error (${response.status}):`,
                errorText
            );
            console.error("JiraService: Full response object:", response);
            throw new Error(
                `JIRA API error: ${response.status} ${response.statusText}`
            );
        }

        const responseData = await response.json();
        console.log("JiraService: Response data:", responseData);
        return responseData;
    }

    async getAccessibleResources() {
        try {
            const resources = await this.fetchWithAuth(
                "https://api.atlassian.com/oauth/token/accessible-resources"
            );
            return resources;
        } catch (error) {
            console.error("Error fetching JIRA accessible resources:", error);
            throw error;
        }
    }

    async getProjects(cloudId: string) {
        try {
            const projects = await this.fetchWithAuth(
                `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project`
            );
            return projects;
        } catch (error) {
            console.error("Error fetching JIRA projects:", error);
            throw error;
        }
    }

    async getIssueTypes(cloudId: string) {
        try {
            const issueTypes = await this.fetchWithAuth(
                `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issuetype`
            );
            return issueTypes;
        } catch (error) {
            console.error("Error fetching JIRA issue types:", error);
            throw error;
        }
    }

    async getProjectIssueTypes(cloudId: string, projectId: string) {
        try {
            const projectMeta = await this.fetchWithAuth(
                `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/createmeta?projectIds=${projectId}&expand=projects.issuetypes`
            );
            return projectMeta.projects[0]?.issuetypes || [];
        } catch (error) {
            console.error("Error fetching JIRA project issue types:", error);
            throw error;
        }
    }

    async getIssues(cloudId: string, projectKey: string) {
        try {
            const jql = encodeURIComponent(
                `project = ${projectKey} ORDER BY created DESC`
            );
            const issues = await this.fetchWithAuth(
                `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search?jql=${jql}`
            );
            return issues.issues || [];
        } catch (error) {
            console.error("Error fetching JIRA issues:", error);
            throw error;
        }
    }

    async getIssue(cloudId: string, issueKey: string) {
        try {
            const issue = await this.fetchWithAuth(
                `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}`
            );
            return issue;
        } catch (error) {
            console.error("Error fetching JIRA issue:", error);
            throw error;
        }
    }

    async getPriorities(cloudId: string) {
        try {
            const priorities = await this.fetchWithAuth(
                `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/priority`
            );
            return priorities;
        } catch (error) {
            console.error("Error fetching JIRA priorities:", error);
            throw error;
        }
    }

    async createIssue(
        cloudId: string,
        params: {
            projectId: string;
            summary: string;
            description?: string;
            issueTypeId: string;
            assigneeId?: string;
            priorityId?: string; // Keep parameter for backward compatibility
        }
    ) {
        try {
            console.log("JiraService: Creating issue with params:", {
                cloudId,
                ...params,
            });

            const {
                projectId,
                summary,
                description,
                issueTypeId,
                assigneeId,
                // Don't extract priorityId
            } = params;

            const issueData: any = {
                fields: {
                    project: {
                        id: projectId,
                    },
                    summary: summary,
                    issuetype: {
                        id: issueTypeId,
                    },
                },
            };

            if (description) {
                // Proper Atlassian Document Format (ADF)
                issueData.fields.description = {
                    version: 1,
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                {
                                    type: "text",
                                    text: description,
                                },
                            ],
                        },
                    ],
                };
            }

            if (assigneeId) {
                issueData.fields.assignee = {
                    id: assigneeId,
                };
            }

            // Remove priority field completely - it's causing 400 errors
            // Different JIRA projects have different configurations for priority
            
            console.log(
                "JiraService: Final issue data being sent to JIRA:",
                issueData
            );

            const issue = await this.fetchWithAuth(
                `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue`,
                {
                    method: "POST",
                    body: JSON.stringify(issueData),
                }
            );

            console.log("JiraService: Issue created successfully:", issue);
            return issue;
        } catch (error) {
            console.error("JiraService: Error creating JIRA issue:", error);
            throw error;
        }
    }

    async createTestIssue(
        cloudId: string,
        projectId: string,
        issueTypeId: string
    ) {
        console.log("JiraService: Creating test issue with:", {
            cloudId,
            projectId,
            issueTypeId,
        });

        return this.createIssue(cloudId, {
            projectId,
            summary: "Test issue from Sybau",
            description:
                "This is a test issue created from the Sybau application.",
            issueTypeId,
        });
    }
}
