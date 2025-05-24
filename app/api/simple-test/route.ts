import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY?.trim();
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key' });
    }

    console.log('Testing simple chat completion...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://argue-win.vercel.app',
        'X-Title': 'Argue-Win-App',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          {
            role: 'user',
            content: '请只回复"测试成功"四个字'
          }
        ],
        max_tokens: 10,
        temperature: 0.3
      })
    });

    const data = await response.json();
    
    console.log('Simple test response status:', response.status);
    console.log('Simple test response data:', JSON.stringify(data, null, 2));

    return NextResponse.json({
      status: response.status,
      success: response.ok,
      data: data
    });

  } catch (error: unknown) {
    console.error('Simple test error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 