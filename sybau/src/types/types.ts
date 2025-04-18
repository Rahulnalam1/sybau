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

export type SupportedPlatform = "jira" | "linear" | "none";

export interface ParsedInput {
    title: string;
    body: string;
    platform: SupportedPlatform;
    userId: string;
}

export interface Task {
    title: string;
    body: string;
    tags?: string[];
}

export interface Draft {
    id: string;
    user_id: string;
    markdown: string;
    title?: string;
    platform: string;
    created_at: string;
    updated_at: string;
}

// same as the Linear Input
export interface GeminiOutput {
    title: string;
    description: string;
    priority: number;
    dueDate?: string;
}

export interface JiraInput {
    summary: string;
    description: string;
    projectId: string;
    issueTypeId: string;
}
