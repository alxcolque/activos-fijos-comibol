import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssetStore } from '../store/assetStore';
import { useDashboardStore } from '../store/dashboardStore';
import { SectionCard } from '../components/SectionCard';
import { AssetImage } from '../components/AssetImage';
import { HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi2';
import type { Asset } from '../interfaces';

export const AssetForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assets, categories, locations, custodians, addAsset, updateAsset } = useAssetStore();
  const { addActivity } = useDashboardStore();

  const isEditMode = !!id;
  const existingAsset = isEditMode ? assets.find(a => a.id === id) : null;

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    categoryId: '',
    locationId: '',
    custodianId: '',
    status: 'Operativo' as Asset['status'],
    value: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    brand: '',
    model: '',
    serialNumber: '',
    observations: '',
    image: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos del activo si estamos en modo edición
  useEffect(() => {
    if (isEditMode && existingAsset) {
      setFormData({
        code: existingAsset.code,
        name: existingAsset.name,
        categoryId: existingAsset.categoryId,
        locationId: existingAsset.locationId,
        custodianId: existingAsset.custodianId,
        status: existingAsset.status,
        value: existingAsset.value,
        purchaseDate: existingAsset.purchaseDate,
        brand: existingAsset.brand,
        model: existingAsset.model,
        serialNumber: existingAsset.serialNumber,
        observations: existingAsset.observations,
        image: existingAsset.image
      });
    } else if (!isEditMode) {
      // Auto-generar un código sugerido en modo creación
      const randomSeq = Math.floor(100 + Math.random() * 900);
      setFormData(prev => ({
        ...prev,
        code: `COM-ACT-${randomSeq}`
      }));
    }
  }, [id, existingAsset, isEditMode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.code.trim()) newErrors.code = 'El código es requerido';
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.categoryId) newErrors.categoryId = 'Seleccione una categoría';
    if (!formData.locationId) newErrors.locationId = 'Seleccione una ubicación';
    if (!formData.custodianId) newErrors.custodianId = 'Seleccione un custodio responsable';
    if (formData.value <= 0) newErrors.value = 'El valor debe ser mayor a 0';
    if (!formData.purchaseDate) newErrors.purchaseDate = 'La fecha de compra es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditMode && existingAsset) {
      const updated: Asset = {
        ...formData,
        id: existingAsset.id
      };
      updateAsset(updated);
      addActivity({
        user: "Ing. Carlos Mendoza",
        action: "Actualizó activo",
        target: `${updated.name} (${updated.code})`,
        type: 'info'
      });
      navigate(`/assets/${existingAsset.id}`);
    } else {
      addAsset(formData);
      addActivity({
        user: "Ing. Carlos Mendoza",
        action: "Registró activo",
        target: `${formData.name} (${formData.code})`,
        type: 'success'
      });
      navigate('/assets');
    }
  };

  return (
    <div className="space-y-6">
      {/* Botón de retroceso y título */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(isEditMode ? `/assets/${id}` : '/assets')}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shrink-0"
        >
          <HiOutlineArrowLeft className="text-xl" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
            {isEditMode ? 'Editar Activo Fijo' : 'Nuevo Activo Fijo'}
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {isEditMode ? 'Modificar datos del registro en el sistema' : 'Registrar nueva adquisición en la base de datos'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Imagen y Previsualización */}
        <div className="lg:col-span-1 space-y-6">
          <SectionCard title="Previsualización de Imagen">
            <div className="flex flex-col gap-4 items-center">
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-sm bg-slate-100 shrink-0">
                <AssetImage 
                  src={formData.image} 
                  alt={formData.name || 'Previsualización'} 
                  categoryId={formData.categoryId} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-full space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Enlace de fotografía</label>
                <input
                  type="text"
                  placeholder="Pegar URL de imagen (opcional)"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm transition-colors h-9 bg-white"
                />
              </div>
              <span className="text-[10px] text-slate-400 font-semibold text-center leading-relaxed">
                Puede pegar un enlace de Unsplash o cualquier servidor de imágenes para previsualizar la fotografía.
              </span>
            </div>
          </SectionCard>
        </div>

        {/* Columna Derecha: Formulario Técnico */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sección 1: Información Principal */}
          <SectionCard title="Información Principal">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Código de Activo <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="Ej. COM-MP-001"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none font-medium text-sm transition-colors h-9 bg-white ${
                    errors.code ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-amber-500'
                  }`}
                />
                {errors.code && <span className="text-[10px] font-semibold text-rose-500 block">{errors.code}</span>}
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Nombre del Activo <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="Ej. Perforadora Hidráulica"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none font-medium text-sm transition-colors h-9 bg-white ${
                    errors.name ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-amber-500'
                  }`}
                />
                {errors.name && <span className="text-[10px] font-semibold text-rose-500 block">{errors.name}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Categoría <span className="text-rose-500">*</span></label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className={`w-full px-3 py-1.5 border rounded-xl focus:outline-none font-medium text-sm bg-white cursor-pointer transition-colors h-9 ${
                    errors.categoryId ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-amber-500'
                  }`}
                >
                  <option value="">Seleccione categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && <span className="text-[10px] font-semibold text-rose-500 block">{errors.categoryId}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Estado Técnico <span className="text-rose-500">*</span></label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as Asset['status'])}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm bg-white cursor-pointer transition-colors h-9"
                >
                  <option value="Operativo">Operativo</option>
                  <option value="En mantenimiento">En mantenimiento</option>
                  <option value="En stock">En stock</option>
                  <option value="De baja">De baja</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Valor Adquisición (USD) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  placeholder="Ej. 15000"
                  value={formData.value === 0 ? '' : String(formData.value)}
                  onChange={(e) => handleInputChange('value', Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none font-medium text-sm transition-colors h-9 bg-white ${
                    errors.value ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-amber-500'
                  }`}
                />
                {errors.value && <span className="text-[10px] font-semibold text-rose-500 block">{errors.value}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Fecha de Compra <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none font-medium text-sm transition-colors h-9 bg-white ${
                    errors.purchaseDate ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-amber-500'
                  }`}
                />
                {errors.purchaseDate && <span className="text-[10px] font-semibold text-rose-500 block">{errors.purchaseDate}</span>}
              </div>
            </div>
          </SectionCard>

          {/* Sección 2: Asignación e Institución */}
          <SectionCard title="Ubicación y Responsabilidad">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Ubicación Física <span className="text-rose-500">*</span></label>
                <select
                  value={formData.locationId}
                  onChange={(e) => handleInputChange('locationId', e.target.value)}
                  className={`w-full px-3 py-1.5 border rounded-xl focus:outline-none font-medium text-sm bg-white cursor-pointer transition-colors h-9 ${
                    errors.locationId ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-amber-500'
                  }`}
                >
                  <option value="">Seleccione ubicación</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name} ({loc.city})</option>
                  ))}
                </select>
                {errors.locationId && <span className="text-[10px] font-semibold text-rose-500 block">{errors.locationId}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Responsable Custodio <span className="text-rose-500">*</span></label>
                <select
                  value={formData.custodianId}
                  onChange={(e) => handleInputChange('custodianId', e.target.value)}
                  className={`w-full px-3 py-1.5 border rounded-xl focus:outline-none font-medium text-sm bg-white cursor-pointer transition-colors h-9 ${
                    errors.custodianId ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-amber-500'
                  }`}
                >
                  <option value="">Seleccione custodio</option>
                  {custodians.map((cust) => (
                    <option key={cust.id} value={cust.id}>{cust.name}</option>
                  ))}
                </select>
                {errors.custodianId && <span className="text-[10px] font-semibold text-rose-500 block">{errors.custodianId}</span>}
              </div>
            </div>
          </SectionCard>

          {/* Sección 3: Detalles Técnicos de Fabricación */}
          <SectionCard title="Detalles Técnicos y Observaciones">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Marca</label>
                  <input
                    type="text"
                    placeholder="Ej. Caterpillar"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm transition-colors h-9 bg-white"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Modelo</label>
                  <input
                    type="text"
                    placeholder="Ej. D10T"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm transition-colors h-9 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Número de Serie</label>
                  <input
                    type="text"
                    placeholder="Ej. CAT-SER-0022"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm transition-colors h-9 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Observaciones Generales</label>
                <textarea
                  placeholder="Agregue información técnica adicional, estado de entrega, desgaste u otros apuntes..."
                  value={formData.observations}
                  onChange={(e) => handleInputChange('observations', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm transition-colors bg-white"
                  rows={4}
                />
              </div>
            </div>
          </SectionCard>

          {/* Botonera de Acciones */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(isEditMode ? `/assets/${id}` : '/assets')}
              className="px-4 py-2 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-500/25 active:scale-[0.98] transition-all text-sm shrink-0"
            >
              <HiOutlineCheck className="text-lg font-bold" />
              {isEditMode ? 'Guardar Cambios' : 'Registrar Activo'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AssetForm;
