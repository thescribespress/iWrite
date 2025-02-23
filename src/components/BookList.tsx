import React, { useState } from 'react';
import { Book, PenLine, Trash2, Share2 } from 'lucide-react';
import { Book as BookType } from '../lib/supabase';
import { BookForm } from './BookForm';
import { supabase } from '../lib/supabase';

interface BookListProps {
  books: BookType[];
  onSelectBook: (book: BookType) => void;
  onCreateBook: (title: string, subtitle: string, description: string, genre: string, targetWordCount: number) => Promise<void>;
  onUpdateBook: (bookId: string, updates: Partial<BookType>) => Promise<void>;
  onDeleteBook: (bookId: string) => Promise<void>;
}

export function BookList({ books, onSelectBook, onCreateBook, onUpdateBook, onDeleteBook }: BookListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);

  const handleCreateSubmit = async (title: string, subtitle: string, description: string, genre: string, targetWordCount: number) => {
    await onCreateBook(title, subtitle, description, genre, targetWordCount);
    setShowCreateForm(false);
  };

  const handleUpdateSubmit = async (title: string, subtitle: string, description: string, genre: string, targetWordCount: number) => {
    if (editingBook) {
      await onUpdateBook(editingBook.id, {
        title,
        subtitle,
        description,
        genre,
        target_word_count: targetWordCount
      });
      setEditingBook(null);
    }
  };

  const togglePublic = async (book: BookType) => {
    await onUpdateBook(book.id, {
      is_public: !book.is_public
    });
  };

  const generateBookCover = (title: string, genre: string) => {
    const hash = title.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const hue = hash % 360;
    const saturation = 70 + (hash % 20);
    const lightness = 45 + (hash % 20);
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Books</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          New Book
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Create New Book</h3>
          <BookForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {editingBook && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Edit Book</h3>
          <BookForm
            initialData={editingBook}
            onSubmit={handleUpdateSubmit}
            onCancel={() => setEditingBook(null)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => {
          const coverColor = generateBookCover(book.title, book.genre || '');
          const progress = (book.current_word_count / book.target_word_count) * 100;
          
          return (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
            >
              <div
                className="h-48 flex items-center justify-center p-6 text-white relative"
                style={{ background: coverColor }}
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">{book.title}</h3>
                  {book.subtitle && (
                    <p className="text-sm opacity-90">{book.subtitle}</p>
                  )}
                </div>
                
                {/* Progress circle */}
                <div className="absolute top-4 right-4 w-12 h-12">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.2)"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="3"
                      strokeDasharray={`${progress}, 100`}
                    />
                    <text
                      x="18"
                      y="20.35"
                      className="text-xs"
                      textAnchor="middle"
                      fill="#fff"
                    >
                      {Math.round(progress)}%
                    </text>
                  </svg>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  {book.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">{book.description}</p>
                  )}
                  <div className="space-y-1">
                    {book.genre && (
                      <p className="text-sm text-gray-500">Genre: {book.genre}</p>
                    )}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, (book.current_word_count / book.target_word_count) * 100)}%`
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      {book.current_word_count.toLocaleString()} / {book.target_word_count.toLocaleString()} words
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {book.status.replace('_', ' ').charAt(0).toUpperCase() + book.status.slice(1)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePublic(book);
                    }}
                    className={`p-2 ${
                      book.is_public 
                        ? 'text-indigo-600 hover:text-indigo-800' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    title={book.is_public ? 'Make private' : 'Share with community'}
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingBook(book);
                    }}
                    className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                    title="Edit book"
                  >
                    <PenLine className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBook(book.id);
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    title="Delete book"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {books.length === 0 && !showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="col-span-full p-6 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors"
          >
            <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900">Create Your First Book</h3>
            <p className="text-sm text-gray-600 mt-2">Begin your writing journey</p>
          </button>
        )}
      </div>
    </div>
  );
}