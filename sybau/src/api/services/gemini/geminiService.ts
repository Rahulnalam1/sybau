import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
    private readonly genAI: any;

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    }

    async generateTasks(text: string): Promise<any> {
        try {
            const model = this.genAI.getGenerativeModel({
                model: "gemini-1.5-flash", // or "gemini-pro"
            });

            // Check if this is a task creation request or a text modification request
            let prompt;

            if (text.includes("Rewrite")) {
                prompt = `INSTRUCTIONS: Rewrite the following meeting notes to be more structured and action-oriented. Focus on:
1. Clarifying action items and their owners
2. Highlighting deadlines and priorities
3. Organizing information in a logical sequence
4. Making language concise and specific
5. Removing unnecessary conversational elements

TEXT TO REWRITE:
${text.replace(/Rewrite.*?following text[^:]*:/i, "").trim()}

OUTPUT: Return ONLY the rewritten text with no additional explanations, comments, or formatting.`;
            } 
            else if (text.includes("Improve")) {
                prompt = `INSTRUCTIONS: Improve these meeting notes to make them more actionable and structured for task creation:
1. Format action items as clear, discrete tasks
2. Ensure each task has an identifiable owner (if mentioned)
3. Extract and highlight any deadlines, priority levels, or dependencies
4. Eliminate vague language and replace with specific, measurable details
5. Organize by project or work area for better task categorization

TEXT TO IMPROVE:
${text.replace(/Improve.*?following text[^:]*:/i, "").trim()}

OUTPUT: Return ONLY the improved text that could be easily parsed into tasks. No additional explanations, comments, or formatting.`;
            }
            else if (text.includes("Expand")) {
                prompt = `INSTRUCTIONS: Expand these meeting notes with additional context and detail to make them more actionable, while maintaining clarity:
1. Add necessary context for each action item
2. Include relevant acceptance criteria or definition of done
3. Add specificity to vague tasks (what, how, when)
4. Clarify dependencies between tasks where applicable
5. Include any relevant resource links or references mentioned

Keep the expanded content focused on actionable information that would be useful in task management systems.

TEXT TO EXPAND:
${text.replace(/Expand.*?following text[^:]*:/i, "").trim()}

OUTPUT: Return ONLY the expanded text with no additional explanations, comments, or formatting.`;
            }
            else if (text.includes("Summarize") || text.includes("Shorten")) {
                prompt = `INSTRUCTIONS: Summarize these meeting notes into concise, actionable points that could be directly converted to tasks:
1. Extract only the key decisions and action items
2. Include only essential who/what/when details for each item
3. Format as a list of discrete action points
4. Retain priority indicators and deadlines
5. Remove discussions, background context, and other non-actionable content

TEXT TO SUMMARIZE:
${text.replace(/Summarize.*?following text[^:]*:|Shorten.*?following text[^:]*:/i, "").trim()}

OUTPUT: Return ONLY the summarized text as a concise list of actionable items. No additional explanations, comments, or formatting.`;
            }
            else {
                // For task creation, use a more focused format
                prompt = `Here is the input text from meeting notes: ${text}
                
                For each action item or task mentioned in these notes:

                1. Create a title (max 5-7 words) that clearly describes the task
                2. Extract a detailed description including context and requirements
                3. Identify the priority level (1-4, where 1 is highest)
                4. Extract any mentioned due date
                5. Identify the assignee if mentioned

                Format each task as a JSON object with these fields:
                - title (string): Short, descriptive title
                - description (string): Detailed task description
                - priority (number): 1-4 or 0 if not specified
                - dueDate (string): ISO 8601 date format or null if not specified
                - assignee (string): Person's name or null if not specified

                Return an array of these JSON objects. Return ONLY THE JSON AND NOTHING ELSE.
                `;
            }

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const textResponse = await response.text();

            // For text modification requests, just return the text
            if (text.includes("Rewrite") || text.includes("Improve") || 
                text.includes("Expand") || text.includes("Summarize") || text.includes("Shorten")) {
                return { text: textResponse };
            }

            // For task creation, parse as JSON
            let cleanJson = textResponse;
            if (textResponse.startsWith("```json")) {
                cleanJson = textResponse.replace(/```json|```/g, "").trim();
            }

            return JSON.parse(cleanJson);
        } catch (error) {
            console.error("Error generating content:", error);
            throw error;
        }
    }

    async autocompleteText(text: string): Promise<string> {
        try {
            const model = this.genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
            });

            const prompt = `Complete the following text naturally by just finishing the current thought or sentence.
Keep the completion very brief - no more than 5-6 words maximum.
Act like a sentence finisher, not an AI assistant generating new content.

${text}

<CURRENT_CURSOR_POSITION>
OUTPUT: Return ONLY the brief completion (5-6 words maximum). No explanations, comments, or formatting.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Error autocompleting text:", error);
            throw error;
        }
    }
}
