// app/api/input/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendTasksToPlatform } from "@/api/services/platform/linearService";
import { createClient } from "@/api/lib/supabase";
import { GeminiOutput } from "@/types/types";
import { GeminiController } from "@/api/controllers/gemini/geminiController";

const geminiController = new GeminiController();

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { draftId, platform, teamId } = await req.json();

    if (!platform || (platform !== "linear" && platform !== "jira")) {
      return NextResponse.json(
        { error: "Invalid platform" }, 
        { status: 400 }
      );
    }

    if (!draftId || !teamId) {
      return NextResponse.json(
        { error: "Missing required parameters" }, 
        { status: 400 }
      );
    }

    // Fetch the draft
    const { data: draft, error: draftError } = await supabase
      .from("drafts")
      .select("*")
      .eq("id", draftId)
      .single();

    if (draftError || !draft) {
      return NextResponse.json(
        { error: "Draft not found" }, 
        { status: 404 }
      );
    }

    // Process with Gemini
    const tasks: GeminiOutput[] = await geminiController.createTasks(draft.markdown);

    // Send to platform
    await sendTasksToPlatform(tasks, platform, draft.user_id, teamId);

    return NextResponse.json({ 
      success: true,
      message: "Tasks processed successfully"
    });

  } catch (error) {
    console.error("Error in process endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}