import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Share2, BookOpen, Plus, Search } from 'lucide-react';
import { Book, Resource, UserProfile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CommunityProps {
  books: Book[];
}

export function Community({ books }: CommunityProps) {
  const { user } = useAuth();
  const [publicBooks, setPublicBooks] = useState<Book[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'books' | 'resources' | 'writers'>('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    content: '',
    category: 'writing_tips',
    tags: [] as string[]
  });

  useEffect(() => {
    fetchPublicBooks();
    fetchResources();
    fetchUsers();
  }, []);

  const fetchPublicBooks = async () => {
    const { data } = await supabase
      .from('books')
      .select('*, user_profiles(username)')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    if (data) setPublicBooks(data);
  };

  const fetchResources = async () => {
    const { data } = await supabase
      .from('resources')
      .select('*, user_profiles(username)')
      .order('created_at', { ascending: false });
    if (data) setResources(data);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setUsers(data);
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { data, error } = await supabase
      .from('resources')
      .insert([{
        ...newResource,
        user_id: user.id,
        likes: 0
      }])
      .select()
      .single();

    if (data) {
      setResources([data, ...resources]);
      setShowResourceForm(false);
      setNewResource({ title: '', content: '', category: 'writing_tips', tags: [] });
    }
  };

  const handleLike = async (type: 'book' | 'resource', id: string) => {
    if (!user) return;

    const table = type === 'book' ? 'books' : 'resources';
    const { data } = await supabase
      .from(table)
      .select('likes')
      .eq('id', id)
      .single();

    if (data) {
      await supabase
        .from(table)
        .update({ likes: data.likes + 1 })
        .eq('id', id);

      if (type === 'book') {
        setPublicBooks(books => books.map(b => 
          b.id === id ? { ...b, likes: (b.likes || 0) + 1 } : b
        ));
      } else {
        setResources(resources => resources.map(r => 
          r.id === id ? { ...r, likes: (r.likes || 0) + 1 } : r
        ));
      }
    }
  };

  const handleFollow = async (userId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('follows')
      .insert([{
        follower_id: user.id,
        following_id: userId
      }]);

    if (!error) {
      fetchUsers(); // Refresh users list
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Writing Community</h2>
        <p className="mt-2 text-gray-600">Connect with fellow writers, share resources, and find inspiration.</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search books, resources, or writers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('books')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'books' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Books
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'resources' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Resources
          </button>
          <button
            onClick={() => setActiveTab('writers')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'writers' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Writers
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'books' && (
        <div className="grid gap-6">
          {publicBooks.map(book => (
            <div key={book.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{book.title}</h3>
                  {book.subtitle && (
                    <p className="text-gray-600 mt-1">{book.subtitle}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    By {(book as any).user_profiles?.username}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleLike('book', book.id)}
                    className="text-gray-400 hover:text-indigo-600"
                  >
                    <ThumbsUp className="w-5 h-5" />
                    <span className="text-sm ml-1">{book.likes || 0}</span>
                  </button>
                  <button className="text-gray-400 hover:text-indigo-600">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-sm ml-1">{book.comments_count || 0}</span>
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-600">
                  {book.description || 'No description available'}
                </p>
              </div>

              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, (book.current_word_count / book.target_word_count) * 100)}%`
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {book.current_word_count.toLocaleString()} / {book.target_word_count.toLocaleString()} words
                </p>
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <span>Genre: {book.genre || 'Unspecified'}</span>
                <span>•</span>
                <span>{book.status.replace('_', ' ').charAt(0).toUpperCase() + book.status.slice(1)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowResourceForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5" />
              Share Resource
            </button>
          </div>

          {showResourceForm && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Share a Writing Resource</h3>
              <form onSubmit={handleResourceSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={newResource.content}
                    onChange={(e) => setNewResource({ ...newResource, content: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newResource.category}
                    onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="writing_tips">Writing Tips</option>
                    <option value="publishing">Publishing</option>
                    <option value="marketing">Marketing</option>
                    <option value="craft">Writing Craft</option>
                    <option value="inspiration">Inspiration</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResourceForm(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Share Resource
                  </button>
                </div>
              </form>
            </div>
          )}

          {resources.map(resource => (
            <div key={resource.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{resource.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    By {(resource as any).user_profiles?.username} • {resource.category.replace('_', ' ')}
                  </p>
                </div>
                <button 
                  onClick={() => handleLike('resource', resource.id)}
                  className="text-gray-400 hover:text-indigo-600"
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span className="text-sm ml-1">{resource.likes || 0}</span>
                </button>
              </div>

              <div className="mt-4">
                <p className="text-gray-600">{resource.content}</p>
              </div>

              {resource.tags && resource.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {resource.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'writers' && (
        <div className="grid gap-6 md:grid-cols-2">
          {users.map(writer => (
            <div key={writer.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{writer.username}</h3>
                  {writer.bio && (
                    <p className="text-gray-600 mt-1">{writer.bio}</p>
                  )}
                  <div className="mt-2 text-sm text-gray-500">
                    <span>{writer.followers?.length || 0} followers</span>
                    <span className="mx-2">•</span>
                    <span>{writer.following?.length || 0} following</span>
                  </div>
                </div>
                {user && user.id !== writer.id && (
                  <button
                    onClick={() => handleFollow(writer.id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Follow
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}