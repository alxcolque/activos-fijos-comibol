import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import CategoriesPage from '../pages/Categories';
import StatusesPage from '../pages/Statuses';
import LocationsPage from '../pages/Locations';
import ProjectsPage from '../pages/Projects';
import ProjectShowPage from '../pages/ProjectShow';
import AssetsList from '../pages/AssetsList';
import AssetDetail from '../pages/AssetDetail';
import AssetForm from '../pages/AssetForm';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import UsersList from '../pages/UsersList';
import SuppliesList from '../pages/SuppliesList';
import PersonalList from '../pages/PersonalList';
import PersonalShowPage from '../pages/PersonalShow';
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
        <Route path="categorias" element={<CategoriesPage />} />
        <Route path="estados" element={<StatusesPage />} />
        <Route path="ubicaciones" element={<LocationsPage />} />
        <Route path="proyectos" element={<ProjectsPage />} />
        <Route path="proyectos/:id" element={<ProjectShowPage />} />
        <Route path="activos" element={<AssetsList />} />
        <Route path="activos/nuevo" element={<AssetForm />} />
        <Route path="activos/:id" element={<AssetDetail />} />
        <Route path="activos/:id/editar" element={<AssetForm />} />
        <Route path="suministros" element={<SuppliesList />} />
        <Route path="supplies" element={<SuppliesList />} />
        <Route path="personal" element={<PersonalList />} />
        <Route path="personal/:id" element={<PersonalShowPage />} />
        <Route path="acquisitions" element={<PersonalList />} />
        <Route path="acquisitions/:id" element={<PersonalShowPage />} />
        <Route path="usuarios" element={<UsersList />} />
        <Route path="reportes" element={<Reports />} />
        <Route path="configuracion" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
