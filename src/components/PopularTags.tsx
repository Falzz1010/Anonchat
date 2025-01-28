import React from 'react';
import { useMessage } from '../contexts/MessageContext';
import { Hash } from 'lucide-react';

function PopularTags() {
  const { popularTags, selectedTag, setSelectedTag } = useMessage();

  if (popularTags.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
        <Hash className="w-5 h-5" />
        Popular Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {popularTags.map(({ tag, count }) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
            className={`px-3 py-1 text-sm rounded-md border-2 border-black dark:border-gray-700 transition-colors flex items-center gap-1
              ${selectedTag === tag 
                ? 'bg-brutal-pink text-white' 
                : 'bg-gray-100 dark:bg-brutal-dark text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
          >
            <span>{tag}</span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              selectedTag === tag 
                ? 'bg-white/20' 
                : 'bg-gray-200 dark:bg-brutal-gray'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default PopularTags;


