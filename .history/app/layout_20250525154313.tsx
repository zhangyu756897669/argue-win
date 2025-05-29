import type { Metadata, Viewport } from "next";
import "./globals.css";
import StagewiseToolbarWrapper from "./components/stagewise-toolbar";

export const metadata: Metadata = {
  title: "吵架包赢 - AI 智能回怼神器",
  description: "使用 AI 生成犀利回复，让你在任何争论中都能占据上风！支持调节语气强度，保持上下文连贯性。",
  keywords: ["吵架", "回怼", "AI", "聊天", "回复", "争论"],
  authors: [{ name: "吵架包赢团队" }],
  creator: "吵架包赢",
  publisher: "吵架包赢",
  robots: "index, follow",
  openGraph: {
    title: "吵架包赢 - AI 智能回怼神器",
    description: "使用 AI 生成犀利回复，让你在任何争论中都能占据上风！",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "吵架包赢 - AI 智能回怼神器",
    description: "使用 AI 生成犀利回复，让你在任何争论中都能占据上风！",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ec4899',
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="吵架包赢" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iI0VDNDg5OSIvPgo8cGF0aCBkPSJNOCAxNkgyNE0xNiA4TDE2IDI0IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
