import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Camera, MapPin, GraduationCap, Cake, CreditCard as Edit2, Save, X, Navigation, Upload, Image as ImageIcon, Zap } from 'lucide-react';

const INTERESTS = [
  'Sports', 'Music', 'Art', 'Photography', 'Travel', 'Movies', 'Reading',
  'Gaming', 'Cooking', 'Fitness', 'Hiking', 'Coffee', 'Food', 'Fashion',
  'Technology', 'Science', 'Politics', 'Volunteering', 'Dancing', 'Yoga'
];

export function Profile() {
  const { profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [generatingProfiles, setGeneratingProfiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    major: '',
    photo_url: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name,
        bio: profile.bio,
        major: profile.major,
        photo_url: profile.photo_url || '',
        latitude: profile.latitude,
        longitude: profile.longitude,
      });
      setSelectedInterests(profile.interests || []);
    }
  }, [profile]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setLocationError('');
      },
      (error) => {
        setLocationError(`Location access denied: ${error.message}`);
      }
    );
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo_url: reader.result as string }));
        setShowPhotoMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          major: formData.major,
          photo_url: formData.photo_url,
          latitude: formData.latitude,
          longitude: formData.longitude,
          last_location_update: formData.latitude ? new Date().toISOString() : null,
          interests: selectedInterests,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;
      await refreshProfile();
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const generateFakeProfiles = async (count: number = 50) => {
    setGeneratingProfiles(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/generate-fake-profiles?count=${count}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate profiles');
      }

      const result = await response.json();
      alert(`Generated ${result.profiles_created} profiles, ${result.swipes_created} swipes, ${result.matches_created} matches, and ${result.messages_created} messages!`);
    } catch (err) {
      console.error('Error generating profiles:', err);
      alert('Error generating profiles. Check console for details.');
    } finally {
      setGeneratingProfiles(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="relative h-48 bg-gradient-to-br from-rose-400 to-orange-400">
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden group cursor-pointer">
                  {(isEditing ? formData.photo_url : profile.photo_url) ? (
                    <img
                      src={isEditing ? formData.photo_url : profile.photo_url || ''}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400 font-bold">
                      {profile.full_name[0]}
                    </div>
                  )}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                      className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {isEditing && showPhotoMenu && (
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 space-y-1 w-48 z-10">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded flex items-center gap-3 transition"
                    >
                      <Upload className="w-5 h-5 text-rose-500" />
                      <span>Upload from Device</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPhotoMenu(false)}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded flex items-center gap-3 transition"
                    >
                      <ImageIcon className="w-5 h-5 text-orange-500" />
                      <span>Paste URL Below</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-20 pb-6 px-6">
            {!isEditing ? (
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {profile.full_name}, {profile.age}
                </h2>
                <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.university}</span>
                </div>
                {profile.major && (
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <GraduationCap className="w-4 h-4" />
                    <span>{profile.major} {profile.graduation_year && `'${profile.graduation_year.toString().slice(-2)}`}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo URL</label>
                  <input
                    type="text"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    placeholder="Or paste an image URL here"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>
            )}

            {profile.bio && !isEditing && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">About</h3>
                <p className="text-gray-600">{profile.bio}</p>
              </div>
            )}

            {isEditing && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none resize-none"
                />
              </div>
            )}

            {((profile.interests && profile.interests.length > 0) || isEditing) && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {isEditing ? (
                    INTERESTS.map(interest => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                          selectedInterests.includes(interest)
                            ? 'bg-rose-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {interest}
                      </button>
                    ))
                  ) : (
                    profile.interests.map(interest => (
                      <span
                        key={interest}
                        className="px-4 py-2 bg-rose-50 text-rose-600 rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}

            {(profile.latitude || isEditing) && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Location</h3>
                {!isEditing && profile.latitude && profile.longitude && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
                    <Navigation className="w-4 h-4 text-orange-500" />
                    <span>Location shared • Connected with nearby people</span>
                  </div>
                )}
                {isEditing && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={requestLocation}
                      className={`w-full px-4 py-3 rounded-lg font-semibold transition ${
                        formData.latitude
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {formData.latitude ? '✓ Location Added' : 'Update Location'}
                    </button>
                    {locationError && (
                      <p className="text-red-500 text-sm">{locationError}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex gap-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 transition flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-5 h-5" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </>
                )}
              </div>

              {!isEditing && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-xs text-gray-500 mb-2 text-center">Testing Tools</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => generateFakeProfiles(30)}
                      disabled={generatingProfiles}
                      className="bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <Zap className="w-4 h-4" />
                      {generatingProfiles ? 'Generating...' : 'Generate 30'}
                    </button>
                    <button
                      onClick={() => generateFakeProfiles(100)}
                      disabled={generatingProfiles}
                      className="bg-indigo-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <Zap className="w-4 h-4" />
                      {generatingProfiles ? 'Generating...' : 'Generate 100'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
