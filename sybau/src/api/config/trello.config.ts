if (!process.env.TRELLO_API_KEY) {
    throw new Error("Missing TRELLO_API_KEY environment variable");
}

if (!process.env.TRELLO_TOKEN) {
    throw new Error("Missing TRELLO_TOKEN environment variable");
}

export const trelloConfig = {
    apiKey: process.env.TRELLO_API_KEY,
    token: process.env.TRELLO_TOKEN,
    baseUrl: "https://api.trello.com/1",
} as const;
