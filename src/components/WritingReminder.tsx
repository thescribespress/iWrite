import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

const inspirationalQuotes = [
  "The first draft is just you telling yourself the story. - Terry Pratchett",
  "You can't wait for inspiration. You have to go after it with a club. - Jack London",
  "Write drunk, edit sober. - Ernest Hemingway",
  "The scariest moment is always just before you start. - Stephen King",
  "You can always edit a bad page. You can't edit a blank page. - Jodi Picoult"
];

export function WritingReminder() {
  const [quote, setQuote] = useState('');
  const [showReminder, setShowReminder] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(30); // minutes

  useEffect(() => {
    const checkWritingSchedule = () => {
      const now = new Date();
      setQuote(inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)]);
      setShowReminder(true);
      
      if (Notification.permission === 'granted') {
        new Notification('Time to Write!', {
          body: quote,
          icon: '/path-to-icon.png'
        });
      }
    };

    // Check based on the reminder interval
    const interval = setInterval(checkWritingSchedule, reminderInterval * 60 * 1000);
    checkWritingSchedule(); // Initial check

    return () => clearInterval(interval);
  }, [reminderInterval]);

  // Update interval when settings change
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'writingReminderInterval') {
        const newInterval = parseInt(e.newValue || '30', 10);
        setReminderInterval(newInterval);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!showReminder) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-lg p-4 border border-indigo-100">
      <div className="flex items-start gap-3">
        <div className="bg-indigo-100 rounded-full p-2">
          <Bell className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">Time to Write!</h4>
          <p className="mt-1 text-sm text-gray-600">{quote}</p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => setShowReminder(false)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                setShowReminder(false);
                // Navigate to writing interface
                window.location.hash = '#dashboard';
              }}
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              Start Writing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}