import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssetStore } from '../store/assetStore';
import { SectionCard } from '../components/SectionCard';
import { AssetImage } from '../components/AssetImage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi2';

export const AssetForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    selectedAsset,
    categories,
    statuses,
    locations,
    isLoading,
    fetchAssetById,
    fetchInitialData,
    createAsset,
    updateAsset,
  } = useAssetStore();

  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    categoryId: '',
    statusId: '',
    locationId: '',
    brand: '',
    model: '',
    serialNumber: '',
    unit: 'PZA',
    quantity: 1,
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseValue: 1,
    residualValue: 1,
    description: '',
    observations: '',
    photo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      fetchAssetById(id);
    } else {
      const seq = Math.floor(1000 + Math.random() * 9000);
      setFormData((prev) => ({
        ...prev,
        code: `AF-${seq}`,
      }));
    }
  }, [id, isEditMode]);

  useEffect(() => {
    if (isEditMode && selectedAsset) {
      setFormData({
        code: selectedAsset.code || '',
        name: selectedAsset.name || '',
        categoryId: selectedAsset.categoryId || '',
        statusId: selectedAsset.statusId || '',
        locationId: selectedAsset.locationId || '',
        brand: selectedAsset.brand || '',
        model: selectedAsset.model || '',
        serialNumber: selectedAsset.serialNumber || '',
        unit: selectedAsset.unit || 'PZA',
        quantity: selectedAsset.quantity || 1,
        purchaseDate: selectedAsset.purchaseDate ? selectedAsset.purchaseDate.split('T')[0] : '',
        purchaseValue: selectedAsset.purchaseValue || 1,
        residualValue: selectedAsset.residualValue || 1,
        description: selectedAsset.description || '',
        observations: selectedAsset.observations || '',
        photo: selectedAsset.photo || '',
      });
    }
  }, [selectedAsset, isEditMode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.code.trim()) newErrors.code = 'El código es obligatorio.';
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio.';
    if (!formData.categoryId) newErrors.categoryId = 'Seleccione una categoría.';
    if (!formData.statusId) newErrors.statusId = 'Seleccione un estado técnico.';
    if (!formData.locationId) newErrors.locationId = 'Seleccione una ubicación.';
    if (formData.quantity <= 0) newErrors.quantity = 'La cantidad debe ser mayor a 0.';
    if (formData.purchaseValue < 0) newErrors.purchaseValue = 'El valor de compra debe ser mayor o igual a 0.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    try {
      const payload = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        statusId: formData.statusId,
        locationId: formData.locationId,
        brand: formData.brand.trim() || undefined,
        model: formData.model.trim() || undefined,
        serialNumber: formData.serialNumber.trim() || undefined,
        unit: formData.unit.trim() || 'PZA',
        quantity: Number(formData.quantity),
        purchaseDate: formData.purchaseDate || undefined,
        purchaseValue: Number(formData.purchaseValue),
        residualValue: Number(formData.residualValue) || undefined,
        description: formData.description.trim() || undefined,
        observations: formData.observations.trim() || undefined,
        photo: formData.photo.trim() || undefined,
      };

      if (isEditMode && id) {
        await updateAsset(id, payload);
        navigate(`/assets/${id}`);
      } else {
        await createAsset(payload);
        navigate('/assets');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Ocurrió un error al guardar el activo fijo.');
    }
  };

  if (isEditMode && isLoading && !selectedAsset) {
    return (
      <div className="py-20">
        <LoadingSpinner label="Cargando formulario de edición..." />
      </div>
    );
  }

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(isEditMode ? `/assets/${id}` : '/assets')}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shrink-0"
        >
          <HiOutlineArrowLeft className="text-xl" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
            {isEditMode ? 'Editar Activo Fijo' : 'Nuevo Activo Fijo'}
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {isEditMode
              ? 'Modificar datos del activo patrimonial'
              : 'Registrar nueva incorporación al inventario corporativo'}
          </p>
        </div>
      </div>

      {submitError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Previsualización Fotográfica */}
        <div className="lg:col-span-1 space-y-6">
          <SectionCard title="Fotografía del Activo">
            <div className="flex flex-col gap-4 items-center">
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-xs bg-slate-100 shrink-0">
                <AssetImage
                  src={formData.photo || undefined}
                  alt={formData.name || 'Previsualización'}
                  categoryId={formData.categoryId}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-full space-y-1">
                <label className="text-xs font-bold text-slate-700 block">URL de Fotografía</label>
                <input
                  type="text"
                  placeholder="Pegar URL de la imagen..."
                  value={formData.photo}
                  onChange={(e) => handleInputChange('photo', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-xs bg-slate-50 transition-colors"
                />
              </div>
              <span className="text-[10px] text-slate-400 font-semibold text-center leading-relaxed">
                Puede proporcionar el enlace HTTPS de una imagen para previsualización en el expediente.
              </span>
            </div>
          </SectionCard>
        </div>

        {/* Columna Datos del Formulario */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos Principales */}
          <SectionCard title="Datos Principales de Inventario">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Código Patrimonial <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. AF-00102"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  required
                  className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none text-xs font-mono font-bold bg-slate-50 transition-colors ${errors.code ? 'border-rose-500' : 'border-slate-200 focus:border-amber-500'}`}
                />
                {errors.code && <span className="text-[10px] font-bold text-rose-500 block mt-1">{errors.code}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nombre del Activo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. Compresora Industrial Atlas Copco"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none text-xs font-bold bg-slate-50 transition-colors ${errors.name ? 'border-rose-500' : 'border-slate-200 focus:border-amber-500'}`}
                />
                {errors.name && <span className="text-[10px] font-bold text-rose-500 block mt-1">{errors.name}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Categoría <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  required
                  className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none text-xs font-semibold bg-slate-50 transition-colors ${errors.categoryId ? 'border-rose-500' : 'border-slate-200 focus:border-amber-500'}`}
                >
                  <option value="">-- Seleccionar Categoría --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.usefulLife ?? 5} años)
                    </option>
                  ))}
                </select>
                {errors.categoryId && <span className="text-[10px] font-bold text-rose-500 block mt-1">{errors.categoryId}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Estado Técnico <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.statusId}
                  onChange={(e) => handleInputChange('statusId', e.target.value)}
                  required
                  className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none text-xs font-semibold bg-slate-50 transition-colors ${errors.statusId ? 'border-rose-500' : 'border-slate-200 focus:border-amber-500'}`}
                >
                  <option value="">-- Seleccionar Estado --</option>
                  {statuses.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
                {errors.statusId && <span className="text-[10px] font-bold text-rose-500 block mt-1">{errors.statusId}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ubicación Física <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.locationId}
                  onChange={(e) => handleInputChange('locationId', e.target.value)}
                  required
                  className={`w-full px-3.5 py-2 border rounded-xl focus:outline-none text-xs font-semibold bg-slate-50 transition-colors ${errors.locationId ? 'border-rose-500' : 'border-slate-200 focus:border-amber-500'}`}
                >
                  <option value="">-- Seleccionar Ubicación --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                {errors.locationId && <span className="text-[10px] font-bold text-rose-500 block mt-1">{errors.locationId}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Fecha de Adquisición
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none text-xs bg-slate-50 transition-colors"
                />
              </div>
            </div>
          </SectionCard>

          {/* Valores Económicos y Cantidades */}
          <SectionCard title="Valores Económicos y Contables">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Valor Compra (Bs.) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.purchaseValue}
                  onChange={(e) => handleInputChange('purchaseValue', Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none text-xs font-bold bg-slate-50 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Vida Útil (según Categoría)
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={selectedCategory ? `${selectedCategory.usefulLife ?? 5} años` : 'Seleccione Categoría'}
                  className="w-full px-3.5 py-2 border border-slate-200/80 rounded-xl text-xs font-bold bg-slate-100 text-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Valor Residual (Bs.)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.residualValue}
                  onChange={(e) => handleInputChange('residualValue', Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none text-xs font-bold bg-slate-50 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Cantidad <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none text-xs font-bold bg-slate-50 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Unidad de Medida
                </label>
                <input
                  type="text"
                  placeholder="PZA, GLOBAL, etc."
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none text-xs bg-slate-50 transition-colors"
                />
              </div>
            </div>
          </SectionCard>

          {/* Especificaciones de Fabricante y Observaciones */}
          <SectionCard title="Especificaciones del Fabricante">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Marca</label>
                  <input
                    type="text"
                    placeholder="Ej. Caterpillar"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none text-xs bg-slate-50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Modelo</label>
                  <input
                    type="text"
                    placeholder="Ej. GA-90"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none text-xs bg-slate-50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Número de Serie</label>
                  <input
                    type="text"
                    placeholder="Ej. CAT-SER-0022"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none text-xs font-mono bg-slate-50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Observaciones</label>
                <textarea
                  rows={3}
                  placeholder="Información adicional del estado técnico..."
                  value={formData.observations}
                  onChange={(e) => handleInputChange('observations', e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none text-xs bg-slate-50 transition-colors resize-none"
                />
              </div>
            </div>
          </SectionCard>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(isEditMode ? `/assets/${id}` : '/assets')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 rounded-xl font-bold text-xs shadow-xs transition-all disabled:opacity-50"
            >
              <HiOutlineCheck className="text-base" />
              <span>{isLoading ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Registrar Activo'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AssetForm;
