import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import AssetsList from '../pages/AssetsList';
import AssetDetail from '../pages/AssetDetail';
import AssetForm from '../pages/AssetForm';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
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
