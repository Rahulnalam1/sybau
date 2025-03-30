import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/api/services/gemini/geminiService';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const geminiService = new GeminiService();
    const completedText = await geminiService.autocompleteText(text);
    
    return NextResponse.json({ result: completedText });
  } catch (error) {
    console.error('Error in autocomplete API:', error);
    return NextResponse.json({ error: 'Failed to autocomplete text' }, { status: 500 });
  }
} 