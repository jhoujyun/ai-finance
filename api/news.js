import Parser from 'rss-parser';

let newsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30 * 60 * 1000;
const MAX_DAILY_REQUESTS = 50;
let dailyRequestCount = 0;
let lastResetDate = new Date().toDateString();

let terminologyCache = {};
const TERMINOLOGY_CACHE_DURATION = 24 * 60 * 60 * 1000;

const FALLBACK_NEWS = [
  {
    title: "全球股市震盪，投資者應如何應對？",
    description: "近期全球主要股市波動加劇，受地緣政治緊張和通脹預期影響。專家建議投資者保持謹慎，分散投資組合，並關注長期價值。",
    url: "#",
    source: { name: "系統預置" },
    publishedAt: new Date().toISOString()
  },
  {
    title: "科技巨頭財報季來臨，市場屏息以待",
    description: "蘋果、微軟、谷歌等科技巨頭即將發布最新財報，其業績表現將對全球股市產生重大影響。分析師預計，AI 相關業務將是本次財報的亮點。",
    url: "#",
    source: { name: "系統預置" },
    publishedAt: new Date().toISOString()
  },
  {
    title: "央行貨幣政策轉向，債市迎來新機遇",
    description: "隨著全球通脹壓力趨緩，多國央行釋放出貨幣政策可能轉向的信號。債券市場有望迎來配置良機，尤其是高評級債券。",
    url: "#",
    source: { name: "系統預置" },
    publishedAt: new Date().toISOString()
  },
  {
    title: "原油價格波動加劇，能源板塊投資風險與機遇並存",
    description: "地緣政治緊張局勢和全球經濟前景不明朗導致原油價格劇烈波動。投資者需密切關注供應鏈變化和OPEC+的決策。",
    url: "#",
    source: { name: "系統預置" },
    publishedAt: new Date().toISOString()
  },
  {
    title: "新興市場吸引力提升，但匯率風險不容忽視",
    description: "在全球經濟復甦不均衡的背景下，部分新興市場展現出較強的增長潛力。然而，匯率波動和資本外流風險仍是投資者需要警惕的因素。",
    url: "#",
    source: { name: "系統預置" },
    publishedAt: new Date().toISOString()
  },
  {
    title: "黃金避險需求升溫，貴金屬配置價值凸顯",
    description: "在不確定性增加的市場環境中，黃金作為傳統避險資產的吸引力再次提升。投資者可適當配置貴金屬以對沖風險。",
    url: "#",
    source: { name: "系統預置" },
    publishedAt: new Date().toISOString()
  },
  {
    title: "AI 技術加速金融業變革，智能投顧成新趨勢",
    description: "人工智能技術正深刻改變金融服務業，智能投顧、量化交易等新模式不斷湧現，為投資者提供更個性化、高效的服務。",
    url: "#",
    source: { name: "系統預置" },
    publishedAt: new Date().toISOString()
  },
  {
    title: "全球供應鏈重塑，製造業板塊面臨挑戰與機遇",
    description: "地緣政治和貿易摩擦加速全球供應鏈多元化布局，部分製造業企業面臨成本上升壓力，但也為具備彈性和創新能力的企業帶來新機遇。",
    url: "#",
    source: { name: "系統預置" },
    publishedAt: new Date().toISOString()
  },
  {
    title: "數字貨幣監管趨嚴，區塊鏈技術應用前景廣闊",
    description: "隨著各國對數字貨幣監管政策的逐步完善，區塊鏈技術在金融、供應鏈等領域的應用前景日益廣闊，但投資仍需謹慎。",
    url: "#",
    source: { name: "系統預置" },
    publishedAt: new Date().toISOString()
  }
];

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
                                const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // 允許 POST 方法
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    let BASE_URL = process.env.API_BASE_URL || 'https://api.openai.com/v1';
    if (BASE_URL.endsWith('/')) BASE_URL = BASE_URL.slice(0, -1);
    if (!BASE_URL.includes('/v1')) BASE_URL += '/v1';
    const MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

    // --- 術語百科查詢邏輯 ---
    if (req.query.term) {
      const term = req.query.term.trim();
      if (POPULAR_TERMS[term]) {
        return res.status(200).json({ success: true, explanation: POPULAR_TERMS[term] });
      }
      if (terminologyCache[term] && terminologyCache[term].timestamp && (Date.now() - terminologyCache[term].timestamp < TERMINOLOGY_CACHE_DURATION)) {
        return res.status(200).json({ success: true, explanation: terminologyCache[term].explanation });
      }
      if (!OPENAI_API_KEY) {
        return res.status(200).json({ success: false, error: '缺少 OPENAI_API_KEY' });
      }
      return await handleTerminologySearchWithRetry(term, BASE_URL, OPENAI_API_KEY, MODEL, res, 3);
    }

    // --- 獨立 AI 處理單個新聞接口 (POST) ---
    if (req.method === 'POST' && req.url === '/api/news/process-single') {
      const { article } = req.body;
      if (!article || !article.title || !article.description) {
        return res.status(400).json({ success: false, error: '缺少新聞文章內容' });
      }
      if (!OPENAI_API_KEY) {
        return res.status(200).json({ success: false, error: '缺少 OPENAI_API_KEY' });
      }
      try {
        const processedArticle = await processSingleArticle(article, 0, BASE_URL, OPENAI_API_KEY, MODEL);
        return res.status(200).json({ success: true, processedArticle });
      } catch (aiError) {
        console.error('獨立 AI 處理失敗:', aiError);
        return res.status(200).json({ success: false, error: `AI 處理失敗: ${aiError.message}` });
      }
    }

    // --- 獲取原始新聞列表 (GET) ---
    const now = Date.now();
    if (newsCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
      return res.status(200).json({ success: true, news: newsCache, timestamp: new Date(cacheTimestamp).toISOString(), fromCache: true });
    }

    let articles = [];
    try {
      articles = await fetchNewsFromSources();
    } catch (e) {
      console.error("獲取新聞源失敗，使用預置數據: ", e.message);
      articles = FALLBACK_NEWS.map(news => ({ ...news, publishedAt: new Date().toISOString(), source: { name: "系統預置" } }));
    }

    if (articles.length === 0) {
        articles = FALLBACK_NEWS.map(news => ({ ...news, publishedAt: new Date().toISOString(), source: { name: "系統預置" } }));
    }

    // 快速返回原始新聞，不進行 AI 處理
    const rawNews = Array(9).fill(null).map((_, i) => {
      const originalArticle = articles[i] || { title: `Placeholder ${i+1}`, description: `No content for placeholder ${i+1}`, source: { name: 'System' }, publishedAt: new Date().toISOString(), url: '#' };
      return {
        id: i + 1,
        title: originalArticle.title,
        source: originalArticle.source.name,
        time: getRelativeTime(originalArticle.publishedAt),
        summary: originalArticle.description || '點擊查看原文',
        url: originalArticle.url,
        image: originalArticle.urlToImage,
        originalTitle: originalArticle.title,
        aiInsight: 'AI 正在解讀中...'
      };
    });

    newsCache = rawNews;
    cacheTimestamp = now;
    res.status(200).json({ success: true, news: rawNews, timestamp: new Date().toISOString(), fromCache: false });

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
