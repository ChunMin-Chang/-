
import React, { useState, useEffect } from 'react';
import { User, TeamPost } from '../types';

interface Props {
  currentUser: User | null;
  onRequireAuth: () => void;
  onViewProfile: (userId: string) => void;
}

const POSTS_STORAGE_KEY = 'ccu_team_posts';

const TeamMatching: React.FC<Props> = ({ currentUser, onRequireAuth, onViewProfile }) => {
  const [posts, setPosts] = useState<TeamPost[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // Create Post Form State
  const [compName, setCompName] = useState('');
  const [role, setRole] = useState('前端工程師');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('');

  // 載入貼文
  useEffect(() => {
    const savedPosts = localStorage.getItem(POSTS_STORAGE_KEY);
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      // 預設假資料
      const mockPosts: TeamPost[] = [
        {
          id: '1',
          authorId: 'mock1',
          authorName: '王小明',
          authorDept: '資工三',
          competitionName: '2024 創新創業大賽',
          roleNeeded: 'UI/UX 設計師',
          description: '我們已有完整的商業模式與後端工程師，急需一位設計師幫忙製作 App 介面與簡報美化！',
          tags: ['Figma', '簡報設計'],
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          authorId: 'mock2',
          authorName: '陳大文',
          authorDept: '企管四',
          competitionName: 'Google Solution Challenge',
          roleNeeded: '全端工程師',
          description: '我有很多關於永續發展的點子，需要技術大神幫忙實現！我負責報告與影片。',
          tags: ['Flutter', 'Firebase', 'Google Cloud'],
          createdAt: new Date().toISOString()
        }
      ];
      setPosts(mockPosts);
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(mockPosts));
    }
  }, []);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newPost: TeamPost = {
      id: Date.now().toString(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorDept: currentUser.department,
      competitionName: compName,
      roleNeeded: role,
      description: desc,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      createdAt: new Date().toISOString()
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
    
    // Reset Form
    setIsCreating(false);
    setCompName('');
    setDesc('');
    setTags('');
  };

  const handleDeletePost = (postId: string) => {
    if(!window.confirm('確定要刪除這則貼文嗎？')) return;
    const updated = posts.filter(p => p.id !== postId);
    setPosts(updated);
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleContact = (e: React.MouseEvent, post: TeamPost) => {
    e.stopPropagation();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    // 模擬聯絡
    alert(`已開啟您的預設信箱，準備聯絡 ${post.authorName}！\n(主旨：關於 ${post.competitionName} 的組隊邀請)`);
    window.location.href = `mailto:student@ccu.edu.tw?subject=想與你組隊：${post.competitionName}&body=Hi ${post.authorName}, 我對你的徵人貼文有興趣！`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">🔥 隊友媒合佈告欄</h2>
          <p className="opacity-90 text-orange-50">
            有神一般的隊友，才有神一般的專題！在這裡尋找你的夢幻團隊。
          </p>
        </div>
        <button 
          onClick={() => currentUser ? setIsCreating(true) : onRequireAuth()}
          className="mt-4 md:mt-0 bg-white text-orange-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-orange-50 transition transform hover:-translate-y-1"
        >
          + 發布徵人需求
        </button>
      </div>

      {/* Create Post Modal (Inline) */}
      {isCreating && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">發布新的徵人需求</h3>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">目標競賽名稱</label>
                <input 
                  type="text" 
                  required
                  className="w-full border-gray-300 rounded-lg focus:ring-orange-500"
                  placeholder="例如：2024 黑客松"
                  value={compName}
                  onChange={e => setCompName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">急徵角色</label>
                <select 
                  className="w-full border-gray-300 rounded-lg focus:ring-orange-500"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option>前端工程師</option>
                  <option>後端工程師</option>
                  <option>UI/UX 設計師</option>
                  <option>行銷企劃</option>
                  <option>專案經理 (PM)</option>
                  <option>多媒體/影音製作</option>
                  <option>領域專家 (Domain Expert)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">需求描述與隊伍現況</label>
              <textarea 
                required
                className="w-full border-gray-300 rounded-lg focus:ring-orange-500 h-24"
                placeholder="介紹一下你們的題目方向，以及希望新隊友具備什麼能力..."
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">技術關鍵字 (逗號分隔)</label>
              <input 
                type="text" 
                className="w-full border-gray-300 rounded-lg focus:ring-orange-500"
                placeholder="React, Python, 簡報高手..."
                value={tags}
                onChange={e => setTags(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                取消
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600"
              >
                確認發布
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition flex flex-col relative group">
            
            {/* Delete Button (Only for author) */}
            {currentUser?.id === post.authorId && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePost(post.id);
                }}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition z-10"
                title="刪除貼文"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            )}

            <div className="mb-4">
              <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-md mb-2">
                徵：{post.roleNeeded}
              </span>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {post.competitionName}
              </h3>
            </div>
            
            <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-4">
              {post.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Author & Action */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div 
                className="flex items-center cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg -ml-1.5 transition group/author"
                onClick={() => onViewProfile(post.authorId)}
                title="點擊查看詳細檔案"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold group-hover/author:ring-2 ring-indigo-300">
                  {post.authorName[0]}
                </div>
                <div className="ml-2">
                  <p className="text-sm font-bold text-gray-800 group-hover/author:text-indigo-600 transition">{post.authorName}</p>
                  <p className="text-xs text-gray-500">{post.authorDept || 'CCU 學生'}</p>
                </div>
              </div>
              <button 
                onClick={(e) => handleContact(e, post)}
                className="text-orange-600 hover:bg-orange-50 p-2 rounded-full transition"
                title="聯絡隊長"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {posts.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p>目前還沒有人發布需求，成為第一個發起人吧！</p>
        </div>
      )}
    </div>
  );
};

export default TeamMatching;
