import { LinearClient } from "@linear/sdk";

export class LinearService {
  private client: LinearClient;

  constructor(apiKey: string) {
    this.client = new LinearClient({
      apiKey,
    });
  }

  async getTeams() {
    try {
      const teams = await this.client.teams();
      return teams.nodes;
    } catch (error) {
      console.error("Error fetching Linear teams:", error);
      throw error;
    }
  }

  async getProjects(teamId: string) {
    try {
      // Get all projects and filter by team
      const projects = await this.client.projects();
      const teamProjects = projects.nodes.filter(
        project => project.teamId === teamId
      );
      return teamProjects;
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
      
      // Get all issues and filter client-side
      const issues = await this.client.issues();
      const projectIssues = issues.nodes.filter(
        issue => issue.projectId === projectId
      );
      return projectIssues;
    } catch (error) {
      console.error("Error fetching Linear issues:", error);
      throw error;
    }
  }

  async getIssuesByTeam(teamId: string) {
    try {
      // Use the team to get its issues directly
      const team = await this.client.team(teamId);
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
      const issue = await this.client.issue(issueId);
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
      const { title, description, teamId, projectId, assigneeId, priority } = params;
      
      const issue = await this.client.createIssue({
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