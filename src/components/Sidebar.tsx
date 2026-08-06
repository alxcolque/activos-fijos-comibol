import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { getAssetUrl } from '../utils/assets';
import { AppLogo } from './AppLogo';
import { 
  HiOutlineSquares2X2, 
  HiOutlineBriefcase, 
  HiOutlineTag,
  HiOutlineCheckCircle,
  HiOutlineMapPin,
  HiOutlineFolder,
  HiOutlineDocumentChartBar, 
  HiOutlineCog6Tooth,
  HiUser
} from 'react-icons/hi2';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const location = useLocation();

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
  const userAvatar = getAssetUrl(user?.avatar || 'avatars/admin.svg');

  return (
    <aside 
      className={`hidden md:flex flex-col border-r border-blue-800 bg-blue-600 h-screen sticky top-0 transition-all duration-300 z-30 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header del Sidebar */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-blue-700/60 shrink-0 relative">
        <AppLogo collapsed={sidebarCollapsed} isDark={true} />
        {!sidebarCollapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
          >
            <HiOutlineChevronLeft className="text-lg" />
          </button>
        )}
        {sidebarCollapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="absolute top-4 -right-3 w-6 h-6 bg-blue-800 border border-blue-700 shadow-sm rounded-full flex items-center justify-center text-blue-100 hover:text-white z-40 transition-colors"
          >
            <HiOutlineChevronRight className="text-xs" />
          </button>
        )}
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
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
              title={sidebarCollapsed ? item.name : undefined}
              className={({ isActive: isLinkActive }) => {
                const active = isLinkActive || isActive;
                return `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm group ${
                  active 
                    ? 'bg-amber-500 text-blue-900 shadow-sm shadow-amber-500/10' 
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`;
              }}
            >
              {({ isActive: isLinkActive }) => {
                const active = isLinkActive || isActive;
                return (
                  <>
                    <Icon className={`text-xl shrink-0 ${active ? 'text-blue-900' : 'text-blue-200 group-hover:text-white'}`} />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                    {sidebarCollapsed && (
                      <span className="sr-only">{item.name}</span>
                    )}
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </nav>

      {/* Sección de Usuario */}
      {user && (
        <div className="p-4 border-t border-blue-700 bg-blue-800 shrink-0">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-amber-500 bg-blue-900 text-amber-400 shrink-0">
              <HiUser className="text-lg" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">{userName}</span>
                <span className="text-[10px] font-semibold text-blue-200 truncate">{userRole}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
export default Sidebar;
