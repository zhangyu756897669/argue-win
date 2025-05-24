import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY?.trim();
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key' });
    }

    // 试试不同的模型
    const models = [
      'deepseek/deepseek-chat',
      'deepseek/deepseek-v3-base:free',
      'anthropic/claude-3-haiku:beta'
    ];

    const results = [];

    for (const model of models) {
      try {
        console.log(`Testing model: ${model}`);
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: 'Hello'
              }
            ],
            max_tokens: 5
          })
        });

        const data = await response.json();
        
        results.push({
          model,
          status: response.status,
          success: response.ok,
          data: response.ok ? data.choices[0]?.message?.content : data.error?.message
        });

      } catch (error: unknown) {
        results.push({
          model,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({ results });

  } catch (error: unknown) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 