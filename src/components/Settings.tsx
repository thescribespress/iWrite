import React, { useState } from 'react';
import { Bell, Clock, Palette, Shield, User, Wrench } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface WritingSchedule {
  days: string[];
  preferredTime: string;
  reminderInterval: number;
}

export function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [writingSchedule, setWritingSchedule] = useState<WritingSchedule>({
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    preferredTime: '09:00',
    reminderInterval: 30
  });
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');

  const handleScheduleChange = (field: keyof WritingSchedule, value: any) => {
    setWritingSchedule(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDayToggle = (day: string) => {
    setWritingSchedule(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-md ${
                  activeTab === 'general' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Wrench className="w-5 h-5" />
                General
              </button>
              <button
                onClick={() => setActiveTab('writing')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-md ${
                  activeTab === 'writing' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Clock className="w-5 h-5" />
                Writing Schedule
              </button>
              <button
                onClick={() => setActiveTab('appearance')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-md ${
                  activeTab === 'appearance' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Palette className="w-5 h-5" />
                Appearance
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-md ${
                  activeTab === 'notifications' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Bell className="w-5 h-5" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-md ${
                  activeTab === 'account' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5" />
                Account
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-md ${
                  activeTab === 'privacy' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Shield className="w-5 h-5" />
                Privacy
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === 'writing' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Writing Schedule</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Writing Days
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={writingSchedule.days.includes(day)}
                          onChange={() => handleDayToggle(day)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Writing Time
                  </label>
                  <input
                    type="time"
                    value={writingSchedule.preferredTime}
                    onChange={(e) => handleScheduleChange('preferredTime', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Interval (minutes)
                  </label>
                  <select
                    value={writingSchedule.reminderInterval}
                    onChange={(e) => handleScheduleChange('reminderInterval', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Appearance</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size
                  </label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            )}

            {/* Add other tab contents as needed */}
          </div>
        </div>
      </div>
    </div>
  );
}