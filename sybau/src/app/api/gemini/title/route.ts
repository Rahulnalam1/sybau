import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
      Based on the following content, generate a 3-4 word title that summarizes the main topic or intent:

      "${text}"

      Return ONLY the title as a plain string with no markdown, quotes, or formatting.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    let rawTitle = (await response.text()).trim()

    // Strip any surrounding quotes or artifacts
    rawTitle = rawTitle.replace(/^["'`]+|["'`]+$/g, "")

    return NextResponse.json({ title: rawTitle })
  } catch (error) {
    console.error("Error generating title:", error)
    return NextResponse.json({ error: "Failed to generate title" }, { status: 500 })
  }
}
