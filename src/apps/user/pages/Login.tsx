// src/apps/user/pages/Login.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@shared/contexts/AuthContext';
import { loginUser } from '@shared/api/auth/authApi';
import { LoginSEO } from '@shared/components/SEO';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showReactivateLink, setShowReactivateLink] = useState(false);

  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  // If the session was already restored (e.g. returning to a tab), redirect
  // away from the login page without requiring the user to log in again.
  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      if (redirectUrl) {
        if (redirectUrl.startsWith('http')) {
          window.location.href = redirectUrl;
        } else {
          navigate(redirectUrl, { replace: true });
        }
      } else {
        navigate('/browse-events', { replace: true });
      }
    }
  }, [isAuthenticated, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowReactivateLink(false);
    setIsLoading(true);

    try {
      const response = await loginUser({ email, password });
      await login(response);

      if (redirectUrl) {
        if (redirectUrl.startsWith('http')) {
          window.location.href = redirectUrl;
        } else {
          navigate(redirectUrl, { replace: true });
        }
      } else {
        navigate('/browse-events', { replace: true });
      }
    } catch (err: any) {
      const errorDetail = err.response?.data?.detail || 'Invalid email or password';
      setError(errorDetail);

      if (
        err.response?.status === 403 ||
        errorDetail.toLowerCase().includes('inactive') ||
        errorDetail.toLowerCase().includes('deactivated')
      ) {
        setShowReactivateLink(true);
        setError('Your account was deactivated!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render the form while AuthContext is still restoring the session —
  // prevents a flash of the login form for already-authenticated users.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600" />
      </div>
    );
  }

  return (
    <>
      <LoginSEO />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Login to MGLTickets</h1>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
                {showReactivateLink && (
                  <p className="mt-2">
                    <Link to="/reactivate-account" className="font-semibold underline">
                      Click here to reactivate your account
                    </Link>
                  </p>
                )}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
                disabled={isLoading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="mb-4 text-right">
              <Link to="/forgot-password" className="text-sm text-orange-600 hover:text-orange-800 font-semibold">
                Forgot Password?
              </Link>
            </div>

            <div className="mb-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed w-full"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-orange-600 hover:text-orange-800 font-semibold">
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;