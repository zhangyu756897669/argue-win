import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, intensity, context } = await req.json();
    
    // 使用新的SiliconFlow API密钥
    const rawApiKey = process.env.SILICONFLOW_API_KEY || "sk-epqstqjyiekbqkehdnmqxovuxllpgvaylkvbvbswwrhxhtlq";
    const apiKey = rawApiKey?.trim();
    
    console.log('=== SiliconFlow API Debug Info ===');
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length);
    console.log('API Key prefix:', apiKey?.substring(0, 20) + '...');
    console.log('Environment variable exists:', !!process.env.SILICONFLOW_API_KEY);
    console.log('Using fallback key:', !process.env.SILICONFLOW_API_KEY);
    console.log('Request data:', { message: message?.substring(0, 50), intensity, context: context?.substring(0, 50) });
    
    if (!apiKey) {
      throw new Error('SiliconFlow API key not found in environment variables');
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

    // SiliconFlow支持的模型列表
    const models = [
      'Qwen/QwQ-32B',
      'Qwen/Qwen2.5-72B-Instruct',
      'Qwen/Qwen2.5-32B-Instruct',
      'Qwen/Qwen2.5-14B-Instruct',
      'Qwen/Qwen2.5-7B-Instruct'
    ];

    let lastError = null;

    for (const model of models) {
      console.log(`Trying SiliconFlow model: ${model}`);
      
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
            max_tokens: 512,
            temperature: 0.7,
            stream: false
          })
        });

        const data = await response.json();

        if (response.ok && data.choices && data.choices[0]?.message?.content) {
          console.log(`Success with SiliconFlow model: ${model}`);
          console.log('Response length:', data.choices[0].message.content.length);
          
          const responseContent = data.choices[0].message.content;
          
          return NextResponse.json({ 
            response: responseContent,
            model: model,
            provider: 'SiliconFlow'
          });
        } else {
          console.log(`Failed with model ${model}:`, data);
          lastError = data.error?.message || data.message || `Model ${model} failed`;
          continue;
        }
      } catch (error) {
        console.log(`Error with model ${model}:`, error);
        lastError = error instanceof Error ? error.message : 'Unknown error';
        continue;
      }
    }

    // 如果所有模型都失败了
    throw new Error(`All SiliconFlow models failed. Last error: ${lastError}`);

  } catch (error: unknown) {
    console.error('=== SiliconFlow API Error Details ===');
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