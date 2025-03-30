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
import { toast } from "sonner"

// Define available integrations
const integrations = {
  "integration-1": { id: "integration-1", label: "GitHub" },
  "integration-2": { id: "integration-2", label: "Jira" },
  "integration-3": { id: "integration-3", label: "Slack" },
}

const DraggableIntegrationItem = ({ 
  id, 
  label
}: { 
  id: string
  label: string
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
          <ToyBrick className="size-4" />
        </div>
        <div className="font-medium text-muted-foreground">{label}</div>
        <div className="h-2 w-2 rounded-full bg-green-500 ml-auto" />
      </DropdownMenuItem>
    </div>
  )
}

const DragOverlayContent = ({ label }: { label: string }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg">
      <div className="flex items-center gap-2 p-2 cursor-grab">
        <div className="flex size-6 items-center justify-center rounded-md border bg-background">
          <ToyBrick className="size-4" />
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
    const integrationId = active.id as string
    
    if (integrations[integrationId as keyof typeof integrations]) {
      const integrationName = integrations[integrationId as keyof typeof integrations].label
      
      // Show toast notification
      toast(`Integrated ${integrationName}`, {
        description: `Connection to ${integrationName} has been established`,
        action: {
          label: "Undo",
          onClick: () => console.log(`Configure ${integrationName} undo`),
        },
      })
    }
    
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
          />
        ))}
      </DropdownMenuContent>

      <DragOverlay>
        {activeId && integrations[activeId as keyof typeof integrations] ? (
          <DragOverlayContent 
            label={integrations[activeId as keyof typeof integrations].label}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}