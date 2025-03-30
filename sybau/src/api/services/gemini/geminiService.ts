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

            const prompt = `Here is the input text: ${text}
            
                            here are the main paramaters of each task:

                            title,
                            description,
                            priority,
                            duedate,

                            Based on the input task:
                            create an appropriate title 3-4 words MAX
                            create an appropriate description, add name of assignee if given
                            IF A DUE DATE IS GIVEN, format it as ISO 8601 value, else set it to NULL 
                            IF A PRIORITY IS GIVEN, assign a priority from 1 (Most urgent) to 4 (Least Urgent), else set it to 0 (No Priority)
                            Format all this information as a JSON object.

                            Return ONLY THE JSON OBJECT AND NOTHING ELSE. No markdown formatting, no code blocks, just the pure JSON.
                            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const textResponse = await response.text(); // Note: text() is a function

            // Clean the response if it contains markdown
            let cleanJson = textResponse;
            if (textResponse.startsWith("```json")) {
                cleanJson = textResponse.replace(/```json|```/g, "").trim();
            }

            return JSON.parse(cleanJson);
        } catch (error) {
            console.error("Error generating tasks:", error);
            throw error;
        }
    }
}
