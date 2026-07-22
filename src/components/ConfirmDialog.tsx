import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  color?: 'danger' | 'warning' | 'primary';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "Confirmar acción",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  color = "danger"
}) => {
  if (!isOpen) return null;

  const getButtonBg = () => {
    switch (color) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/10';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/10';
      case 'primary':
      default:
        return 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={() => onOpenChange(false)} 
      />
      {/* Modal Dialog */}
      <div className="relative bg-white border border-slate-200/80 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        <h2 className="text-slate-800 font-bold text-base mb-2">{title}</h2>
        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">{message}</p>
        <div className="flex justify-end gap-2 shrink-0">
          <button 
            type="button"
            onClick={() => onOpenChange(false)} 
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button 
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm transition-all active:scale-[0.98] ${getButtonBg()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
