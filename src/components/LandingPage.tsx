import React from 'react';
import { BookTemplate, Sparkles, Target, Timer } from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => void;
}

export function LandingPage({ onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-indigo-50 to-white">
      <div className="text-center max-w-3xl mx-auto">
        <div className="flex justify-center mb-6">
          <BookTemplate className="w-16 h-16 text-indigo-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Your Journey to Becoming a Published Author Starts Here
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          iWrite is your AI-powered writing companion that helps you transform your ideas into professionally published books.
        </p>
        
        <button
          onClick={onSignIn}
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors mb-12"
        >
          Start Writing Now
        </button>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-center mb-4">
              <Sparkles className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Writing Assistant</h3>
            <p className="text-gray-600">Get intelligent suggestions and real-time feedback as you write</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-center mb-4">
              <Timer className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Scheduling</h3>
            <p className="text-gray-600">Break down your writing goals into manageable daily tasks</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-center mb-4">
              <Target className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Publishing Made Easy</h3>
            <p className="text-gray-600">Format and publish your book with just a few clicks</p>
          </div>
        </div>
      </div>
    </div>
  );
}