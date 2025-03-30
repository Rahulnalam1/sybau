import { GeminiService } from "@/api/services/gemini/geminiService";

export class GeminiController {
    private geminiService: GeminiService;

    constructor() {
        this.geminiService = new GeminiService();
    }

    async createTasks(text: string) {
        try {
            const res = await this.geminiService.generateTasks(text);
            return res;
        } catch (error) {
            console.error("Error in GeminiController.createTasks:", error);
            throw error;
        }
    }
}
