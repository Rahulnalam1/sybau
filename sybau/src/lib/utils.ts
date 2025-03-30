import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAuthUrlForIntegration(id: string): string | null {
  switch (id) {
    case "linear": {
      const redirectUri =
        process.env.NEXT_PUBLIC_LINEAR_REDIRECT_URI ||
        "http://localhost:3000/api/auth/linear/callback"
      const clientId = process.env.NEXT_PUBLIC_LINEAR_CLIENT_ID || "missing"

      return `https://linear.app/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=read,write,issues:create&response_type=code&state=random-state-value`
    }

    case "jira": {
      const redirectUri =
        process.env.NEXT_PUBLIC_JIRA_REDIRECT_URI ||
        "http://localhost:3000/api/auth/jira/callback"
      const clientId =
        process.env.NEXT_PUBLIC_JIRA_CLIENT_ID ||
        "5Ruf42z2OB9cSIcnQ3El3ytnOQCD89ng"

      return `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=offline_access%20read%3Ajira-work%20write%3Ajira-work%20manage%3Ajira-project&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&state=random-state-value&response_type=code&prompt=consent`
    }

    default:
      return null
  }
}
