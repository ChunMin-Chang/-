
import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import CompetitionCard from './components/CompetitionCard';
import DetailModal from './components/DetailModal';
import UserModal from './components/UserModal';
import TeamMatching from './components/TeamMatching'; 
import PublicProfileModal from './components/PublicProfileModal'; // Import New Component
import { GOOGLE_SHEETS_CSV_URL, DEFAULT_IMAGE } from './constants';
import { Competition, CompetitionCategory, CompetitionLocation, FilterState, User } from './types';
import { searchNewCompetitions, SearchResponse } from './geminiService';
import { getCurrentUser, logout, getUserById } from './authService';

const App: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'favorites' | 'teammates'>('home');
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  // Public Profile State
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Initialize Auth
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // Effect to load public profile data when ID changes
  useEffect(() => {
    if (viewingProfileId) {
      const publicUser = getUserById(viewingProfileId);
      if (publicUser) {
        setViewingUser(publicUser);
      } else {
        // Fallback for mock posts if user not found in DB
        // In a real app, you might fetch from API
        alert('找不到該使用者資料');
        setViewingProfileId(null);
      }
    } else {
      setViewingUser(null);
    }
  }, [viewingProfileId]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  // 收藏夾狀態
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('ccu_favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // 篩選器狀態
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    location: 'all',
    sortBy: 'deadline_asc'
  });
  
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiSearchResult, setAiSearchResult] = useState<SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    localStorage.setItem('ccu_favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) {
      alert('請先登入才能收藏競賽！');
      setIsUserModalOpen(true);
      return;
    }
    setFavorites(prev => {
      const newFavs = new Set(prev);
      if (newFavs.has(id)) {
        newFavs.delete(id);
      } else {
        newFavs.add(id);
      }
      return newFavs;
    });
  };

  // CSV 解析函數
  const parseCSV = (text: string) => {
    const lines = text.split(/\r\n|\n/);
    const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
    
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const obj: any = {};
      const currentLine = lines[i];
      
      const matches = currentLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      let values = [];
      if (matches) {
         values = matches;
      }
      
      values = [];
      let currentVal = '';
      let inQuotes = false;
      for(let charIndex = 0; charIndex < currentLine.length; charIndex++) {
        const char = currentLine[charIndex];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentVal);
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal);

      headers.forEach((header, index) => {
        let val = values[index] ? values[index].trim() : '';
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        }
        val = val.replace(/""/g, '"');
        obj[header] = val;
      });
      
      result.push(obj);
    }
    return result;
  };

  useEffect(() => {
    const fetchCompetitions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(GOOGLE_SHEETS_CSV_URL);
        const text = await response.text();
        const parsedData = parseCSV(text);

        const mappedData: Competition[] = parsedData.map((item: any, index: number) => ({
          id: String(index + 1),
          name: item.name || '未命名競賽',
          organizer: item.organizer || '未知主辦方',
          prize: item.prize || '詳見官網',
          category: (item.category as CompetitionCategory) || CompetitionCategory.TECH,
          location: (item.location as CompetitionLocation) || CompetitionLocation.ONLINE,
          deadline: item.end_date || '未定',
          summary: item.summary || '',
          rules: item.rules || '',
          registrationMethod: item.registration_method || '詳見官網',
          officialLink: item.official_url || '',
          imageUrl: item.image_url || DEFAULT_IMAGE
        })).filter(item => item.name !== '未命名競賽');

        setCompetitions(mappedData);
      } catch (error) {
        console.error("Failed to fetch CSV:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  const parsePrizeValue = (prizeString: string): number => {
    if (!prizeString) return 0;
    const numbers = prizeString.replace(/[^0-9]/g, '');
    return numbers ? parseInt(numbers, 10) : 0;
  };

  const filteredCompetitions = useMemo(() => {
    let baseList = competitions;
    if (currentView === 'favorites') {
      baseList = competitions.filter(c => favorites.has(c.id));
    }

    return baseList
      .filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) || 
                            c.organizer.toLowerCase().includes(filters.searchQuery.toLowerCase());
        const matchesCategory = filters.category === 'all' || c.category === filters.category;
        const matchesLocation = filters.location === 'all' || c.location === filters.location;
        return matchesSearch && matchesCategory && matchesLocation;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'deadline_asc':
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          case 'deadline_desc':
            return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
          case 'prize_desc':
            return parsePrizeValue(b.prize) - parsePrizeValue(a.prize);
          case 'prize_asc':
            return parsePrizeValue(a.prize) - parsePrizeValue(b.prize);
          default:
            return 0;
        }
      });
  }, [competitions, filters, currentView, favorites]);

  const handleAiSearch = async () => {
    if (!aiSearchQuery) return;
    setIsSearching(true);
    setAiSearchResult(null);
    try {
      const result = await searchNewCompetitions(aiSearchQuery);
      setAiSearchResult(result);
    } catch (err) {
      setAiSearchResult({ text: "搜尋失敗，請確認 API Key 是否正確且具備 Google 搜尋權限。", links: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handleExportICS = () => {
    if (filteredCompetitions.length === 0) {
      alert("目前沒有可匯出的收藏賽事");
      return;
    }
    // ... (Keep existing ICS logic)
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CCU Competition Platform//TW\nCALSCALE:GREGORIAN\n";
    filteredCompetitions.forEach(comp => {
      const cleanDate = comp.deadline.replace(/-/g, '');
      const uuid = `${comp.id}@ccu-competition.com`;
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `UID:${uuid}\n`;
      icsContent += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
      icsContent += `DTSTART;VALUE=DATE:${cleanDate}\n`;
      icsContent += `DTEND;VALUE=DATE:${cleanDate}\n`;
      icsContent += `SUMMARY:[競賽截止] ${comp.name}\n`;
      icsContent += `DESCRIPTION:主辦：${comp.organizer} / 獎金：${comp.prize} / 連結：${comp.officialLink}\n`;
      icsContent += `URL:${comp.officialLink}\n`;
      icsContent += "END:VEVENT\n";
    });
    icsContent += "END:VCALENDAR";
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'my_competitions.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        currentView={currentView}
        onNavigate={setCurrentView}
        favoritesCount={favorites.size}
        currentUser={user}
        onOpenUserModal={() => setIsUserModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* VIEW: Teammate Matching */}
        {currentView === 'teammates' ? (
          <TeamMatching 
            currentUser={user} 
            onRequireAuth={() => setIsUserModalOpen(true)}
            onViewProfile={(id) => setViewingProfileId(id)}
          />
        ) : (
          /* VIEW: Home & Favorites */
          <>
            {/* Header logic (Only show on Home) */}
            {currentView === 'home' && (
              <>
              <header className="mb-12 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                  找競賽，不再是大海撈針
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                  中正競賽智匯通為大專生整合全台最新賽事資訊。不再擔心系網資訊過時，輕鬆篩選、AI 智慧分析，助你奪下獎學金！
                </p>
              </header>

              {/* Filter Bar */}
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10">
                {/* ... Keep Filters UI ... */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="搜尋競賽名稱或主辦單位..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      value={filters.searchQuery}
                      onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <select 
                    className="py-2.5 px-4 bg-gray-50 border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
                  >
                    <option value="all">所有分類</option>
                    {Object.values(CompetitionCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <select 
                    className="py-2.5 px-4 bg-gray-50 border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value as any }))}
                  >
                    <option value="all">所有地點</option>
                    {Object.values(CompetitionLocation).map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                  <select 
                    className="py-2.5 px-4 bg-gray-50 border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition font-bold text-indigo-600"
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  >
                    <option value="deadline_asc">截止日期：由近到遠</option>
                    <option value="deadline_desc">截止日期：由遠到近</option>
                    <option value="prize_desc">獎金：由高到低</option>
                    <option value="prize_asc">獎金：由低到高</option>
                  </select>
                </div>
              </section>

              {/* AI Discovery Tool */}
              <section className="mb-12">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
                   {/* ... Keep AI Tool UI ... */}
                   <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2 flex items-center">
                        <span className="text-3xl mr-3">✨</span>
                        AI 智慧探索：找不到喜歡的比賽？
                      </h2>
                      <p className="opacity-90 text-indigo-100 mb-6">
                        輸入你的興趣（如：Python, 行銷企劃, 插畫），讓 Gemini AI 幫你即時搜尋全網最新賽事！
                      </p>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="例如：2025 年適合資工系的創業競賽..."
                          className="flex-1 px-5 py-3 rounded-xl text-gray-900 focus:ring-4 focus:ring-indigo-300 transition"
                          value={aiSearchQuery}
                          onChange={(e) => setAiSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                        />
                        <button 
                          onClick={handleAiSearch}
                          disabled={isSearching}
                          className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition active:scale-95 disabled:opacity-50"
                        >
                          {isSearching ? '搜尋中...' : 'AI 搜尋'}
                        </button>
                      </div>
                    </div>
                  </div>
                  {aiSearchResult && (
                    <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg text-white flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          AI 建議賽事與分析：
                        </h3>
                        <button 
                          onClick={() => setAiSearchResult(null)}
                          className="text-white/60 hover:text-white"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none mb-6">
                        {aiSearchResult.text}
                      </div>
                      {aiSearchResult.links.length > 0 && (
                        <div className="border-t border-white/20 pt-4">
                          <p className="text-xs font-bold text-indigo-200 uppercase mb-3 tracking-widest">參考來源連結：</p>
                          <div className="flex flex-wrap gap-2">
                            {aiSearchResult.links.map((link, idx) => (
                              <a 
                                key={idx}
                                href={link.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center"
                              >
                                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                {link.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
              </>
            )}

            {/* Favorites Header */}
            {currentView === 'favorites' && (
               <div className="mb-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between">
                 <div>
                   <h2 className="text-2xl font-bold text-indigo-900 flex items-center">
                     <svg className="w-8 h-8 mr-3 text-red-500 fill-current" viewBox="0 0 20 20">
                       <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                     </svg>
                     我的收藏清單 ({favorites.size})
                   </h2>
                   <p className="text-indigo-600 mt-2">
                     這裡列出您感興趣的所有賽事，您可以一鍵將其匯入行事曆。
                   </p>
                 </div>
                 <button 
                   onClick={handleExportICS}
                   className="mt-4 md:mt-0 flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                 >
                   <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                   匯出所有賽程到行事曆
                 </button>
               </div>
            )}

            {/* Competition Grid */}
            <section>
              {currentView === 'home' && (
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">精選競賽專區</h2>
                  <div className="flex items-center gap-4">
                     {isLoading && <span className="text-indigo-600 text-sm font-medium animate-pulse">資料同步中...</span>}
                     <span className="text-sm text-gray-500">共找到 {filteredCompetitions.length} 項競賽</span>
                  </div>
                </div>
              )}
              
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="bg-white rounded-xl h-96 shadow-sm border border-gray-100 animate-pulse p-4">
                      <div className="bg-gray-200 h-40 rounded-lg mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredCompetitions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCompetitions.map(comp => (
                    <CompetitionCard 
                      key={comp.id} 
                      competition={comp} 
                      onClick={setSelectedComp}
                      isFavorite={favorites.has(comp.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                   {/* Empty State UI */}
                   <div className="text-gray-400 mb-4">
                    {currentView === 'favorites' ? (
                      <svg className="w-16 h-16 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {currentView === 'favorites' ? '目前沒有收藏的競賽' : '找不到符合條件的競賽'}
                  </h3>
                  <p className="text-gray-500">
                    {currentView === 'favorites' ? '回到首頁點擊愛心圖示，將感興趣的比賽加入清單！' : '試試看不同的關鍵字或調整篩選條件。'}
                  </p>
                  <button 
                    onClick={() => currentView === 'favorites' ? setCurrentView('home') : setFilters({ searchQuery: '', category: 'all', location: 'all', sortBy: 'deadline_asc' })}
                    className="mt-6 text-indigo-600 font-bold hover:underline"
                  >
                    {currentView === 'favorites' ? '去逛逛比賽' : '重置所有篩選'}
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 中正競賽智匯通 - 由 CCU 學生團隊為全國大專生打造
          </p>
          <div className="mt-4 flex justify-center space-x-6">
             <a href="#" className="text-gray-400 hover:text-indigo-600 transition text-xs">隱私權政策</a>
             <a href="#" className="text-gray-400 hover:text-indigo-600 transition text-xs">服務條款</a>
             <a href="#" className="text-gray-400 hover:text-indigo-600 transition text-xs">聯絡我們</a>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      {selectedComp && (
        <DetailModal 
          competition={selectedComp} 
          onClose={() => setSelectedComp(null)} 
        />
      )}

      <UserModal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)}
        currentUser={user}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />
      
      <PublicProfileModal
        isOpen={!!viewingProfileId}
        onClose={() => setViewingProfileId(null)}
        user={viewingUser}
      />
    </div>
  );
};

export default App;
