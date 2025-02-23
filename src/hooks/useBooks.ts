import { useState, useEffect } from 'react';
import { supabase, Book } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user]);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const createBook = async (title: string, subtitle: string, description?: string, genre?: string, targetWordCount: number = 50000) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Ensure targetWordCount is a number
      const wordCount = typeof targetWordCount === 'string' ? parseInt(targetWordCount, 10) : targetWordCount;
      
      if (isNaN(wordCount)) {
        throw new Error('Invalid target word count');
      }

      const { data, error } = await supabase
        .from('books')
        .insert([{
          user_id: user.id,
          title,
          subtitle,
          description,
          genre,
          target_word_count: wordCount,
          current_word_count: 0,
          status: 'draft'
        }])
        .select()
        .single();

      if (error) throw error;
      setBooks(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Book creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create book');
      throw err;
    }
  };

  const updateBook = async (bookId: string, updates: Partial<Book>) => {
    try {
      // Ensure target_word_count is a number if it's being updated
      if (updates.target_word_count !== undefined) {
        updates.target_word_count = typeof updates.target_word_count === 'string' 
          ? parseInt(updates.target_word_count, 10) 
          : updates.target_word_count;
        
        if (isNaN(updates.target_word_count)) {
          throw new Error('Invalid target word count');
        }
      }

      const { data, error } = await supabase
        .from('books')
        .update(updates)
        .eq('id', bookId)
        .select()
        .single();

      if (error) throw error;
      setBooks(prev => prev.map(book => book.id === bookId ? data : book));
      return data;
    } catch (err) {
      console.error('Book update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update book');
      throw err;
    }
  };

  const deleteBook = async (bookId: string) => {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (error) throw error;
      setBooks(prev => prev.filter(book => book.id !== bookId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete book');
      throw err;
    }
  };

  return {
    books,
    loading,
    error,
    createBook,
    updateBook,
    deleteBook,
    refreshBooks: fetchBooks
  };
}