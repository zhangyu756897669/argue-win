import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== Debugging Environment ===');
    
    // 检查环境变量，新密钥作为fallback
    const envKey = process.env.OPENROUTER_API_KEY || "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";
    
    // 详细的API密钥分析
    const keyAnalysis = {
      exists: !!envKey,
      length: envKey?.length || 0,
      startsWithCorrectPrefix: envKey?.startsWith('sk-or-v1-') || false,
      hasWhitespace: envKey ? /\s/.test(envKey) : false,
      trimmedLength: envKey?.trim().length || 0,
      firstChars: envKey?.substring(0, 15) || 'N/A',
      lastChars: envKey?.substring(-10) || 'N/A'
    };
    
    console.log('Key Analysis:', keyAnalysis);
    
    // 尝试清理API密钥
    const cleanKey = envKey?.trim();
    
    if (!cleanKey) {
      return NextResponse.json({
        error: 'No API key found',
        analysis: keyAnalysis
      });
    }
    
    // 简单的认证测试
    const testResponse = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanKey}`,
        'HTTP-Referer': 'https://argue-win.vercel.app',
        'X-Title': 'Argue-Win-App',
      }
    });
    
    const testData = await testResponse.json();
    
    return NextResponse.json({
      status: testResponse.status,
      success: testResponse.ok,
      analysis: keyAnalysis,
      modelEndpointTest: {
        status: testResponse.status,
        data: testResponse.ok ? 'Authentication successful' : testData
      }
    });
    
  } catch (error: unknown) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} 