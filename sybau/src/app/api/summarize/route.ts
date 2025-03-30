import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/api/services/gemini/geminiService';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const geminiService = new GeminiService();
    // Use the existing functionality but prefix with "Summarize" to trigger that condition
    const summarizedText = await geminiService.generateTasks("Summarize: " + text);
    
    return NextResponse.json({ result: summarizedText });
  } catch (error) {
    console.error('Error in summarize API:', error);
    return NextResponse.json({ error: 'Failed to summarize text' }, { status: 500 });
  }
} 