import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  HiOutlineSquares2X2, 
  HiOutlineBriefcase, 
  HiOutlinePlus,
  HiOutlineDocumentChartBar, 
  HiOutlineCog6Tooth 
} from 'react-icons/hi2';

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Inicio', path: '/', icon: HiOutlineSquares2X2 },
    { name: 'Activos', path: '/assets', icon: HiOutlineBriefcase },
    { name: 'divider', path: '', icon: () => null }, // Espacio para el botón central +
    { name: 'Reportes', path: '/reports', icon: HiOutlineDocumentChartBar },
    { name: 'Ajustes', path: '/settings', icon: HiOutlineCog6Tooth },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] px-4 py-2 flex items-center justify-between z-30 pb-safe">
      {navItems.map((item) => {
        if (item.name === 'divider') {
          return (
            <div key="fab-placeholder" className="w-12 h-12 flex justify-center items-center relative -top-4">
              <button
                type="button"
                onClick={() => navigate('/assets/new')}
                className="w-14 h-14 bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/30 text-white font-bold text-2xl rounded-full flex items-center justify-center transition-all active:scale-95 shrink-0"
              >
                <HiOutlinePlus />
              </button>
            </div>
          );
        }

        const Icon = item.icon;
        const isActive = 
          item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.path);

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center gap-0.5 w-14 transition-colors ${
              isActive 
                ? 'text-amber-600 font-semibold' 
                : 'text-slate-400 font-medium'
            }`}
          >
            <Icon className="text-xl" />
            <span className="text-[10px]">{item.name}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
