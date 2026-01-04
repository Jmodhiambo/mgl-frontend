import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@shared/contexts/AuthContext';
import { router } from './routes';
import ErrorBoundary from '@shared/components/ErrorBoundary';

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;