"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "black",
          "--normal-border": "var(--border)",
          "--normal-description": "#71717a",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
