import React from 'react';
import type { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  iconColorClass: string; // e.g. "text-amber-600 bg-amber-50"
  description?: string;
  trend?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColorClass,
  description,
  trend
}) => {
  return (
    <div className="border border-slate-200/60 shadow-sm bg-white hover:shadow-md transition-shadow duration-200 rounded-xl p-5 flex flex-row items-center gap-4">

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className={`p-3.5 rounded-xl shrink-0 ${iconColorClass}`}>
            <Icon className="text-2xl" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">{title}</span>
        </div>
        <span className="text-2xl font-bold text-slate-800 tracking-tight mt-1 block text-center">{value}</span>
        {(description || trend) && (
          <div className="flex items-center gap-1.5 mt-1 block">
            {trend && (
              <span className={`text-xs font-bold ${trend.type === 'positive' ? 'text-emerald-600' :
                trend.type === 'negative' ? 'text-rose-600' : 'text-slate-500'
                }`}>
                {trend.value}
              </span>
            )}
            {description && <span className="text-xs text-slate-400 font-medium truncate">{description}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
