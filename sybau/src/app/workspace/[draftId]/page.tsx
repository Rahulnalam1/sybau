"use client"

import { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { AppSidebar } from "@/components/app-sidebar";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { toast } from "sonner";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { EmailCommandButton } from "@/components/actions";
import { Toaster } from "sonner";
import { supabase } from "@/api/lib/supabase-browser";

import { IntegrationProvider, useIntegration } from "@/app/context/IntegrationContext";

// Integration map (same as the draggable dropdown uses)
import JiraIcon from "@/../public/jira.svg";
import LinearIcon from "@/../public/linear.svg";

const integrations = {
  linear: {
    id: "linear",
    label: "Linear",
    iconSrc: LinearIcon,
  },
  jira: {
    id: "jira",
    label: "Jira",
    iconSrc: JiraIcon,
  },
};

export default function WorkspaceDraftPage() {
  const router = useRouter();
  const { draftId } = useParams();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],
    content: "",
  });

  // 🔥 Move this into a ref so we can set it later
  let setActiveIntegrationRef = useRef<((integration: any) => void) | null>(null);

  // Load draft after editor and integration context are ready
  useEffect(() => {
    if (!editor || !draftId || !setActiveIntegrationRef.current) return

    const fetchDraft = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.access_token) return

        const res = await fetch(`/api/drafts/${draftId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        if (!res.ok) throw new Error("Failed to load")

        const data = await res.json()

        if (data?.markdown) {
          editor.commands.setContent(data.markdown)
        }

        if (data?.platform && integrations[data.platform as keyof typeof integrations]) {
          const integration = integrations[data.platform as keyof typeof integrations]
          setActiveIntegrationRef.current!(integration)
        }
      } catch (err) {
        console.error("Failed to load draft:", err)
      }
    }

    fetchDraft()
  }, [editor, draftId]);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isSaveCombo = (isMac && event.metaKey && event.key === 's') ||
                          (!isMac && event.ctrlKey && event.key === 's');
  
      if (isSaveCombo) {
        event.preventDefault();
        if (!editor) return;
  
        const markdown = editor.getHTML();
  
        if (!draftId) {
          toast.error("Draft ID not found");
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
  
        const savingToast = toast.loading("Saving draft...");
  
        try {
          const res = await fetch(`/api/drafts/${draftId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ markdown }),
          });
  
          const result = await res.json();
  
          toast.dismiss(savingToast);
  
          if (res.ok && result.success) {
            toast.success("Draft saved!", {
              description: `Changes synced to your account.`,
              duration: 2000,
            });
          } else {
            toast.error(result.error || "Update failed");
          }
        } catch (error) {
          toast.dismiss(savingToast);
          toast.error("Error saving draft");
          console.error("PATCH error:", error);
        }
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  // Wrap everything in IntegrationProvider
  return (
    <IntegrationProvider>
      <IntegrationConsumer setRef={(fn) => (setActiveIntegrationRef.current = fn)} />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/workspace">Workspace</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Draft {draftId}</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex-1">
              <EditorContent
                editor={editor}
                className="prose max-w-none min-h-[500px] p-4 focus:outline-none"
              />
            </div>
            <div className="flex justify-center pb-4">
              <EmailCommandButton editor={editor} />
            </div>
          </div>
        </SidebarInset>
        <Toaster position="bottom-right" />
      </SidebarProvider>
    </IntegrationProvider>
  );
}

// 👇 helper component to grab `setActiveIntegration` from context and expose it
function IntegrationConsumer({ setRef }: { setRef: (fn: (i: any) => void) => void }) {
  const { setActiveIntegration } = useIntegration();
  useEffect(() => {
    setRef(setActiveIntegration);
  }, []);
  return null;
}
