// src/pages/EmailVerification.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { emailVerification, resendVerificationEmail } from '@shared/api/auth/authApi';
import type { VerificationResponse } from '@shared/types/Auth';
import axios from 'axios';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying');
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Verify email on component mount
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    verifyEmail(token);
  }, [token]);

  // Countdown timer for auto-redirect on success
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      navigate('/login');
    }
  }, [status, countdown, navigate]);

  // Proper error handling
  const verifyEmail = async (verificationToken: string) => {
    try {
      // API function returns just the data, not the full response
      const data: VerificationResponse = await emailVerification(verificationToken);

      // Check data.success directly
      if (data.success) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        setUserName(data.user?.name || '');
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to verify email. Please try again.');
      }
    } catch (error) {
      console.error('Email verification error:', error);

      // Proper axios error handling
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const detail = error.response?.data?.detail || error.response?.data?.message;

        if (statusCode === 410) {
          // Token expired
          setStatus('expired');
          setMessage(detail || 'Verification link has expired.');
        } else if (statusCode === 400) {
          // Invalid token
          setStatus('error');
          setMessage(detail || 'Invalid verification token.');
        } else if (statusCode === 500) {
          // Server error
          setStatus('error');
          setMessage('Server error. Please try again later.');
        } else {
          // Other errors
          setStatus('error');
          setMessage(detail || 'Failed to verify email. Please try again.');
        }
      } else {
        // Network or unknown errors
        setStatus('error');
        setMessage('Network error. Please check your connection and try again.');
      }
    }
  };

  // Use axios instead of fetch, consistent with the rest of the app
  const handleResendEmail = async () => {
    if (!email) {
      setMessage('Email address not found. Please register again.');
      return;
    }

    setIsResending(true);
    setResendSuccess(false);

    try {
      const data = await resendVerificationEmail(email);

      if (data.success) {
        setResendSuccess(true);
        setMessage(data.message || 'Verification email sent! Please check your inbox.');
      }
    } catch (error) {
      console.error('Resend email error:', error);

      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail || error.response?.data?.message;
        setMessage(detail || 'Failed to resend email. Please try again.');
      } else {
        setMessage('Network error. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Verifying State */}
        {status === 'verifying' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Verifying Your Email</h1>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Email Verified!</h1>
            {userName && (
              <p className="text-lg text-gray-700 mb-4">
                Welcome, <span className="font-semibold text-orange-600">{userName}</span>!
              </p>
            )}
            <p className="text-gray-600 mb-6">{message}</p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                Your account is now active. You can start exploring events and purchasing tickets!
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 mb-4"
            >
              Go to Login
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-sm text-gray-500">
              Redirecting automatically in {countdown} seconds...
            </p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Verification Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                The verification link may be invalid or has already been used.
              </p>
            </div>

            <div className="space-y-3">
              {email && (
                <button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Resend Verification Email
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => navigate('/register')}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:border-orange-500 hover:text-orange-600 transition-all"
              >
                Back to Registration
              </button>
            </div>

            {resendSuccess && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Verification email sent to {email}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Expired State */}
        {status === 'expired' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Link Expired</h1>
            <p className="text-gray-600 mb-6">{message}</p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                Verification links expire after 24 hours for security reasons. Request a new one below.
              </p>
            </div>

            {email && (
              <>
                <button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Send New Verification Email
                    </>
                  )}
                </button>

                {resendSuccess && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ New verification email sent to {email}
                    </p>
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => navigate('/login')}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:border-orange-500 hover:text-orange-600 transition-all"
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Having trouble?{' '}
            <a
              href="/contact"
              className="text-orange-600 hover:text-orange-700 font-medium hover:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;