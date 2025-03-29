import { LinearService } from "../../services/linear/linearService";

export class LinearController {
  private linearService: LinearService;

  constructor(apiKey: string) {
    this.linearService = new LinearService(apiKey);
  }

  async getTeams() {
    try {
      const teams = await this.linearService.getTeams();
      return teams;
    } catch (error) {
      console.error("Error in LinearController.getTeams:", error);
      throw error;
    }
  }

  async getProjects(teamId: string) {
    try {
      const projects = await this.linearService.getProjects(teamId);
      return projects;
    } catch (error) {
      console.error("Error in LinearController.getProjects:", error);
      throw error;
    }
  }

  async getIssues(projectId: string) {
    try {
      const issues = await this.linearService.getIssues(projectId);
      return issues;
    } catch (error) {
      console.error("Error in LinearController.getIssues:", error);
      throw error;
    }
  }

  async getIssuesByTeam(teamId: string) {
    try {
      const issues = await this.linearService.getIssuesByTeam(teamId);
      return issues;
    } catch (error) {
      console.error("Error in LinearController.getIssuesByTeam:", error);
      throw error;
    }
  }

  async getIssueById(issueId: string) {
    try {
      const issue = await this.linearService.getIssueById(issueId);
      return issue;
    } catch (error) {
      console.error("Error in LinearController.getIssueById:", error);
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
      const issue = await this.linearService.createIssue(params);
      return issue;
    } catch (error) {
      console.error("Error in LinearController.createIssue:", error);
      throw error;
    }
  }
} 