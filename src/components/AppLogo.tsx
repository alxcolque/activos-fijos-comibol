import React from 'react';

interface AppLogoProps {
  collapsed?: boolean;
  isDark?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ collapsed, isDark = false }) => {
  return (
    <div className="flex items-center gap-3 px-2 py-1 select-none">
      <img 
        src="/logo.png" 
        alt="COMIBOL Logo" 
        className="w-10 h-10 object-contain shrink-0"
      />
      {!collapsed && (
        <div className="flex flex-col">
          <span className={`text-sm font-bold tracking-wider uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}>
            COMIBOL
          </span>
          <span className={`text-xs font-semibold -mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
            Activos Fijos
          </span>
        </div>
      )}
    </div>
  );
};

export default AppLogo;
