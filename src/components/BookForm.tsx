import React, { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { Book } from '../lib/supabase';

interface BookFormProps {
  onSubmit: (title: string, subtitle: string, description: string, genre: string, targetWordCount: number) => Promise<void>;
  initialData?: Book;
  onCancel: () => void;
}

export function BookForm({ onSubmit, initialData, onCancel }: BookFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [genre, setGenre] = useState(initialData?.genre || '');
  const [targetWordCount, setTargetWordCount] = useState(initialData?.target_word_count || 50000);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Ensure targetWordCount is a number
      const wordCount = typeof targetWordCount === 'string' 
        ? parseInt(targetWordCount, 10) 
        : targetWordCount;

      if (isNaN(wordCount)) {
        throw new Error('Invalid target word count');
      }

      await onSubmit(title, subtitle, description, genre, wordCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    setGenerating(true);
    try {
      const prompt = `Generate a creative book title, subtitle, and description for a ${genre || 'fiction'} book.`;
      
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer AIzaSyDdmo-sxPNJYH87VQisv3b4_1Apmi4D8wo`
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        const suggestion = data.candidates[0].content.parts[0].text;
        const lines = suggestion.split('\n');
        
        // Parse the response and update fields
        const suggestedTitle = lines.find(l => l.startsWith('Title:'))?.replace('Title:', '').trim();
        const suggestedSubtitle = lines.find(l => l.startsWith('Subtitle:'))?.replace('Subtitle:', '').trim();
        const suggestedDescription = lines.find(l => l.startsWith('Description:'))?.replace('Description:', '').trim();

        if (suggestedTitle) setTitle(suggestedTitle);
        if (suggestedSubtitle) setSubtitle(suggestedSubtitle);
        if (suggestedDescription) setDescription(suggestedDescription);
      }
    } catch (err) {
      setError('Failed to generate suggestions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
          <button
            type="button"
            onClick={generateSuggestions}
            disabled={generating}
            className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            title="Generate AI suggestions"
          >
            <Wand2 className="w-4 h-4" />
            {generating ? 'Generating...' : 'Suggest'}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">
          Subtitle
        </label>
        <input
          type="text"
          id="subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
          Genre
        </label>
        <input
          type="text"
          id="genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label htmlFor="targetWordCount" className="block text-sm font-medium text-gray-700">
          Target Word Count
        </label>
        <input
          type="number"
          id="targetWordCount"
          value={targetWordCount}
          onChange={(e) => setTargetWordCount(parseInt(e.target.value))}
          min={1000}
          step={1000}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : initialData ? 'Update Book' : 'Create Book'}
        </button>
      </div>
    </form>
  );
}