import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { useToast } from './ToastContext';

interface Message {
  id?: string;
  content: string;
  username: string;
  timestamp: string;
  tags: string[];
  reactions: any[];
  likes: number;
  replies: number;
  parent_id?: string | null;
  liked_by: string[];
}

interface TagCount {
  tag: string;
  count: number;
}

interface MessageContextType {
  messages: Message[];
  replies: { [key: string]: Message[] };
  userLikes: string[];
  isLoading: boolean;
  popularTags: TagCount[];
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  addMessage: (message: Omit<Message, 'id'>) => Promise<void>;
  replyToMessage: (parentId: string, message: Omit<Message, 'id'>) => Promise<void>;
  toggleLike: (messageId: string) => Promise<void>;
  addReply: (replyData: Partial<Message>) => Promise<void>;
}

const MessageContext = createContext<MessageContextType>({
  messages: [],
  replies: {},
  userLikes: [],
  isLoading: true,
  popularTags: [],
  selectedTag: '',
  setSelectedTag: () => {},
  addMessage: async () => {},
  replyToMessage: async () => {},
  toggleLike: async () => {},
  addReply: async () => {}
});

export const useMessage = () => useContext(MessageContext);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [replies, setReplies] = useState<{ [key: string]: Message[] }>({});
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [popularTags, setPopularTags] = useState<TagCount[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [processedEvents] = useState(new Set<string>());
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState<string>('');
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<number>(0);
  const RATE_LIMIT_DELAY = 3000; // 3 seconds between messages
  const { showToast } = useToast();

  // Generate a persistent anonymous user ID
  const getUserId = () => {
    let userId = localStorage.getItem('anonymousUserId');
    if (!userId) {
      userId = `anon-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('anonymousUserId', userId);
    }
    return userId;
  };

  const fetchPopularTags = async () => {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('tags')
        .not('tags', 'is', null);

      if (error) throw error;

      // Count tag occurrences
      const tagCounts: { [key: string]: number } = {};
      messages.forEach((message) => {
        if (Array.isArray(message.tags)) {
          message.tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      // Convert to array and sort by count
      const sortedTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Get top 10 tags

      setPopularTags(sortedTags);
    } catch (error) {
      console.error('Error fetching popular tags:', error);
    }
  };

  const handleRealtimeMessage = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    // Add check for already processed events
    if (processedEvents.has(newRecord?.id)) {
      return;
    }

    // Add the event to processed events
    if (newRecord?.id) {
      processedEvents.add(newRecord.id);
    }

    switch (eventType) {
      case 'INSERT':
        if (newRecord.parent_id) {
          // Handle new reply
          setReplies(prev => {
            // Check if reply already exists
            const existingReplies = prev[newRecord.parent_id] || [];
            if (existingReplies.some(reply => reply.id === newRecord.id)) {
              return prev;
            }
            return {
              ...prev,
              [newRecord.parent_id]: [
                ...existingReplies,
                newRecord
              ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            };
          });
        } else {
          // Handle new main message
          setMessages(prev => {
            // Check if message already exists
            if (prev.some(msg => msg.id === newRecord.id)) {
              return prev;
            }
            return [newRecord, ...prev].sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          });
        }
        break;

      case 'UPDATE':
        if (newRecord.parent_id) {
          // Update reply
          setReplies(prev => ({
            ...prev,
            [newRecord.parent_id]: prev[newRecord.parent_id]?.map(reply =>
              reply.id === newRecord.id ? { ...reply, ...newRecord } : reply
            ) || []
          }));
        } else {
          // Update main message
          setMessages(prev =>
            prev.map(msg =>
              msg.id === newRecord.id ? { ...msg, ...newRecord } : msg
            )
          );
        }
        break;

      case 'DELETE':
        if (oldRecord.parent_id) {
          // Remove reply
          setReplies(prev => ({
            ...prev,
            [oldRecord.parent_id]: prev[oldRecord.parent_id]?.filter(
              reply => reply.id !== oldRecord.id
            ) || []
          }));
        } else {
          // Remove main message
          setMessages(prev => prev.filter(msg => msg.id !== oldRecord.id));
        }
        break;
    }
  };

  // Modify fetchMessages to include duplicate checking
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .is('parent_id', null)
        .order('timestamp', { ascending: false });

      if (messagesError) throw messagesError;

      // Add messages to processed events
      messagesData?.forEach(msg => processedEvents.add(msg.id));

      // Fetch replies for all messages
      const { data: repliesData, error: repliesError } = await supabase
        .from('messages')
        .select('*')
        .not('parent_id', 'is', null)
        .order('timestamp', { ascending: true });

      if (repliesError) throw repliesError;

      // Organize replies by parent_id
      const repliesMap: { [key: string]: Message[] } = {};
      repliesData?.forEach(reply => {
        if (reply.parent_id) {
          if (!repliesMap[reply.parent_id]) {
            repliesMap[reply.parent_id] = [];
          }
          repliesMap[reply.parent_id].push(reply);
        }
      });

      setMessages(messagesData || []);
      setReplies(repliesMap);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('message_likes')
        .select('message_id')
        .eq('user_id', getUserId());

      if (error) throw error;
      setUserLikes(data.map(like => like.message_id));
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    fetchMessages();
    fetchPopularTags();
    fetchUserLikes();
    
    const subscription = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          handleRealtimeMessage(payload);
          // Fetch popular tags whenever messages change
          await fetchPopularTags();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addMessage = async (message: Omit<Message, 'id'>) => {
    try {
      // Check rate limit
      const now = Date.now();
      if (now - lastMessageTimestamp < RATE_LIMIT_DELAY) {
        const waitTime = Math.ceil((RATE_LIMIT_DELAY - (now - lastMessageTimestamp)) / 1000);
        showToast(`Please wait ${waitTime} seconds before sending another message`, 'error');
        throw new Error(`Rate limit: Please wait ${waitTime} seconds`);
      }

      // Check for duplicate content in recent messages
      const recentDuplicate = messages.find(msg => 
        msg.content === message.content && 
        Date.now() - new Date(msg.timestamp).getTime() < 5 * 60 * 1000
      );
      
      if (recentDuplicate) {
        showToast('Duplicate message detected. Please wait before sending the same message again.', 'error');
        throw new Error('Duplicate message detected');
      }

      const { data, error } = await supabase
        .from('messages')
        .insert([message])
        .select()
        .single();

      if (error) throw error;

      // Update rate limit timestamp
      setLastMessageTimestamp(Date.now());

      // Optimistically update the UI
      setMessages(prevMessages => [data, ...prevMessages]);
      
      // Refresh popular tags after adding a message
      await fetchPopularTags();
      
      return data;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  };

  const replyToMessage = async (parentId: string, message: Omit<Message, 'id'>) => {
    try {
      // Check rate limit
      const now = Date.now();
      if (now - lastMessageTimestamp < RATE_LIMIT_DELAY) {
        const waitTime = Math.ceil((RATE_LIMIT_DELAY - (now - lastMessageTimestamp)) / 1000);
        showToast(`Please wait ${waitTime} seconds before sending another reply`, 'error');
        throw new Error(`Rate limit: Please wait ${waitTime} seconds`);
      }

      // Check for duplicate replies
      const existingReplies = replies[parentId] || [];
      const recentDuplicate = existingReplies.find(reply => 
        reply.content === message.content && 
        Date.now() - new Date(reply.timestamp).getTime() < 5 * 60 * 1000
      );

      if (recentDuplicate) {
        showToast('Duplicate reply detected. Please wait before sending the same reply again.', 'error');
        throw new Error('Duplicate reply detected');
      }

      const replyMessage = {
        ...message,
        parent_id: parentId
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([replyMessage])
        .select()
        .single();

      if (error) throw error;

      // Update rate limit timestamp
      setLastMessageTimestamp(Date.now());

      // Update the reply count of the parent message
      const parentMessage = messages.find(msg => msg.id === parentId);
      if (parentMessage) {
        const { error: updateError } = await supabase
          .from('messages')
          .update({ replies: (parentMessage.replies || 0) + 1 })
          .eq('id', parentId);

        if (updateError) throw updateError;
      }

      return data;
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  };

  const toggleLike = async (messageId: string) => {
    try {
      const userId = getUserId();
      const isLiked = userLikes.includes(messageId);

      // Optimistic update
      setUserLikes(prev =>
        isLiked 
          ? prev.filter(id => id !== messageId)
          : [...prev, messageId]
      );

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, likes: isLiked ? msg.likes - 1 : msg.likes + 1 }
            : msg
        )
      );

      // Make sure messageId is a valid UUID before sending to Supabase
      if (!isValidUUID(messageId)) {
        throw new Error('Invalid message ID format');
      }

      const { error } = await supabase.rpc('toggle_message_like', {
        message_id: messageId,
        user_id: userId
      });

      if (error) throw error;

    } catch (error) {
      // Revert optimistic update on error
      setUserLikes(prev =>
        prev.includes(messageId)
          ? prev.filter(id => id !== messageId)
          : [...prev, messageId]
      );
      
      console.error('Error toggling like:', error);
      throw error;
    }
  };

  // Add this helper function to validate UUID format
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // When creating new messages or replies, ensure they have proper UUID format
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const addReply = async (replyData: Partial<Message>) => {
    if (!replyData.parent_id) return;
    
    const newReply: Message = {
      id: generateUUID(), // Use UUID format instead of random string
      content: replyData.content || '',
      username: replyData.username || 'Anonymous',
      timestamp: new Date().toISOString(),
      tags: replyData.tags || [],
      reactions: replyData.reactions || [],
      likes: 0,
      parent_id: replyData.parent_id,
      liked_by: [], // Add this if it's required by your Message interface
    };

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([newReply])
        .select()
        .single();

      if (error) throw error;

      setReplies(prev => ({
        ...prev,
        [replyData.parent_id!]: [...(prev[replyData.parent_id!] || []), data],
      }));

      return data;
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  };

  return (
    <MessageContext.Provider value={{
      messages,
      replies,
      userLikes,
      isLoading,
      popularTags,
      selectedTag,
      setSelectedTag,
      addMessage,
      replyToMessage,
      toggleLike,
      addReply
    }}>
      {children}
    </MessageContext.Provider>
  );
}


