import { NextApiRequest, NextApiResponse } from "next";
import { TrelloService } from "../../services/trello/trelloService";
import { CreateCardParams, UpdateCardParams } from "./types";

export class TrelloController {
    private trelloService: TrelloService;

    constructor() {
        this.trelloService = new TrelloService();
    }

    async getBoards(req: NextApiRequest, res: NextApiResponse) {
        try {
            const user = (req as any).user;
            const boards = await this.trelloService.getBoards(user.id);
            return res.status(200).json(boards);
        } catch (error) {
            console.error("Failed to fetch boards:", error);
            return res.status(500).json({ error: "Failed to fetch boards" });
        }
    }

    async createCard(req: NextApiRequest, res: NextApiResponse) {
        try {
            const params = req.body as CreateCardParams;
            const card = await this.trelloService.createCard(params);
            return res.status(201).json(card);
        } catch (error) {
            console.error("Failed to create card:", error);
            return res.status(500).json({ error: "Failed to create card" });
        }
    }

    async updateCard(req: NextApiRequest, res: NextApiResponse) {
        try {
            const { cardId } = req.query;
            const params: UpdateCardParams = {
                ...req.body,
                cardId: cardId as string,
            };
            const card = await this.trelloService.updateCard(params);
            return res.status(200).json(card);
        } catch (error) {
            console.error("Failed to update card:", error);
            return res.status(500).json({ error: "Failed to update card" });
        }
    }

    async deleteCard(req: NextApiRequest, res: NextApiResponse) {
        try {
            const { cardId } = req.query;
            await this.trelloService.deleteCard(cardId as string);
            return res.status(204).send(null);
        } catch (error) {
            console.error("Failed to delete card:", error);
            return res.status(500).json({ error: "Failed to delete card" });
        }
    }

    async getBoardLists(req: NextApiRequest, res: NextApiResponse) {
        try {
            const { boardId } = req.query;
            const lists = await this.trelloService.getBoardLists(
                boardId as string
            );
            return res.status(200).json(lists);
        } catch (error) {
            console.error("Failed to fetch board lists:", error);
            return res
                .status(500)
                .json({ error: "Failed to fetch board lists" });
        }
    }
}
