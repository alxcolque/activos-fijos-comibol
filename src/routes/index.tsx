import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import CategoriesPage from '../pages/Categories';
import StatusesPage from '../pages/Statuses';
import LocationsPage from '../pages/Locations';
import ProjectsPage from '../pages/Projects';
import AssetsList from '../pages/AssetsList';
import AssetDetail from '../pages/AssetDetail';
import AssetForm from '../pages/AssetForm';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';
import LoginPage from '../pages/LoginPage';
import ProtectedRoute from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Ruta Pública: Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas Protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="statuses" element={<StatusesPage />} />
        <Route path="locations" element={<LocationsPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="assets" element={<AssetsList />} />
        <Route path="assets/new" element={<AssetForm />} />
        <Route path="assets/:id" element={<AssetDetail />} />
        <Route path="assets/:id/edit" element={<AssetForm />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
