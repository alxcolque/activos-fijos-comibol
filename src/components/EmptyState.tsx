import React from 'react';
import { HiOutlineInbox } from 'react-icons/hi2';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white border border-slate-200/50 border-dashed rounded-2xl max-w-md mx-auto my-6 select-none shadow-sm">
      <div className="p-4 rounded-full bg-slate-50 text-slate-400 mb-4 shrink-0 border border-slate-100">
        {icon || <HiOutlineInbox className="text-4xl" />}
      </div>
      <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
      <p className="text-sm font-medium text-slate-500 mt-1 mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button 
          type="button"
          onClick={onAction}
          className="font-bold text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/50 rounded-xl px-4 py-2 transition-all active:scale-[0.98]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
