import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicPage from './pages/PublicPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminEditor from './pages/AdminEditor';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<PublicPage />} />
          <Route path="/lexique-des-cuirs" element={<PublicPage />} />
          <Route path="/lexique-semelles-exterieurs" element={<PublicPage />} />
          <Route path="/lexique-chaussures" element={<PublicPage />} />
          <Route path="/:slug" element={<PublicPage />} />

          {/* Authentication Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Administration Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/editor/:pageId"
            element={
              <ProtectedRoute>
                <AdminEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit/:pageId"
            element={
              <ProtectedRoute>
                <AdminEditor />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<PublicPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
