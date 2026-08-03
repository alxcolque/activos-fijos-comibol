import React, { useState, useEffect } from 'react';
import type { LocationNode, CreateLocationDTO } from '../../interfaces/location.interface';
import { HiXMark } from 'react-icons/hi2';

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLocationDTO) => Promise<void>;
  locationItem?: LocationNode | null;
  defaultParentId?: string | null;
  locationsList: LocationNode[];
  isLoading?: boolean;
}

export const LocationFormModal: React.FC<LocationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  locationItem,
  defaultParentId,
  //locationsList,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>('');
  //const [parentFilterTerm, setParentFilterTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (locationItem) {
      setName(locationItem.name || '');
      setDescription(locationItem.description || '');
      setParentId(locationItem.parentId || '');
    } else {
      setName('');
      setDescription('');
      setParentId(defaultParentId || '');
    }
    //setParentFilterTerm('');
    setError(null);
  }, [locationItem, defaultParentId, isOpen]);

  if (!isOpen) return null;

  // Filtrar para no permitir asignarse a sí mismo como padre
  //const availableParents = locationsList.filter((loc) => loc.id !== locationItem?.id);

  // Filtrado reactivo por término de búsqueda
  /* const filteredParents = availableParents.filter((loc) =>
    loc.name.toLowerCase().includes(parentFilterTerm.toLowerCase()),
  ); */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre de la ubicación es obligatorio.');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        parentId: parentId ? parentId : null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al procesar la ubicación.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-800">
            {locationItem ? 'Editar Ubicación' : 'Nueva Ubicación'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <HiXMark className="text-xl" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600">
              {error}
            </div>
          )}

          {/* Campo Ubicación Padre con Filtro de Búsqueda */}
          {/* <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Ubicación Padre (Jerarquía)
            </label>
            <div className="relative">
              <HiMagnifyingGlass className="absolute left-3 top-2.5 text-slate-400 text-sm pointer-events-none" />
              <input
                type="text"
                value={parentFilterTerm}
                onChange={(e) => setParentFilterTerm(e.target.value)}
                placeholder="Filtrar ubicación padre por nombre..."
                className="w-full pl-9 pr-3.5 py-1.5 bg-slate-100/70 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-amber-500 mb-1"
              />
            </div>

            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            >
              <option value="">-- Sin Padre (Ubicación Raíz / Sede Principal) --</option>
              {filteredParents.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div> */}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre de la Ubicación <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="EJ: Empresa Minera Huanuni - Nivel 240"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descripción / Observaciones
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre el área, departamento o coordenadas físicas..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Footer del Modal */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-xs font-bold text-blue-900 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : locationItem ? 'Guardar Cambios' : 'Crear Ubicación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
