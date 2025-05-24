import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== Debugging Environment ===');
    
    // 检查环境变量
    const envKey = process.env.OPENROUTER_API_KEY;
    const fallbackKey = "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";
    const finalKey = envKey || fallbackKey;
    
    // 详细的API密钥分析
    const keyAnalysis = {
      envKeyExists: !!envKey,
      envKeyLength: envKey?.length || 0,
      finalKeyLength: finalKey?.length || 0,
      startsWithCorrectPrefix: finalKey?.startsWith('sk-or-v1-') || false,
      usingFallback: !envKey,
      firstChars: finalKey?.substring(0, 20) || 'N/A',
    };
    
    console.log('Key Analysis:', keyAnalysis);
    
    if (!finalKey) {
      return NextResponse.json({
        error: 'No API key found',
        analysis: keyAnalysis
      });
    }

    // 测试最简单的API调用
    console.log('Testing OpenRouter API...');
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${finalKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://argue-win.vercel.app',
        'X-Title': 'Argue-Win-App',
      }
    });

    const data = await response.json();
    console.log('Models API response status:', response.status);
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'API key authentication failed',
        status: response.status,
        response: data,
        analysis: keyAnalysis
      });
    }

    // 如果models API成功，测试多个聊天模型
    const testModels = [
      'deepseek/deepseek-chat',
      'anthropic/claude-3-haiku:beta',
      'google/gemma-7b-it:free',
      'microsoft/wizardlm-2-8x22b',
      'meta-llama/llama-3-8b-instruct:free'
    ];

    const chatResults = [];
    
    for (const model of testModels) {
      try {
        const chatResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${finalKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://argue-win.vercel.app',
            'X-Title': 'Argue-Win-App',
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: 'Say "test success"' }],
            max_tokens: 10
          })
        });

        const chatData = await chatResponse.json();
        chatResults.push({
          model,
          status: chatResponse.status,
          success: chatResponse.ok,
          data: chatResponse.ok ? chatData.choices[0]?.message?.content : chatData.error?.message || 'Unknown error'
        });
        
        // 如果找到一个成功的模型，就停止测试
        if (chatResponse.ok) break;
        
      } catch (error) {
        chatResults.push({
          model,
          error: error instanceof Error ? error.message : 'Request failed'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      analysis: keyAnalysis,
      modelsAPI: { status: response.status, success: true },
      chatTests: chatResults,
      recommendedModel: chatResults.find(r => r.success)?.model || 'none'
    });
    
  } catch (error: unknown) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} 