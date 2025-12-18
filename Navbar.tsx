
import React from 'react';
import { User } from '../types';

interface Props {
  currentView: 'home' | 'favorites' | 'teammates';
  onNavigate: (view: 'home' | 'favorites' | 'teammates') => void;
  favoritesCount: number;
  currentUser: User | null;
  onOpenUserModal: () => void;
}

const Navbar: React.FC<Props> = ({ currentView, onNavigate, favoritesCount, currentUser, onOpenUserModal }) => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => onNavigate('home')}
          >
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              中正競賽智匯通
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
            <button 
              onClick={() => onNavigate('home')}
              className={`transition ${currentView === 'home' ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'}`}
            >
              首頁
            </button>
            <button 
              onClick={() => onNavigate('favorites')}
              className={`transition flex items-center ${currentView === 'favorites' ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'}`}
            >
              我的收藏
              {favoritesCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => onNavigate('teammates')}
              className={`transition flex items-center ${currentView === 'teammates' ? 'text-orange-500 font-bold' : 'hover:text-orange-500'}`}
            >
              隊友媒合
              <span className="ml-1.5 bg-orange-100 text-orange-600 text-xs px-1.5 py-0.5 rounded">NEW</span>
            </button>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
             <span className="hidden sm:inline text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">CCU Only</span>
             
             {currentUser ? (
               <button 
                 onClick={onOpenUserModal}
                 className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded-lg transition"
               >
                 <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                   {currentUser.name[0]}
                 </div>
                 <span className="hidden md:block text-sm font-medium text-gray-700">{currentUser.name}</span>
               </button>
             ) : (
               <button 
                 onClick={onOpenUserModal}
                 className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition"
               >
                 登入/註冊
               </button>
             )}
          </div>
        </div>
      </div>
      
      {/* Mobile Tab Bar (Optional simplification) */}
      <div className="md:hidden flex justify-around border-t border-gray-100 bg-white py-2 text-xs text-gray-500">
        <button onClick={() => onNavigate('home')} className={currentView === 'home' ? 'text-indigo-600 font-bold' : ''}>首頁</button>
        <button onClick={() => onNavigate('favorites')} className={currentView === 'favorites' ? 'text-indigo-600 font-bold' : ''}>收藏 ({favoritesCount})</button>
        <button onClick={() => onNavigate('teammates')} className={currentView === 'teammates' ? 'text-orange-600 font-bold' : ''}>找隊友</button>
      </div>
    </nav>
  );
};

export default Navbar;
