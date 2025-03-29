import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { TrelloController } from "@/api/controllers/trello/trelloController";

const trelloController = new TrelloController();

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const boards = await trelloController.getBoards({
            user: session.user,
        } as any);
        return NextResponse.json(boards);
    } catch (error) {
        console.error("Failed to fetch boards:", error);
        return NextResponse.json(
            { error: "Failed to fetch boards" },
            { status: 500 }
        );
    }
}
