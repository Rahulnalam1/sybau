// context/IntegrationContext.tsx
"use client"

import React, { createContext, useContext, useState } from "react"

export type Integration = {
  id: string
  label: string
  iconSrc: any
}

type IntegrationContextType = {
  activeIntegration: Integration | null
  setActiveIntegration: (integration: Integration | null) => void
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined)

export const IntegrationProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeIntegration, setActiveIntegration] = useState<Integration | null>(null)

  return (
    <IntegrationContext.Provider value={{ activeIntegration, setActiveIntegration }}>
      {children}
    </IntegrationContext.Provider>
  )
}

export const useIntegration = () => {
  const context = useContext(IntegrationContext)
  if (!context) {
    throw new Error("useIntegration must be used within an IntegrationProvider")
  }
  return context
}
