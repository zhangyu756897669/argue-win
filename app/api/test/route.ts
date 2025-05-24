import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    console.log('Testing OpenRouter connection...');
    console.log('API Key length:', apiKey?.length);
    console.log('API Key format:', apiKey?.startsWith('sk-or-v1-') ? 'Valid' : 'Invalid');
    console.log('Environment check:', process.env.OPENROUTER_API_KEY ? 'Found' : 'Not found');
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API key not found in environment variables'
      });
    }
    
    // 直接使用fetch测试OpenRouter API
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
            content: '请说"你好"'
          }
        ],
        max_tokens: 50
      })
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        status: response.status,
        error: data,
        apiKeyInfo: {
          length: apiKey?.length,
          prefix: apiKey?.substring(0, 20) + '...',
          format: apiKey?.startsWith('sk-or-v1-') ? 'Valid' : 'Invalid'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: data.choices[0]?.message?.content,
      apiKeyInfo: {
        length: apiKey?.length,
        prefix: apiKey?.substring(0, 20) + '...',
        format: 'Valid'
      }
    });

  } catch (error: unknown) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? { message: error.message, stack: error.stack } : error
    });
  }
} 