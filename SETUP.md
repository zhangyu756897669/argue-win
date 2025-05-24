# 🚀 快速安装指南

## 前置要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器
- OpenRouter API Key

## 一键安装

```bash
# 1. 克隆项目
git clone https://github.com/your-username/argue-win.git
cd argue-win

# 2. 安装依赖
npm install

# 3. 创建环境变量文件
echo "OPENROUTER_API_KEY=your_api_key_here" > .env.local

# 4. 启动项目
npm run dev
```

## 获取 OpenRouter API Key

1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册/登录账户
3. 前往 [API Keys 页面](https://openrouter.ai/keys)
4. 创建新的 API Key
5. 复制 API Key 到 `.env.local` 文件中

## 环境变量配置

在项目根目录创建 `.env.local` 文件：

```env
# OpenRouter API 配置
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxx

# 可选配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 常见问题

### Q: 如何获得免费的 API Key？
A: OpenRouter 提供免费额度，注册后即可获得初始credits。

### Q: 支持哪些浏览器？
A: 支持 Chrome 90+、Firefox 88+、Safari 14+ 等现代浏览器。

### Q: 可以自定义 AI 模型吗？
A: 可以在 `app/api/chat/route.ts` 中修改 `model` 参数。

### Q: 数据存储在哪里？
A: 历史记录仅存储在浏览器的 localStorage 中，不会上传到服务器。

## 部署到生产环境

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 添加环境变量 `OPENROUTER_API_KEY`
4. 点击部署

### 其他平台

项目支持任何支持 Next.js 的托管平台：
- Netlify
- Railway
- Heroku
- 自建服务器

## 性能优化建议

1. **API 缓存**：考虑添加 Redis 缓存相似请求
2. **图片优化**：使用 Next.js Image 组件
3. **代码分割**：利用动态导入减少包体积
4. **CDN 加速**：通过 CDN 分发静态资源

## 开发模式

```bash
# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 类型检查
npm run type-check

# 代码格式化
npm run lint
```

有问题？请查看 [完整文档](README.md) 或提交 [Issue](https://github.com/your-username/argue-win/issues)。 