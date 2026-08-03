import React, { useState, useRef, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { getAssetUrl } from '../utils/assets';
import { Breadcrumb } from './Breadcrumb';
import { HiBars3, HiBell } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { toggleMobileDrawer } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Cerrar menús al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 w-full h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md flex items-center px-4 md:px-6 justify-between gap-4 select-none">
      {/* Lado izquierdo: Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <Breadcrumb />
      </div>

      {/* Lado derecho: Notificaciones, perfil y menú hamburguesa */}
      <div className="flex items-center gap-3.5 relative">
        {/* Notificaciones */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all relative shrink-0"
          >
            <HiBell className="text-xl" />
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white shadow-sm">
              3
            </span>
          </button>

          {/* Menú de Notificaciones */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 font-bold text-slate-800 border-b border-slate-100 text-xs">
                Notificaciones Recientes
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-slate-50 transition-colors">
                  <p className="text-xs font-bold text-slate-800">🛠 Alerta de Mantenimiento</p>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">Volquete Caterpillar ingresado a taller.</p>
                </div>
                <div className="px-4 py-3 hover:bg-slate-50 transition-colors">
                  <p className="text-xs font-bold text-slate-800">📦 Asignación de Activo</p>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">Laptop HP asignada a Lic. Ana María Rojas.</p>
                </div>
                <div className="px-4 py-3 hover:bg-slate-50 transition-colors">
                  <p className="text-xs font-bold text-slate-800">⏳ Recordatorio de Auditoría</p>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">La auditoría de activos finaliza mañana.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Perfil de Usuario */}
        {user && (
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="flex items-center focus:outline-none shrink-0"
            >
              <img
                className="w-8 h-8 rounded-full border-2 border-amber-500 object-cover hover:opacity-90 transition-opacity"
                src={getAssetUrl(user.avatar || 'avatars/admin.svg')}
                alt={user.fullName || user.name || 'Administrador'}
              />
            </button>

            {/* Menú de Perfil */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-1 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="font-semibold text-[10px] text-slate-400">Sesión iniciada como</p>
                  <p className="font-bold text-xs text-amber-600 truncate mt-0.5">{user.email}</p>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Configuración del Sistema
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botón de Menú Hamburguesa en Mobile */}
        <button
          type="button"
          onClick={toggleMobileDrawer}
          className="flex md:hidden p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shrink-0"
        >
          <HiBars3 className="text-2xl" />
        </button>
      </div>
    </header>
  );
};

export default Header;
