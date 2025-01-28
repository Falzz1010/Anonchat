import React, { useState } from 'react';
import { Send, Hash, MessageSquare } from 'lucide-react';
import { useMessage } from '../contexts/MessageContext';
import EmojiPicker from './EmojiPicker';
import { censorBadWords, containsBadWords } from '../utils/profanityFilter';
import { useToast } from '../contexts/ToastContext';

interface MessageInputProps {
  darkMode: boolean;
  parentId?: string | null;
}

function MessageInput({ darkMode, parentId = null }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addMessage, replyToMessage } = useMessage();
  const { showToast } = useToast();
  const maxLength = 500;

  const validateTags = (tags: string): boolean => {
    const invalidChars = /[!@#$%^&*(),.?":{}|<>\/\\;'\[\]]/;
    const tagsArray = tags.split(',').map(tag => tag.trim());
    
    for (const tag of tagsArray) {
      if (tag && invalidChars.test(tag)) {
        showToast('Tags should only contain letters, numbers, and hyphens', 'warning');
        return false;
      }
      
      // Remove any # if user manually types it
      if (tag.includes('#')) {
        showToast('No need to add # symbol, it will be added automatically', 'info');
        return false;
      }
    }
    
    return true;
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove any # symbols as they type
    const cleanedValue = value.replace(/#/g, '');
    setTags(cleanedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length === 0) return;
    if (message.length > maxLength) return;
    if (isSubmitting) return;
    
    // Validate tags before submitting
    if (tags && !validateTags(tags)) return;

    try {
      setIsSubmitting(true);
      
      const processedTags = tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);

      const newMessage = {
        content: censorBadWords(message.trim()), // Sensor kata kasar
        username: localStorage.getItem('anonymousUserId') || `anon-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        tags: processedTags,
        reactions: [],
        likes: 0,
        replies: 0,
        liked_by: []
      };

      if (parentId) {
        await replyToMessage(parentId, newMessage);
      } else {
        await addMessage(newMessage);
      }

      // Clear form after successful submission
      setMessage('');
      setTags('');
    } catch (error) {
      console.error('Failed to send message:', error);
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(message + emoji);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="mt-8 scroll-smooth"
      autoComplete="off"
    >
      <div
        className={`p-8 ${
          darkMode ? 'bg-[#2a2a2a] text-white' : 'bg-white'
        } border-4 border-black shadow-brutal rounded-xl`}
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Pesan Baru
        </h2>
        
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Tag
          </label>
          <input
            type="text"
            placeholder="Tambahkan tag (pisahkan dengan koma, hanya huruf dan angka)"
            className={`w-full px-4 py-2 ${
              darkMode ? 'bg-[#1a1a1a]' : 'bg-gray-100'
            } border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5757]`}
            value={tags}
            onChange={handleTagsChange}
            disabled={isSubmitting}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Pisahkan tag dengan koma. Tidak boleh menggunakan simbol.
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Pesan</label>
          <div className="relative">
            <textarea
              placeholder="Apa yang ingin kamu sampaikan?"
              className={`input-brutal ${
                darkMode ? 'bg-[#1a1a1a]' : 'bg-gray-100'
              } min-h-[120px] rounded-lg resize-none`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              autoComplete="off"
              maxLength={maxLength}
            />
            <div className="absolute bottom-2 right-2">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
          </div>
          <div className="mt-2 text-sm text-right">
            <span className={message.length > maxLength ? 'text-red-500' : 'opacity-70'}>
              {message.length}/{maxLength}
            </span>
          </div>
        </div>
        
        <button
          type="submit"
          className="btn-primary rounded-lg flex items-center gap-2 text-lg"
          disabled={!message.trim()}
        >
          <Send className="w-5 h-5" />
          <span>Kirim Pesan</span>
        </button>
      </div>
    </form>
  );
}

export default MessageInput;