import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useSocket } from './hooks/useSocket';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthSuccess from './pages/AuthSuccess';
import CompleteProfile from './pages/CompleteProfile';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import MapView from './pages/MapView';

// Donor Pages
import DonorListings from './pages/donor/DonorListings';
import CreateListing from './pages/donor/CreateListing';
import EditListing from './pages/donor/EditListing';
import VerifyPickup from './pages/donor/VerifyPickup';

// Receiver Pages
import BrowseFood from './pages/receiver/BrowseFood';
import ClaimFood from './pages/receiver/ClaimFood';
import MyClaims from './pages/receiver/MyClaims';

function App() {
  const { isAuthenticated, fetchMe } = useAuthStore();
  
  // Initialize Socket.io for real-time notifications
  useSocket();

  useEffect(() => {
    document.title = 'FoodSaver - Reduce Food Waste';
    if (isAuthenticated) {
      fetchMe();
    }
  }, [isAuthenticated, fetchMe]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route
          path="/auth/complete-profile"
          element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <MapView />
            </ProtectedRoute>
          }
        />

        {/* Donor Routes */}
        <Route
          path="/donor/listings"
          element={
            <ProtectedRoute>
              <DonorListings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/create"
          element={
            <ProtectedRoute>
              <CreateListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/edit/:id"
          element={
            <ProtectedRoute>
              <EditListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/verify"
          element={
            <ProtectedRoute>
              <VerifyPickup />
            </ProtectedRoute>
          }
        />

        {/* Receiver Routes */}
        <Route
          path="/receiver/browse"
          element={
            <ProtectedRoute>
              <BrowseFood />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receiver/claim/:id"
          element={
            <ProtectedRoute>
              <ClaimFood />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receiver/claims"
          element={
            <ProtectedRoute>
              <MyClaims />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;


