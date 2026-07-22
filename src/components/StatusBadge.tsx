import React from 'react';

interface StatusBadgeProps {
  status: 'Operativo' | 'En mantenimiento' | 'En stock' | 'De baja';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getStyles = () => {
    const base = "inline-flex items-center font-bold rounded-full select-none border";
    const sizes = {
      sm: "px-2 py-0.5 text-[10px]",
      md: "px-2.5 py-1 text-xs",
      lg: "px-3.5 py-1.5 text-sm"
    };
    
    switch (status) {
      case 'Operativo':
        return `${base} ${sizes[size]} bg-emerald-50 text-emerald-700 border-emerald-200/50`;
      case 'En mantenimiento':
        return `${base} ${sizes[size]} bg-amber-50 text-amber-700 border-amber-200/50`;
      case 'En stock':
        return `${base} ${sizes[size]} bg-blue-50 text-blue-700 border-blue-200/50`;
      case 'De baja':
        return `${base} ${sizes[size]} bg-rose-50 text-rose-700 border-rose-200/50`;
      default:
        return `${base} ${sizes[size]} bg-slate-50 text-slate-700 border-slate-200/50`;
    }
  };

  return (
    <span className={getStyles()}>
      {status}
    </span>
  );
};

export default StatusBadge;
