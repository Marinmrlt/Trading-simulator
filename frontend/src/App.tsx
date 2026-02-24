import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Trading from './pages/Trading';
import WalletPage from './pages/Wallet';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Backtest from './pages/Backtest';

function App() {
  const fetchProfile = useAuthStore(state => state.fetchProfile);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trade" element={<Trading />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/backtest" element={<Backtest />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
