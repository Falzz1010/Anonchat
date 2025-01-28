import React from 'react';
import { Hash, TrendingUp } from 'lucide-react';
import { useMessage } from '../contexts/MessageContext';

interface SidebarProps {
  selectedTag: string;
  onTagSelect: (tag: string) => void;
  darkMode: boolean;
  onClose: () => void;
}

function Sidebar({ selectedTag, onTagSelect, darkMode, onClose }: SidebarProps) {
  const { popularTags } = useMessage();
  
  // Calculate total message count
  const totalMessages = popularTags.reduce((sum, tag) => sum + tag.count, 0);

  return (
    <div
      className={`p-8 ${
        darkMode ? 'bg-[#2a2a2a] text-white' : 'bg-white'
      } border-4 border-black shadow-brutal rounded-xl w-full`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Popular Tags
        </h2>
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Close sidebar"
        >
          <span className="text-xl">✕</span>
        </button>
      </div>
      
      <button 
        onClick={() => onTagSelect('')}
        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between mb-4
          ${!selectedTag 
            ? 'bg-[#ff5757] text-white font-bold translate-x-1 translate-y-1' 
            : `hover:bg-gray-100 hover:translate-x-1 ${darkMode ? 'hover:bg-[#3a3a3a]' : ''}`
          }`}
      >
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4" />
          <span>Show All Messages</span>
        </div>
        <span className={`text-sm px-2 py-1 rounded-full ${
          !selectedTag 
            ? 'bg-white text-[#ff5757]' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {totalMessages}
        </span>
      </button>
      
      {popularTags.length > 0 ? (
        <div className="space-y-2">
          {popularTags.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => onTagSelect(tag)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between
                ${
                  selectedTag === tag
                    ? 'bg-[#ff5757] text-white font-bold translate-x-1 translate-y-1'
                    : `hover:bg-gray-100 hover:translate-x-1 ${darkMode ? 'hover:bg-[#3a3a3a]' : ''}`
                }`}
            >
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                <span>{tag}</span>
              </div>
              <span className={`text-sm px-2 py-1 rounded-full ${
                selectedTag === tag 
                  ? 'bg-white text-[#ff5757]' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <p>No tags available yet</p>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
