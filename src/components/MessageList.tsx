import React, { useState, useEffect } from 'react';
import { ThumbsUp, MessageCircle, Flag, Clock } from 'lucide-react';
import { useMessage } from '../contexts/MessageContext';
import MessageCard from './MessageCard';
import LoadingMessage from './LoadingMessage';
import Skeleton from './Skeleton';

interface Message {
  id: string;
  content: string;
  username: string;
  timestamp: string;
  tags: string[];
  likes: number;
  replies: number;
}

interface MessageListProps {
  darkMode: boolean;
  searchQuery: string;
  selectedTag: string;
}

function MessageList({ darkMode, searchQuery, selectedTag }: MessageListProps) {
  const { messages, isLoading } = useMessage();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 5; // Number of messages to show per page
  
  const filteredMessages = messages
    .filter(message => {
      const matchesSearch = message.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag ? message.tags.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Calculate pagination
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((index) => (
          <Skeleton key={index} darkMode={darkMode} />
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff5757]"></div>
      </div>
    );
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {filteredMessages.length === 0 ? (
        <div className={`text-center py-12 ${darkMode ? 'text-white' : 'text-black'}`}>
          <p className="text-lg">No messages found</p>
          {selectedTag && (
            <p className="text-sm opacity-70 mt-2">
              Try removing the tag filter or search query
            </p>
          )}
        </div>
      ) : (
        <>
          {currentMessages.map((message) => (
            <MessageCard key={message.id} message={message} />
          ))}
          
          {/* Enhanced Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
              {/* Mobile Page Indicator */}
              <div className="sm:hidden flex items-center gap-3">
                <select
                  value={currentPage}
                  onChange={(e) => handlePageChange(Number(e.target.value))}
                  className={`px-4 py-2 border-2 border-black rounded-xl font-bold appearance-none 
                    ${darkMode ? 'bg-[#2a2a2a] text-white' : 'bg-white'} 
                    shadow-brutal min-w-[120px] text-center`}
                  style={{ backgroundPosition: "right 0.75rem center" }}
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                    <option key={pageNumber} value={pageNumber}>
                      Page {pageNumber} of {totalPages}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 border-2 border-black rounded-xl font-bold transition-all duration-200 
                    ${darkMode ? 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]' : 'bg-white hover:bg-gray-50'} 
                    ${currentPage === 1 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px]'}`}
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">←</span>
                </button>
                
                {/* Desktop Page Numbers */}
                <div className="hidden sm:flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                    // Always show first and last page
                    const isFirstPage = pageNumber === 1;
                    const isLastPage = pageNumber === totalPages;
                    // Show pages around current page
                    const isNearCurrentPage = Math.abs(pageNumber - currentPage) <= 1;
                    // Show ellipsis
                    const showEllipsisBefore = pageNumber === currentPage - 2;
                    const showEllipsisAfter = pageNumber === currentPage + 2;

                    if (!isFirstPage && !isLastPage && !isNearCurrentPage) {
                      if (showEllipsisBefore || showEllipsisAfter) {
                        return (
                          <span 
                            key={`dots-${pageNumber}`} 
                            className={`px-2 font-bold ${darkMode ? 'text-white' : 'text-black'}`}
                          >
                            •••
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`w-10 h-10 border-2 border-black rounded-xl font-bold transition-all duration-200 
                          ${pageNumber === currentPage 
                            ? 'bg-[#ff5757] text-white transform scale-110 shadow-brutal-active' 
                            : `${darkMode ? 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]' : 'bg-white hover:bg-gray-50'} 
                              shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px]`
                          }`}
                        aria-current={pageNumber === currentPage ? 'page' : undefined}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>
                
                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 border-2 border-black rounded-xl font-bold transition-all duration-200 
                    ${darkMode ? 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]' : 'bg-white hover:bg-gray-50'} 
                    ${currentPage === totalPages 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px]'}`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">→</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MessageList;






