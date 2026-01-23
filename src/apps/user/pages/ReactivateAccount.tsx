import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ReactivateAccountSEO } from '@shared/components/SEO';
import type { ReactivateAccountResponse } from '@shared/types/Auth';
import { reactivateUserAccount } from '@shared/api/auth/authApi';

export default function ReactivateAccount() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterLink, setShowRegisterLink] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowRegisterLink(false);
    setIsLoading(true);

    try {
      const data: ReactivateAccountResponse = await reactivateUserAccount(email);

      if (!data.success) {
        throw new Error(data.message || 'Failed to reactivate account');
      }

      alert('Account reactivated successfully! Please login.');
      navigate('/login');
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred. Please try again.';
      setError(errorMessage);
      
      // Check if the error indicates user doesn't exist
      if (err.message?.toLowerCase().includes('not found') || err.message?.toLowerCase().includes('does not exist')) {
        setShowRegisterLink(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ReactivateAccountSEO />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h1 className="text-2xl font-bold mb-2 text-center">Reactivate Account</h1>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Welcome back! Enter your email to reactivate your account
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
                {showRegisterLink && (
                  <p className="mt-2">
                    <Link to="/register" className="font-semibold underline">
                      Click here to create a new account
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
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
                disabled={isLoading}
              />
            </div>

            {/* <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
                disabled={isLoading}
              />
            </div> */}

            <div className="mb-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed w-full"
              >
                {isLoading ? 'Reactivating...' : 'Reactivate Account'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                <Link to="/login" className="text-orange-600 hover:text-orange-800 font-semibold">
                  Back to Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}