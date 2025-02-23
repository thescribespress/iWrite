import React, { useState, useEffect, useRef } from 'react';
import { Save, Download, Wand2, Check, AlertCircle, Bold, Italic, Underline } from 'lucide-react';
import { Chapter } from '../lib/supabase';

interface EditorProps {
  chapter: Chapter;
  onSave: (content: string) => Promise<void>;
}

export function Editor({ chapter, onSave }: EditorProps) {
  const [content, setContent] = useState(chapter.content || '');
  const [wordCount, setWordCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [selectedText, setSelectedText] = useState({ start: 0, end: 0 });
  const [proofreading, setProofreading] = useState<{
    active: boolean;
    suggestions: Array<{
      text: string;
      start: number;
      end: number;
      suggestion: string;
      type: 'grammar' | 'style' | 'spelling';
    }>;
  }>({ active: false, suggestions: [] });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(chapter.content || '');
  }, [chapter]);

  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(words);

    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(() => {
      handleSave();
    }, 30000);

    setAutoSaveTimer(timer);

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [content]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(content);
      setLastSaved(new Date());
    } finally {
      setSaving(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    // Update selected text range
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    setSelectedText({ start, end });
  };

  const handleTextSelect = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      setSelectedText({
        start: textarea.selectionStart,
        end: textarea.selectionEnd
      });
    }
  };

  const applyFormatting = (format: 'bold' | 'italic' | 'underline') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) return;

    const selectedText = content.substring(start, end);
    const beforeSelection = content.substring(0, start);
    const afterSelection = content.substring(end);

    let formattedText = selectedText;
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `_${selectedText}_`;
        break;
    }

    const newContent = beforeSelection + formattedText + afterSelection;
    setContent(newContent);

    // Restore focus and set cursor position after formatting
    textarea.focus();
    const newCursorPos = start + formattedText.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  };

  const handleProofreading = async () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // Only proofread selected text if there's a selection
    const textToProofread = start !== end ? 
      content.substring(start, end) : 
      content;

    setProofreading({ ...proofreading, active: true });
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{
            role: "system",
            content: "You are a professional editor. Analyze the text for grammar, style, and spelling issues. Return a JSON array of suggestions with the following format: [{text: string, suggestion: string, type: 'grammar'|'style'|'spelling'}]"
          }, {
            role: "user",
            content: textToProofread
          }]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        try {
          const suggestions = JSON.parse(data.choices[0].message.content);
          setProofreading({
            active: true,
            suggestions: suggestions.map((s: any, i: number) => ({
              ...s,
              start: start + textToProofread.indexOf(s.text),
              end: start + textToProofread.indexOf(s.text) + s.text.length
            }))
          });
        } catch (e) {
          console.error('Error parsing proofreading response:', e);
        }
      }
    } catch (error) {
      console.error('Error during proofreading:', error);
      setProofreading({ active: false, suggestions: [] });
    }
  };

  const applySuggestion = (suggestion: {
    text: string;
    start: number;
    end: number;
    suggestion: string;
  }) => {
    const newContent = 
      content.substring(0, suggestion.start) +
      suggestion.suggestion +
      content.substring(suggestion.end);
    
    setContent(newContent);
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => applyFormatting('bold')}
            className="p-2 rounded hover:bg-gray-100"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormatting('italic')}
            className="p-2 rounded hover:bg-gray-100"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormatting('underline')}
            className="p-2 rounded hover:bg-gray-100"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleProofreading}
            disabled={selectedText.start === selectedText.end}
            className="flex items-center gap-1 px-3 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" />
            Proofread
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100"
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          onSelect={handleTextSelect}
          className="w-full h-full p-4 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Start writing your chapter..."
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>
          {wordCount} words
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Proofreading Suggestions */}
      {proofreading.active && proofreading.suggestions.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <h3 className="font-medium mb-2">Proofreading Suggestions</h3>
          <div className="space-y-2">
            {proofreading.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-1" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{suggestion.type}</div>
                  <div className="text-sm text-gray-600">
                    Change "{suggestion.text}" to "{suggestion.suggestion}"
                  </div>
                  <button
                    onClick={() => applySuggestion(suggestion)}
                    className="mt-1 text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Apply suggestion
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}