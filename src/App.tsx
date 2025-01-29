import React, { useState } from 'react';
import { MessageSquare, Sun, Moon, Search, TrendingUp, Activity, Clock, History } from 'lucide-react';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import PopularTags from './components/PopularTags';
import { useTheme } from './contexts/ThemeContext';
import { MessageProvider } from './contexts/MessageContext';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Monitoring from './pages/monitoring';
import CursorTrail from './components/CursorTrail';

type SortOption = 'popular' | 'newest' | 'oldest';

function App() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [selectedTag, setSelectedTag] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/" element={
          <MessageProvider>
            <div className={`min-h-screen overflow-x-hidden ${darkMode ? 'dark bg-[#1a1a1a]' : 'bg-[#ffde59]'}`}>
              {darkMode && <CursorTrail />}
              <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 w-full">
                <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                
                {/* Move monitoring button below header */}
                <div className="flex items-center gap-2 mb-4">
                  <Link
                    to="/monitoring"
                    className="brutal-button p-2"
                    title="System Monitoring"
                  >
                    <Activity className="w-5 h-5" />
                  </Link>
                </div>

                <div className="flex gap-4 sm:gap-8 py-8 relative w-full overflow-x-hidden">
                  {/* Sidebar - Update positioning and width */}
                  <div className={`
                    ${showSidebar ? 'block' : 'hidden'} 
                    lg:block 
                    fixed lg:static 
                    inset-0 lg:inset-auto 
                    z-50 lg:z-0 
                    lg:w-80
                    w-full h-full lg:h-auto
                    p-4 lg:p-0
                    bg-black/50 lg:bg-transparent
                  `}>
                    <div className="
                      w-[90%] lg:w-full 
                      max-w-sm 
                      mx-auto lg:mx-0
                      h-auto 
                      relative
                    ">
                      <Sidebar 
                        selectedTag={selectedTag} 
                        onTagSelect={(tag) => {
                          setSelectedTag(tag);
                          setShowSidebar(false);
                        }}
                        darkMode={darkMode}
                        onClose={() => setShowSidebar(false)}
                      />
                    </div>
                  </div>

                  
                 <div className="flex-1 w-full overflow-x-hidden">
                    <MessageInput darkMode={darkMode} />

                    {/* Search Bar */}
                   <div className="my-8 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] overflow-x-hidden">
                      <div className={`flex flex-col sm:flex-row items-center gap-3 p-4 ${
                        darkMode ? 'bg-[#2a2a2a]' : 'bg-white'
                       } border-4 border-black shadow-brutal rounded-xl w-full`}>
                        {/* Search Section */}
                        <div className="flex items-center gap-3 flex-1 w-full">
                          <Search className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-black'}`} />
                          <input
                            type="text"
                            placeholder="Cari pesan..."
                            className={`w-full bg-transparent focus:outline-none text-lg ${
                              darkMode ? 'placeholder-gray-500 text-white' : 'placeholder-gray-400 text-black'
                            }`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>

                        {/* Divider */}
                        <div className={`hidden sm:block h-8 w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>

                        {/* Sort Controls */}
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Urutkan:</span>
                          <div className="flex gap-1 flex-1 sm:flex-initial">
                            <button
                              onClick={() => setSortBy('popular')}
                              className={`flex-1 sm:flex-initial brutal-button px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 text-sm ${
                                sortBy === 'popular'
                                  ? 'bg-[#ff5757] text-white'
                                  : darkMode ? 'text-white hover:bg-gray-800' : 'hover:bg-gray-100'
                              }`}
                            >
                              <TrendingUp className="w-4 h-4" />
                              <span className="hidden sm:inline">Populer</span>
                            </button>
                            <button
                              onClick={() => setSortBy('newest')}
                              className={`flex-1 sm:flex-initial brutal-button px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 text-sm ${
                                sortBy === 'newest'
                                  ? 'bg-[#ff5757] text-white'
                                  : darkMode ? 'text-white hover:bg-gray-800' : 'hover:bg-gray-100'
                              }`}
                            >
                              <Clock className="w-4 h-4" />
                              <span className="hidden sm:inline">Terbaru</span>
                            </button>
                            <button
                              onClick={() => setSortBy('oldest')}
                              className={`flex-1 sm:flex-initial brutal-button px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 text-sm ${
                                sortBy === 'oldest'
                                  ? 'bg-[#ff5757] text-white'
                                  : darkMode ? 'text-white hover:bg-gray-800' : 'hover:bg-gray-100'
                              }`}
                            >
                              <History className="w-4 h-4" />
                              <span className="hidden sm:inline">Terlama</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Update Toggle Button styling */}
                    <div className="lg:hidden mb-4">
                      <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className={`
                          brutal-button 
                          px-4 py-2 
                          ${darkMode ? 'bg-[#2a2a2a] text-white' : 'bg-white'}
                          border-4 border-black 
                          shadow-brutal 
                          rounded-xl
                          hover:translate-x-1 
                          hover:translate-y-1 
                          transition-transform
                          flex items-center gap-2
                        `}
                      >
                        <TrendingUp className="w-5 h-5" />
                        {showSidebar ? 'Sembunyikan Tag' : 'Tampilkan Tag'}
                      </button>
                    </div>

                    {/* Messages List */}
                    <MessageList 
                      darkMode={darkMode} 
                      searchQuery={searchQuery} 
                      selectedTag={selectedTag} 
                      sortBy={sortBy}
                    />
                  </div>
                </div>

                <Footer darkMode={darkMode} />
              </div>
            </div>
          </MessageProvider>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;







