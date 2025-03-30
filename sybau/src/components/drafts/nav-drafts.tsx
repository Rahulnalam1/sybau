// components/nav-drafts.tsx
import { File } from "lucide-react"
import Link from "next/link"
import { Draft } from "@/types/types"

export function NavDrafts({ drafts }: { drafts: Draft[] }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase text-muted-foreground px-4">
        Drafts
      </div>
      {drafts.map((draft) => (
        <Link
          key={draft.id}
          href={`/drafts/${draft.id}`}
          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted rounded-md"
        >
          <File className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">{draft.title || "Untitled Draft"}</span>
        </Link>
      ))}
    </div>
  )
}
