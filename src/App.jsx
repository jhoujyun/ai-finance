import { useState, useEffect } from 'react';
import { 
  Newspaper, Calendar, TrendingUp, BookOpen, RefreshCw, 
  ChevronRight, AlertCircle, Globe, DollarSign, PieChart, Search, Plus, Trash2, Calculator, Menu, X
} from 'lucide-react';

const NewsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(9)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md flex flex-col animate-pulse">
        <div className="p-5 flex-grow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-16 bg-slate-200 rounded-md"></div>
            <div className="h-3 w-12 bg-slate-200 rounded-md"></div>
          </div>
          <div className="h-6 w-full bg-slate-300 rounded-md mb-2"></div>
          <div className="h-6 w-3/4 bg-slate-300 rounded-md mb-4"></div>
          <div className="h-4 w-full bg-slate-200 rounded-md mb-4"></div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center text-indigo-600 mb-2">
              <div className="h-4 w-24 bg-indigo-200 rounded-md"></div>
            </div>
            <div className="h-4 w-full bg-slate-200 rounded-md mb-1"></div>
            <div className="h-4 w-5/6 bg-slate-200 rounded-md"></div>
          </div>
        </div>
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <div className="h-4 w-20 bg-slate-200 rounded-md"></div>
        </div>
      </div>
    ))}
  </div>
);

const ErrorBoundary = ({ error, children }) => {
  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-rose-600 mb-1">加載失敗</h3>
          <p className="text-sm text-rose-600">{error}</p>
        </div>
      </div>
    );
  }
  return children;
};

const App = () => {
  const [activeTab, setActiveTab] = useState('news');
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState(null);

  const [calendar, setCalendar] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState(null);

  const [marketData, setMarketData] = useState([]);
  const [marketLoading, setMarketLoading] = useState(false);

  const [portfolio, setPortfolio] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('portfolio') || '[]');
    } catch (e) {
      console.error('Portfolio 加載失敗:', e);
      return [];
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [termResult, setTermResult] = useState(null);
  const [termLoading, setTermLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const FALLBACK_LOCAL_NEWS = [
    {
      id: 1,
      title: "AI 全球財經終端：歡迎體驗",
      source: "系統預置",
      time: "剛剛",
      summary: "當前新聞服務暫時不可用，或網絡連接不穩定。請稍後重試。系統已為您加載預置新聞，確保頁面正常顯示。",
      aiInsight: "💡 提示：請檢查網絡連接或後端服務狀態。",
      category: "系統提示",
      url: "#",
      image: null,
      originalTitle: "AI 全球財經終端：歡迎體驗"
    },
    {
      id: 2,
      title: "全球經濟展望：挑戰與機遇並存",
      source: "系統預置",
      time: "1小時前",
      summary: "分析師指出，儘管全球經濟面臨多重挑戰，但新興技術和綠色產業帶來新的增長機遇。",
      aiInsight: "💡 投資者應關注科技創新和可持續發展領域的投資機會。",
      category: "宏觀經濟",
      url: "#",
      image: null,
      originalTitle: "全球經濟展望：挑戰與機遇並存"
    },
    {
      id: 3,
      title: "科技股領漲市場，AI 概念持續火熱",
      source: "系統預置",
      time: "2小時前",
      summary: "人工智能相關股票表現強勁，帶動科技板塊整體上漲。市場對 AI 技術的未來發展充滿期待。",
      aiInsight: "💡 AI 領域的長期投資價值顯著，但需警惕短期波動風險。",
      category: "市場分析",
      url: "#",
      image: null,
      originalTitle: "科技股領漲市場，AI 概念持續火熱"
    },
    {
      id: 4,
      title: "央行貨幣政策會議紀要：謹慎觀望",
      source: "系統預置",
      time: "3小時前",
      summary: "最新央行會議紀要顯示，決策者對通脹前景仍持謹慎態度，未來貨幣政策走向仍不明朗。",
      aiInsight: "💡 貨幣政策的不確定性可能增加市場波動，建議投資者保持流動性。",
      category: "政策解讀",
      url: "#",
      image: null,
      originalTitle: "央行貨幣政策會議紀要：謹慎觀望"
    },
    {
      id: 5,
      title: "原油價格波動加劇，能源板塊受關注",
      source: "系統預置",
      time: "4小時前",
      summary: "地緣政治緊張局勢和供應鏈問題導致原油價格大幅波動，能源類股票成為市場焦點。",
      aiInsight: "💡 能源板塊短期內受地緣政治影響大，長期投資需綜合考慮供需關係。",
      category: "大宗商品",
      url: "#",
      image: null,
      originalTitle: "原油價格波動加劇，能源板塊受關注"
    },
    {
      id: 6,
      title: "黃金避險需求上升，貴金屬表現堅挺",
      source: "系統預置",
      time: "5小時前",
      summary: "在全球經濟不確定性增加的背景下，黃金作為避險資產的吸引力增強，價格持續走高。",
      aiInsight: "💡 適當配置黃金有助於對沖市場風險，尤其是在波動時期。",
      category: "貴金屬",
      url: "#",
      image: null,
      originalTitle: "黃金避險需求上升，貴金屬表現堅挺"
    },
    {
      id: 7,
      title: "新興市場投資機會：高增長與高風險並存",
      source: "系統預置",
      time: "6小時前",
      summary: "部分新興市場經濟體展現出強勁增長勢頭，吸引國際資本流入，但同時也伴隨著較高的政治和匯率風險。",
      aiInsight: "💡 投資新興市場需仔細評估各國宏觀經濟狀況和政策穩定性。",
      category: "新興市場",
      url: "#",
      image: null,
      originalTitle: "新興市場投資機會：高增長與高風險並存"
    },
    {
      id: 8,
      title: "區塊鏈技術應用加速，數字資產未來可期",
      source: "系統預置",
      time: "7小時前",
      summary: "區塊鏈技術在金融、供應鏈等領域的應用不斷深化，數字資產的發展前景廣闊，但監管政策仍是關鍵變數。",
      aiInsight: "💡 區塊鏈技術的長期潛力巨大，但數字資產投資波動性高，需謹慎。",
      category: "區塊鏈",
      url: "#",
      image: null,
      originalTitle: "區塊鏈技術應用加速，數字資產未來可期"
    },
    {
      id: 9,
      title: "ESG 投資理念盛行，可持續發展成主流",
      source: "系統預置",
      time: "8小時前",
      summary: "環境、社會和公司治理（ESG）投資理念日益受到重視，越來越多的投資者將可持續發展納入決策考量。",
      aiInsight: "💡 ESG 投資不僅符合社會責任，長期來看也可能帶來穩定的財務回報。",
      category: "ESG投資",
      url: "#",
      image: null,
      originalTitle: "ESG 投資理念盛行，可持續發展成主流"
    }
  ];

  // 計算器狀態
  const [calcMode, setCalcMode] = useState('compound'); // compound, mortgage, roi
  const [compoundPrincipal, setCompoundPrincipal] = useState('');
  const [compoundRate, setCompoundRate] = useState('');
  const [compoundYears, setCompoundYears] = useState('');
  const [compoundResult, setCompoundResult] = useState(null);

  const [mortgagePrincipal, setMortgagePrincipal] = useState('');
  const [mortgageRate, setMortgageRate] = useState('');
  const [mortgageYears, setMortgageYears] = useState('');
  const [mortgageResult, setMortgageResult] = useState(null);

  const [roiInitial, setRoiInitial] = useState('');
  const [roiFinal, setRoiFinal] = useState('');
  const [roiYears, setRoiYears] = useState('');
  const [roiResult, setRoiResult] = useState(null);

  useEffect(() => {
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  // 動態更新頁面標題
  useEffect(() => {
    const tabTitles = {
      'news': 'AI 全球財經終端 - 即時新聞',
      'calendar': 'AI 全球財經終端 - 經濟日曆',
      'portfolio': 'AI 全球財經終端 - 投資組合',
      'wiki': 'AI 全球財經終端 - 術語百科',
      'calc': 'AI 全球財經終端 - 財經計算器'
    };
    document.title = tabTitles[activeTab] || 'AI 全球財經終端';
  }, [activeTab]);

  useEffect(() => {
    fetchNews();
    fetchCalendar();
    fetchMarketData();
  }, []);

  const processNewsAIInsight = async (newsItem, index) => {
    try {
      const response = await fetch('/api/news/process-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article: {
            title: newsItem.title,
            description: newsItem.summary,
            source: { name: newsItem.source }
          }
        })
      });
      
      const data = await response.json();
      if (data.success && data.processedArticle) {
        setNews(prevNews => {
          const updatedNews = [...prevNews];
          updatedNews[index] = {
            ...updatedNews[index],
            title: data.processedArticle.title || updatedNews[index].title,
            summary: data.processedArticle.summary || updatedNews[index].summary,
            aiInsight: data.processedArticle.aiInsight || '💡 AI 解讀暫時不可用',
            category: data.processedArticle.category || updatedNews[index].category
          };
          return updatedNews;
        });
      }
    } catch (error) {
      console.error(`處理第 ${index + 1} 條新聞 AI 解讀失敗:`, error);
    }
  };

  const fetchNews = async (retries = 3) => {
    setNewsLoading(true);
    setNewsError(null);
    let lastError = null;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const res = await fetch('/api/news', { signal: AbortSignal.timeout(15000) });
        let data;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          console.error("API 返回非 JSON 格式，可能是 Vercel 錯誤頁面:", text.substring(0, 200));
          throw new Error("服務器返回非 JSON 格式數據，請檢查 Vercel 日誌。");
        }
        if (data.success) {
          setNews(data.news || []);
          setNewsLoading(false);
          
          // 異步加載 AI 解讀
          const newsArray = data.news || [];
          newsArray.forEach((newsItem, index) => {
            if (newsItem.aiInsight === 'AI 正在解讀中...') {
              processNewsAIInsight(newsItem, index);
            }
          });
          
          return;
        } else {
          lastError = data.error || '新聞加載失敗';
          if (attempt < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
        }
      } catch (e) {
        lastError = e.name === 'AbortError' ? '請求超時，請檢查網絡' : `網絡連接失敗: ${e.message}`;
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
      }
    }
    
    // 如果最終還是失敗，則使用本地預置新聞數據，不顯示紅色錯誤框
    if (news.length === 0) {
      setNews(FALLBACK_LOCAL_NEWS);
      console.warn("API 加載失敗，已回退到本地預置新聞數據。");
      // 不設置 newsError，避免顯示紅色錯誤框
    } else {
      setNewsError(lastError || '新聞加載失敗，請稍後重試');
    }
    setNewsLoading(false);
  };

  const fetchCalendar = async () => {
    setCalendarLoading(true);
    setCalendarError(null);
    try {
      const res = await fetch('/api/calendar');
      const data = await res.json();
      if (data.success) {
        setCalendar(data.events || []);
      } else {
        setCalendarError(data.error || '日曆加載失敗');
      }
    } catch (e) {
      setCalendarError('網絡連接失敗');
    } finally {
      setCalendarLoading(false);
    }
  };

  const fetchMarketData = async () => {
    setMarketLoading(true);
    try {
      const res = await fetch('/api/market');
      const data = await res.json();
      if (data.success) {
        setMarketData(data.data || []);
      }
    } catch (e) {
      console.error('市場數據加載失敗:', e);
    } finally {
      setMarketLoading(false);
    }
  };

  const handleSearchTerm = async () => {
    if (!searchTerm.trim()) return;
    setTermLoading(true);
    setTermResult(null);
    try {
      const res = await fetch(`/api/news?term=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (data.success) {
        setTermResult({ explanation: data.explanation });
      } else {
        setTermResult({ error: data.error || '查詢失敗' });
      }
    } catch (e) {
      setTermResult({ error: '網絡連接失敗' });
    } finally {
      setTermLoading(false);
    }
  };

  // 複利計算
  const calculateCompound = () => {
    const p = parseFloat(compoundPrincipal);
    const r = parseFloat(compoundRate) / 100;
    const t = parseFloat(compoundYears);
    if (p > 0 && r >= 0 && t > 0) {
      const result = p * Math.pow(1 + r, t);
      setCompoundResult({
        principal: p,
        finalAmount: result,
        interest: result - p,
        rate: r * 100
      });
    }
  };

  // 房貸月供計算
  const calculateMortgage = () => {
    const p = parseFloat(mortgagePrincipal);
    const r = parseFloat(mortgageRate) / 100 / 12;
    const n = parseFloat(mortgageYears) * 12;
    if (p > 0 && r >= 0 && n > 0) {
      const monthlyPayment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayment = monthlyPayment * n;
      setMortgageResult({
        monthlyPayment: monthlyPayment,
        totalPayment: totalPayment,
        totalInterest: totalPayment - p,
        principal: p
      });
    }
  };

  // ROI 計算
  const calculateROI = () => {
    const initial = parseFloat(roiInitial);
    const final = parseFloat(roiFinal);
    const years = parseFloat(roiYears);
    if (initial > 0 && final > 0 && years > 0) {
      const totalReturn = final - initial;
      const roi = (totalReturn / initial) * 100;
      const annualROI = (Math.pow(final / initial, 1 / years) - 1) * 100;
      setRoiResult({
        initialInvestment: initial,
        finalValue: final,
        totalReturn: totalReturn,
        roi: roi,
        annualROI: annualROI,
        years: years
      });
    }
  };

  const menuItems = [
    { id: 'news', icon: Newspaper, label: '即時新聞' },
    { id: 'calendar', icon: Calendar, label: '經濟日曆' },
    { id: 'portfolio', icon: PieChart, label: '投資組合' },
    { id: 'wiki', icon: BookOpen, label: '術語百科' },
    { id: 'calc', icon: Calculator, label: '計算器' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Market Ticker */}
      <div className="bg-slate-900 text-white py-2 overflow-hidden whitespace-nowrap border-b border-slate-700">
        <div className="inline-block animate-marquee">
          {marketData.map((item, i) => (
            <span key={i} className="mx-6 text-sm font-medium">
              <span className="text-slate-400">{item.name}:</span> 
              <span className={item.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {item.price} ({item.change >= 0 ? '+' : ''}{item.change}%)
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo 和標題 */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <img src="/logo.svg" alt="AI 全球財經終端 Logo" className="w-10 h-10 md:w-12 md:h-12" />
            <h1 className="text-base md:text-xl font-bold tracking-tight text-slate-800 whitespace-nowrap">AI 全球財經終端</h1>
          </div>
          
          {/* 桌面版導航 */}
          <nav className="hidden md:flex space-x-1">
            {menuItems.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* 手機版導航 - 只顯示新聞圖標 */}
          <nav className="md:hidden flex items-center">
            <button
              onClick={() => {
                setActiveTab('news');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'news' 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Newspaper className="w-5 h-5" />
            </button>
          </nav>
          
          {/* 右側按鈕組 */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button onClick={() => { fetchNews(); fetchCalendar(); fetchMarketData(); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <RefreshCw className={`w-5 h-5 ${newsLoading || calendarLoading || marketLoading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* 漢堡菜單 (手機版) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* 手機版下拉菜單 */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 py-2 shadow-lg">
            {menuItems.slice(1).map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-3" />
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 新聞標籤 */}
        {activeTab === 'news' && (
          <ErrorBoundary error={newsError}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">即時新聞</h2>
              <button
                onClick={() => fetchNews(3, true)}
                className="p-2 hover:bg-slate-200 rounded-full transition"
                title="刷新新聞"
              >
                <RefreshCw className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            {newsLoading && news.length === 0 ? (
              <NewsSkeleton />
            ) : news.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
                    <div className="p-5 flex-grow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-md uppercase tracking-wider">
                          {item.category || '財經新聞'}
                        </span>
                        <span className="text-xs text-slate-400">{item.time}</span>
                      </div>
                      <h3 className="text-lg font-bold mb-3 leading-snug group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-4">{item.summary || item.description || '無摘要'}</p>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="flex items-center text-indigo-600 mb-2">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          <span className="text-xs font-bold uppercase">AI 投資解讀</span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{item.aiInsight || '暫無解讀'}</p>
                      </div>
                    </div>
                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-xs text-slate-400">{item.source}</span>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 font-bold text-xs flex items-center">
                        閱讀原文 <ChevronRight className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暫無新聞內容</p>
              </div>
            )}
          </ErrorBoundary>
        )}

        {/* 經濟日曆標籤 */}
        {activeTab === 'calendar' && (
          <ErrorBoundary error={calendarError}>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-indigo-600" />
                  經濟日曆
                </h2>
                {calendarLoading ? (
                  <div className="flex items-center justify-center py-12"><RefreshCw className="animate-spin text-indigo-600 w-8 h-8" /></div>
                ) : calendar.length > 0 ? (
                  <div className="space-y-4">
                    {calendar.map((event, i) => (
                      <div key={i} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                        <div className="flex-shrink-0 w-20 text-center">
                          <div className="text-sm font-bold text-slate-600">{event.date}</div>
                          <div className="text-xs text-slate-400">{event.time}</div>
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-bold text-slate-800 mb-1">{event.name || '未知事件'}</h3>
                          <p className="text-sm text-slate-500 mb-2">{event.description || '暫無描述'}</p>
                          <div className="flex items-center space-x-4 text-xs">
                            <span className="text-slate-400">預期: <span className="font-bold text-slate-600">{event.forecast}</span></span>
                            <span className="text-slate-400">前值: <span className="font-bold text-slate-600">{event.previous}</span></span>
                          </div>
                        </div>
                        <div className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold ${event.importance === '高' ? 'bg-rose-100 text-rose-600' : event.importance === '中' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {event.importance}重要
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>暫無日曆事件</p>
                  </div>
                )}
              </div>
            </div>
          </ErrorBoundary>
        )}

        {/* 投資組合標籤 */}
        {activeTab === 'portfolio' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <PieChart className="w-6 h-6 mr-2 text-indigo-600" />
                我的模擬投資組合
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <input id="p-name" placeholder="資產名稱 (如 BTC, TSLA)" className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                <input id="p-price" type="number" placeholder="買入價格" className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                <button 
                  onClick={() => {
                    const n = document.getElementById('p-name').value;
                    const p = document.getElementById('p-price').value;
                    if(n && p) {
                      setPortfolio([...portfolio, { name: n, price: p }]);
                      document.getElementById('p-name').value = '';
                      document.getElementById('p-price').value = '';
                    }
                  }}
                  className="bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-1" /> 添加資產
                </button>
              </div>
              {portfolio.length > 0 ? (
                <div className="space-y-3">
                  {portfolio.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <span className="ml-4 text-sm text-slate-500">買入價: ${item.price}</span>
                      </div>
                      <button onClick={() => setPortfolio(portfolio.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-rose-500">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p>還沒有添加任何資產</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 術語百科標籤 */}
        {activeTab === 'wiki' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-indigo-600" />
                財經術語百科
              </h2>
              <div className="flex space-x-2 mb-6">
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchTerm()}
                  placeholder="輸入術語 (如: 縮表, 非農, 降息)" 
                  className="flex-grow px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
                <button onClick={handleSearchTerm} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                  查詢
                </button>
              </div>
              <div className="mb-8">
                <p className="text-sm text-slate-500 font-bold mb-3 uppercase">熱門術語</p>
                <div className="flex flex-wrap gap-2">
                  {['縮表', '非農', '降息', '升息', 'QE', 'CPI', 'GDP', '熊市', '牛市', '回購'].map(term => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchTerm(term);
                        setTimeout(() => handleSearchTerm(), 0);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-600 text-sm font-bold rounded-lg transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
              {termResult && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 animate-in fade-in slide-in-from-bottom-2">
                  {termLoading ? (
                    <div className="flex items-center justify-center py-8"><RefreshCw className="animate-spin text-indigo-600" /></div>
                  ) : termResult.error ? (
                    <p className="text-slate-500">{termResult.error}</p>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-indigo-600 mb-3">{searchTerm}</h3>
                      <p className="text-slate-700 leading-relaxed">{termResult.explanation || termResult.aiInsight || '暫無解釋'}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 計算器標籤 */}
        {activeTab === 'calc' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Calculator className="w-6 h-6 mr-2 text-indigo-600" />
                財經計算器
              </h2>
              
              {/* 計算器模式切換 */}
              <div className="flex space-x-2 mb-8">
                {[
                  { id: 'compound', label: '複利計算' },
                  { id: 'mortgage', label: '房貸月供' },
                  { id: 'roi', label: 'ROI 回報率' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setCalcMode(mode.id)}
                    className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                      calcMode === mode.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* 複利計算 */}
              {calcMode === 'compound' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="number"
                      placeholder="本金 ($)"
                      value={compoundPrincipal}
                      onChange={(e) => setCompoundPrincipal(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="年利率 (%)"
                      value={compoundRate}
                      onChange={(e) => setCompoundRate(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="年數"
                      value={compoundYears}
                      onChange={(e) => setCompoundYears(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <button
                    onClick={calculateCompound}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    計算複利
                  </button>
                  {compoundResult && (
                    <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-slate-500 font-bold uppercase">本金</div>
                          <div className="text-2xl font-bold text-slate-800">${compoundResult.principal.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 font-bold uppercase">利息</div>
                          <div className="text-2xl font-bold text-emerald-600">${compoundResult.interest.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 font-bold uppercase">年利率</div>
                          <div className="text-2xl font-bold text-slate-800">{compoundResult.rate.toFixed(2)}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 font-bold uppercase">最終金額</div>
                          <div className="text-2xl font-bold text-indigo-600">${compoundResult.finalAmount.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 房貸月供 */}
              {calcMode === 'mortgage' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="number"
                      placeholder="貸款金額 ($)"
                      value={mortgagePrincipal}
                      onChange={(e) => setMortgagePrincipal(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="年利率 (%)"
                      value={mortgageRate}
                      onChange={(e) => setMortgageRate(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="貸款年限"
                      value={mortgageYears}
                      onChange={(e) => setMortgageYears(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <button
                    onClick={calculateMortgage}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    計算月供
                  </button>
                  {mortgageResult && (
                    <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-slate-500 font-bold uppercase">月供金額</div>
                          <div className="text-2xl font-bold text-indigo-600">${mortgageResult.monthlyPayment.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 font-bold uppercase">總利息</div>
                          <div className="text-2xl font-bold text-rose-600">${mortgageResult.totalInterest.toFixed(2)}</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm text-slate-500 font-bold uppercase">總還款額</div>
                          <div className="text-2xl font-bold text-slate-800">${mortgageResult.totalPayment.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ROI 計算 */}
              {calcMode === 'roi' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="number"
                      placeholder="初始投資 ($)"
                      value={roiInitial}
                      onChange={(e) => setRoiInitial(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="最終價值 ($)"
                      value={roiFinal}
                      onChange={(e) => setRoiFinal(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="投資年數"
                      value={roiYears}
                      onChange={(e) => setRoiYears(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <button
                    onClick={calculateROI}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    計算 ROI
                  </button>
                  {roiResult && (
                    <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-slate-500 font-bold uppercase">總回報率</div>
                          <div className="text-2xl font-bold text-emerald-600">{roiResult.roi.toFixed(2)}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 font-bold uppercase">年化回報率</div>
                          <div className="text-2xl font-bold text-emerald-600">{roiResult.annualROI.toFixed(2)}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 font-bold uppercase">總收益</div>
                          <div className="text-2xl font-bold text-slate-800">${roiResult.totalReturn.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 font-bold uppercase">最終價值</div>
                          <div className="text-2xl font-bold text-indigo-600">${roiResult.finalValue.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-12 border-t border-slate-200 text-center text-slate-400 text-sm">
        <p>© 2026 AI 全球財經終端. Powered by Advanced AI Models.</p>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
