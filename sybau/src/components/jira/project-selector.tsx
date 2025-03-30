'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import { GeminiOutput } from "@/types/types";

interface JiraProject {
  id: string;
  key: string;
  name: string;
  avatarUrls?: {
    [key: string]: string;
  };
  description?: string;
}

interface JiraProjectSelectorProps {
  projects: JiraProject[];
  cloudId: string;
  cloudUrl: string;
}

export function JiraProjectSelector({ projects, cloudId, cloudUrl }: JiraProjectSelectorProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [processingTasks, setProcessingTasks] = useState(false);
  const [draftContent, setDraftContent] = useState("");
  const [generatedTasks, setGeneratedTasks] = useState<GeminiOutput[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [issueTypes, setIssueTypes] = useState<any[]>([]);
  const [selectedIssueType, setSelectedIssueType] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft_id");

  useEffect(() => {
    async function fetchDraftContent() {
      if (!draftId) {
        console.log("No draft ID found in URL");
        toast.error("No draft ID provided. Please select a draft first.");
        setLoading(false);
        return;
      }

      console.log("Fetching draft content for ID:", draftId);

      try {
        const supabase = createClientComponentClient();
        const { data, error } = await supabase
          .from("drafts")
          .select("markdown")
          .eq("id", draftId)
          .single();

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        if (data?.markdown) {
          setDraftContent(data.markdown);
        } else {
          // Try to load from localStorage as fallback
          const savedContent = localStorage.getItem('editor_content');
          if (savedContent) {
            console.log("Found content in localStorage");
            setDraftContent(savedContent);
          } else {
            toast.error("Draft content is empty");
          }
        }
      } catch (error) {
        console.error("Error fetching draft content:", error);
        toast.error("Failed to load draft content");
      } finally {
        setLoading(false);
      }
    }

    fetchDraftContent();
  }, [draftId]);

  const handleProjectSelect = async (projectId: string) => {
    setSelectedProject(projectId);
    
    // Fetch issue types for the selected project
    try {
      const response = await fetch(`/api/jira/issue-types?cloudId=${cloudId}&projectId=${projectId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch issue types");
      }
      
      const issueTypesData = await response.json();
      setIssueTypes(issueTypesData);
      
      // Default to the first issue type (usually "Task")
      const taskType = issueTypesData.find((type: any) => type.name === "Task") || issueTypesData[0];
      if (taskType) {
        setSelectedIssueType(taskType.id);
      }
    } catch (error) {
      console.error("Error fetching issue types:", error);
      toast.error("Failed to load issue types");
    }
  };

  const handleGenerateTasks = async () => {
    if (!selectedProject) {
      toast.error("Please select a project first");
      return;
    }

    if (!draftContent) {
      console.log("Draft content is empty. Current state:", { draftId, contentLength: 0 });
      toast.error("No content to process. Please go back to the workspace and try again.");
      return;
    }

    console.log("Generating tasks with content length:", draftContent.length);
    setProcessingTasks(true);

    try {
      // Generate tasks using Gemini API
      const tasksRes = await fetch("/api/input/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: draftContent,
        }),
      });
      
      if (!tasksRes.ok) {
        throw new Error("Failed to generate tasks");
      }
      
      const { tasks } = await tasksRes.json();
      
      setGeneratedTasks(tasks);
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating tasks:", error);
      toast.error("Failed to generate tasks");
    } finally {
      setProcessingTasks(false);
    }
  };
  
  const handlePushTasks = async () => {
    if (!selectedProject || !generatedTasks || !selectedIssueType) {
      toast.error("Please select a project and issue type");
      return;
    }
    
    setProcessingTasks(true);
    
    try {
      // Create a new endpoint for pushing tasks to JIRA
      const response = await fetch("/api/jira/create-issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks: generatedTasks,
          cloudId,
          projectId: selectedProject,
          issueTypeId: selectedIssueType,
          draftId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to push tasks to JIRA");
      }

      const result = await response.json();
      toast.success(`Successfully created ${result.createdIssues?.length || 0} tasks in JIRA!`);
      
      // Redirect back to workspace after a short delay
      setTimeout(() => {
        if (draftId) {
          router.push(`/workspace/${draftId}`);
        } else {
          router.push("/workspace");
        }
      }, 2000);
    } catch (error) {
      console.error("Error pushing tasks:", error);
      toast.error("Failed to push tasks to JIRA");
    } finally {
      setProcessingTasks(false);
    }
  };
  
  const closePreview = () => {
    setShowPreview(false);
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 0:
        return "No Priority";
      case 1:
        return "Highest";
      case 2:
        return "High";
      case 3:
        return "Medium";
      case 4:
        return "Low";
      default:
        return "Unknown";
    }
  };
  
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 0:
        return "bg-gray-200";
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-blue-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Preview modal for tasks
  const taskPreview = showPreview && generatedTasks && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Task Preview</h2>
          <button onClick={closePreview} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-grow">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">These tasks will be created in JIRA project:</p>
            <p className="font-medium">{projects.find(p => p.id === selectedProject)?.name} ({projects.find(p => p.id === selectedProject)?.key})</p>
          </div>
          
          <div className="space-y-4">
            {generatedTasks.map((task, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{task.title}</h3>
                  {task.priority !== undefined && (
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getPriorityColor(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.description}</p>
                {task.dueDate && (
                  <div className="mt-2 text-xs text-gray-500">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}
                {task.assignee && (
                  <div className="mt-1 text-xs text-gray-500">
                    Assignee: {task.assignee}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t p-4 flex justify-end space-x-3">
          <Button variant="outline" onClick={closePreview} disabled={processingTasks}>
            Cancel
          </Button>
          <Button 
            onClick={handlePushTasks} 
            disabled={processingTasks}
            className="flex items-center space-x-2"
          >
            {processingTasks ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Create in JIRA</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Select a project to push tasks to:</h2>
        {draftId ? (
          <p className="text-sm text-gray-600 mb-4">
            Using draft ID: {draftId}
          </p>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md mb-4">
            <p className="text-sm text-yellow-800">
              No draft selected. Please go back to the workspace and select a draft.
            </p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className={`bg-white rounded-lg shadow-md p-6 border cursor-pointer transition-colors
              ${selectedProject === project.id 
                ? 'border-blue-500 ring-2 ring-blue-200' 
                : 'border-gray-100 hover:border-blue-200'}`}
            onClick={() => handleProjectSelect(project.id)}
          >
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
                href={`${cloudUrl}/browse/${project.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-100 transition-colors"
              >
                Open in JIRA
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {selectedProject && (
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleGenerateTasks} 
            disabled={processingTasks || !draftId}
            className="flex items-center space-x-2"
          >
            {processingTasks ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Generate Tasks</span>
            )}
          </Button>
        </div>
      )}
      
      {taskPreview}
    </div>
  );
} 