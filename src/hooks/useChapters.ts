import { useState, useEffect } from 'react';
import { supabase, Chapter } from '../lib/supabase';

export function useChapters(bookId: string) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookId) {
      fetchChapters();
    }
  }, [bookId]);

  const fetchChapters = async () => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('order', { ascending: true });

      if (error) throw error;
      setChapters(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chapters');
    } finally {
      setLoading(false);
    }
  };

  const createChapter = async (title: string, content?: string) => {
    try {
      const nextOrder = chapters.length + 1;
      const { data, error } = await supabase
        .from('chapters')
        .insert([{
          book_id: bookId,
          title,
          content,
          order: nextOrder,
          word_count: content ? content.trim().split(/\s+/).length : 0
        }])
        .select()
        .single();

      if (error) throw error;
      setChapters(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chapter');
      throw err;
    }
  };

  const updateChapter = async (chapterId: string, updates: Partial<Chapter>) => {
    try {
      if (updates.content) {
        updates.word_count = updates.content.trim().split(/\s+/).length;
      }

      const { data, error } = await supabase
        .from('chapters')
        .update(updates)
        .eq('id', chapterId)
        .select()
        .single();

      if (error) throw error;
      setChapters(prev => prev.map(chapter => chapter.id === chapterId ? data : chapter));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update chapter');
      throw err;
    }
  };

  const deleteChapter = async (chapterId: string) => {
    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId);

      if (error) throw error;
      setChapters(prev => prev.filter(chapter => chapter.id !== chapterId));
      
      // Reorder remaining chapters
      const remainingChapters = chapters.filter(chapter => chapter.id !== chapterId);
      await Promise.all(
        remainingChapters.map((chapter, index) =>
          updateChapter(chapter.id, { order: index + 1 })
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chapter');
      throw err;
    }
  };

  const reorderChapter = async (chapterId: string, newOrder: number) => {
    try {
      const chapter = chapters.find(c => c.id === chapterId);
      if (!chapter) throw new Error('Chapter not found');

      const oldOrder = chapter.order;
      if (newOrder === oldOrder) return;

      // Update all affected chapters
      const updatedChapters = chapters.map(c => {
        if (c.id === chapterId) {
          return { ...c, order: newOrder };
        } else if (
          (oldOrder < newOrder && c.order > oldOrder && c.order <= newOrder) ||
          (oldOrder > newOrder && c.order >= newOrder && c.order < oldOrder)
        ) {
          return {
            ...c,
            order: oldOrder < newOrder ? c.order - 1 : c.order + 1
          };
        }
        return c;
      });

      // Sort by order to ensure correct sequence
      updatedChapters.sort((a, b) => a.order - b.order);

      // Update all chapters in the database
      await Promise.all(
        updatedChapters.map(chapter =>
          supabase
            .from('chapters')
            .update({ order: chapter.order })
            .eq('id', chapter.id)
        )
      );

      setChapters(updatedChapters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder chapter');
      throw err;
    }
  };

  return {
    chapters,
    loading,
    error,
    createChapter,
    updateChapter,
    deleteChapter,
    reorderChapter,
    refreshChapters: fetchChapters
  };
}