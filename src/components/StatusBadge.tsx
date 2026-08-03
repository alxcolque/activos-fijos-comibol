import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getStyles = () => {
    const base = 'inline-flex items-center font-bold rounded-full select-none border';
    const sizes = {
      sm: 'px-2.5 py-0.5 text-[10px]',
      md: 'px-3 py-1 text-xs',
      lg: 'px-3.5 py-1.5 text-sm',
    };

    const statusLower = (status || '').toLowerCase();

    if (statusLower.includes('operat') || statusLower.includes('activo')) {
      return `${base} ${sizes[size]} bg-emerald-50 text-emerald-700 border-emerald-200/60`;
    }
    if (statusLower.includes('mantenimient') || statusLower.includes('repara')) {
      return `${base} ${sizes[size]} bg-amber-50 text-amber-700 border-amber-200/60`;
    }
    if (statusLower.includes('stock') || statusLower.includes('almacen')) {
      return `${base} ${sizes[size]} bg-blue-50 text-blue-700 border-blue-200/60`;
    }
    if (statusLower.includes('baja') || statusLower.includes('inactiv')) {
      return `${base} ${sizes[size]} bg-rose-50 text-rose-700 border-rose-200/60`;
    }

    return `${base} ${sizes[size]} bg-slate-100 text-slate-700 border-slate-200`;
  };

  return <span className={getStyles()}>{status || 'Desconocido'}</span>;
};

export default StatusBadge;
