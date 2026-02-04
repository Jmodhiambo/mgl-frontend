import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@shared/contexts/AuthContext';
import { router } from './routes';
import ErrorBoundary from '@shared/components/ErrorBoundary';
import { loadRecaptchaScript, cleanupRecaptcha } from '@shared/config/recaptcha';

function App() {
  useEffect(() => {
    // Preload reCAPTCHA script on app load
    loadRecaptchaScript()
      .then(() => {
        console.log('reCAPTCHA script loaded successfully.');
      })
      .catch((error) => {
        console.error('Failed to load reCAPTCHA script:', error);
      });

    // Cleanup reCAPTCHA resources on unmount
    return () => {
      cleanupRecaptcha();
    };

  }, []);

  return (
    <AuthProvider>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;