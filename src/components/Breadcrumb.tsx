import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { HiHome, HiChevronRight } from 'react-icons/hi2';
import { useAssetStore } from '../store/assetStore';
import { useProjectStore } from '../store/projectStore';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const { selectedAsset } = useAssetStore();
  const { projects } = useProjectStore();

  const getBreadcrumbTitle = (segment: string, index: number) => {
    switch (segment) {
      case 'activos':
      case 'assets':
        return 'Activos';
      case 'proyectos':
      case 'projects':
        return 'Proyectos';
      case 'categorias':
      case 'categories':
        return 'Categorías';
      case 'estados':
      case 'statuses':
        return 'Estados';
      case 'ubicaciones':
      case 'locations':
        return 'Ubicaciones';
      case 'reportes':
      case 'reports':
        return 'Reportes';
      case 'configuracion':
      case 'settings':
        return 'Configuración';
      case 'nuevo':
      case 'new':
        return 'Nuevo';
      case 'editar':
      case 'edit':
        return 'Editar';
      default:
        // Si el segmento previo es "activos" o "assets"
        if (
          index > 0 &&
          (pathnames[index - 1] === 'activos' || pathnames[index - 1] === 'assets')
        ) {
          if (selectedAsset && (selectedAsset.id === segment || index === 1)) {
            return selectedAsset.name;
          }
          return 'Detalle de Activo';
        }

        // Si el segmento previo es "proyectos" o "projects"
        if (
          index > 0 &&
          (pathnames[index - 1] === 'proyectos' || pathnames[index - 1] === 'projects')
        ) {
          const foundProject = projects.find((p) => p.id === segment);
          if (foundProject) {
            return foundProject.name;
          }
          return 'Detalle de Proyecto';
        }

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
        const title = getBreadcrumbTitle(value, index);

        return (
          <React.Fragment key={to}>
            <HiChevronRight className="text-slate-300 text-[10px] shrink-0" />
            {last ? (
              <span className="text-slate-800 font-bold px-1.5 py-1 max-w-[200px] sm:max-w-[300px] truncate">
                {title}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-slate-800 transition-colors px-1.5 py-1 rounded-lg hover:bg-slate-100 max-w-[150px] sm:max-w-[200px] truncate"
              >
                {title}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
