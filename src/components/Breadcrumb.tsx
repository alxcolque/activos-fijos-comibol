import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { HiHome, HiChevronRight } from 'react-icons/hi2';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const getBreadcrumbTitle = (segment: string) => {
    switch (segment) {
      case 'assets':
        return 'Activos';
      case 'new':
        return 'Nuevo';
      case 'edit':
        return 'Editar';
      case 'reports':
        return 'Reportes';
      case 'settings':
        return 'Ajustes';
      default:
        if (segment.startsWith('act-')) {
          return 'Detalle';
        }
        return segment;
    }
  };

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium select-none">
      <Link 
        to="/" 
        className="flex items-center gap-1 hover:text-slate-800 transition-colors py-1 px-1.5 rounded-lg hover:bg-slate-100"
      >
        <HiHome className="text-sm text-slate-400 -mt-0.5" />
        <span>Inicio</span>
      </Link>
      
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        return (
          <React.Fragment key={to}>
            <HiChevronRight className="text-slate-300 text-[10px] shrink-0" />
            {last ? (
              <span className="text-slate-800 font-bold px-1.5 py-1">{getBreadcrumbTitle(value)}</span>
            ) : (
              <Link 
                to={to} 
                className="hover:text-slate-800 transition-colors px-1.5 py-1 rounded-lg hover:bg-slate-100"
              >
                {getBreadcrumbTitle(value)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
