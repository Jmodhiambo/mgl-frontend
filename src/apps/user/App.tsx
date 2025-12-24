/**
 * Main App Component
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./shared/context/AuthContext";
import ProtectedRoute from "./apps/routes/ProtectedRoute";

import Login from "./apps/pages/Login";
import Dashboard from "./apps/pages/Dashboard";
import Events from "./apps/pages/Events";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;