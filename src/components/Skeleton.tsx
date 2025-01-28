import React from 'react';

interface SkeletonProps {
  darkMode: boolean;
}

function Skeleton({ darkMode }: SkeletonProps) {
  return (
    <div
      className={`card-brutal ${
        darkMode ? 'bg-[#2a2a2a]' : 'bg-white'
      } rounded-xl animate-pulse`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className={`h-6 w-32 ${darkMode ? 'bg-[#3a3a3a]' : 'bg-gray-200'} rounded-lg mb-2`}></div>
          <div className={`h-4 w-24 ${darkMode ? 'bg-[#3a3a3a]' : 'bg-gray-200'} rounded-lg`}></div>
        </div>
        <div className={`h-8 w-8 ${darkMode ? 'bg-[#3a3a3a]' : 'bg-gray-200'} rounded-lg`}></div>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className={`h-4 w-full ${darkMode ? 'bg-[#3a3a3a]' : 'bg-gray-200'} rounded-lg`}></div>
        <div className={`h-4 w-3/4 ${darkMode ? 'bg-[#3a3a3a]' : 'bg-gray-200'} rounded-lg`}></div>
      </div>
      
      <div className="flex gap-2 mb-6">
        <div className={`h-6 w-20 ${darkMode ? 'bg-[#3a3a3a]' : 'bg-gray-200'} rounded-full`}></div>
        <div className={`h-6 w-20 ${darkMode ? 'bg-[#3a3a3a]' : 'bg-gray-200'} rounded-full`}></div>
      </div>
      
      <div className="flex gap-6">
        <div className={`h-6 w-16 ${darkMode ? 'bg-[#3a3a3a]' : 'bg-gray-200'} rounded-lg`}></div>
        <div className={`h-6 w-16 ${darkMode ? 'bg-[#3a3a3a]' : 'bg-gray-200'} rounded-lg`}></div>
      </div>
    </div>
  );
}

export default Skeleton;
