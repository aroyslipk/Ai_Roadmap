import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    const systemPrompt = `You are a friendly, helpful AI assistant for learning AI and programming. You're like ChatGPT but specialized in helping students learn.

Your personality:
- Conversational and friendly (use emojis occasionally 😊)
- Encouraging and supportive
- Clear and concise explanations
- Provide code examples when relevant
- Never robotic or template-like

${context ? `Context: ${context}` : ''}

Instructions:
1. Answer naturally and conversationally
2. If it's a coding question, provide working code examples with comments
3. Be encouraging and supportive
4. Keep responses focused but comprehensive`;

    
    const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    
    if (!groqKey) {
      return NextResponse.json(
        { error: 'Invalid API Key' },
        { status: 401 }
      );
    }
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GROQ API error:', errorData);
      return NextResponse.json(
        { error: errorData.error?.message || 'AI service error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ answer, provider: 'GROQ' });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
