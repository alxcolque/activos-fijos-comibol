import React from 'react';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Buscar activos...", 
  value, 
  onChange, 
  className = ""
}) => {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-8 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm transition-colors h-9 bg-white"
      />
      <HiOutlineMagnifyingGlass className="absolute left-3 top-2.5 text-slate-400 text-lg pointer-events-none" />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 font-bold text-xs"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
