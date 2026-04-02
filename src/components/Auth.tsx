import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Heart, ArrowRight, Check, Mail, Lock, Sparkles } from 'lucide-react';

const VALID_DOMAINS = [
  'stanford.edu', 'berkeley.edu', 'ucla.edu', 'mit.edu', 'harvard.edu',
  'yale.edu', 'princeton.edu', 'columbia.edu', 'upenn.edu', 'cornell.edu',
  'dartmouth.edu', 'brown.edu', 'northwestern.edu', 'duke.edu', 'jhu.edu',
  'caltech.edu', 'uchicago.edu', 'rice.edu', 'vanderbilt.edu', 'wustl.edu',
  'emory.edu', 'georgetown.edu', 'cmu.edu', 'usc.edu', 'tufts.edu',
  'nyu.edu', 'bu.edu', 'bc.edu', 'brandeis.edu', 'rochester.edu',
  'case.edu', 'uci.edu', 'ucsd.edu', 'ucsb.edu', 'ucdavis.edu',
  'ucsc.edu', 'ucr.edu', 'ucmerced.edu', 'utexas.edu', 'umich.edu',
  'gatech.edu', 'uiuc.edu', 'wisc.edu', 'washington.edu', 'unc.edu',
  'pitt.edu', 'osu.edu', 'psu.edu', 'umn.edu', 'msu.edu',
  'purdue.edu', 'ufl.edu', 'umd.edu', 'vt.edu', 'uva.edu',
  'ncsu.edu', 'rutgers.edu', 'asu.edu', 'ua.edu', 'auburn.edu',
  'fsu.edu', 'usf.edu', 'ucf.edu', 'miami.edu', 'fiu.edu',
  'gsu.edu', 'uga.edu', 'uiowa.edu', 'iastate.edu', 'ku.edu',
  'ksu.edu', 'uky.edu', 'louisville.edu', 'tulane.edu', 'lsu.edu',
  'maine.edu', 'bowdoin.edu', 'umd.edu', 'umass.edu', 'neu.edu',
  'wayne.edu', 'mtu.edu', 'wmich.edu', 'umn.edu', 'stthomas.edu',
  'olemiss.edu', 'msstate.edu', 'mizzou.edu', 'slu.edu', 'umt.edu',
  'montana.edu', 'unl.edu', 'uno.edu', 'unr.edu', 'unlv.edu',
  'unh.edu', 'princeton.edu', 'rutgers.edu', 'njit.edu', 'stevens.edu',
  'unm.edu', 'nmsu.edu', 'rpi.edu', 'rit.edu', 'buffalo.edu',
  'binghamton.edu', 'stonybrook.edu', 'albany.edu', 'fordham.edu',
  'syracuse.edu', 'union.edu', 'hamilton.edu', 'colgate.edu',
  'vassar.edu', 'pace.edu', 'sjfc.edu', 'baruch.cuny.edu',
  'nd.edu', 'iupui.edu', 'bsu.edu', 'valpo.edu', 'butler.edu',
  'oregonstate.edu', 'uoregon.edu', 'pdx.edu', 'up.edu', 'reed.edu',
  'drexel.edu', 'temple.edu', 'lehigh.edu', 'lafayette.edu',
  'swarthmore.edu', 'haverford.edu', 'brynmawr.edu', 'villanova.edu',
  'gettysburg.edu', 'bucknell.edu', 'dickinson.edu', 'uri.edu',
  'clemson.edu', 'sc.edu', 'cofc.edu', 'usd.edu', 'sdstate.edu',
  'utk.edu', 'memphis.edu', 'etsu.edu', 'belmont.edu', 'lipscomb.edu',
  'tamu.edu', 'uh.edu', 'uta.edu', 'baylor.edu', 'ttu.edu',
  'txstate.edu', 'unt.edu', 'utsa.edu', 'shsu.edu', 'sfasu.edu',
  'lamar.edu', 'tarleton.edu', 'twu.edu', 'utrgv.edu', 'utpb.edu',
  'uttyler.edu', 'pvamu.edu', 'utdallas.edu', 'utah.edu', 'byu.edu',
  'usu.edu', 'uvu.edu', 'suu.edu', 'weber.edu', 'uvm.edu',
  'middlebury.edu', 'bennington.edu', 'vcu.edu', 'gmu.edu',
  'richmond.edu', 'wm.edu', 'hampden.edu', 'wsu.edu', 'pugetsound.edu',
  'seattle.edu', 'wwu.edu', 'gonzaga.edu', 'wvu.edu', 'marshall.edu',
  'uwm.edu', 'marquette.edu', 'uwec.edu', 'uwgb.edu',
  'uwlax.edu', 'uwosh.edu', 'uwp.edu', 'uwrf.edu', 'uwsp.edu',
  'uwstout.edu', 'uww.edu', 'lawrence.edu', 'beloit.edu', 'ripon.edu',
  'uwyo.edu', 'gwu.edu', 'american.edu', 'howard.edu', 'cua.edu',
];

type AuthStep = 'choice' | 'login' | 'signup-email' | 'signup-password';

export function Auth() {
  const [step, setStep] = useState<AuthStep>('choice');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const validateEmail = (emailValue: string): { valid: boolean; error?: string } => {
    if (!emailValue.endsWith('.edu')) {
      return { valid: false, error: 'Must use a .edu email address' };
    }

    const domain = emailValue.split('@')[1]?.toLowerCase();
    if (!domain) {
      return { valid: false, error: 'Invalid email format' };
    }

    const isValidUniversity = VALID_DOMAINS.includes(domain);
    if (!isValidUniversity) {
      return { valid: false, error: 'University email not recognized' };
    }

    return { valid: true };
  };

  const validatePassword = (pwd: string): { valid: boolean; error?: string } => {
    if (pwd.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(pwd)) {
      return { valid: false, error: 'Password must include uppercase letter' };
    }
    if (!/[0-9]/.test(pwd)) {
      return { valid: false, error: 'Password must include number' };
    }
    return { valid: true };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = validateEmail(email);
    if (!validation.valid) {
      setError(validation.error || 'Invalid email');
      return;
    }

    setStep('signup-password');
  };

  const handleSignupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const validation = validatePassword(password);
    if (!validation.valid) {
      setError(validation.error || 'Invalid password');
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
      {step === 'choice' && (
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Heart className="w-16 h-16 text-rose-500 fill-rose-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Campus Connect</h1>
            <p className="text-gray-600 text-lg">Find your connection on campus</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setStep('login');
                setError('');
                setEmail('');
                setPassword('');
              }}
              className="w-full bg-rose-500 text-white py-4 rounded-xl font-semibold hover:bg-rose-600 transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-lg"
            >
              Sign In
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setStep('signup-email');
                setError('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold hover:bg-orange-600 transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-lg"
            >
              Create Account
              <Sparkles className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-10 bg-white rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 text-center mb-4">What you get:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Browse profiles from your campus</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Like or pass on profiles you like</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Chat with your matches instantly</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'login' && (
        <div className="w-full max-w-md">
          <button
            onClick={() => setStep('choice')}
            className="text-gray-600 hover:text-gray-900 font-medium mb-6 flex items-center gap-1"
          >
            ← Back
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600 mb-8">Sign in to your account</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition"
                    placeholder="you@university.edu"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}

      {step === 'signup-email' && (
        <div className="w-full max-w-md">
          <button
            onClick={() => setStep('choice')}
            className="text-gray-600 hover:text-gray-900 font-medium mb-6 flex items-center gap-1"
          >
            ← Back
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
            <p className="text-gray-600 mb-2">Step 1 of 2</p>

            <form onSubmit={handleSignupEmail} className="space-y-4">
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                  University Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder="you@university.edu"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">We only accept .edu emails from recognized universities</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {step === 'signup-password' && (
        <div className="w-full max-w-md">
          <button
            onClick={() => setStep('signup-email')}
            className="text-gray-600 hover:text-gray-900 font-medium mb-6 flex items-center gap-1"
          >
            ← Back
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your Password</h2>
            <p className="text-gray-600 mb-2">Step 2 of 2</p>

            <form onSubmit={handleSignupPassword} className="space-y-4">
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 space-y-1">
                <p className="font-medium">Password requirements:</p>
                <ul className="text-xs space-y-1 ml-2">
                  <li>• At least 8 characters</li>
                  <li>• One uppercase letter</li>
                  <li>• One number</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
