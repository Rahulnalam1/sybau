import {
    TrelloBoard,
    TrelloCard,
    CreateCardParams,
    UpdateCardParams,
} from "../../controllers/trello/types";
import { trelloConfig } from "../../config/trello.config";
import OAuth from "oauth-1.0a";
import crypto from "crypto";

export class TrelloService {
    private apiKey: string;
    private oauth: OAuth;
    private token?: OAuth.Token;

    constructor(accessToken?: string, tokenSecret?: string) {
        this.apiKey = trelloConfig.apiKey;

        if (accessToken && tokenSecret) {
            this.token = {
                key: accessToken,
                secret: tokenSecret,
            };
        }

        this.oauth = new OAuth({
            consumer: {
                key: this.apiKey,
                secret: trelloConfig.token,
            },
            signature_method: "HMAC-SHA1",
            hash_function(baseString: string, key: string) {
                return crypto
                    .createHmac("sha1", key)
                    .update(baseString)
                    .digest("base64");
            },
        });
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        if (!this.token) {
            throw new Error("User not authenticated with Trello");
        }

        const url = `${trelloConfig.baseUrl}${endpoint}`;
        const requestData: OAuth.RequestData = {
            url,
            method: options.method || "GET",
        };

        const headers = this.oauth.toHeader(
            this.oauth.authorize(requestData, this.token)
        );

        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
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
