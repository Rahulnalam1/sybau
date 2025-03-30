"use client"

import {
  Folder,
  Forward,
  Trash2,
  Ellipsis,
  type LucideIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { IntegrationsDropdown } from "./dnd-integrations"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name} className="group/menu-item">
            <SidebarMenuButton 
              asChild 
              tooltip={item.name}
              className="transition-colors duration-150 hover:delay-200 relative"
            >
              <a 
                href={item.url}
                className="flex items-center w-full hover:bg-accent/50 rounded-md"
                onMouseEnter={(e) => {
                  const icon = e.currentTarget.querySelector('.hover-icon');
                  if (icon) icon.classList.remove('opacity-0');
                }}
                onMouseLeave={(e) => {
                  const icon = e.currentTarget.querySelector('.hover-icon');
                  if (icon) icon.classList.add('opacity-0');
                }}
              >
                <item.icon />
                <span>{item.name}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                    <Ellipsis 
                      className="ml-auto h-4 w-4 opacity-0 transition-opacity duration-200 hover-icon cursor-pointer" 
                      size={16}
                    />
                  </DropdownMenuTrigger>
                  {item.name === "Integrations" ? (
                    <IntegrationsDropdown />
                  ) : (
                    <DropdownMenuContent
                      className="w-[200px] rounded-lg"
                      side={isMobile ? "bottom" : "right"}
                      align={isMobile ? "end" : "start"}
                    >
                      <DropdownMenuItem>
                        <Folder className="text-muted-foreground" />
                        <span>View Project</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Forward className="text-muted-foreground" />
                        <span>Share Project</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Trash2 className="text-muted-foreground" />
                        <span>Delete Project</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
