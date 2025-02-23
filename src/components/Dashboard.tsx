import React, { useState } from 'react';
import { BookOpen, Target, Timer, Book as BookIcon, Users, Lightbulb } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBooks } from '../hooks/useBooks';
import { useChapters } from '../hooks/useChapters';
import { Book, Chapter } from '../lib/supabase';
import { BookList } from './BookList';
import { ChapterList } from './ChapterList';
import { Editor } from './Editor';

export function Dashboard() {
  const { user } = useAuth();
  const { books, loading: loadingBooks, createBook, updateBook, deleteBook } = useBooks();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  
  const {
    chapters,
    loading: loadingChapters,
    createChapter,
    updateChapter,
    deleteChapter,
    reorderChapter
  } = useChapters(selectedBook?.id || '');

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setSelectedChapter(null);
  };

  const handleSelectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
  };

  const handleCreateBook = async (title: string, description: string, genre: string, targetWordCount: number) => {
    await createBook(title, description, genre, targetWordCount);
  };

  const handleUpdateBook = async (bookId: string, updates: Partial<Book>) => {
    await updateBook(bookId, updates);
  };

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      await deleteBook(bookId);
      if (selectedBook?.id === bookId) {
        setSelectedBook(null);
        setSelectedChapter(null);
      }
    }
  };

  const handleCreateChapter = async (title: string) => {
    await createChapter(title);
  };

  const handleUpdateChapter = async (chapterId: string, updates: Partial<Chapter>) => {
    await updateChapter(chapterId, updates);
    if (selectedChapter?.id === chapterId) {
      const updatedChapter = chapters.find(c => c.id === chapterId);
      if (updatedChapter) {
        setSelectedChapter(updatedChapter);
      }
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (window.confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) {
      await deleteChapter(chapterId);
      if (selectedChapter?.id === chapterId) {
        setSelectedChapter(null);
      }
    }
  };

  const handleSaveContent = async (content: string) => {
    if (selectedChapter) {
      await updateChapter(selectedChapter.id, { content });
    }
  };

  if (loadingBooks) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your writing space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Writing Space</h1>
        
        {!selectedBook ? (
          <BookList
            books={books}
            onSelectBook={handleSelectBook}
            onCreateBook={handleCreateBook}
            onUpdateBook={handleUpdateBook}
            onDeleteBook={handleDeleteBook}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedBook(null);
                  setSelectedChapter(null);
                }}
                className="text-indigo-600 hover:text-indigo-700"
              >
                ← Back to Books
              </button>
              <h2 className="text-xl font-semibold">{selectedBook.title}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <ChapterList
                    chapters={chapters}
                    onSelectChapter={handleSelectChapter}
                    onCreateChapter={handleCreateChapter}
                    onUpdateChapter={handleUpdateChapter}
                    onDeleteChapter={handleDeleteChapter}
                    onReorderChapter={reorderChapter}
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                {selectedChapter ? (
                  <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-16rem)]">
                    <Editor
                      chapter={selectedChapter}
                      onSave={handleSaveContent}
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Select a Chapter</h3>
                    <p className="mt-2 text-gray-500">
                      Choose a chapter from the list to start writing or create a new one.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}