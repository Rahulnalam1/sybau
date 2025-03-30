import { NextRequest, NextResponse } from "next/server";
import { GeminiController } from "@/api/controllers/gemini/geminiController";

const geminiController = new GeminiController();

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const result = await geminiController.createTasks(text);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error in Gemini API route:", error);
    return NextResponse.json(
      { error: "Failed to process with Gemini" },
      { status: 500 }
    );
  }
} 