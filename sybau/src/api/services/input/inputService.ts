import { SupportedPlatform, Task } from "@/types/types"

export async function parseMarkdownInput(
    markdown: string,
    platform: SupportedPlatform,
    userId: string
): Promise<Task[]> {
    const lines = markdown.trim().split("\n")
    const tasks: Task[] = []
  
    let currentTitle = ""
    let currentBody: string[] = []
  
    for (const line of lines) {
      if (line.startsWith("## ")) {
        if (currentTitle) {
          tasks.push({
            title: currentTitle,
            body: currentBody.join("\n").trim(),
          })
        }
  
        currentTitle = line.replace(/^## /, "").trim()
        currentBody = []
      } else {
        currentBody.push(line)
      }
    }
  
    if (currentTitle) {
      tasks.push({
        title: currentTitle,
        body: currentBody.join("\n").trim(),
      })
    }
  
    return tasks
}
