import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, intensity, context } = await req.json();
    
    // 获取并清理API Key，新密钥作为fallback
    const rawApiKey = process.env.OPENROUTER_API_KEY || "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";
    const apiKey = rawApiKey?.trim();
    
    console.log('=== API Debug Info ===');
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length);
    console.log('API Key prefix:', apiKey?.substring(0, 20) + '...');
    console.log('Request data:', { message: message?.substring(0, 50), intensity, context: context?.substring(0, 50) });
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not found in environment variables');
    }
    
    // 简化的提示词，只要求5个简洁回复
    const prompt = `对方说："${message}"

请生成5条简洁的反击回复（语气强度${intensity}/10），每条回复不超过20字。
请按以下格式输出，每条回复都在同一行：

回复1：你的第一条回复
回复2：你的第二条回复
回复3：你的第三条回复
回复4：你的第四条回复
回复5：你的第五条回复`;

    console.log('About to call OpenRouter API...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://argue-win.vercel.app',
        'X-Title': 'Argue-Win-App',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-v3-base:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error:', data);
      throw new Error(data.error?.message || 'API call failed');
    }

    console.log('API call successful!');
    console.log('Response length:', data.choices[0]?.message?.content?.length);

    return NextResponse.json({ 
      response: data.choices[0]?.message?.content || '生成失败'
    });

  } catch (error: any) {
    console.error('=== API Error Details ===');
    console.error('Error message:', error?.message);
    console.error('Error type:', error?.constructor?.name);
    console.error('Full error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to generate response',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
} 