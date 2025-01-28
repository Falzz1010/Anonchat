import React, { useState, useEffect } from 'react';
import { Activity, Users, MessageSquare, TrendingUp, Clock, ArrowLeft, Info, X, LayoutGrid, List } from 'lucide-react';
import { useMessage } from '../contexts/MessageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';


function Monitoring() {
  const { darkMode } = useTheme();
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalUsers: 0,
    totalTags: 0,
    messagesPerHour: '0'
  });
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Fetch and update all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add minimum loading time of 1 second
      const startTime = Date.now();
      
      const { data: allMessages, error: supabaseError } = await supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: false });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (allMessages) {
        // Calculate total messages
        const totalMessages = allMessages.length;

        // Calculate unique users (based on username)
        const uniqueUsers = new Set(allMessages.map(msg => msg.username));
        const totalUsers = uniqueUsers.size;

        // Calculate unique tags (flatten all tags arrays and get unique values)
        const allTags = allMessages.flatMap(msg => msg.tags || []);
        const uniqueTags = new Set(allTags.filter(tag => tag)); // Filter out null/empty tags
        const totalTags = uniqueTags.size;
        
        // Calculate messages per hour (last 24 hours)
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recent24h = allMessages.filter(msg => 
          new Date(msg.timestamp) > last24Hours
        );
        const messagesPerHour = (recent24h.length / 24).toFixed(1);

        // Ensure minimum loading time of 1 second
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 1000) {
          await new Promise(resolve => setTimeout(resolve, 1000 - elapsedTime));
        }

        // Update stats
        setStats({
          totalMessages,
          totalUsers,
          totalTags,
          messagesPerHour
        });

        // Update recent messages
        setRecentMessages(allMessages.slice(0, 5));
      } else {
        setStats({
          totalMessages: 0,
          totalUsers: 0,
          totalTags: 0,
          messagesPerHour: '0'
        });
        setRecentMessages([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up Supabase real-time subscription
    const subscription = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        async () => {
          // Fetch updated data when changes occur
          await fetchData();
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const statCards = [
    {
      label: 'Total Messages',
      value: stats.totalMessages,
      icon: MessageSquare,
      color: 'text-blue-500'
    },
    {
      label: 'Active Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-green-500'
    },
    {
      label: 'Unique Tags',
      value: stats.totalTags,
      icon: TrendingUp,
      color: 'text-purple-500'
    },
    {
      label: 'Messages/Hour',
      value: stats.messagesPerHour,
      icon: Clock,
      color: 'text-orange-500'
    }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-[#1a1a1a]' : 'bg-[#ffde59]'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/"
            className="brutal-button inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Chat
          </Link>

          <button
            onClick={() => setShowAboutModal(true)}
            className="brutal-button inline-flex items-center gap-2"
          >
            <Info className="w-5 h-5" />
            About
          </button>
        </div>

        <div className="mb-8">
          <h1 className={`text-4xl font-bold flex items-center gap-3 ${darkMode ? 'text-white' : 'text-black'}`}>
            <Activity className="w-10 h-10 text-[#ff5757]" />
            System Monitoring
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time statistics and system performance metrics
            <span className="ml-2 text-sm text-[#ff5757]">(Live updates)</span>
          </p>
        </div>

        {error && (
          <div className="mb-8 brutal-card bg-red-100 dark:bg-red-900">
            <p className="text-red-700 dark:text-red-100">
              Error: {error}
            </p>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex justify-end mb-6">
          <div className="brutal-card inline-flex p-1 gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`brutal-button p-2 ${
                viewMode === 'grid' 
                  ? 'bg-[#ff5757] text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`brutal-button p-2 ${
                viewMode === 'list' 
                  ? 'bg-[#ff5757] text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              aria-label="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Display */}
        {viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="brutal-card animate-pulse">
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))
            ) : (
              statCards.map((stat) => (
                <div key={stat.label} className="brutal-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                      <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                        {stat.value}
                      </p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {loading ? (
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="animate-pulse flex items-start gap-4 p-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  </div>
                </div>
              ))
            ) : (
              statCards.map((stat) => (
                <div key={stat.label} className="brutal-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                          {stat.value}
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Last updated: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Activity Timeline */}
        <div className="mt-12">
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
            Recent Activity
          </h2>
          <div className="brutal-card">
            {loading ? (
              // Loading skeleton for recent messages
              <div className="space-y-4">
                {Array(3).fill(0).map((_, index) => (
                  <div key={index} className="animate-pulse flex items-start gap-4 p-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex items-start gap-4 p-4 rounded-lg ${
                      darkMode ? 'bg-brutal-dark' : 'bg-gray-50'
                    }`}
                  >
                    <div className="w-2 h-2 mt-2 rounded-full bg-[#ff5757]" />
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-black'}`}>
                        {message.username}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
                      <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {message.content.slice(0, 100)}
                        {message.content.length > 100 && '...'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* About Modal */}
        {showAboutModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className={`brutal-card max-w-lg w-full mx-4 sm:mx-auto relative ${darkMode ? 'bg-[#2a2a2a]' : 'bg-white'}`}>
              {/* Close button */}
              <button
                onClick={() => setShowAboutModal(false)}
                className="brutal-button p-1.5 sm:p-2 absolute top-4 right-4"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Modal Content */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff5757]" />
                  <h2 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                    About Chat Anonim
                  </h2>
                </div>

                {/* Description */}
                <div className={`text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p className="leading-relaxed">
                    Chat Anonim adalah platform chat anonim yang memungkinkan pengguna untuk berkomunikasi 
                    secara bebas tanpa perlu mengungkapkan identitas mereka.
                  </p>
                </div>

                {/* Features Section */}
                <div className="border-t-2 border-black/10 dark:border-white/10 pt-4">
                  <h3 className={`text-base sm:text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-black'}`}>
                    Fitur Utama:
                  </h3>
                  <ul className="list-disc list-inside space-y-1.5 text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}">
                    <li>Chat anonim tanpa registrasi</li>
                    <li>Sistem tag untuk kategorisasi pesan</li>
                    <li>Dukungan emoji dan reaksi</li>
                    <li>Mode gelap/terang</li>
                    <li>Real-time updates</li>
                  </ul>
                </div>

                {/* Creator Section */}
                <div className="border-t-2 border-black/10 dark:border-white/10 pt-4">
                  <h3 className={`text-base sm:text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-black'}`}>
                    Dibuat Oleh:
                  </h3>
                  <div className={`p-3 sm:p-4 brutal-card inline-block ${darkMode ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}>
                     <p className={`font-bold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-black'}`}>Naufal Rizky</p>
                    <p className={`text-xs sm:text-sm opacity-75 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Front End Developer</p>
                  </div>
                </div>

                {/* Technologies Section */}
                <div className="border-t-2 border-black/10 dark:border-white/10 pt-4">
                  <h3 className={`text-base sm:text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-black'}`}>
                    Teknologi:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Tailwind CSS', 'Supabase'].map((tech) => (
                      <span 
                        key={tech} 
                        className="brutal-button text-xs sm:text-sm py-1.5 px-3"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Monitoring;

