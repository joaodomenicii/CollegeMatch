import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Camera, Upload, Image as ImageIcon, Trash2, Plus } from 'lucide-react';

const US_UNIVERSITIES = [
  // Alabama
  'University of Alabama',
  'Auburn University',
  'Alabama A&M University',
  'University of South Alabama',
  'Samford University',

  // Alaska
  'University of Alaska Anchorage',
  'University of Alaska Fairbanks',

  // Arizona
  'Arizona State University',
  'University of Arizona',
  'Northern Arizona University',
  'Grand Canyon University',

  // Arkansas
  'University of Arkansas',
  'Arkansas State University',
  'Hendrix College',

  // California
  'UC Berkeley',
  'UCLA',
  'UC San Diego',
  'UC Santa Barbara',
  'UC Irvine',
  'UC Davis',
  'UC Riverside',
  'UC Santa Cruz',
  'USC',
  'Stanford University',
  'Caltech',
  'San Diego State University',
  'San Jose State University',
  'California State University Fullerton',
  'California State University Long Beach',
  'Pepperdine University',
  'Santa Clara University',
  'University of San Francisco',
  'San Francisco State University',
  'Loyola Marymount University',
  'Chapman University',
  'Biola University',
  'Azusa Pacific University',

  // Colorado
  'University of Colorado Boulder',
  'Colorado State University',
  'University of Denver',
  'Colorado School of Mines',

  // Connecticut
  'Yale University',
  'University of Connecticut',
  'Wesleyan University',
  'Trinity College',
  'Quinnipiac University',
  'Southern Connecticut State University',

  // Delaware
  'University of Delaware',
  'Delaware State University',

  // Florida
  'University of Florida',
  'Florida State University',
  'University of South Florida',
  'University of Central Florida',
  'University of Miami',
  'Florida International University',
  'Florida Atlantic University',
  'Florida Gulf Coast University',
  'Stetson University',
  'Florida Tech',
  'Barry University',
  'Florida National University',
  'Rollins College',
  'University of Tampa',
  'Nova Southeastern University',
  'Jacksonville University',

  // Georgia
  'Georgia Tech',
  'University of Georgia',
  'Emory University',
  'Georgia State University',
  'Georgia Southern University',
  'Mercer University',
  'Kennesaw State University',
  'Savannah College of Art and Design',

  // Hawaii
  'University of Hawaii at Manoa',
  'Brigham Young University Hawaii',
  'Hawaii Pacific University',

  // Idaho
  'University of Idaho',
  'Boise State University',
  'Idaho State University',

  // Illinois
  'University of Illinois Urbana-Champaign',
  'Northwestern University',
  'University of Chicago',
  'Illinois Institute of Technology',
  'DePaul University',
  'Loyola University Chicago',
  'University of Illinois Chicago',
  'Northern Illinois University',
  'Southern Illinois University Carbondale',

  // Indiana
  'Purdue University',
  'Indiana University Bloomington',
  'Notre Dame',
  'Indiana University-Purdue University Indianapolis',
  'Ball State University',
  'Valparaiso University',
  'Butler University',
  'Rose-Hulman Institute of Technology',

  // Iowa
  'University of Iowa',
  'Iowa State University',
  'Grinnell College',
  'Drake University',
  'University of Northern Iowa',

  // Kansas
  'University of Kansas',
  'Kansas State University',
  'Wichita State University',
  'Kansas City University',

  // Kentucky
  'University of Kentucky',
  'University of Louisville',
  'Bellarmine University',
  'Transylvania University',
  'Eastern Kentucky University',

  // Louisiana
  'Tulane University',
  'Louisiana State University',
  'University of Louisiana at Lafayette',
  'Loyola University New Orleans',
  'Xavier University of Louisiana',

  // Maine
  'University of Maine',
  'Bowdoin College',
  'Colby College',
  'Bates College',

  // Maryland
  'University of Maryland College Park',
  'Johns Hopkins University',
  'Towson University',
  'University of Maryland Baltimore County',
  'Frostburg State University',
  'Morgan State University',
  'Salisbury University',

  // Massachusetts
  'Harvard University',
  'MIT',
  'Boston University',
  'Boston College',
  'Brandeis University',
  'Tufts University',
  'Northeastern University',
  'UMass Amherst',
  'UMass Boston',
  'UMass Lowell',
  'Worcester Polytechnic Institute',
  'Wellesley College',
  'Smith College',
  'Mount Holyoke College',
  'Hampshire College',
  'Amherst College',
  'Williams College',
  'Babson College',

  // Michigan
  'University of Michigan',
  'Michigan State University',
  'University of Michigan Dearborn',
  'Michigan Technological University',
  'Wayne State University',
  'Western Michigan University',
  'Central Michigan University',
  'Oakland University',
  'Kalamazoo College',

  // Minnesota
  'University of Minnesota Twin Cities',
  'University of St. Thomas',
  'Macalester College',
  'Carleton College',
  'Minnesota State University Mankato',
  'University of Minnesota Duluth',

  // Mississippi
  'University of Mississippi',
  'Mississippi State University',
  'University of Southern Mississippi',
  'Mississippi Valley State University',

  // Missouri
  'University of Missouri',
  'Washington University in St. Louis',
  'Saint Louis University',
  'University of Missouri Kansas City',
  'Missouri State University',
  'University of Central Missouri',
  'Rockhurst University',

  // Montana
  'University of Montana',
  'Montana State University',
  'University of Montana Western',

  // Nebraska
  'University of Nebraska Lincoln',
  'University of Nebraska Omaha',
  'University of Nebraska Kearney',
  'Creighton University',

  // Nevada
  'University of Nevada Las Vegas',
  'University of Nevada Reno',
  'Nevada State College',

  // New Hampshire
  'Dartmouth College',
  'University of New Hampshire',
  'Plymouth State University',
  'Keene State College',

  // New Jersey
  'Princeton University',
  'Rutgers University New Brunswick',
  'Rutgers University Newark',
  'New Jersey Institute of Technology',
  'Stevens Institute of Technology',
  'Seton Hall University',
  'Fairleigh Dickinson University',
  'Montclair State University',
  'Kean University',

  // New Mexico
  'University of New Mexico',
  'New Mexico State University',
  'New Mexico Institute of Mining and Technology',

  // New York
  'Cornell University',
  'Columbia University',
  'NYU',
  'Rensselaer Polytechnic Institute',
  'Rochester Institute of Technology',
  'University at Buffalo',
  'CUNY City College',
  'CUNY Queens College',
  'CUNY Hunter College',
  'State University of New York at Binghamton',
  'State University of New York at Stony Brook',
  'State University of New York at Albany',
  'Fordham University',
  'Syracuse University',
  'Union College',
  'Hamilton College',
  'Colgate University',
  'Vassar College',
  'Sarah Lawrence College',
  'Pace University',
  'St. John\'s University',
  'Iona College',
  'Manhattan College',
  'Baruch College',

  // North Carolina
  'Duke University',
  'University of North Carolina at Chapel Hill',
  'University of North Carolina at Charlotte',
  'North Carolina State University',
  'Wake Forest University',
  'University of North Carolina at Greensboro',
  'University of North Carolina at Wilmington',
  'Appalachian State University',
  'Elon University',
  'Davidson College',

  // North Dakota
  'University of North Dakota',
  'North Dakota State University',

  // Ohio
  'Ohio State University',
  'Case Western Reserve University',
  'University of Cincinnati',
  'Ohio University',
  'Miami University',
  'Cleveland State University',
  'University of Toledo',
  'Kent State University',
  'Bowling Green State University',
  'Denison University',
  'Oberlin College',
  'Kenyon College',

  // Oklahoma
  'University of Oklahoma',
  'Oklahoma State University',
  'University of Tulsa',
  'Oklahoma City University',

  // Oregon
  'University of Oregon',
  'Oregon State University',
  'Portland State University',
  'University of Portland',
  'Reed College',
  'Lewis and Clark College',

  // Pennsylvania
  'University of Pennsylvania',
  'Carnegie Mellon University',
  'Drexel University',
  'Temple University',
  'University of Pittsburgh',
  'Pennsylvania State University',
  'Lehigh University',
  'Lafayette College',
  'Swarthmore College',
  'Haverford College',
  'Bryn Mawr College',
  'Villanova University',
  'Gettysburg College',
  'Bucknell University',
  'Dickinson College',

  // Rhode Island
  'Brown University',
  'University of Rhode Island',
  'Rhode Island School of Design',

  // South Carolina
  'University of South Carolina',
  'Clemson University',
  'College of Charleston',
  'University of South Carolina Aiken',
  'Furman University',
  'Winthrop University',

  // South Dakota
  'University of South Dakota',
  'South Dakota State University',

  // Tennessee
  'Vanderbilt University',
  'University of Tennessee',
  'Tennessee Technological University',
  'University of Memphis',
  'East Tennessee State University',
  'Belmont University',
  'Lipscomb University',
  'Fisk University',
  'Tennessee State University',

  // Texas
  'University of Texas at Austin',
  'Rice University',
  'Southern Methodist University',
  'Texas A&M University',
  'University of Houston',
  'University of Texas at Arlington',
  'Baylor University',
  'Texas Tech University',
  'Texas State University',
  'University of North Texas',
  'University of Texas at San Antonio',
  'Sam Houston State University',
  'Stephen F. Austin State University',
  'Lamar University',
  'Tarleton State University',
  'Texas Woman\'s University',
  'UT Rio Grande Valley',
  'UT Permian Basin',
  'UT Tyler',
  'Prairie View A&M University',
  'University of Texas at Dallas',

  // Utah
  'University of Utah',
  'Brigham Young University',
  'Utah State University',
  'University of Utah Valley',
  'Southern Utah University',
  'Weber State University',

  // Vermont
  'University of Vermont',
  'Middlebury College',
  'Bennington College',
  'Marlboro College',

  // Virginia
  'University of Virginia',
  'Virginia Tech',
  'College of William and Mary',
  'Virginia Commonwealth University',
  'George Mason University',
  'University of Richmond',
  'Roanoke College',
  'Randolph-Macon College',
  'Sweet Briar College',
  'Hampton University',
  'Howard University',

  // Washington
  'University of Washington',
  'Washington State University',
  'University of Puget Sound',
  'Seattle University',
  'Western Washington University',
  'Gonzaga University',
  'University of Washington Bothell',
  'University of Washington Tacoma',

  // West Virginia
  'West Virginia University',
  'Marshall University',
  'West Virginia University Institute of Technology',

  // Wisconsin
  'University of Wisconsin Madison',
  'University of Wisconsin Milwaukee',
  'Marquette University',
  'University of Wisconsin Eau Claire',
  'University of Wisconsin Green Bay',
  'University of Wisconsin La Crosse',
  'University of Wisconsin Oshkosh',
  'University of Wisconsin Platteville',
  'University of Wisconsin River Falls',
  'University of Wisconsin Stevens Point',
  'University of Wisconsin Stout',
  'University of Wisconsin Whitewater',
  'Lawrence University',
  'Beloit College',
  'Ripon College',

  // Wyoming
  'University of Wyoming',
  'Wyoming Catholic College',

  // Washington DC
  'Georgetown University',
  'George Washington University',
  'Howard University',
  'American University',
  'Catholic University of America',
].sort();

const INTERESTS = [
  'Sports', 'Music', 'Art', 'Photography', 'Travel', 'Movies', 'Reading',
  'Gaming', 'Cooking', 'Fitness', 'Hiking', 'Coffee', 'Food', 'Fashion',
  'Technology', 'Science', 'Politics', 'Volunteering', 'Dancing', 'Yoga'
];

export function ProfileSetup() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    university: '',
    major: '',
    graduation_year: new Date().getFullYear(),
    age: 18,
    gender: '',
    looking_for: '',
    photo_url: '',
    additional_photos: [] as string[],
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [locationError, setLocationError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').insert({
        id: user.id,
        full_name: formData.full_name,
        bio: formData.bio,
        university: formData.university,
        major: formData.major,
        graduation_year: formData.graduation_year,
        age: formData.age,
        gender: formData.gender,
        looking_for: formData.looking_for,
        photo_url: formData.photo_url,
        additional_photos: formData.additional_photos,
        interests: selectedInterests,
        latitude: formData.latitude,
        longitude: formData.longitude,
        last_location_update: formData.latitude ? new Date().toISOString() : null,
      });

      if (error) throw error;
      await refreshProfile();
    } catch (err) {
      console.error('Error creating profile:', err);
      alert('Error creating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, isAdditional = false) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (isAdditional) {
          setFormData({
            ...formData,
            additional_photos: [...formData.additional_photos, result],
          });
        } else {
          setFormData({ ...formData, photo_url: result });
        }
        setShowPhotoMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAdditionalPhoto = (index: number) => {
    setFormData({
      ...formData,
      additional_photos: formData.additional_photos.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 p-4 overflow-y-auto">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 my-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
        <p className="text-gray-600 mb-8">Let others know who you are</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center relative group cursor-pointer overflow-hidden">
                {formData.photo_url ? (
                  <img src={formData.photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-12 h-12 text-gray-400" />
                )}
                <button
                  type="button"
                  onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                  className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                >
                  <Camera className="w-8 h-8 text-white" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {showPhotoMenu && (
              <div className="mt-4 bg-white rounded-lg shadow-lg border border-gray-200 p-2 space-y-1">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
            <input
              type="text"
              value={formData.photo_url}
              onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
              placeholder="Paste an image URL here"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none mb-3"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Or Upload from Device
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Additional Photos (Optional)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
              {formData.additional_photos.map((photo, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                  <img src={photo} alt={`Additional ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeAdditionalPhoto(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, true)}
              className="hidden"
              id="additionalPhotoInput"
            />
            <button
              type="button"
              onClick={() => document.getElementById('additionalPhotoInput')?.click()}
              className="w-full px-4 py-2 border-2 border-dashed border-rose-300 rounded-lg text-rose-600 hover:bg-rose-50 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add More Photos
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                required
                min="18"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
            <select
              required
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
            >
              <option value="">Select your university</option>
              {US_UNIVERSITIES.map(uni => (
                <option key={uni} value={uni}>{uni}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
              <input
                type="text"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                placeholder="Computer Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
              <input
                type="number"
                value={formData.graduation_year}
                onChange={(e) => setFormData({ ...formData, graduation_year: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Looking For</label>
              <select
                value={formData.looking_for}
                onChange={(e) => setFormData({ ...formData, looking_for: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Everyone">Everyone</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(interest => (
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
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location (Optional)</label>
            <p className="text-sm text-gray-600 mb-3">Share your location to connect with people nearby on campus</p>
            <button
              type="button"
              onClick={requestLocation}
              className={`w-full px-4 py-3 rounded-lg font-semibold transition ${
                formData.latitude
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {formData.latitude ? '✓ Location Added' : 'Share My Location'}
            </button>
            {locationError && (
              <p className="text-red-500 text-sm mt-2">{locationError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 transition disabled:opacity-50"
          >
            {loading ? 'Creating Profile...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
