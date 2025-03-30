import { JiraOAuthService } from "@/api/services/jira/jiraOAuthService";
import { isJiraAuthenticated } from "@/lib/jira-auth";
import { redirect } from "next/navigation";
import { CreateJiraTestIssueButton } from "@/components/jira/create-test-issue-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <div className="flex items-center mb-4">
                  {project.avatarUrls && project.avatarUrls["48x48"] ? (
                    <img 
                      src={project.avatarUrls["48x48"]} 
                      alt={project.name} 
                      className="w-10 h-10 mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium">{project.name.substring(0, 2)}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-lg">{project.name}</h3>
                    <p className="text-sm text-gray-500">Key: {project.key}</p>
                  </div>
                </div>
                
                <div className="mt-2 mb-4">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {project.description || "No description available"}
                  </p>
                </div>
                
                <div className="mt-4 space-x-2 flex">
                  <a
                    href={`${cloudResource.url}/browse/${project.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    Open in JIRA
                  </a>
                  
                  <CreateJiraTestIssueButton
                    cloudId={cloudId}
                    projectId={project.id}
                  />
                </div>
              </div>
            ))}
          </div>
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