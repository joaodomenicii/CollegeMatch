import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Heart } from 'lucide-react';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const verifyEmailDomain = (email: string): { valid: boolean; error?: string } => {
    if (!email.endsWith('.edu')) {
      return { valid: false, error: 'Please use a .edu email address to sign up' };
    }

    const emailParts = email.split('@');
    if (emailParts.length !== 2) {
      return { valid: false, error: 'Invalid email format' };
    }

    const domain = emailParts[1].toLowerCase();

    const validDomains = [
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

    const shortDomain = domain.split('.edu')[0];
    const isValidUniversity = validDomains.some(valid =>
      domain === valid || domain.includes(shortDomain)
    );

    if (!isValidUniversity && !domain.endsWith('.edu')) {
      return { valid: false, error: 'Please use a valid university email address' };
    }

    return { valid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isLogin) {
      const verification = verifyEmailDomain(email);
      if (!verification.valid) {
        setError(verification.error || 'Invalid email');
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Heart className="w-12 h-12 text-rose-500 fill-rose-500" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Campus Connect</h1>
        <p className="text-center text-gray-600 mb-8">Find your connection on campus</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition"
              placeholder="you@university.edu"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-rose-500 hover:text-rose-600 font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
