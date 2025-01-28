import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function Header() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className={`py-8 ${darkMode ? 'text-white' : 'text-black'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            {/* Logo container */}
            <div className="w-14 h-14 bg-[#ff5757] border-4 border-black shadow-brutal rounded-xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
              <img 
                src="/logo.png" 
                alt="Chat Anonim Logo" 
                className="w-8 h-8"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  const icon = document.createElement('div');
                  icon.innerHTML = '<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
                  e.currentTarget.parentElement?.appendChild(icon.firstChild as Node);
                }}
              />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black">Chat Anonim</h1>
            <p className="text-sm opacity-70">Ekspresikan dirimu dengan bebas, tetap anonim</p>
          </div>
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-2 bg-gray-100 dark:bg-brutal-dark text-gray-700 dark:text-gray-300 rounded-md border-2 border-black dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}

export default Header;
