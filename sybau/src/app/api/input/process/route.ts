// POST api/input/process

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/api/middleware/authMiddleware";
import { GeminiController } from "@/api/controllers/gemini/geminiController";

const geminiController = new GeminiController();

export async function POST(req: NextRequest) {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const { text } = body;
    
    console.log("Received request to process text, length:", text?.length || 0);
    
    if (!text || text.trim() === '') {
        console.error("Empty text received in API");
        return NextResponse.json(
            { error: "No text provided" },
            { status: 400 }
        );
    }

    try {
        console.log("Calling Gemini with text sample:", text.substring(0, 100) + "...");
        const tasks = await geminiController.createTasks(text);
        console.log("Gemini response:", tasks);
        return NextResponse.json({ tasks });
    } catch (err) {
        console.error("Failed to process input:", err);
        return NextResponse.json(
            { error: "Failed to process input" },
            { status: 500 }
        );
    }
}
