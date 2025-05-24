import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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
    console.log('Environment variable exists:', !!process.env.OPENROUTER_API_KEY);
    console.log('Using fallback key:', !process.env.OPENROUTER_API_KEY);
    console.log('Request data:', { message: message?.substring(0, 50), intensity, context: context?.substring(0, 50) });
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not found in environment variables');
    }

    // 使用OpenAI SDK调用OpenRouter
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    });

    // 简化的提示词，只要求5个简洁回复
    const prompt = `对方说："${message}"

请生成5条简洁的反击回复（语气强度${intensity}/10），每条回复不超过20字。
请按以下格式输出，每条回复都在同一行：

回复1：你的第一条回复
回复2：你的第二条回复
回复3：你的第三条回复
回复4：你的第四条回复
回复5：你的第五条回复`;

    console.log('About to call OpenRouter API via OpenAI SDK...');

    const response = await openai.chat.completions.create({
      model: 'deepseek/deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    console.log('API call successful!');
    console.log('Response length:', response.choices[0]?.message?.content?.length);
    console.log('Response content preview:', response.choices[0]?.message?.content?.substring(0, 200) + '...');

    const responseContent = response.choices[0]?.message?.content;
    
    if (!responseContent || responseContent.trim().length === 0) {
      throw new Error('API returned empty response');
    }

    return NextResponse.json({ 
      response: responseContent
    });

  } catch (error: unknown) {
    console.error('=== API Error Details ===');
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.constructor.name : 'UnknownError';
    console.error('Error message:', errorMessage);
    console.error('Error type:', errorName);
    console.error('Full error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to generate response',
      details: errorMessage
    }, { status: 500 });
  }
} 