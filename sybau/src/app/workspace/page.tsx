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

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { EmailCommandButton } from "@/components/actions"
import { Toaster } from "sonner"

import { IntegrationProvider } from "../context/IntegrationContext";

export default function Page() {
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

  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.slice(1))

    const access_token = params.get("access_token")
    const refresh_token = params.get("refresh_token")

    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token })
        .then(() => {
          router.replace("/workspace") // Clean the URL
        })
        .catch((err) => console.error("Failed to set session", err))
    }
  }, [])

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
              <EditorContent 
                editor={editor} 
                className="prose max-w-none min-h-[500px] p-4 focus:outline-none" 
              />
            </div>
            <div className="flex justify-center pb-4">
              <EmailCommandButton />
            </div>
          </div>
        </SidebarInset>
        <Toaster position="bottom-right" />
      </SidebarProvider>
    </IntegrationProvider>
  )
}
