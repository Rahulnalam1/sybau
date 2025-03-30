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
import { Editor } from "@tiptap/react"

interface CommandOption {
  icon: React.ElementType;
  label: string;
  action: () => void;
}

interface EmailCommandButtonProps {
  editor?: Editor | null;
}

export function EmailCommandButton({ editor }: EmailCommandButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [width, setWidth] = React.useState("160px")
  const [isContentVisible, setIsContentVisible] = React.useState(true)
  const [selectedText, setSelectedText] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const buttonRef = React.useRef<HTMLDivElement>(null)

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

  const handleAutomateTasks = async () => {
    if (!selectedText || !editor) return
    
    try {
      setLoading(true)
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText })
      });
      
      if (!response.ok) throw new Error('Failed to process with Gemini');
      
      const { result } = await response.json();
      console.log("Generated tasks:", result);
      
      toast.success(`Successfully created tasks`);
      handleCancel();
    } catch (error) {
      console.error("Error automating tasks:", error);
      toast.error("Failed to automate tasks");
    } finally {
      setLoading(false);
    }
  }

  const handleRewrite = async () => {
    if (!selectedText || !editor) return
    
    try {
      setLoading(true)
      
      const rewritePrompt = `Rewrite the following text in a clear, professional manner while maintaining the original meaning: ${selectedText}`;
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rewritePrompt })
      });
      
      if (!response.ok) throw new Error('Failed to process with Gemini');
      
      const { result } = await response.json();
      
      editor.commands.deleteSelection();
      editor.commands.insertContent(result.text || "");
      
      toast.success("Text rewritten successfully");
      handleCancel();
    } catch (error) {
      console.error("Error rewriting text:", error);
      toast.error("Failed to rewrite text");
    } finally {
      setLoading(false);
    }
  }

  const handleImprove = async () => {
    if (!selectedText || !editor) return
    
    try {
      setLoading(true)
      
      const improvePrompt = `Improve the following text by enhancing clarity, fixing grammar issues, and making it more engaging: ${selectedText}`;
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: improvePrompt })
      });
      
      if (!response.ok) throw new Error('Failed to process with Gemini');
      
      const { result } = await response.json();
      
      editor.commands.deleteSelection();
      editor.commands.insertContent(result.text || "");
      
      toast.success("Text improved successfully");
      handleCancel();
    } catch (error) {
      console.error("Error improving text:", error);
      toast.error("Failed to improve text");
    } finally {
      setLoading(false);
    }
  }

  const handleExpand = async () => {
    if (!selectedText || !editor) return
    
    try {
      setLoading(true)
      
      const expandPrompt = `Expand the following text by adding more details, examples, and elaborating on key points: ${selectedText}`;
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: expandPrompt })
      });
      
      if (!response.ok) throw new Error('Failed to process with Gemini');
      
      const { result } = await response.json();
      
      editor.commands.deleteSelection();
      editor.commands.insertContent(result.text || "");
      
      toast.success("Text expanded successfully");
      handleCancel();
    } catch (error) {
      console.error("Error expanding text:", error);
      toast.error("Failed to expand text");
    } finally {
      setLoading(false);
    }
  }

  const handleShorten = async () => {
    if (!selectedText || !editor) return
    
    try {
      setLoading(true)
      
      const shortenPrompt = `Summarize the following text concisely while preserving the key points: ${selectedText}`;
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: shortenPrompt })
      });
      
      if (!response.ok) throw new Error('Failed to process with Gemini');
      
      const { result } = await response.json();
      
      editor.commands.deleteSelection();
      editor.commands.insertContent(result.text || "");
      
      toast.success("Text shortened successfully");
      handleCancel();
    } catch (error) {
      console.error("Error shortening text:", error);
      toast.error("Failed to shorten text");
    } finally {
      setLoading(false);
    }
  }

  const handleSummarize = async () => {
    if (!selectedText || !editor) return
    
    try {
      setLoading(true)
      
      const summarizePrompt = `Summarize the following text into key points while maintaining important information: ${selectedText}`;
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summarizePrompt })
      });
      
      if (!response.ok) throw new Error('Failed to process with Gemini');
      
      const { result } = await response.json();
      
      editor.commands.deleteSelection();
      editor.commands.insertContent(result.text || "");
      
      toast.success("Text summarized successfully");
      handleCancel();
    } catch (error) {
      console.error("Error summarizing text:", error);
      toast.error("Failed to summarize text");
    } finally {
      setLoading(false);
    }
  }

  const commandOptions: CommandOption[] = [
    { icon: Cpu, label: loading ? "Processing..." : "Automate tasks", action: handleAutomateTasks },
    { icon: WandSparkles, label: "Rewrite selection...", action: handleRewrite },
    { icon: Sparkles, label: "Improve", action: handleImprove },
    { icon: AArrowUp, label: "Expand", action: handleExpand },
    { icon: AArrowDown, label: "Shorten", action: handleShorten },
    { icon: Search, label: "Summarize", action: handleSummarize },
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
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1 z-10" ref={buttonRef}>
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
                      disabled={loading}
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
