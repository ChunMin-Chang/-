
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { login, register, updateUserProfile } from '../authService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
}

type Mode = 'login' | 'register' | 'profile';

const UserModal: React.FC<Props> = ({ isOpen, onClose, currentUser, onLoginSuccess, onLogout }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  
  // Profile Edit States
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [portfolio, setPortfolio] = useState('');

  useEffect(() => {
    if (currentUser) {
      setMode('profile');
      setBio(currentUser.bio || '');
      setSkills(currentUser.skills.join(', ') || '');
      setPortfolio(currentUser.portfolioUrl || '');
    } else {
      setMode('login');
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const user = await login(email);
        onLoginSuccess(user);
        onClose();
      } else if (mode === 'register') {
        const user = await register(name, email, department);
        onLoginSuccess(user);
        onClose();
      } else if (mode === 'profile' && currentUser) {
        const updatedUser = {
          ...currentUser,
          bio,
          skills: skills.split(',').map(s => s.trim()).filter(s => s !== ''),
          portfolioUrl: portfolio
        };
        const savedUser = await updateUserProfile(updatedUser);
        onLoginSuccess(savedUser); // Update app state
        alert('個人資料已更新！');
      }
    } catch (err: any) {
      setError(err.message || '發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'login' && '歡迎回來'}
              {mode === 'register' && '加入競賽夥伴'}
              {mode === 'profile' && '我的個人檔案'}
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              {mode === 'login' && '登入以尋找隊友或收藏競賽'}
              {mode === 'register' && '建立帳號，開始你的奪獎之旅'}
              {mode === 'profile' && '完善資料讓更多人認識你'}
            </p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Login & Register Fields */}
            {(mode === 'login' || mode === 'register') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            )}

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名 / 暱稱</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">系級 (如：資工三)</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Profile Edit Fields */}
            {mode === 'profile' && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg mb-4 text-center">
                   <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-2">
                     {currentUser?.name[0]}
                   </div>
                   <h3 className="font-bold">{currentUser?.name}</h3>
                   <p className="text-xs text-gray-500">{currentUser?.department}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">自我介紹 (Bio)</label>
                  <textarea 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-24"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="簡單介紹你的專長與經歷..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">技能標籤 (用逗號分隔)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={skills}
                    onChange={e => setSkills(e.target.value)}
                    placeholder="Python, 平面設計, 影片剪輯..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">作品集連結 (Portfolio URL)</label>
                  <input 
                    type="url" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={portfolio}
                    onChange={e => setPortfolio(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? '處理中...' : (mode === 'login' ? '登入' : mode === 'register' ? '註冊帳號' : '儲存修改')}
            </button>

            {mode === 'profile' && (
               <button 
                 type="button"
                 onClick={() => { onLogout(); onClose(); }}
                 className="w-full mt-2 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
               >
                 登出
               </button>
            )}
          </form>

          {/* Switch Mode Links */}
          <div className="mt-6 text-center text-sm">
            {mode === 'login' && (
              <p className="text-gray-600">
                還沒有帳號？ <button onClick={() => setMode('register')} className="text-indigo-600 font-bold hover:underline">立即註冊</button>
              </p>
            )}
            {mode === 'register' && (
              <p className="text-gray-600">
                已經有帳號？ <button onClick={() => setMode('login')} className="text-indigo-600 font-bold hover:underline">直接登入</button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
