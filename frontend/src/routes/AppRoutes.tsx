import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthLayout } from '../components/layout/AuthLayout';
import { ProtectedLayout } from '../components/layout/ProtectedLayout';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { MyTripsPage } from '../pages/MyTripsPage';
import { CreateTripPage } from '../pages/CreateTripPage';
import { ProfilePage } from '../pages/ProfilePage';
import { DestinationsPage } from '../pages/DestinationsPage';
import { TripDetailsPage } from '../pages/TripDetailsPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Guest-only routes */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Protected application routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/trips" element={<MyTripsPage />} />
          <Route path="/trips/create" element={<CreateTripPage />} />
          <Route path="/trips/:tripId" element={<TripDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/trips/:tripId/destinations" element={<DestinationsPage />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
