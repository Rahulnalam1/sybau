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