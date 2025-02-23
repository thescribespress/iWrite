import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { Chapter } from '../lib/supabase';

interface ChapterListProps {
  chapters: Chapter[];
  onSelectChapter: (chapter: Chapter) => void;
  onCreateChapter: (title: string) => Promise<void>;
  onUpdateChapter: (chapterId: string, updates: Partial<Chapter>) => Promise<void>;
  onDeleteChapter: (chapterId: string) => Promise<void>;
  onReorderChapter: (chapterId: string, newOrder: number) => Promise<void>;
}

export function ChapterList({
  chapters,
  onSelectChapter,
  onCreateChapter,
  onUpdateChapter,
  onDeleteChapter,
  onReorderChapter
}: ChapterListProps) {
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [editingChapter, setEditingChapter] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newChapterTitle.trim()) {
      await onCreateChapter(newChapterTitle);
      setNewChapterTitle('');
    }
  };

  const handleUpdateTitle = async (chapter: Chapter) => {
    if (editTitle.trim() && editTitle !== chapter.title) {
      await onUpdateChapter(chapter.id, { title: editTitle });
    }
    setEditingChapter(null);
  };

  const handleMoveChapter = async (chapter: Chapter, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? chapter.order - 1 : chapter.order + 1;
    if (newOrder > 0 && newOrder <= chapters.length) {
      await onReorderChapter(chapter.id, newOrder);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreateSubmit} className="flex gap-2">
        <input
          type="text"
          value={newChapterTitle}
          onChange={(e) => setNewChapterTitle(e.target.value)}
          placeholder="New chapter title"
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        <button
          type="submit"
          disabled={!newChapterTitle.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          Add Chapter
        </button>
      </form>

      <div className="space-y-2">
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {editingChapter === chapter.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateTitle(chapter)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingChapter(null)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectChapter(chapter)}
                    className="text-left hover:text-indigo-600 transition-colors"
                  >
                    <h3 className="font-medium">
                      Chapter {chapter.order}: {chapter.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {chapter.word_count.toLocaleString()} words
                    </p>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleMoveChapter(chapter, 'up')}
                  disabled={chapter.order === 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleMoveChapter(chapter, 'down')}
                  disabled={chapter.order === chapters.length}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setEditingChapter(chapter.id);
                    setEditTitle(chapter.title);
                  }}
                  className="p-1 text-gray-400 hover:text-indigo-600"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDeleteChapter(chapter.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}