import React from 'react';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "p-5"
}) => {
  return (
    <div className={`border border-slate-200/60 shadow-sm bg-white rounded-xl overflow-hidden flex flex-col ${className}`}>
      {(title || action) && (
        <>
          <div className="px-5 py-4 flex items-center justify-between gap-4 shrink-0 bg-white">
            <div className="flex flex-col min-w-0">
              {title && <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 font-semibold mt-0.5 truncate">{subtitle}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
          <hr className="border-t border-slate-100" />
        </>
      )}
      <div className={`flex-1 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default SectionCard;
