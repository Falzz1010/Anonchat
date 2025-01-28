import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useMessage } from '../contexts/MessageContext';
import { censorBadWords, containsBadWords } from '../utils/profanityFilter';
import { useToast } from '../contexts/ToastContext';

interface Message {
  id: string;
  content: string;
  username: string;
  timestamp: string;
  tags: string[];
  reactions: { emoji: string; count: number; }[];
  likes: number;
  parent_id?: string;
}

interface MessageCardProps {
  message: Message;
  isReply?: boolean;
}

function MessageCard({ message, isReply = false }: MessageCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const { addReply, replies = {}, userLikes, toggleLike } = useMessage();
  const { showToast } = useToast();

  const messageReplies = replies?.[message.id] ?? [];
  const isLiked = userLikes.includes(message.id);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || isReplying) return;

    // Cek kata kasar
    if (containsBadWords(replyContent)) {
      showToast('Balasan mengandung kata-kata tidak pantas. Pesan akan disensor.', 'warning');
    }

    try {
      setIsReplying(true);
      
      if (!addReply) {
        throw new Error('addReply function is not available');
      }
      
      await addReply({
        content: censorBadWords(replyContent.trim()), // Sensor kata kasar
        username: `Anonymous #${Math.floor(Math.random() * 10000)}`,
        parent_id: message.id,
        tags: [],
        reactions: [],
      });

      setReplyContent('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Failed to add reply:', error);
      // Add more detailed error information
      console.error('Context state:', { addReply, replies, userLikes, toggleLike });
    } finally {
      setIsReplying(false);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      await toggleLike(message.id);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
    if (!showReplies) {
      setShowReplyForm(false);
    }
  };

  return (
    <div className={`brutal-card ${isReply ? 'ml-8' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
            {message.username}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Content */}
      <p className="mb-4 text-gray-800 dark:text-gray-200">{message.content}</p>

      {/* Tags */}
      {message.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {message.tags.map((tag) => (
            <span key={tag} className="brutal-button text-sm">#{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-2 transition-colors ${
              isLiked ? 'text-[#ff5757]' : 'hover:text-[#ff5757] dark:text-white'
            }`}
          >
            <ThumbsUp className={`w-5 h-5 ${isLiking ? 'animate-pulse' : ''}`} />
            <span className="font-bold">{message.likes}</span>
          </button>
          {!isReply && messageReplies.length > 0 && (
            <button 
              onClick={toggleReplies}
              className="brutal-button flex items-center gap-1"
            >
              {showReplies ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              <span>{messageReplies.length} Replies</span>
            </button>
          )}
          {!isReply && (
            <button 
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="brutal-button flex items-center gap-1"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Reply</span>
            </button>
          )}
        </div>
      </div>

      {/* Reply Form */}
      {!isReply && showReplyForm && (
        <form onSubmit={handleReply} className="mt-4">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="brutal-input w-full mb-2"
            placeholder="Write your reply..."
            rows={2}
            disabled={isReplying}
          />
          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              onClick={() => setShowReplyForm(false)}
              className="brutal-button bg-gray-200"
              disabled={isReplying}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`brutal-button bg-brutal-blue text-white ${
                isReplying ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!replyContent.trim() || isReplying}
            >
              {isReplying ? 'Sending...' : 'Reply'}
            </button>
          </div>
        </form>
      )}

      {/* Replies */}
      {!isReply && showReplies && messageReplies.length > 0 && (
        <div className="mt-4 space-y-4">
          {messageReplies.map((reply) => (
            <MessageCard 
              key={reply.id} 
              message={reply} 
              isReply={true} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MessageCard;


