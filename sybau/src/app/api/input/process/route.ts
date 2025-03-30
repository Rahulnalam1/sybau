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

    try {
        const tasks = await geminiController.createTasks(text);
        return NextResponse.json({ tasks });
    } catch (err) {
        console.error("Failed to process input:", err);
        return NextResponse.json(
            { error: "Failed to process input" },
            { status: 500 }
        );
    }
}
