import { LinearClient } from "@linear/sdk";
import { getLinearAccessToken } from "@/lib/linear-auth-browser";

export class LinearOAuthServiceClient {
  private client: LinearClient;

  constructor() {
    // Initialize with a dummy token, will be replaced in methods
    this.client = new LinearClient({
      accessToken: "placeholder",
    });
  }

  private async getClient() {
    const accessToken = await getLinearAccessToken();
    if (!accessToken) {
      throw new Error("No Linear access token found");
    }
    
    // Create a new client with the correct token
    return new LinearClient({
      accessToken,
    });
  }

  async getTeams() {
    try {
      const client = await this.getClient();
      const teams = await client.teams();
      return teams.nodes;
    } catch (error) {
      console.error("Error fetching Linear teams:", error);
      throw error;
    }
  }

  async getProjects(teamId: string) {
    try {
      const client = await this.getClient();
      // Get the team first
      const team = await client.team(teamId);
      if (!team) {
        throw new Error(`Team with ID ${teamId} not found`);
      }
      
      // Get projects from the team
      const projects = await team.projects();
      return projects.nodes;
    } catch (error) {
      console.error("Error fetching Linear projects:", error);
      throw error;
    }
  }

  async createIssue(params: {
    title: string;
    description?: string;
    teamId: string;
    projectId?: string;
    assigneeId?: string;
    priority?: number;
  }) {
    try {
      const client = await this.getClient();
      const { title, description, teamId, projectId, assigneeId, priority } = params;
      
      const issue = await client.createIssue({
        title,
        description,
        teamId,
        projectId,
        assigneeId,
        priority,
      });
      
      return issue;
    } catch (error) {
      console.error("Error creating Linear issue:", error);
      throw error;
    }
  }
} 