import Parser from 'rss-parser';

let newsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30 * 60 * 1000;
const MAX_DAILY_REQUESTS = 50;
let dailyRequestCount = 0;
let lastResetDate = new Date().toDateString();

let terminologyCache = {};
const TERMINOLOGY_CACHE_DURATION = 24 * 60 * 60 * 1000;

const POPULAR_TERMS = {
  '縮表': '央行減少資產負債表規模，通常通過不再購買新的資產或讓現有資產到期而不再購買來實現。這是一種緊縮貨幣政策工具。',
  '非農': '美國非農就業人數，是衡量美國就業市場健康狀況的重要經濟指標。每月首週五發布，對美元和股市影響重大。',
  '降息': '央行降低基準利率，使借貸成本下降，促進經濟增長。通常在經濟衰退或通脹下降時進行。',
  '升息': '央行提高基準利率，使借貸成本上升，抑制通脹。通常在經濟過熱或通脹上升時進行。',
  'QE': '量化寬鬆政策，央行通過購買長期資產來增加貨幣供應量，降低長期利率。',
  'CPI': '消費者物價指數，衡量消費者購買商品和服務的平均價格變化，是衡量通脹的重要指標。',
  'GDP': '國內生產總值，衡量一個國家在特定時期內生產的所有商品和服務的總價值。',
  '熊市': '股票市場持續下跌的時期，投資者信心低落，通常下跌 20% 以上。',
  '牛市': '股票市場持續上升的時期，投資者信心高漲，通常上升 20% 以上。',
  '回購': '公司用現金買回自己的股票，減少流通股數，通常用於提高每股收益或穩定股價。'
};

const RSS_FEEDS = [
  'https://finance.yahoo.com/news/rss',
  'https://www.investing.com/rss/news_25.rss' // Investing.com 財經新聞
];

async function nativeRssParser(xmlText) {
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xmlText)) !== null) {
        const itemContent = match[1];
        const titleMatch = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/.exec(itemContent);
        const linkMatch = /<link>([\s\S]*?)<\/link>/.exec(itemContent);
        const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(itemContent);
        const descriptionMatch = /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/.exec(itemContent);
        const creatorMatch = /<dc:creator><!\[CDATA\[([\s\S]*?)\]\]><\/dc:creator>/.exec(itemContent);

        if (titleMatch && linkMatch) {
            items.push({
                title: titleMatch[1],
                link: linkMatch[1],
                pubDate: pubDateMatch ? pubDateMatch[1] : new Date().toUTCString(),
                contentSnippet: descriptionMatch ? descriptionMatch[1].replace(/<[^>]*>?/gm, '').substring(0, 250) : '',
                creator: creatorMatch ? creatorMatch[1] : 'Unknown Source',
            });
        }
    }
    return { items };
}

async function fetchNewsFromSources() {
    let articles = [];
    let lastError = null;

    for (const url of RSS_FEEDS) {
        try {
            // 優先嘗試 rss-parser
            try {
                const parser = new Parser();
                const feed = await parser.parseURL(url);
                articles = feed.items;
            } catch (parserError) {
                console.warn(`rss-parser failed for ${url}, falling back to native parser. Error: ${parserError.message}`);
                const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const xmlText = await response.text();
                const feed = await nativeRssParser(xmlText);
                articles = feed.items;
            }

            if (articles && articles.length > 0) {
                return articles.map(item => ({
                    title: item.title,
                    description: item.contentSnippet || item.summary || item.content,
                    url: item.link,
                    publishedAt: item.pubDate,
                    source: { name: item.creator || new URL(url).hostname },
                    urlToImage: null
                })).filter(article => article.title && article.url).slice(0, 12);
            }
        } catch (error) {
            lastError = error;
            console.error(`Failed to fetch or parse from ${url}:`, error.message);
            continue; // 嘗試下一個源
        }
    }

    if (articles.length === 0 && lastError) {
        throw new Error(`All news sources failed. Last error: ${lastError.message}`);
    }
    return [];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.query.term) {
      // ... 術語百科邏輯保持不變 ...
    }

    const now = Date.now();
    if (newsCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
      return res.status(200).json({ success: true, news: newsCache, timestamp: new Date(cacheTimestamp).toISOString(), fromCache: true });
    }

    const articles = await fetchNewsFromSources();

    if (articles.length === 0) {
        throw new Error('無法從任何來源獲取新聞。');
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    let processedNews;
    if (OPENAI_API_KEY) {
      const articlesToProcess = Array(9).fill(null).map((_, i) => articles[i] || { title: `Placeholder ${i+1}`, description: `No content for placeholder ${i+1}`, source: { name: 'System' }, publishedAt: new Date().toISOString(), url: '#' });
      const processingPromises = articlesToProcess.map((article, index) => 
        processSingleArticle(article, index, process.env.API_BASE_URL, OPENAI_API_KEY, process.env.AI_MODEL)
      );
      const results = await Promise.allSettled(processingPromises);
      processedNews = results.map((result, index) => {
        const originalArticle = articlesToProcess[index];
        if (result.status === 'fulfilled') {
          return { id: index + 1, title: result.value.title, source: originalArticle.source.name, time: getRelativeTime(originalArticle.publishedAt), summary: result.value.summary, aiInsight: result.value.aiInsight, category: result.value.category, url: originalArticle.url, image: null, originalTitle: originalArticle.title };
        } else {
          console.error(`處理新聞 ${index + 1} 失敗:`, result.reason);
          return createFallbackNews([originalArticle], `AI 處理失敗: ${result.reason?.message || '未知錯誤'}`)[0];
        }
      });
    } else {
      processedNews = createFallbackNews(articles, '缺少 OPENAI_API_KEY');
    }

    newsCache = processedNews;
    cacheTimestamp = now;
    res.status(200).json({ success: true, news: processedNews, timestamp: new Date().toISOString(), fromCache: false });

  } catch (error) {
    console.error('[API Error]', error);
    res.status(200).json({ success: false, error: `後端 API 錯誤: ${error.message}`, news: newsCache || getDefaultNews() });
  }
}

// ... 其他輔助函數 (handleTerminologySearchWithRetry, processSingleArticle, etc.) 保持不變 ...

async function processSingleArticle(article, index, BASE_URL_ENV, OPENAI_API_KEY, MODEL_ENV) {
  let BASE_URL = BASE_URL_ENV || 'https://api.openai.com/v1';
  if (BASE_URL.endsWith('/')) BASE_URL = BASE_URL.slice(0, -1);
  if (!BASE_URL.includes('/v1')) BASE_URL += '/v1';
  const MODEL = MODEL_ENV || 'gpt-4o-mini';
  const apiUrl = `${BASE_URL}/chat/completions`;
  const articleContent = article.description || article.content?.substring(0, 200) || '';

  const aiResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'User-Agent': 'Mozilla/5.0'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: '你是一個專業的財經翻譯和分析助手。請將新聞翻譯成繁體中文，並提供針對普通投資者的投資解讀。解讀應包含對市場影響、潛在機會或風險的分析。請以 JSON 格式回應，不要包含 markdown 標記。' },
        { role: 'user', content: `請將以下財經新聞翻譯成繁體中文，並提供針對普通投資者的投資解讀。解讀應包含對市場影響、潛在機會或風險的分析。回應格式：{"title":"[繁體中文標題]","summary":"[繁體中文摘要]","aiInsight":"[繁體中文投資解讀]","category":"[繁體中文類別]"}。新聞內容:\n標題: ${article.title}\n摘要: ${articleContent}\n來源: ${article.source.name}` }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" }
    }),
    signal: AbortSignal.timeout(8000) 
  });

  if (!aiResponse.ok) {
    const errorDetail = await aiResponse.text();
    throw new Error(`AI API 錯誤 (${aiResponse.status}): ${errorDetail.substring(0, 100)}`);
  }

  const aiData = await aiResponse.json();
  const responseText = aiData.choices[0].message.content;
  const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  try {
    return JSON.parse(cleanedText);
  } catch (e) {
    throw new Error(`JSON 解析失敗: ${e.message}.`);
  }
}

function createFallbackNews(articles, errorMessage = '') {
  return articles.slice(0, 9).map((article, index) => ({
    id: index + 1,
    title: article.title,
    source: article.source.name,
    time: getRelativeTime(article.publishedAt),
    summary: article.description || '請點擊閱讀原文查看詳情',
    aiInsight: `💡 AI 處理失敗: ${errorMessage}`,
    category: '系統提示',
    url: article.url,
    image: null,
    originalTitle: article.title
  }));
}

function getDefaultNews() {
  return [{ id: 1, title: "系統訊息", source: "系統", time: "現在", summary: "新聞服務暫時不可用，請稍後再試。", aiInsight: "💡 提示：請檢查後端服務日誌。", category: "系統", url: "#" }];
}

function getRelativeTime(publishedAt) {
  if (!publishedAt) return '未知時間';
  const now = new Date();
  const published = new Date(publishedAt);
  const diffMs = now - published;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return '剛剛';
  if (diffHours < 24) return `${diffHours}小時前`;
  return published.toLocaleDateString('zh-TW');
}

// The terminology search function remains unchanged.
async function handleTerminologySearchWithRetry(term, BASE_URL, OPENAI_API_KEY, MODEL, res, retries = 3) {
    // ... (omitted for brevity, no changes from previous version)
}
