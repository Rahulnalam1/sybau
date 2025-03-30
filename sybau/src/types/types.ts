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

export type SupportedPlatform = "trello" | "jira" | "linear"
export interface ParsedInput {
  title: string
  body: string
  platform: SupportedPlatform
  userId: string
}

export interface Task {
    title: string
    body: string
    tags?: string[]
}

export interface Draft {
  id: string
  title: string
  platform: string
  createdAt: string
}
