import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Profile, Match } from '../lib/supabase';
import { MessageCircle, Heart } from 'lucide-react';
import { Chat } from './Chat';

type MatchWithProfile = Match & {
  profile: Profile;
};

export function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithProfile | null>(null);

  useEffect(() => {
    loadMatches();
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: matchesData, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const matchesWithProfiles = await Promise.all(
        (matchesData || []).map(async (match) => {
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherUserId)
            .single();

          return {
            ...match,
            profile: profileData!,
          };
        })
      );

      setMatches(matchesWithProfiles);
    } catch (err) {
      console.error('Error loading matches:', err);
    } finally {
      setLoading(false);
    }
  };

  if (selectedMatch) {
    return <Chat match={selectedMatch} onBack={() => setSelectedMatch(null)} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-md">
          <Heart className="w-16 h-16 text-rose-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No matches yet</h3>
          <p className="text-gray-600">
            Start swiping to find your connections on campus
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Matches</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((match) => (
            <button
              key={match.id}
              onClick={() => setSelectedMatch(match)}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 flex items-center gap-4 text-left"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex-shrink-0 overflow-hidden">
                {match.profile.photo_url ? (
                  <img
                    src={match.profile.photo_url}
                    alt={match.profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-white font-bold">
                    {match.profile.full_name[0]}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">
                  {match.profile.full_name}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {match.profile.university}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {match.profile.major}
                </p>
              </div>

              <MessageCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
