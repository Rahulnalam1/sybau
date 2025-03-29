"use client"

import { Ellipsis, type LucideIcon } from "lucide-react"
import React from "react"

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
import { Folder, Trash2 } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    // Keep items[] type for backward compatibility, but we won't use it in the new implementation
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const { isMobile } = useSidebar()
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title} className="group/menu-item">
            <SidebarMenuButton 
              asChild 
              isActive={item.isActive}
              tooltip={item.title}
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
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                
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
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
