import React, { useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { useAssetStore } from '../store/assetStore';
import { useSettingsStore } from '../store/settingsStore';
import { AppLogo } from '../components/AppLogo';
import { 
  HiOutlineSquares2X2, 
  HiOutlineBriefcase, 
  HiOutlineTag,
  HiOutlineCheckCircle,
  HiOutlineMapPin,
  HiOutlineFolder,
  HiOutlineDocumentChartBar, 
  HiOutlineCog6Tooth,
  HiXMark,
  HiUser
} from 'react-icons/hi2';

export const MainLayout: React.FC = () => {
  const { mobileDrawerOpen, setMobileDrawerOpen } = useUIStore();
  const { fetchUser, user } = useAuthStore();
  const { fetchInitialData } = useAssetStore();
  const { fetchSettings } = useSettingsStore();
  const location = useLocation();

  // Cargar datos iniciales del sistema al montar el layout principal
  useEffect(() => {
    fetchUser();
    fetchInitialData();
    fetchSettings();
  }, []);

  // Cerrar el drawer móvil al cambiar de ruta
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: HiOutlineSquares2X2 },
    { name: 'Activos', path: '/assets', icon: HiOutlineBriefcase },
    { name: 'Categorías', path: '/categories', icon: HiOutlineTag },
    { name: 'Estados', path: '/statuses', icon: HiOutlineCheckCircle },
    { name: 'Ubicaciones', path: '/locations', icon: HiOutlineMapPin },
    { name: 'Proyectos', path: '/projects', icon: HiOutlineFolder },
    { name: 'Reportes', path: '/reports', icon: HiOutlineDocumentChartBar },
    { name: 'Ajustes', path: '/settings', icon: HiOutlineCog6Tooth },
  ];

  const userName = user?.fullName || user?.name || 'Administrador';
  const userRole = user?.role || 'Administrador COMIBOL';

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased relative">
      {/* Sidebar de Escritorio */}
      <Sidebar />

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
        <Header />

        {/* Contenido de la Página */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* Barra de Navegación Móvil */}
        <BottomNavigation />
      </div>

      {/* Drawer de Navegación Móvil */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300" 
            onClick={() => setMobileDrawerOpen(false)} 
          />
          {/* Menu Drawer */}
          <div className="relative flex flex-col w-72 max-w-[80vw] bg-blue-600 h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {/* Header del Drawer */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-blue-700/60 shrink-0">
              <AppLogo isDark={true} />
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-blue-100 hover:bg-blue-700 transition-colors"
              >
                <HiXMark className="text-xl" />
              </button>
            </div>

            {/* Links de Navegación */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = 
                  item.path === '/' 
                    ? location.pathname === '/' 
                    : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors font-semibold text-sm ${
                      isActive 
                        ? 'bg-amber-500 text-blue-900 shadow-sm' 
                        : 'text-blue-100 hover:bg-blue-700 active:bg-blue-850'
                    }`}
                  >
                    <Icon className={`text-xl shrink-0 ${isActive ? 'text-blue-900' : 'text-blue-200'}`} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Info de Usuario al Fondo */}
            {user && (
              <div className="p-4 border-t border-blue-750 bg-blue-800 flex items-center gap-3 shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-amber-500 bg-blue-900 text-amber-400 shrink-0">
                  <HiUser className="text-xl" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">{userName}</span>
                  <span className="text-[10px] font-semibold text-blue-200 truncate">{userRole}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
