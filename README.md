# AI 全球財經終端

![AI 全球財經終端 Logo](/logo.svg)

## 項目簡介

**AI 全球財經終端** 是一個專為普通投資者設計的綜合性財經信息平台。它利用先進的 AI 技術，提供即時新聞翻譯與深度解讀、實用財經工具，並整合全球市場數據，旨在幫助用戶更高效地獲取、理解和分析財經信息，做出明智的投資決策。

## 核心功能

-   **即時新聞翻譯與 AI 解讀**：
    -   從 **Yahoo Finance RSS** 抓取全球最新財經新聞。
    -   AI 自動將新聞翻譯成繁體中文，並提供針對普通投資者的深度投資解讀，分析市場影響、潛在機會與風險。
    -   新聞網格佈局，確保視覺體驗完整。
-   **經濟日曆**：
    -   提供全球重要經濟事件的日期、時間、重要性及 AI 分析，幫助用戶掌握市場脈動。
    -   數據穩定，即使 AI 處理失敗也有回退機制。
-   **投資組合管理**：
    -   用戶可自定義添加、編輯和刪除投資標的，實時追蹤收益。
    -   數據本地化存儲，保護用戶隱私。
-   **專業財經計算器**：
    -   **複利計算器**：精確計算長期投資收益。
    -   **房貸月供計算器**：快速評估房產投資負擔。
    -   **投資回報率 (ROI) 計算器**：分析投資績效。
-   **術語百科**：
    -   AI 驅動的財經術語解釋，用繁體中文提供專業、簡潔的定義。
    -   內置熱門術語庫，減少 API 調用，提升響應速度。
    -   智能快取機制，有效解決 API 限流 (429) 問題。
-   **市場看板**：
    -   頂部跑馬燈形式展示實時匯率、加密貨幣等市場數據，快速掌握大盤概況。
-   **響應式設計**：
    -   優化手機版導航欄，Logo 和標題完整顯示，功能菜單收納至漢堡菜單，提供流暢的移動端體驗。
-   **SEO 優化**：
    -   針對域名 `f-url.com` 進行了全面的 SEO 配置，包括 Canonical URL, sitemap.xml, robots.txt, Open Graph 和 Twitter Card 標籤，提升搜索引擎可見性。
    -   集成 Google Analytics (GA4) 和 Google AdSense，支持流量分析與廣告變現。

## 技術棧

-   **前端**：React, Vite, Tailwind CSS, Lucide React Icons
-   **後端**：Node.js (API Routes), OpenAI API (AI 翻譯與解讀), rss-parser (RSS 解析)
-   **部署**：Vercel

## 部署指南

### 1. 環境變量配置

在 Vercel 或本地 `.env` 文件中配置以下環境變量：

-   `OPENAI_API_KEY`: 您的 OpenAI API 密鑰，用於 AI 翻譯和解讀。
-   `API_BASE_URL`: (可選) 如果您使用 OpenAI API 的中轉接口，請填寫此項，例如 `https://api.openai.com/v1`。
-   `AI_MODEL`: (可選) 指定 AI 模型，例如 `gpt-4o-mini`。

### 2. 本地運行

```bash
# 克隆倉庫
git clone [您的 GitHub 倉庫地址]
cd ai-finance-hub

# 安裝依賴
npm install

# 啟動開發服務器
npm run dev
```

### 3. 部署到 Vercel

1.  將項目推送到 GitHub 倉庫。
2.  登錄 Vercel，導入您的 GitHub 項目。
3.  在項目設置中配置上述環境變量。
4.  確保 `vercel.json` 文件存在於項目根目錄，用於處理域名重定向等配置。
5.  確保 `sitemap.xml` 和 `robots.txt` 位於 `public/` 目錄下。
6.  點擊部署。

## 項目結構

```
ai-finance-hub/
├── public/
│   ├── logo.svg
│   ├── sitemap.xml
│   └── robots.txt
├── src/
│   └── App.jsx
├── api/
│   ├── news.js
│   ├── calendar.js
│   └── market.js
├── index.html
├── package.json
├── vercel.json
└── README.md
└── .gitignore
```

## 貢獻

歡迎提出建議或提交 Pull Request。

## 聯繫

如果您有任何問題或建議，請通過 [您的聯繫方式] 與我聯繫。

---
