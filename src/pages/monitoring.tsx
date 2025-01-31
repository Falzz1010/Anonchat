import React, { useState, useEffect } from 'react';
import { Activity, Users, MessageSquare, TrendingUp, Clock, ArrowLeft, Info, X, LayoutGrid, List, RefreshCw, Zap, MessageCircle, Users2, Hash } from 'lucide-react';
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
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshInterval, setRefreshInterval] = useState<number>(30);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showRefreshProgress, setShowRefreshProgress] = useState(false);
  const [advancedStats, setAdvancedStats] = useState({
    peakHour: '00:00',
    averageMessageLength: 0,
    topTags: [],
    userRetention: 0,
    activeUsers24h: 0,
    messageDistribution: {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    }
  });
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'messages' | 'users' | 'tags'>('messages');
  
  // Add time range options
  const timeRangeOptions = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
  ];

  // Modify fetchData to properly handle time ranges
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate time range
      const now = new Date();
      let startTime = new Date();
      switch (timeRange) {
        case '1h':
          startTime.setHours(startTime.getHours() - 1);
          break;
        case '7d':
          startTime.setDate(startTime.getDate() - 7);
          break;
        case '30d':
          startTime.setDate(startTime.getDate() - 30);
          break;
        default: // 24h
          startTime.setDate(startTime.getDate() - 1);
      }

      // Fetch messages within the selected time range
      const { data: allMessages, error: supabaseError } = await supabase
        .from('messages')
        .select('*')
        .gte('timestamp', startTime.toISOString())
        .order('timestamp', { ascending: false });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (allMessages) {
        // Calculate total messages
        const totalMessages = allMessages.length;

        // Calculate unique users
        const uniqueUsers = new Set(allMessages.map(msg => msg.username));
        const totalUsers = uniqueUsers.size;

        // Calculate unique tags
        const allTags = allMessages.flatMap(msg => msg.tags || []);
        const uniqueTags = new Set(allTags.filter(tag => tag));
        const totalTags = uniqueTags.size;
        
        // Calculate messages per hour based on the selected time range
        let messagesPerHour;
        const hoursDiff = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        messagesPerHour = (allMessages.length / hoursDiff).toFixed(1);

        // Update stats
        setStats({
          totalMessages,
          totalUsers,
          totalTags,
          messagesPerHour
        });

        // Update advanced stats
        setAdvancedStats(processAdvancedStats(allMessages));

        // Update time series data
        const timeData = allMessages.reduce((acc: any[], msg) => {
          const hour = new Date(msg.timestamp).getHours();
          const existing = acc.find(d => d.hour === hour);
          if (existing) existing.count++;
          else acc.push({ hour, count: 1 });
          return acc;
        }, []);
        
        setTimeSeriesData(timeData.sort((a, b) => a.hour - b.hour));

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

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Add effect to refetch data when timeRange changes
  useEffect(() => {
    fetchData();
  }, [timeRange]);

  // Add auto-refresh logic
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let refreshTimeout: NodeJS.Timeout;

    if (refreshInterval > 0) {
      refreshTimeout = setTimeout(() => {
        fetchData();
      }, refreshInterval * 1000);

      // Show progress bar
      setShowRefreshProgress(true);
      let progress = 0;
      progressInterval = setInterval(() => {
        progress += 1;
        const progressBar = document.getElementById('refresh-progress');
        if (progressBar) {
          progressBar.style.width = `${(progress / refreshInterval) * 100}%`;
        }
        if (progress >= refreshInterval) {
          setShowRefreshProgress(false);
        }
      }, 1000);
    }

    return () => {
      clearTimeout(refreshTimeout);
      clearInterval(progressInterval);
    };
  }, [refreshInterval, lastRefresh]);

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

  const processAdvancedStats = (messages: any[]) => {
    // Calculate message distribution by time of day
    const distribution = messages.reduce((acc, msg) => {
      const hour = new Date(msg.timestamp).getHours();
      if (hour >= 5 && hour < 12) acc.morning++;
      else if (hour >= 12 && hour < 17) acc.afternoon++;
      else if (hour >= 17 && hour < 22) acc.evening++;
      else acc.night++;
      return acc;
    }, { morning: 0, afternoon: 0, evening: 0, night: 0 });

    // Calculate peak hour
    const hourCounts = new Array(24).fill(0);
    messages.forEach(msg => {
      const hour = new Date(msg.timestamp).getHours();
      hourCounts[hour]++;
    });
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

    // Calculate average message length
    const avgLength = messages.reduce((acc, msg) => 
      acc + (msg.content?.length || 0), 0) / messages.length;

    // Get top tags
    const tagCount = messages.reduce((acc: {[key: string]: number}, msg) => {
      (msg.tags || []).forEach((tag: string) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {});
    
    const topTags = Object.entries(tagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);

    // Calculate user retention (users who sent multiple messages)
    const userMessageCounts = messages.reduce((acc: {[key: string]: number}, msg) => {
      acc[msg.username] = (acc[msg.username] || 0) + 1;
      return acc;
    }, {});
    
    const returningUsers = Object.values(userMessageCounts).filter(count => count > 1).length;
    const totalUsers = Object.keys(userMessageCounts).length;
    const retention = totalUsers ? (returningUsers / totalUsers) * 100 : 0;

    return {
      peakHour: `${peakHour.toString().padStart(2, '0')}:00`,
      averageMessageLength: Math.round(avgLength),
      topTags,
      userRetention: Math.round(retention),
      activeUsers24h: totalUsers,
      messageDistribution: distribution
    };
  };

  return (
    <div className={`min-h-screen overflow-x-hidden ${darkMode ? 'dark bg-[#1a1a1a]' : 'bg-[#ffde59]'}`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
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

        {/* Time Range Controls with responsive design */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Time Range Selector */}
          <div className="brutal-card p-2 w-full sm:w-auto">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Time Range:</div>
            <div className="grid grid-cols-2 sm:flex sm:inline-flex gap-1">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className={`brutal-button px-3 py-1.5 text-sm transition-colors w-full sm:w-auto ${
                    timeRange === option.value 
                      ? 'bg-[#ff5757] text-white hover:bg-[#ff4444]' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Refresh Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="brutal-button px-3 py-1.5 w-full sm:w-auto text-sm"
            >
              <option value="0">Manual Refresh</option>
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="300">5 minutes</option>
            </select>

            <button
              onClick={() => fetchData()}
              className="brutal-button inline-flex items-center justify-center gap-2 px-3 py-1.5 w-full sm:w-auto text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Now
            </button>
          </div>
        </div>

        {/* Add Refresh Progress Bar */}
        {showRefreshProgress && (
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 sm:mb-6 overflow-hidden">
            <div
              id="refresh-progress"
              className="h-full bg-[#ff5757] transition-all duration-1000 ease-linear"
              style={{ width: '0%' }}
            />
          </div>
        )}

        {/* Status Indicators with responsive spacing */}
        <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between mb-4 sm:mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing data for: {timeRangeOptions.find(opt => opt.value === timeRange)?.label}
          </div>
        </div>

        {/* Advanced Analytics Toggle - Moved here */}
        <div className="mb-6">
          <button
            onClick={() => setShowAdvancedStats(!showAdvancedStats)}
            className="brutal-button inline-flex items-center gap-2"
          >
            <Zap className={`w-5 h-5 ${showAdvancedStats ? 'text-[#ff5757]' : ''}`} />
            {showAdvancedStats ? 'Hide Advanced Analytics' : 'Show Advanced Analytics'}
          </button>
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

        {/* Advanced Analytics Section - Remove button from here */}
        {showAdvancedStats && (
          <div className="mt-12 space-y-6">
            {/* Message Distribution */}
            <div className="brutal-card">
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                darkMode ? 'text-white' : 'text-black'
              }`}>
                <MessageCircle className="w-5 h-5 text-[#ff5757]" />
                Message Distribution
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(advancedStats.messageDistribution).map(([time, count]) => (
                  <div key={time} className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {time}
                    </div>
                    <div className={`text-2xl font-bold ${
                      darkMode ? 'text-white' : 'text-black'
                    }`}>
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Engagement */}
            <div className="brutal-card">
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                darkMode ? 'text-white' : 'text-black'
              }`}>
                <Users2 className="w-5 h-5 text-[#ff5757]" />
                User Engagement
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    User Retention Rate
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-black'
                  }`}>
                    {advancedStats.userRetention}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active Users (24h)
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-black'
                  }`}>
                    {advancedStats.activeUsers24h}
                  </p>
                </div>
              </div>
            </div>

            {/* Trending Tags */}
            <div className="brutal-card">
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                darkMode ? 'text-white' : 'text-black'
              }`}>
                <Hash className="w-5 h-5 text-[#ff5757]" />
                Trending Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {advancedStats.topTags.map((tag) => (
                  <span
                    key={tag}
                    className="brutal-button bg-[#ff5757] text-white px-3 py-1.5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className={`brutal-card w-full max-w-lg relative ${darkMode ? 'bg-[#2a2a2a]' : 'bg-white'}`}>
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
                  <ul className={`list-disc list-inside space-y-1.5 text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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





