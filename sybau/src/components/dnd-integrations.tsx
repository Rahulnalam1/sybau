'use client'

import { useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  useDraggable,
  DragOverlay,
} from "@dnd-kit/core"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// Import SVGs as React components
// Option 1: Use Image component if using Next.js
import Image from "next/image"
import LinearIconSrc from "../../public/linear.svg"
import JiraIconSrc from "../../public/jira.svg"
import TrelloIconSrc from "../../public/trello.svg"
import NotionIconSrc from "../../public/notion.svg"
import GitHubIconSrc from "../../public/github.svg"

// Define available integrations with proper icon handling
const integrations = {
  "integration-1": { 
    id: "integration-1", 
    label: "Jira", 
    iconSrc: JiraIconSrc 
  },
  "integration-2": { 
    id: "integration-2", 
    label: "Linear", 
    iconSrc: LinearIconSrc 
  },
  "integration-3": { 
    id: "integration-3", 
    label: "Trello", 
    iconSrc: TrelloIconSrc 
  },
  "integration-4": { 
    id: "integration-4", 
    label: "Notion", 
    iconSrc: NotionIconSrc 
  },
  "integration-5": { 
    id: "integration-5", 
    label: "GitHub", 
    iconSrc: GitHubIconSrc 
  },
}

const DraggableIntegrationItem = ({ 
  id, 
  label,
  iconSrc
}: { 
  id: string
  label: string
  iconSrc: string
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    cursor: 'grabbing'
  } : undefined

  // Determine dot color based on integration type
  const getDotColor = (id: string) => {
    // Red dots for Notion, GitHub, and Trello
    if (id === "integration-3" || id === "integration-4" || id === "integration-5") {
      return "bg-red-500"
    }
    // Green dots for others (Jira and Linear)
    return "bg-green-500"
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <DropdownMenuItem 
        className="gap-2 p-2 cursor-grab"
        onSelect={(e) => e.preventDefault()}
      >
        <div className="flex size-6 items-center justify-center rounded-md border bg-background">
          <Image src={iconSrc} alt={label} className="size-4" width={16} height={16} />
        </div>
        <div className="font-medium text-muted-foreground">{label}</div>
        <div className={`h-2 w-2 rounded-full ${getDotColor(id)} ml-auto`} />
      </DropdownMenuItem>
    </div>
  )
}

const DragOverlayContent = ({ label, iconSrc, id } : { 
  label: string 
  iconSrc: string
  id: string
}) => {
  // Same dot color logic as above
  const getDotColor = (id: string) => {
    if (id === "integration-3" || id === "integration-4" || id === "integration-5") {
      return "bg-red-500"
    }
    return "bg-green-500"
  }

  return (
    <div className="bg-white shadow-lg rounded-lg">
      <div className="flex items-center gap-2 p-2 cursor-grab">
        <div className="flex size-6 items-center justify-center rounded-md border bg-background">
          <Image src={iconSrc} alt={label} className="size-4" width={16} height={16} />
        </div>
        <div className="font-medium text-muted-foreground">{label}</div>
        <div className={`h-2 w-2 rounded-full ${getDotColor(id)} ml-auto`} />
      </div>
    </div>
  )
}

export function IntegrationsDropdown() {
  const [activeId, setActiveId] = useState<string | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event
    console.log("Dragged integration:", active.id)
    
    // Show toast notification when integration is dragged
    const integration = integrations[active.id as keyof typeof integrations]
    if (integration) {
      toast(`${integration.label} added to workspace`, {
        description: `${integration.label} integration has been successfully connected`,
        duration: Infinity,
        action: {
          label: "Undo",
          onClick: () => {
            console.log(`Removed ${integration.label} integration`)
            // Logic to remove the integration would go here
          },
        },
      })
    }
    
    setActiveId(null)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >
      <DropdownMenuContent
        className="w-[200px] rounded-lg"
        align="start"
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Available Integrations
        </DropdownMenuLabel>
        {Object.values(integrations).map((integration) => (
          <DraggableIntegrationItem 
            key={integration.id}
            id={integration.id}
            label={integration.label}
            iconSrc={integration.iconSrc}
          />
        ))}
      </DropdownMenuContent>

      <DragOverlay>
        {activeId && integrations[activeId as keyof typeof integrations] ? (
          <DragOverlayContent 
            label={integrations[activeId as keyof typeof integrations].label}
            iconSrc={integrations[activeId as keyof typeof integrations].iconSrc}
            id={activeId}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}