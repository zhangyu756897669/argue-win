import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, intensity, context } = await req.json();
    
    // 使用新的SiliconFlow API密钥
    const rawApiKey = process.env.SILICONFLOW_API_KEY || "sk-epqstqjyiekbqkehdnmqxovuxllpgvaylkvbvbswwrhxhtlq";
    const apiKey = rawApiKey?.trim();
    
    console.log('=== SiliconFlow API Debug Info ===');
    console.log('API Key exists:', !!apiKey);
    console.log('Request data:', { message: message?.substring(0, 50), intensity });
    
    if (!apiKey) {
      throw new Error('SiliconFlow API key not found');
    }

    // 修改提示词格式，确保符合前端期望的格式
    const prompt = `对方说："${message}"

请生成5条简洁的反击回复（语气强度${intensity}/10），每条回复不超过20字。
请严格按照以下格式输出，每条回复独占一行：

回复1：你的第一条回复
回复2：你的第二条回复
回复3：你的第三条回复
回复4：你的第四条回复
回复5：你的第五条回复`;

    // 使用最快的模型
    const model = 'Qwen/Qwen2.5-7B-Instruct';
    
    console.log(`Using SiliconFlow model: ${model}`);
    
    // 创建AbortController用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时

    try {
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
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
              content: prompt
            }
          ],
          max_tokens: 300,  // 减少token数量提高速度
          temperature: 0.8,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok && data.choices && data.choices[0]?.message?.content) {
        console.log(`✅ Success with SiliconFlow model: ${model}`);
        console.log('Response length:', data.choices[0].message.content.length);
        
        const responseContent = data.choices[0].message.content;
        
        return NextResponse.json({ 
          response: responseContent,
          model: model,
          provider: 'SiliconFlow'
        });
      } else {
        console.log(`❌ Failed with model ${model}:`, data);
        throw new Error(data.error?.message || data.message || 'API call failed');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('请求超时，请重试');
      }
      throw error;
    }

  } catch (error: unknown) {
    console.error('=== SiliconFlow API Error Details ===');
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error message:', errorMessage);
    
    return NextResponse.json({ 
      error: 'Failed to generate response',
      details: errorMessage
    }, { status: 500 });
  }
}