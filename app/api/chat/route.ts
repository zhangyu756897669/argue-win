import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "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",
});

export async function POST(req: Request) {
  try {
    const { message, intensity, context } = await req.json();
    
    // 检查API Key是否配置
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn('OPENROUTER_API_KEY not found, using fallback key');
    }
    
    const prompt = `作为一个吵架高手，请根据以下信息生成5条吵架回复：
    对方说的话：${message}
    语气强度（1-10）：${intensity}
    上下文：${context || '无'}
    
    要求：
    1. 回复要符合语气强度（1为温和建议，10为极具攻击性）
    2. 保持上下文的连贯性
    3. 每条回复都要犀利且有理有据
    4. 用中文回复
    5. 每条回复分别用"回复1："、"回复2："、"回复3："、"回复4："、"回复5："标记
    6. 每条回复要简洁有力，不超过50字`;

    const stream = await client.chat.completions.create({
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      stream: true
    }, {
      headers: {
        "HTTP-Referer": "https://argue-win.vercel.app",
        "X-Title": "Argue-Win-App",
      }
    });

    const encoder = new TextEncoder();
    
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              const data = `data: ${JSON.stringify({ content })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }
          
          // 发送结束信号
          const endData = `data: ${JSON.stringify({ done: true })}\n\n`;
          controller.enqueue(encoder.encode(endData));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          const errorData = `data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      }
    });

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
} 