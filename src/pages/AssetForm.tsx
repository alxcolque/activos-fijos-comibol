import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssetStore } from '../store/assetStore';
import { SectionCard } from '../components/SectionCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import api from '../api/axios.instance';
import { getAssetUrl } from '../utils/assets';
import {
  HiOutlineArrowLeft,
  HiOutlineCheck,
  HiOutlineCloudArrowUp,
  HiOutlineTrash,
  HiOutlineArrowPath,
} from 'react-icons/hi2';

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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadImageError, setUploadImageError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadImageError('Solo se permiten archivos de imagen (PNG, JPG, JPEG, WEBP, GIF, SVG).');
      return;
    }

    setUploadImageError(null);
    const localBlobUrl = URL.createObjectURL(file);
    setPreviewUrl(localBlobUrl);
    setIsUploadingImage(true);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('folder', 'photos');

      const res = await api.post('/uploads', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.data?.path || res.data?.data?.url) {
        const photoPath = res.data.data.path || res.data.data.url;
        handleInputChange('photo', photoPath);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.customMessage || 'Error al subir la imagen al servidor.';
      setUploadImageError(msg);
      setPreviewUrl(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

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
        categoryId: selectedAsset.categoryId || selectedAsset.category?.id || '',
        statusId: selectedAsset.statusId || selectedAsset.status?.id || '',
        locationId: selectedAsset.locationId || selectedAsset.location?.id || '',
        brand: selectedAsset.brand || '',
        model: selectedAsset.model || '',
        serialNumber: selectedAsset.serialNumber || '',
        unit: selectedAsset.unit || 'PZA',
        quantity: selectedAsset.quantity ?? 1,
        purchaseDate: selectedAsset.purchaseDate ? selectedAsset.purchaseDate.split('T')[0] : '',
        purchaseValue: selectedAsset.purchaseValue ?? 0,
        residualValue: selectedAsset.residualValue ?? 0,
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
        photo: formData.photo.trim() ? formData.photo.trim() : (isEditMode ? null : undefined),
      };

      if (isEditMode && id) {
        await updateAsset(id, payload);
        navigate(`/activos/${id}`);
      } else {
        await createAsset(payload);
        navigate('/activos');
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
          onClick={() => navigate(isEditMode ? `/activos/${id}` : '/activos')}
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
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              {(() => {
                const activePhotoUrl = previewUrl || (formData.photo ? getAssetUrl(formData.photo) : null);

                if (activePhotoUrl) {
                  return (
                    <div className="flex flex-col items-center gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                      <div className="w-full aspect-[4/3] rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0 shadow-xs relative">
                        <img
                          src={activePhotoUrl}
                          alt="Vista previa del activo"
                          className="w-full h-full object-cover"
                        />
                        {isUploadingImage && (
                          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white gap-2">
                            <LoadingSpinner />
                            <span className="text-xs font-bold animate-pulse">Guardando en el servidor...</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center text-center gap-2 w-full">
                        <span className="text-[11px] font-mono text-slate-400 truncate max-w-full">
                          {formData.photo || 'Vista previa local'}
                        </span>
                        <div className="flex items-center justify-center gap-2 mt-1 w-full">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 rounded-xl font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <HiOutlineArrowPath className="text-sm" />
                            <span>Cambiar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewUrl(null);
                              handleInputChange('photo', '');
                            }}
                            disabled={isUploadingImage}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <HiOutlineTrash className="text-sm" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center p-6 min-h-[220px] border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-amber-500 bg-amber-50/60 scale-[0.99]'
                      : 'border-slate-300 hover:border-amber-400 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center py-4 gap-2 text-amber-600">
                      <LoadingSpinner />
                      <span className="text-xs font-bold animate-pulse">Subiendo imagen...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="p-3 bg-amber-100/80 text-amber-600 rounded-2xl shadow-xs">
                        <HiOutlineCloudArrowUp className="text-2xl" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">
                          Arrastra la imagen aquí o <span className="text-amber-600 underline">explorar</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Solo imágenes (PNG, JPG, WEBP, GIF, SVG)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

              {uploadImageError && (
                <p className="text-xs font-bold text-rose-500 mt-1 text-center">{uploadImageError}</p>
              )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              onClick={() => navigate(isEditMode ? `/activos/${id}` : '/activos')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || isUploadingImage}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 rounded-xl font-bold text-xs shadow-xs transition-all disabled:opacity-50"
            >
              <HiOutlineCheck className="text-base" />
              <span>{isUploadingImage ? 'Subiendo imagen...' : isLoading ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Registrar Activo'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AssetForm;
