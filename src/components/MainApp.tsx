import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SwipeCards } from './SwipeCards';
import { Matches } from './Matches';
import { Profile } from './Profile';
import { Heart, MessageCircle, User, LogOut } from 'lucide-react';

export function MainApp() {
  const [activeTab, setActiveTab] = useState<'swipe' | 'matches' | 'profile'>('swipe');
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-rose-50 to-orange-50">
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
          <h1 className="text-2xl font-bold text-gray-800">Campus Connect</h1>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 hover:bg-gray-100 rounded-full transition"
          title="Sign out"
        >
          <LogOut className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      <main className="flex-1 overflow-hidden">
        {activeTab === 'swipe' && <SwipeCards />}
        {activeTab === 'matches' && <Matches />}
        {activeTab === 'profile' && <Profile />}
      </main>

      <nav className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => setActiveTab('swipe')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition ${
              activeTab === 'swipe'
                ? 'text-rose-500 bg-rose-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Heart className={`w-6 h-6 ${activeTab === 'swipe' ? 'fill-rose-500' : ''}`} />
            <span className="text-xs font-medium">Discover</span>
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition ${
              activeTab === 'matches'
                ? 'text-rose-500 bg-rose-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs font-medium">Matches</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition ${
              activeTab === 'profile'
                ? 'text-rose-500 bg-rose-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
