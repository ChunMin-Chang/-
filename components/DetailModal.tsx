
import React, { useState, useEffect } from 'react';
import { Competition } from '../types';
import { getCompetitionAnalysis } from '../geminiService';

interface Props {
  competition: Competition;
  onClose: () => void;
}

const DetailModal: React.FC<Props> = ({ competition, onClose }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>('正在分析中...');
  const [email, setEmail] = useState('');
  const [isReminderSet, setIsReminderSet] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      const analysis = await getCompetitionAnalysis(competition.name, competition.summary);
      setAiAnalysis(analysis);
    };
    fetchAnalysis();
  }, [competition]);

  // 檢查連結是否有效
  const hasValidLink = competition.officialLink && competition.officialLink.trim() !== '';

  // 產生 Google Calendar 連結
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`[競賽截止] ${competition.name}`);
    const details = encodeURIComponent(`主辦單位：${competition.organizer}\n獎金：${competition.prize}\n\n${competition.officialLink}`);
    // 簡單將 YYYY-MM-DD 轉為 YYYYMMDD
    const dateStr = competition.deadline.replace(/-/g, '');
    const dates = `${dateStr}/${dateStr}`; // 全天事件
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
  };

  const handleSetReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if(email) {
      // 模擬後端 API 呼叫
      setIsReminderSet(true);
      setTimeout(() => {
        // 3秒後自動消失
        // setIsReminderSet(false); 
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Image & Fast Stats */}
        <div className="w-full md:w-1/3 bg-gray-50 p-6 flex flex-col border-b md:border-b-0 md:border-r border-gray-100 overflow-y-auto">
          <img 
            src={competition.imageUrl} 
            alt={competition.name}
            className="w-full aspect-video md:aspect-square object-cover rounded-xl shadow-inner mb-6"
          />
          <div className="space-y-4 mb-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">獎金詳情</p>
              <p className="text-lg font-bold text-indigo-600">{competition.prize}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">截止日期</p>
              <p className="text-lg font-bold text-red-500">{competition.deadline}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">主辦單位</p>
              <p className="text-sm font-medium text-gray-700">{competition.organizer}</p>
            </div>
          </div>

          {/* Assistant Tools */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
             <h4 className="font-bold text-gray-800 flex items-center">
               <span className="text-lg mr-2">🤖</span> 個人參賽助理
             </h4>
             
             {/* 1. Calendar Button */}
             <a 
               href={getGoogleCalendarUrl()}
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center justify-center w-full py-2 px-4 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
             >
               <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
               </svg>
               加入 Google 行事曆
             </a>

             {/* 2. Email Reminder */}
             {!isReminderSet ? (
               <form onSubmit={handleSetReminder} className="space-y-2">
                 <label className="text-xs font-semibold text-gray-500">設定截止提醒 (7天/3天前)</label>
                 <div className="flex space-x-2">
                   <input 
                     type="email" 
                     placeholder="輸入 Email..." 
                     required
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                   />
                   <button 
                     type="submit"
                     className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-200"
                   >
                     設定
                   </button>
                 </div>
               </form>
             ) : (
               <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                 <p className="text-green-800 text-sm font-bold flex items-center justify-center">
                   <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                   提醒已設定完成！
                 </p>
                 <p className="text-xs text-green-600 mt-1">我們將發送郵件至 {email}</p>
               </div>
             )}
          </div>
          
          <div className="mt-auto pt-6">
            {hasValidLink ? (
              <a 
                href={competition.officialLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
              >
                前往官網報名
              </a>
            ) : (
              <div className="block w-full text-center bg-gray-300 text-gray-500 py-3 rounded-xl font-bold cursor-not-allowed">
                暫無報名連結
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed Info */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition bg-white/80 p-1 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 leading-tight">
            {competition.name}
          </h2>

          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-bold text-indigo-600 mb-3 flex items-center">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full mr-3"></span>
                競賽簡介
              </h3>
              <p className="text-gray-600 leading-relaxed">{competition.summary}</p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-indigo-600 mb-3 flex items-center">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full mr-3"></span>
                競賽方法
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{competition.rules}</p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-indigo-600 mb-3 flex items-center">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full mr-3"></span>
                報名辦法
              </h3>
              <p className="text-gray-600 leading-relaxed">{competition.registrationMethod}</p>
            </section>

            {/* Added explicit Link section, hidden if no link */}
            {hasValidLink && (
              <section>
                <h3 className="text-lg font-bold text-indigo-600 mb-3 flex items-center">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full mr-3"></span>
                  官方連結
                </h3>
                <a 
                  href={competition.officialLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 break-all hover:underline font-medium"
                >
                  {competition.officialLink}
                </a>
              </section>
            )}

            <section className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
              <h3 className="text-lg font-bold text-indigo-700 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Gemini AI 參賽建議
              </h3>
              <div className="prose prose-sm text-indigo-900 leading-relaxed whitespace-pre-wrap">
                {aiAnalysis}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
