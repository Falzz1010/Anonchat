import React, { useState } from 'react';
import { MessageSquare, Sun, Moon, Search, TrendingUp, Activity } from 'lucide-react';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import PopularTags from './components/PopularTags';
import { useTheme } from './contexts/ThemeContext';
import { MessageProvider } from './contexts/MessageContext';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Monitoring from './pages/Monitoring';

function App() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [selectedTag, setSelectedTag] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/" element={
          <MessageProvider>
            <div className={`min-h-screen ${darkMode ? 'dark bg-[#1a1a1a]' : 'bg-[#ffde59]'}`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                
                {/* Update the Monitoring Link */}
                <div className="flex justify-end mb-4">
                  <Link
                    to="/monitoring"
                    className="brutal-button p-2"
                    title="System Monitoring"
                  >
                    <Activity className="w-5 h-5" />
                  </Link>
                </div>
                
                <div className="flex gap-8 py-8 relative">
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

                  {/* Main Content */}
                  <div className="flex-1">
                    {/* Message Input - Moved to top */}
                    <MessageInput darkMode={darkMode} />

                    {/* Search Bar */}
                    <div className="my-8">
                      <div className={`flex items-center gap-3 p-4 ${
                        darkMode ? 'bg-[#2a2a2a]' : 'bg-white'
                      } border-4 border-black shadow-brutal rounded-xl`}>
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
                    />
                  </div>
                </div>

                <Footer darkMode={darkMode} />
              </div>
            </div>
          </MessageProvider>
        } />
      </Routes>
    </Router>
  );
}

export default App;







