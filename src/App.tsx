import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { ProfileSetup } from './components/ProfileSetup';
import { MainApp } from './components/MainApp';

function App() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (!profile) {
    return <ProfileSetup />;
  }

  return <MainApp />;
}

export default App;
