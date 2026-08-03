import React from 'react';
import type { ProjectStatus } from '../../interfaces/project.interface';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'FINISHED':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'SUSPENDED':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'ACTIVE':
        return 'Activo';
      case 'FINISHED':
        return 'Finalizado';
      case 'SUSPENDED':
        return 'Suspendido';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStyles()}`}>
      {getLabel()}
    </span>
  );
};

export default ProjectStatusBadge;
