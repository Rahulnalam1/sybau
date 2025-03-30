"use client"

import { Ellipsis, FileText, Folder, Trash2 } from "lucide-react"
import Link from "next/link"
import { Draft } from "@/types/types"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"

export function NavDrafts({ drafts }: { drafts: Draft[] }) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Drafts</SidebarGroupLabel>
      <SidebarMenu>
        {drafts.map((draft) => (
          <SidebarMenuItem key={draft.id} className="group/menu-item">
            <SidebarMenuButton
              asChild
              tooltip={draft.title || "Untitled Draft"}
              className="transition-colors duration-150 hover:delay-200 relative"
            >
              <Link
                href={`/drafts/${draft.id}`}
                className="flex items-center w-full hover:bg-accent/50 rounded-md"
                onMouseEnter={(e) => {
                  const icon = e.currentTarget.querySelector(".hover-icon")
                  if (icon) icon.classList.remove("opacity-0")
                }}
                onMouseLeave={(e) => {
                  const icon = e.currentTarget.querySelector(".hover-icon")
                  if (icon) icon.classList.add("opacity-0")
                }}
              >
                <FileText className="shrink-0" />
                <span className="truncate">{draft.title || "Untitled Draft"}</span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                    <Ellipsis
                      className="ml-auto h-4 w-4 opacity-0 transition-opacity duration-200 hover-icon cursor-pointer"
                      size={16}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[200px] rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuItem>
                      <Folder className="text-muted-foreground" />
                      <span>Rename</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trash2 className="text-muted-foreground" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
