import "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email?: string | null;
            name?: string | null;
            image?: string | null;
        };
        trelloAccessToken?: string;
        trelloTokenSecret?: string;
    }

    interface JWT {
        oauth_token?: string;
        oauth_token_secret?: string;
    }
}

export interface TrelloBoard {
    id: string;
    name: string;
    desc: string;
    url: string;
    closed: boolean;
}

export interface TrelloCard {
    id: string;
    name: string;
    desc: string;
    listId: string;
    due?: string;
    labels?: TrelloLabel[];
}

export interface TrelloLabel {
    id: string;
    name: string;
    color: string;
}

export interface CreateCardParams {
    listId: string;
    name: string;
    description?: string;
    due?: string;
    labelIds?: string[];
}

export interface UpdateCardParams extends Partial<CreateCardParams> {
    cardId: string;
}

// ... rest of the file stays the same
