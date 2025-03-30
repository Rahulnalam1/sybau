import { JiraOAuthService } from "@/api/services/jira/jiraOAuthService";
import { isJiraAuthenticated } from "@/lib/jira-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JiraProjectSelector } from "@/components/jira/project-selector";

export default async function JiraProjectsPage() {
  // Check if user is authenticated with JIRA
  if (!(await isJiraAuthenticated())) {
    redirect('/integrate/jira');
  }
  
  try {
    const jiraService = new JiraOAuthService();
    
    // First, get accessible resources (Jira Cloud instances)
    const resources = await jiraService.getAccessibleResources();
    
    if (!resources || resources.length === 0) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">No JIRA Cloud Instances Found</h1>
          <p>We couldn't find any JIRA Cloud instances that you have access to.</p>
          <div className="mt-4">
            <Link href="/integrate/jira" className="text-blue-500 hover:underline">
              Return to JIRA Integration
            </Link>
          </div>
        </div>
      );
    }
    
    // Use the first available resource (cloud instance)
    const cloudResource = resources[0];
    const cloudId = cloudResource.id;
    
    // Get projects for this cloud instance
    const projects = await jiraService.getProjects(cloudId);
    
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Your JIRA Projects</h1>
            <p className="text-gray-600">
              Connected to JIRA Cloud: {cloudResource.name} ({cloudResource.url})
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">
              Back to Dashboard
            </Link>
          </Button>
        </div>
        
        {projects && projects.length > 0 ? (
          <JiraProjectSelector 
            projects={projects} 
            cloudId={cloudId} 
            cloudUrl={cloudResource.url}
          />
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <p>No projects found in this JIRA instance.</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching JIRA projects:", error);
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Error Loading JIRA Projects</h1>
        <p className="text-red-600">
          {error instanceof Error ? error.message : "An unexpected error occurred while loading your JIRA projects."}
        </p>
        <div className="mt-4">
          <Link href="/integrate/jira" className="text-blue-500 hover:underline">
            Return to JIRA Integration
          </Link>
        </div>
      </div>
    );
  }
} 