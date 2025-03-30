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
import { supabase } from "@/api/lib/supabase-browser";

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
  const [isLoading, setIsLoading] = useState(false);
  
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

  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isSaveCombo = (isMac && event.metaKey && event.key === 's') ||
                          (!isMac && event.ctrlKey && event.key === 's');
  
      if (isSaveCombo) {
        event.preventDefault();
        if (!editor) return;
  
        const markdown = editor.getHTML();
  
        // Optional: Get title/platform context
        const {
            data: { session },
        } = await supabase.auth.getSession();

        const titleRes = await fetch("/api/gemini/title", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
            text: markdown,
        }),
        }) 

        const { title } = await titleRes.json()
  
        const savingToast = toast.loading("Saving draft...");
  
        try {
          const res = await fetch("/api/drafts", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ markdown, title }),
          });
  
          const result = await res.json();
  
          toast.dismiss(savingToast);
  
          if (res.ok && result.success) {
            toast.success("Draft saved!", {
                description: `Changes synced to your account.`,
                duration: 2000,
              });
          } else {
            toast.error(result.error || "Failed to save draft");
          }
        } catch (err) {
          toast.dismiss(savingToast);
          toast.error("Save failed — check your connection");
          console.error("Save error:", err);
        }
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor]);
  
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
