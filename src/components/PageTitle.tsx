import React from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm font-medium text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default PageTitle;
