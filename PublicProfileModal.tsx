
import React from 'react';
import { User } from '../types';

interface Props {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const PublicProfileModal: React.FC<Props> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="relative">
          <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
              <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600">
                {user.name[0]}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-indigo-600 font-medium">{user.department || 'CCU 學生'}</p>
          
          <div className="mt-6 text-left space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">關於我</h3>
              <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                {user.bio || '這位同學很神秘，還沒寫自我介紹。'}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">技能專長</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills && user.skills.length > 0 ? (
                  user.skills.map((skill, idx) => (
                    <span key={idx} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-100">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-xs">暫無標籤</span>
                )}
              </div>
            </div>

            {user.portfolioUrl && (
              <div className="pt-4">
                <a 
                  href={user.portfolioUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  查看個人作品集
                </a>
              </div>
            )}
            
            <button 
              onClick={() => {
                 window.location.href = `mailto:${user.email}?subject=來自中正競賽智匯通的合作邀請`;
              }}
              className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
            >
              發送 Email 聯絡
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfileModal;
