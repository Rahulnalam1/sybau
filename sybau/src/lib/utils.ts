import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAuthUrlForIntegration(
  id: string,
  options?: { draftId?: string; platform?: string }
): string | null {
  const { draftId, platform } = options || {}

  switch (id) {
    case "linear": {
      const redirectUri =
        process.env.NEXT_PUBLIC_LINEAR_REDIRECT_URI ||
        "http://localhost:3000/api/auth/linear/callback"
      const clientId = process.env.NEXT_PUBLIC_LINEAR_CLIENT_ID || "missing"

      const url = new URL("https://linear.app/oauth/authorize")
      url.searchParams.set("client_id", clientId)
      url.searchParams.set("redirect_uri", redirectUri)
      url.searchParams.set("scope", "read,write,issues:create")
      url.searchParams.set("response_type", "code")
      url.searchParams.set("state", "random-state-value")

      if (draftId) url.searchParams.set("draftId", draftId)
      if (platform) url.searchParams.set("platform", platform)

      return url.toString()
    }

    case "jira": {
      const redirectUri =
        process.env.NEXT_PUBLIC_JIRA_REDIRECT_URI ||
        "http://localhost:3000/api/auth/jira/callback"
      const clientId =
        process.env.NEXT_PUBLIC_JIRA_CLIENT_ID ||
        "5Ruf42z2OB9cSIcnQ3El3ytnOQCD89ng"

      const url = new URL("https://auth.atlassian.com/authorize")
      url.searchParams.set("audience", "api.atlassian.com")
      url.searchParams.set("client_id", clientId)
      url.searchParams.set("scope", "offline_access read:jira-work write:jira-work manage:jira-project")
      url.searchParams.set("redirect_uri", redirectUri)
      url.searchParams.set("state", "random-state-value")
      url.searchParams.set("response_type", "code")
      url.searchParams.set("prompt", "consent")

      if (draftId) url.searchParams.set("draftId", draftId)
      if (platform) url.searchParams.set("platform", platform)

      return url.toString()
    }

    default:
      return null
  }
}
