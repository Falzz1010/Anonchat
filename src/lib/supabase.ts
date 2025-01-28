import { createClient } from '@supabase/supabase-js';

// Tipe untuk database Supabase (opsional tapi recommended)
export type Database = {
  public: {
    tables: {
      messages: {
        Row: {
          id: string;
          content: string;
          user: string;
          timestamp: string;
          tags: string[];
          likes: number;
          replies: number;
          reactions: { emoji: string; count: number; }[];
          parent_id?: string;
          liked_by?: string[];
        };
        Insert: {
          id?: string;
          content: string;
          user: string;
          timestamp?: string;
          tags?: string[];
          likes?: number;
          replies?: number;
          reactions?: { emoji: string; count: number; }[];
          parent_id?: string;
          liked_by?: string[];
        };
        Update: {
          id?: string;
          content?: string;
          user?: string;
          timestamp?: string;
          tags?: string[];
          likes?: number;
          replies?: number;
          reactions?: { emoji: string; count: number; }[];
          parent_id?: string;
          liked_by?: string[];
        };
      };
      message_likes: {
        Row: {
          message_id: string;
          user_id: string;
        };
        Insert: {
          message_id: string;
          user_id: string;
        };
        Update: {
          message_id?: string;
          user_id?: string;
        };
      };
    };
  };
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Better debug logging
console.log('Environment Variables:', {
  VITE_SUPABASE_URL: supabaseUrl ? 'defined' : 'undefined',
  VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'defined' : 'undefined'
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing environment variables for Supabase configuration.\n' +
    'Please ensure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set in your .env.local file.'
  );
}

// Buat client Supabase dengan type safety
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Test connection
supabase.from('messages').select('*').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection successful');
    }
  });

// Helper functions
export const supabaseHelper = {
  messages: {
    async getAll() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async create(message: { content: string; username: string; tags: string[] }) {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          ...message,
          timestamp: new Date().toISOString(),
        }])
        .select();
      
      if (error) throw error;
      return data;
    },

    async addReaction(messageId: string, emoji: string) {
      const { data: message } = await supabase
        .from('messages')
        .select('reactions')
        .eq('id', messageId)
        .single();

      const reactions = message?.reactions || [];
      const existingReaction = reactions.find(r => r.emoji === emoji);

      const updatedReactions = existingReaction
        ? reactions.map(r => 
            r.emoji === emoji 
              ? { ...r, count: r.count + 1 }
              : r
          )
        : [...reactions, { emoji, count: 1 }];

      const { data, error } = await supabase
        .from('messages')
        .update({ reactions: updatedReactions })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    subscribeToChanges(callback: (payload: any) => void) {
      return supabase
        .channel('messages_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages' },
          callback
        )
        .subscribe();
    }
  }
};


