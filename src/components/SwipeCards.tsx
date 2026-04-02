import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Profile, calculateDistance } from '../lib/supabase';
import { X, Heart, MapPin, GraduationCap, Sparkles, Navigation, ChevronLeft, ChevronRight } from 'lucide-react';

export function SwipeCards() {
  const { user, profile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    loadProfiles();
  }, [user, profile]);

  const loadProfiles = async () => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      const { data: swipedIds } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const swipedUserIds = swipedIds?.map(s => s.swiped_id) || [];

      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .eq('university', profile.university);

      if (swipedUserIds.length > 0) {
        query = query.not('id', 'in', `(${swipedUserIds.join(',')})`);
      }

      if (profile.looking_for && profile.looking_for !== 'Everyone') {
        query = query.eq('gender', profile.looking_for);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      let sortedProfiles = data || [];

      if (profile.latitude && profile.longitude) {
        sortedProfiles = sortedProfiles
          .map(p => ({
            ...p,
            distance: p.latitude && p.longitude
              ? calculateDistance(profile.latitude!, profile.longitude!, p.latitude, p.longitude)
              : Infinity
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 20);
      } else {
        sortedProfiles = sortedProfiles.slice(0, 20);
      }

      setProfiles(sortedProfiles);
    } catch (err) {
      console.error('Error loading profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (liked: boolean) => {
    if (!user || currentIndex >= profiles.length) return;

    const swipedProfile = profiles[currentIndex];
    setSwipeDirection(liked ? 'right' : 'left');

    setTimeout(async () => {
      try {
        await supabase.from('swipes').insert({
          swiper_id: user.id,
          swiped_id: swipedProfile.id,
          liked,
        });

        setCurrentIndex(prev => prev + 1);
        setCurrentPhotoIndex(0);
        setSwipeDirection(null);
      } catch (err) {
        console.error('Error saving swipe:', err);
      }
    }, 300);
  };

  const getProfilePhotos = () => {
    if (!currentProfile) return [];
    const photos = [currentProfile.photo_url];
    if (currentProfile.additional_photos) {
      photos.push(...currentProfile.additional_photos);
    }
    return photos.filter(p => p);
  };

  const handleNextPhoto = () => {
    const photos = getProfilePhotos();
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    }
  };

  const handlePrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Finding people near you...</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-md">
          <Sparkles className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No more profiles</h3>
          <p className="text-gray-600 mb-6">Check back later for new people on your campus</p>
          <button
            onClick={loadProfiles}
            className="bg-rose-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-600 transition"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  const profilePhotos = currentProfile ? getProfilePhotos() : [];

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div
          className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            swipeDirection === 'left' ? '-translate-x-[200%] rotate-[-20deg] opacity-0' :
            swipeDirection === 'right' ? 'translate-x-[200%] rotate-[20deg] opacity-0' : ''
          }`}
        >
          <div className="relative h-96 bg-gradient-to-br from-gray-200 to-gray-300">
            {profilePhotos.length > 0 ? (
              <img
                src={profilePhotos[currentPhotoIndex]}
                alt={`${currentProfile.full_name} photo`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-gray-400">
                {currentProfile.full_name[0]}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            {profilePhotos.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  disabled={currentPhotoIndex === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/60 disabled:opacity-20 text-white p-2 rounded-full transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  disabled={currentPhotoIndex === profilePhotos.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/60 disabled:opacity-20 text-white p-2 rounded-full transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="absolute top-3 left-0 right-0 flex gap-1 px-3">
              {profilePhotos.map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-1 rounded-full transition ${
                    idx === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="text-3xl font-bold mb-1">
                {currentProfile.full_name}, {currentProfile.age}
              </h2>
              <div className="flex items-center gap-2 text-sm opacity-90 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{currentProfile.university}</span>
              </div>
              {currentProfile.major && (
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <GraduationCap className="w-4 h-4" />
                  <span>{currentProfile.major} {currentProfile.graduation_year && `'${currentProfile.graduation_year.toString().slice(-2)}`}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {currentProfile.bio && (
              <p className="text-gray-700 mb-4">{currentProfile.bio}</p>
            )}

            {profile?.latitude && profile?.longitude && currentProfile.latitude && currentProfile.longitude && (
              <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg mb-4">
                <Navigation className="w-4 h-4" />
                <span>
                  {calculateDistance(profile.latitude, profile.longitude, currentProfile.latitude, currentProfile.longitude).toFixed(1)} miles away
                </span>
              </div>
            )}

            {currentProfile.interests && currentProfile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentProfile.interests.map(interest => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => handleSwipe(false)}
            className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95 border-2 border-red-200 hover:border-red-400"
          >
            <X className="w-7 h-7 text-red-500" />
          </button>
          <button
            onClick={() => handleSwipe(true)}
            className="w-16 h-16 bg-rose-500 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95 hover:bg-rose-600"
          >
            <Heart className="w-8 h-8 text-white fill-white" />
          </button>
        </div>

        {profiles.length > 1 && (
          <div className="text-center mt-4 text-sm text-gray-500">
            {currentIndex + 1} / {profiles.length}
          </div>
        )}
      </div>
    </div>
  );
}
