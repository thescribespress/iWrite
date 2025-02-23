import React, { useState } from 'react';
import { 
  BookTemplate,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './contexts/AuthContext';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { WritingReminder } from './components/WritingReminder';
import { Community } from './components/Community';
import { Settings } from './components/Settings';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const { user, signOut } = useAuth();
  const books = []; // Placeholder for books, you might want to fetch this from context or props

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      setShowAuthModal(true);
    }
  };

  const handleNavigation = (section: string) => {
    setCurrentSection(section);
    setIsMenuOpen(false);
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'books':
        return <Dashboard />; // Books are shown in dashboard
      case 'community':
        return <Community books={books} />;
      case 'resources':
        return <div className="p-8">Writing resources coming soon!</div>;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookTemplate className="w-8 h-8 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-900">iWrite</span>
            </div>
            
            {user && (
              <>
                <nav className="hidden md:flex space-x-8">
                  <button
                    onClick={() => handleNavigation('dashboard')}
                    className={`text-gray-600 hover:text-indigo-600 ${
                      currentSection === 'dashboard' ? 'text-indigo-600' : ''
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => handleNavigation('books')}
                    className={`text-gray-600 hover:text-indigo-600 ${
                      currentSection === 'books' ? 'text-indigo-600' : ''
                    }`}
                  >
                    My Books
                  </button>
                  <button
                    onClick={() => handleNavigation('community')}
                    className={`text-gray-600 hover:text-indigo-600 ${
                      currentSection === 'community' ? 'text-indigo-600' : ''
                    }`}
                  >
                    Community
                  </button>
                  <button
                    onClick={() => handleNavigation('resources')}
                    className={`text-gray-600 hover:text-indigo-600 ${
                      currentSection === 'resources' ? 'text-indigo-600' : ''
                    }`}
                  >
                    Resources
                  </button>
                  <button
                    onClick={() => handleNavigation('settings')}
                    className={`text-gray-600 hover:text-indigo-600 ${
                      currentSection === 'settings' ? 'text-indigo-600' : ''
                    }`}
                  >
                    Settings
                  </button>
                </nav>
                
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </>
            )}

            <div className="flex items-center space-x-4">
              <button 
                onClick={handleAuthClick}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center space-x-2"
              >
                {user ? (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && user && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => handleNavigation('dashboard')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavigation('books')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                My Books
              </button>
              <button
                onClick={() => handleNavigation('community')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Community
              </button>
              <button
                onClick={() => handleNavigation('resources')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Resources
              </button>
              <button
                onClick={() => handleNavigation('settings')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Settings
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-grow">
        {user ? renderSection() : (
          <>
            <LandingPage onSignIn={() => setShowAuthModal(true)} />
            <SubscriptionPlans />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
          Powered by The Scribes Press
        </div>
      </footer>

      {/* Modals and Overlays */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      {/* Writing Reminder */}
      {user && <WritingReminder />}
    </div>
  );
}

export default App;