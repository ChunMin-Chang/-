
import React from 'react';
import { Competition } from '../types';

interface Props {
  competition: Competition;
  onClick: (comp: Competition) => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

const CompetitionCard: React.FC<Props> = ({ competition, onClick, isFavorite, onToggleFavorite }) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case '資訊科技': return 'bg-blue-100 text-blue-800';
      case '商業競賽': return 'bg-green-100 text-green-800';
      case '藝術設計': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer flex flex-col group relative"
      onClick={() => onClick(competition)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={competition.imageUrl} 
          alt={competition.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getCategoryColor(competition.category)}`}>
            {competition.category}
          </span>
        </div>
        {/* Favorite Button */}
        <button 
          onClick={(e) => onToggleFavorite(e, competition.id)}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm z-10 group-hover:scale-110 duration-200"
        >
          <svg 
            className={`w-5 h-5 transition-colors ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
          {competition.name}
        </h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {competition.organizer}
        </p>
        
        <div className="mt-auto space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-indigo-600">{competition.prize}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{competition.location}</span>
          </div>
          <div className="flex items-center text-sm text-red-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-semibold">截止：{competition.deadline}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionCard;
