import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useDashboardStore } from '../store/dashboardStore';
import { PageTitle } from '../components/PageTitle';
import { SectionCard } from '../components/SectionCard';
import { HiOutlineCheck } from 'react-icons/hi2';

export const Settings: React.FC = () => {
  const { settings, fetchSettings, updateSettings, loading } = useSettingsStore();
  const { addActivity } = useDashboardStore();

  const [formData, setFormData] = useState({
    companyName: '',
    nit: '',
    address: '',
    phone: '',
    currency: 'USD',
    language: 'Español',
    theme: 'Light',
    appVersion: '',
    lastAuditDate: ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName,
        nit: settings.nit,
        address: settings.address,
        phone: settings.phone,
        currency: settings.currency,
        language: settings.language,
        theme: settings.theme,
        appVersion: settings.appVersion,
        lastAuditDate: settings.lastAuditDate
      });
    }
  }, [settings]);

  const handleInputChange = (field: string, val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateSettings(formData);
      addActivity({
        user: "Ing. Carlos Mendoza",
        action: "Actualizó configuración",
        target: "Preferencias del Sistema",
        type: 'success'
      });
      setSaving(false);
      alert('Configuración institucional guardada exitosamente en memoria.');
    }, 1500);
  };

  if (loading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle 
        title="Configuración" 
        subtitle="Ajustes del sistema de activos fijos y preferencias institucionales"
      />

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Datos de la Empresa */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Datos de la Institución">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Nombre de la Institución / Razón Social <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm transition-colors h-9 bg-white"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">NIT (Número de Identificación Tributaria) <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formData.nit}
                    onChange={(e) => handleInputChange('nit', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm transition-colors h-9 bg-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Teléfono de Contacto <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm transition-colors h-9 bg-white"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Dirección Principal / Oficina Central <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm transition-colors h-9 bg-white"
                  required
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Preferencias del Sistema">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Moneda Base</label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm bg-white cursor-pointer transition-colors h-9"
                >
                  <option value="USD">Dólar Estadounidense ($ - USD)</option>
                  <option value="BOB">Boliviano (Bs - BOB)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Idioma Predeterminado</label>
                <select
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm bg-white cursor-pointer transition-colors h-9"
                >
                  <option value="Español">Español (ES)</option>
                  <option value="Quechua">Quechua (QU)</option>
                  <option value="Aymara">Aymara (AY)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Tema Visual</label>
                <select
                  value={formData.theme}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm bg-slate-50 text-slate-500 cursor-not-allowed h-9"
                  disabled
                >
                  <option value="Light">Tema Claro (Institucional COMIBOL)</option>
                </select>
                <span className="text-[10px] text-slate-400 font-semibold block">Tema bloqueado institucionalmente</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Fecha Último Inventario General</label>
                <input
                  type="date"
                  value={formData.lastAuditDate}
                  onChange={(e) => handleInputChange('lastAuditDate', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm transition-colors h-9 bg-white"
                />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Columna Derecha: Acerca de la App y botón de guardar */}
        <div className="lg:col-span-1 space-y-6">
          <SectionCard title="Acerca del Sistema" bodyClassName="p-5 flex flex-col gap-4">
            <div className="flex flex-col items-center py-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-3xl select-none">⚙️</span>
              <span className="text-sm font-bold text-slate-800 mt-2">Gestión de Activos</span>
              <span className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">COMIBOL v{formData.appVersion}</span>
            </div>

            <hr className="border-t border-slate-100" />

            <div className="space-y-2 text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Licencia:</span>
                <span className="text-slate-700">Corporativa / Privada</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Desarrollo:</span>
                <span className="text-slate-700">Depto. Sistemas COMIBOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tipo de Servidor:</span>
                <span className="text-slate-700">Frontend Mock (Local JSON)</span>
              </div>
            </div>

            <hr className="border-t border-slate-100" />
            
            <p className="text-[10px] text-slate-400 leading-relaxed text-center font-medium">
              Esta versión corresponde al prototipo de interfaz del Plan Básico del Sistema de Gestión de Activos Fijos de COMIBOL.
            </p>
          </SectionCard>

          <button
            type="submit"
            disabled={saving}
            className="w-full font-bold text-white text-sm py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl shadow-md shadow-amber-500/25 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
            onClick={handleSave}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <HiOutlineCheck className="text-lg font-bold" />
                Guardar Ajustes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
