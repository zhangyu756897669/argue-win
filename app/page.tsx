'use client';

import { useState, useEffect } from 'react';
import * as Slider from '@radix-ui/react-slider';

interface ChatHistory {
  id: string;
  message: string;
  intensity: number;
  context: string;
  responses: string[];
  timestamp: number;
}

export default function Home() {
  const [message, setMessage] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [context, setContext] = useState('');
  const [responses, setResponses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // 从 localStorage 加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('argue-win-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 保存到 localStorage
  const saveToHistory = (newEntry: ChatHistory) => {
    const updatedHistory = [newEntry, ...history].slice(0, 10); // 最多保存10条记录
    setHistory(updatedHistory);
    localStorage.setItem('argue-win-history', JSON.stringify(updatedHistory));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponses([]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, intensity, context }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '生成回复失败');
      }

      // 解析回复内容，提取5条完整回复
      console.log('原始响应:', data.response); // 调试用
      
      const fullText = data.response;
      const replyBlocks = [];
      
      // 按回复分割文本
      const parts = fullText.split(/回复\d+：/);
      
      // 第一部分通常是空的或者是前言，从第二部分开始
      for (let i = 1; i < parts.length && replyBlocks.length < 5; i++) {
        const content = parts[i].trim();
        if (content) {
          // 清理内容，去掉多余的换行和空白
          const cleanContent = content
            .split('\n')
            .filter((line: string) => line.trim())
            .join(' ')
            .trim();
          
          if (cleanContent) {
            replyBlocks.push(`回复${i}：${cleanContent}`);
          }
        }
      }
      
      // 如果没有找到标准格式，尝试其他解析方式
      if (replyBlocks.length === 0) {
        const lines = fullText.split('\n').filter((line: string) => line.trim());
        let currentReply = '';
        let replyCount = 0;
        
        for (const line of lines) {
          if (line.match(/^回复\d+/)) {
            if (currentReply && replyCount < 5) {
              replyBlocks.push(currentReply.trim());
              replyCount++;
            }
            currentReply = line;
          } else if (currentReply) {
            currentReply += ' ' + line.trim();
          }
        }
        
        // 添加最后一个回复
        if (currentReply && replyCount < 5) {
          replyBlocks.push(currentReply.trim());
        }
      }
      
      setResponses(replyBlocks.length > 0 ? replyBlocks : ['生成的回复格式有误，请重试']);

      // 保存到历史记录
      const newEntry: ChatHistory = {
        id: Date.now().toString(),
        message,
        intensity,
        context,
        responses: replyBlocks,
        timestamp: Date.now()
      };
      saveToHistory(newEntry);

    } catch (err) {
      setError(err instanceof Error ? err.message : '发生错误');
    } finally {
      setLoading(false);
    }
  };

  const getIntensityLabel = (value: number) => {
    if (value <= 2) return '温和建议';
    if (value <= 4) return '据理力争';
    if (value <= 6) return '强硬反击';
    if (value <= 8) return '犀利回击';
    return '极具攻击性';
  };

  const getIntensityColor = (value: number) => {
    if (value <= 2) return 'text-green-600';
    if (value <= 4) return 'text-blue-600';
    if (value <= 6) return 'text-yellow-600';
    if (value <= 8) return 'text-orange-600';
    return 'text-red-600';
  };

  const loadFromHistory = (entry: ChatHistory) => {
    setMessage(entry.message);
    setIntensity(entry.intensity);
    setContext(entry.context);
    setResponses(entry.responses);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
      {/* 头部 */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent">
            吵架包赢
          </h1>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-pink-600 hover:text-pink-700 text-sm font-medium"
          >
            {showHistory ? '隐藏历史' : '查看历史'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 历史记录 */}
        {showHistory && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">历史记录</h3>
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-4">暂无历史记录</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => loadFromHistory(entry)}
                    className="p-3 bg-pink-50 rounded-lg cursor-pointer hover:bg-pink-100 transition-colors"
                  >
                    <p className="text-gray-800 text-sm line-clamp-2">{entry.message}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(entry.timestamp).toLocaleString()} • 强度: {entry.intensity}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 主表单 */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                💬 对方说的话
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 border-2 border-pink-100 rounded-xl focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all resize-none bg-white/80"
                rows={4}
                placeholder="在这里输入对方说的话..."
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                🔥 语气强度: {intensity} - <span className={getIntensityColor(intensity)}>{getIntensityLabel(intensity)}</span>
              </label>
              <div className="px-2">
                <Slider.Root
                  className="relative flex items-center select-none touch-none w-full h-6"
                  value={[intensity]}
                  onValueChange={(value) => setIntensity(value[0])}
                  max={10}
                  min={1}
                  step={1}
                  disabled={loading}
                >
                  <Slider.Track className="bg-gradient-to-r from-green-200 via-yellow-200 via-orange-200 to-red-200 relative grow rounded-full h-3">
                    <Slider.Range className="absolute bg-gradient-to-r from-pink-400 to-rose-500 rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb
                    className="block w-6 h-6 bg-white border-3 border-pink-400 rounded-full hover:bg-pink-50 focus:outline-none focus:ring-4 focus:ring-pink-200 shadow-lg transition-all"
                    aria-label="语气强度"
                  />
                </Slider.Root>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>温和</span>
                  <span>适中</span>
                  <span>激烈</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📝 上下文（可选）
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full p-4 border-2 border-pink-100 rounded-xl focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all resize-none bg-white/80"
                rows={3}
                placeholder="之前的对话内容或背景信息..."
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 px-6 rounded-xl hover:from-pink-600 hover:to-rose-600 focus:outline-none focus:ring-4 focus:ring-pink-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg transition-all transform hover:scale-[1.02] disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  AI 正在生成回复...
                </div>
              ) : (
                '🚀 开始吵架'
              )}
            </button>
          </form>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">❌</span>
              {error}
            </div>
          </div>
        )}

        {/* 回复结果 */}
        {responses.length > 0 && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">💎</span>
              吵架神回复
            </h3>
            <div className="space-y-4">
              {responses.map((response, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border-l-4 border-pink-400 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigator.clipboard.writeText(response.replace(/^回复\d+：/, ''))}
                  title="点击复制"
                >
                  <p className="text-gray-800 leading-relaxed">{response}</p>
                  <div className="text-xs text-gray-500 mt-2 flex items-center">
                    <span className="mr-2">📋</span>
                    点击复制这条回复
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部说明 */}
      <div className="max-w-4xl mx-auto p-4 text-center">
        <p className="text-gray-500 text-sm">
          💡 小贴士：点击回复内容可以直接复制到剪贴板
        </p>
      </div>
    </div>
  );
}
