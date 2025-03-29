import {
    TrelloBoard,
    TrelloCard,
    CreateCardParams,
    UpdateCardParams,
} from "../../controllers/trello/types";
import { trelloConfig } from "../../config/trello.config";

export class TrelloService {
    private apiKey: string;
    private token: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = trelloConfig.apiKey;
        this.token = trelloConfig.token;
        this.baseUrl = trelloConfig.baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        url.searchParams.append("key", this.apiKey);
        url.searchParams.append("token", this.token);

        const response = await fetch(url.toString(), {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`Trello API error: ${response.statusText}`);
        }

        return response.json();
    }

    async getBoards(userId: string): Promise<TrelloBoard[]> {
        return this.request<TrelloBoard[]>(`/members/${userId}/boards`);
    }

    async createCard(params: CreateCardParams): Promise<TrelloCard> {
        return this.request<TrelloCard>("/cards", {
            method: "POST",
            body: JSON.stringify({
                idList: params.listId,
                name: params.name,
                desc: params.description,
                due: params.due,
                idLabels: params.labelIds,
            }),
        });
    }

    async updateCard(params: UpdateCardParams): Promise<TrelloCard> {
        return this.request<TrelloCard>(`/cards/${params.cardId}`, {
            method: "PUT",
            body: JSON.stringify({
                idList: params.listId,
                name: params.name,
                desc: params.description,
                due: params.due,
                idLabels: params.labelIds,
            }),
        });
    }

    async deleteCard(cardId: string): Promise<void> {
        await this.request(`/cards/${cardId}`, {
            method: "DELETE",
        });
    }

    async getBoardLists(boardId: string): Promise<any[]> {
        return this.request(`/boards/${boardId}/lists`);
    }
}
