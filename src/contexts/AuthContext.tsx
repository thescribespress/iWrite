import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        // Check if user profile exists
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', currentUser.id)
          .single();

        // If no profile exists, create one
        if (!profile) {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([{
              id: currentUser.id,
              username: currentUser.user_metadata.username || currentUser.email?.split('@')[0],
              created_at: new Date().toISOString()
            }]);

          if (profileError) {
            console.error('Error creating user profile:', profileError);
            await supabase.auth.signOut();
            setUser(null);
          }
        }
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // First check if username is available
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        throw new Error('Username already taken');
      }

      // Create auth user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('Signup failed');

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{ 
          id: user.id, 
          username,
          created_at: new Date().toISOString()
        }]);

      if (profileError) {
        // If profile creation fails, clean up the auth user
        await supabase.auth.signOut();
        throw profileError;
      }

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('User already registered')) {
          throw new Error('Email already registered. Please sign in instead.');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        }
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during sign in');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}