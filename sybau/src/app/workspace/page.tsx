"use client"

import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { Extension } from '@tiptap/core';
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

import { IntegrationProvider } from "../context/IntegrationContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollText } from "lucide-react";

// Custom extension to handle the '++' autocomplete trigger
const AutocompleteExtension = Extension.create({
  name: 'autocomplete',
  
  addKeyboardShortcuts() {
    return {
      '+': ({ editor }) => {
        // Check if the last character was also a '+'
        const { selection } = editor.state;
        const { from } = selection;
        const lastChar = editor.state.doc.textBetween(Math.max(0, from - 1), from);
        
        if (lastChar === '+') {
          // Remove the "++" trigger
          editor.commands.deleteRange({ from: from - 2, to: from });
          
          // Show loading indicator
          const loadingToast = toast.loading("Generating autocomplete...");
          
          // Get the current paragraph text
          const paragraph = editor.state.doc.textBetween(
            editor.state.selection.$from.start(),
            editor.state.selection.from
          );
          
          // Call the autocomplete API
          fetch('/api/autocomplete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: paragraph })
          })
          .then(response => response.json())
          .then(data => {
            if (data.result) {
              editor.commands.insertContent(data.result);
              toast.dismiss(loadingToast);
              toast.success("Text autocompleted");
            } else {
              toast.dismiss(loadingToast);
              toast.error("Failed to autocomplete");
            }
          })
          .catch(error => {
            console.error("Autocomplete error:", error);
            toast.dismiss(loadingToast);
            toast.error("Error generating autocomplete");
          });
          
          return true;
        }
        
        return false;
      }
    };
  }
});

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing, or type "++" to AI autocomplete',
      }),
      AutocompleteExtension,
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

  const handleSummarize = async () => {
    if (!editor || editor.isEmpty) {
      toast.error("No content to summarize");
      return;
    }
    
    // Get the current editor content
    const content = editor.getHTML();
    const textContent = editor.getText();
    
    if (!textContent.trim()) {
      toast.error("No content to summarize");
      return;
    }
    
    // Show loading indicator
    const loadingToast = toast.loading("Summarizing content...");
    
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textContent })
      });
      
      if (!response.ok) throw new Error('Failed to summarize');
      
      const data = await response.json();
      
      if (data.result && data.result.text) {
        // Create a new document with the summarized content
        editor.commands.setContent(data.result.text);
        toast.dismiss(loadingToast);
        toast.success("Content summarized successfully");
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error("Summarize error:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to summarize content");
    }
  };

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
