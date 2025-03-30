'use client'

import { useState } from "react"
import { ToyBrick } from "lucide-react"
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

// Import SVGs as React components
// Option 1: Use Image component if using Next.js
import Image from "next/image"
import LinearIconSrc from "../../public/linear.svg"
import JiraIconSrc from "../../public/jira.svg"

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
        <div className="h-2 w-2 rounded-full bg-green-500 ml-auto" />
      </DropdownMenuItem>
    </div>
  )
}

const DragOverlayContent = ({ label, iconSrc } : { 
  label: string 
  iconSrc: string
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg">
      <div className="flex items-center gap-2 p-2 cursor-grab">
        <div className="flex size-6 items-center justify-center rounded-md border bg-background">
          <Image src={iconSrc} alt={label} className="size-4" width={16} height={16} />
        </div>
        <div className="font-medium text-muted-foreground">{label}</div>
        <div className="h-2 w-2 rounded-full bg-green-500 ml-auto" />
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
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}