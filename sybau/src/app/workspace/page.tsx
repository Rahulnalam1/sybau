"use client"

import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { AppSidebar } from "@/components/app-sidebar"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { EmailCommandButton } from "@/components/actions"
import { Toaster } from "sonner"
import { toast } from "sonner"

import { IntegrationProvider } from "../context/IntegrationContext";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
    ],
    content: '',
  })

  const supabase = createClientComponentClient()
  const router = useRouter()

  // Load editor content from Supabase
  const loadSavedContent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoading(false)
        return
      }
      
      // Fetch the most recent draft for this user
      const { data, error } = await supabase
        .from("drafts")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        console.error("Error loading content:", error)
        toast.error("Failed to load your content")
      }
      
      if (data && editor) {
        // Set the editor content with the saved content
        editor.commands.setContent(data.markdown)
        // Also save to localStorage immediately
        localStorage.setItem('editor_content', data.markdown)
      } else {
        // Check localStorage as a fallback
        const savedContent = localStorage.getItem('editor_content')
        if (savedContent && editor) {
          editor.commands.setContent(savedContent)
        }
      }
    } catch (err) {
      console.error("Error loading content:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (editor) {
      loadSavedContent()
    }
  }, [editor])

  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.slice(1))

    const access_token = params.get("access_token")
    const refresh_token = params.get("refresh_token")

    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token })
        .then(() => {
          router.replace("/workspace") // Clean the URL
          
          // If we just returned from OAuth, we should load the saved content
          loadSavedContent()
        })
        .catch((err) => console.error("Failed to set session", err))
    }
  }, [])
  
  // Save editor content to localStorage whenever it changes
  useEffect(() => {
    if (editor) {
      const updateStorage = () => {
        const content = editor.getHTML();
        if (content) {
          console.log("Saving editor content to localStorage, length:", content.length);
          localStorage.setItem('editor_content', content);
        }
      };
      
      // Set up event handler for content changes
      editor.on('update', updateStorage);
      
      return () => {
        editor.off('update', updateStorage);
      };
    }
  }, [editor]);

  return (
    <IntegrationProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Workspace
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center min-h-[500px]">
                  <p className="text-muted-foreground">Loading your content...</p>
                </div>
              ) : (
                <EditorContent 
                  editor={editor} 
                  className="prose max-w-none min-h-[500px] p-4 focus:outline-none" 
                />
              )}
            </div>
            <div className="flex justify-center pb-4">
              <EmailCommandButton editor={editor} />
            </div>
          </div>
        </SidebarInset>
        <Toaster position="bottom-right" />
      </SidebarProvider>
    </IntegrationProvider>
  )
}
