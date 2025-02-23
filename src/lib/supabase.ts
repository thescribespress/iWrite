import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Type definitions for database tables
export type UserProfile = {
  id: string;
  username: string;
  full_name?: string;
  created_at: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  subscription_status: 'active' | 'cancelled' | 'expired';
  writing_schedule: {
    days: string[];
    preferred_time: string;
  };
  last_reminder_sent: string;
  followers: string[];
  following: string[];
  bio?: string;
  website?: string;
};

export type Book = {
  id: string;
  user_id: string;
  title: string;
  subtitle?: string;
  description?: string;
  genre?: string;
  target_word_count: number;
  current_word_count: number;
  status: 'draft' | 'in_progress' | 'completed' | 'published';
  created_at: string;
  is_public: boolean;
  likes: number;
  comments_count: number;
};

export type Chapter = {
  id: string;
  book_id: string;
  title: string;
  content?: string;
  formatted_content?: {
    blocks: Array<{
      type: string;
      text: string;
      style?: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
      };
    }>;
  };
  word_count: number;
  order: number;
  created_at: string;
  last_autosave: string;
};

export type WritingGoal = {
  id: string;
  user_id: string;
  daily_word_count: number;
  writing_days: string[];
  created_at: string;
};

export type Subscription = {
  id: string;
  name: 'Free' | 'Pro' | 'Enterprise';
  price: number;
  features: string[];
  limits: {
    books: number;
    ai_suggestions: number;
    cloud_storage: number;
  };
};

export type Resource = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes: number;
  created_at: string;
};

export type Comment = {
  id: string;
  user_id: string;
  book_id?: string;
  resource_id?: string;
  content: string;
  created_at: string;
};

export type Follow = {
  follower_id: string;
  following_id: string;
  created_at: string;
};