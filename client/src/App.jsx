import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Layout } from './components/Layout.jsx';
import { Landing } from './pages/Landing.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Applications } from './pages/Applications.jsx';
import { ApplicationDetail } from './pages/ApplicationDetail.jsx';
import { Events } from './pages/Events.jsx';
import { Analytics } from './pages/Analytics.jsx';
import { SkillAnalyzer } from './pages/SkillAnalyzer.jsx';
import { Profile } from './pages/Profile.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { useAuth } from './context/AuthContext.jsx';

export const App = () => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Routes>
      {/* Public Landing */}
      <Route path="/" element={<Landing />} />

      {/* Auth Routes */}
      <Route
        path="/login"
        element={!loading && isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={!loading && isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Protected App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/applications/:id" element={<ApplicationDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/skill-analyzer" element={<SkillAnalyzer />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
