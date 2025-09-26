import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { MainLayout } from './components/layout/MainLayout';
import { RealmProvider } from './context/RealmContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" /> : <LoginForm />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/" /> : <RegisterForm />} 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <RealmProvider>
              <MainLayout />
            </RealmProvider>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/realms/:realmId" 
        element={
          <ProtectedRoute>
            <RealmProvider>
              <MainLayout />
            </RealmProvider>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/realms/:realmId/channels/:channelId" 
        element={
          <ProtectedRoute>
            <RealmProvider>
              <MainLayout />
            </RealmProvider>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#374151',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;