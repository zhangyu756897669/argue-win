const https = require('https');

const apiKey = 'sk-epqstqjyiekbqkehdnmqxovuxllpgvaylkvbvbswwrhxhtlq';

console.log('Testing SiliconFlow API...');

const payload = JSON.stringify({
  model: 'Qwen/QwQ-32B',
  messages: [
    {
      role: 'user',
      content: '对方说："你今天又迟到了"\n\n请生成5条简洁的反击回复（语气强度7/10），每条回复不超过20字。'
    }
  ],
  max_tokens: 512,
  temperature: 0.7,
  stream: false
});

const options = {
  hostname: 'api.siliconflow.cn',
  port: 443,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.choices && parsed.choices[0]) {
        console.log('✅ SiliconFlow API Success!');
        console.log('Model:', parsed.model || 'Unknown');
        console.log('Content:', parsed.choices[0].message.content);
      } else {
        console.log('❌ Unexpected response format:', parsed);
      }
    } catch (e) {
      console.log('❌ Parse error, raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request error: ${e.message}`);
});

req.write(payload);
req.end(); 