"use client"

import * as React from "react"
import {
  Zap,
  WandSparkles,
  Sparkles,
  Search,
  AArrowDown,
  AArrowUp,
  Cpu,
} from "lucide-react"
import {
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import {
} from "@/components/ui/hover-card"
import { toast } from "sonner"

import { useIntegration } from "@/app/context/IntegrationContext"
import { getAuthUrlForIntegration } from "@/lib/utils"
import { supabase } from "@/api/lib/supabase-browser"

import { Editor } from "@tiptap/react"

interface CommandOption {
  icon: React.ElementType;
  label: string;
  action: () => void;
}

type Integration = {
  id: string,
  label: string,
  iconSrc: any
}

export function EmailCommandButton({ editor } : { editor: Editor | null}) {
  const [open, setOpen] = React.useState(false)
  const [width, setWidth] = React.useState("160px")
  const [isContentVisible, setIsContentVisible] = React.useState(true)
  const [selectedText, setSelectedText] = React.useState("")
  const buttonRef = React.useRef<HTMLDivElement>(null)

  const { activeIntegration } = useIntegration()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (!open) {
          handleClick()
        } else {
          handleCancel()
        }
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (open && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        handleCancel()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Monitor text selection
  React.useEffect(() => {
    const checkSelection = () => {
      const selection = window.getSelection()
      const text = selection?.toString() || ""
      const trimmedText = text.trim()
      setSelectedText(trimmedText)
      
      // If text is selected and the menu isn't open, open it
      if (trimmedText && !open) {
        handleClick()
      }
    }

    document.addEventListener("selectionchange", checkSelection)
    return () => document.removeEventListener("selectionchange", checkSelection)
  }, [open])

  const commandOptions: CommandOption[] = [
    {
      icon: Cpu,
      label: "Automate tasks",
      action: async () => {
        if (!activeIntegration) {
          toast.error("No integration selected");
          return;
        }
  
        try {
          const markdown = editor?.getHTML();
          const platform = activeIntegration.id;
  
          const {
            data: { session },
          } = await supabase.auth.getSession();
  
          const res = await fetch("/api/drafts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ markdown, platform }),
          });
  
          const { id } = await res.json();
          if (!id) throw new Error("No draft ID returned");
  
          // ✅ Use new getAuthUrlForIntegration helper
          const authUrl = getAuthUrlForIntegration(platform, {
            draftId: id,
            platform,
          });
  
          if (!authUrl) {
            toast.error("Integration not supported");
            return;
          }
  
          toast(`Redirecting to ${activeIntegration.label}...`);
          window.location.href = authUrl;
  
        } catch (err) {
          toast.error("Failed to save draft before redirect");
          console.error("OAuth redirect error:", err);
        }
      },
    },
    { icon: WandSparkles, label: "Rewrite selection...", action: () => console.log("Rewrite") },
    { icon: Sparkles, label: "Improve", action: () => console.log("Improve") },
    { icon: AArrowUp, label: "Expand", action: () => console.log("Expand") },
    { icon: AArrowDown, label: "Shorten", action: () => console.log("Shorten") },
  ]

  const handleClick = () => {
    setIsContentVisible(false)
    setTimeout(() => {
      setWidth("400px")
      setTimeout(() => {
        setOpen(true)
        setTimeout(() => {
          setIsContentVisible(true)
        }, 25)
      }, 400)
    }, 100)
  }

  const handleCancel = () => {
    setIsContentVisible(false)
    setTimeout(() => {
      setOpen(false)
      setTimeout(() => {
        setWidth("160px")
        setTimeout(() => {
          setIsContentVisible(true)
        }, 100)
      }, 100)
    }, 100)
  }

  const commonStyles = {
    width,
    WebkitTransition: 'width 500ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    MozTransition: 'width 500ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    OTransition: 'width 500ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    transition: 'width 500ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  }

  const contentStyles = {
    opacity: isContentVisible ? 1 : 0,
    transition: 'opacity 150ms ease-in-out',
  }

  return (
    <>
      <div className="relative" ref={buttonRef}>
        {!open ? (
          <Button
            className="ml-auto bg-white hover:bg-gray-50 text-gray-900 rounded-[12px] border border-gray-200 shadow-sm flex items-center gap-4 px-5 py-3 text-sm h-11"
            style={commonStyles}
            onClick={handleClick}
          >
            <div className="flex items-center" style={contentStyles}>
              <Zap className="h-4 w-4 mr-1" />
              Actions
              <span className="text-sm text-gray-500 ml-4">⌘K</span>
            </div>
          </Button>
        ) : (
          <div
            className="ml-auto bg-white text-gray-900 rounded-[12px] border border-gray-200 shadow-sm"
            style={commonStyles}
          >
            {selectedText ? (
              <div className="p-2" style={contentStyles}>
                <div className="flex items-center px-2 py-1.5 mb-1 bg-gray-50 rounded-md">
                  <Search className="h-4 w-4 text-gray-500 mr-2" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full bg-transparent border-none outline-none text-sm text-gray-500 placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-0.5">
                  {commandOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={option.action}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-50 rounded-md text-left"
                    >
                      <option.icon className="h-4 w-4 text-gray-500" />
                      <span className="text-[13px]">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between px-5 py-3 h-11" style={contentStyles}>
                <span className="text-sm text-gray-500">Select some text first</span>
                <button
                  onClick={handleCancel}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
