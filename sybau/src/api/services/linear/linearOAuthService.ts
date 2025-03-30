import { LinearClient } from "@linear/sdk";
import { getLinearAccessToken } from "@/lib/linear-auth";

export class LinearOAuthService {
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

  async getIssues(projectId: string) {
    try {
      if (!projectId || projectId === 'test') {
        return []; // Return empty array for test or invalid project IDs
      }
      
      const client = await this.getClient();
      // Get the project first to ensure it exists
      const project = await client.project(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      // Get issues from the project
      const issues = await project.issues();
      return issues.nodes;
    } catch (error) {
      console.error("Error fetching Linear issues:", error);
      throw error;
    }
  }

  async getIssuesByTeam(teamId: string) {
    try {
      const client = await this.getClient();
      // Use the team to get its issues directly
      const team = await client.team(teamId);
      if (!team) {
        throw new Error(`Team with ID ${teamId} not found`);
      }
      
      // Get issues from the team
      const issues = await team.issues();
      return issues.nodes;
    } catch (error) {
      console.error("Error fetching Linear issues by team:", error);
      throw error;
    }
  }
  
  async getIssueById(issueId: string) {
    try {
      const client = await this.getClient();
      const issue = await client.issue(issueId);
      return issue;
    } catch (error) {
      console.error("Error fetching Linear issue by ID:", error);
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