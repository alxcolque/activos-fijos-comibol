import React, { useEffect, useState, useMemo } from 'react';
import { useLocationStore } from '../store/locationStore';
import type { LocationNode, CreateLocationDTO } from '../interfaces/location.interface';
import { LocationFormModal } from '../components/locations/LocationFormModal';
import { LocationsTreeView } from '../components/locations/LocationsTreeView';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { SearchBar } from '../components/SearchBar';
import {
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiOutlineMapPin,
  HiOutlineBars3,
  HiOutlineFolderOpen,
} from 'react-icons/hi2';

export const LocationsPage: React.FC = () => {
  const {
    locationsTree,
    locationsFlat,
    isLoading,
    error,
    fetchLocationsTree,
    fetchLocationsFlat,
    createLocation,
    updateLocation,
    deleteLocation,
  } = useLocationStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationNode | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<LocationNode | null>(null);

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  useEffect(() => {
    fetchLocationsTree();
    fetchLocationsFlat();
  }, []);

  const showNotification = (type: 'success' | 'danger', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredFlatLocations = useMemo(() => {
    if (!searchTerm.trim()) return locationsFlat;
    const term = searchTerm.toLowerCase();
    return locationsFlat.filter(
      (loc) =>
        loc.name.toLowerCase().includes(term) ||
        (loc.description && loc.description.toLowerCase().includes(term)),
    );
  }, [locationsFlat, searchTerm]);

  const handleOpenCreate = (parentId?: string | null) => {
    setSelectedLocation(null);
    setDefaultParentId(parentId || null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (locationItem: LocationNode) => {
    setSelectedLocation(locationItem);
    setDefaultParentId(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: CreateLocationDTO) => {
    try {
      if (selectedLocation) {
        await updateLocation(selectedLocation.id, data);
        showNotification('success', 'Ubicación actualizada exitosamente.');
      } else {
        await createLocation(data);
        showNotification('success', 'Ubicación registrada exitosamente.');
      }
    } catch (err: any) {
      showNotification('danger', err.message || 'Error al guardar la ubicación.');
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return;
    try {
      await deleteLocation(locationToDelete.id);
      showNotification('success', 'Ubicación eliminada correctamente.');
      setLocationToDelete(null);
    } catch (err: any) {
      showNotification('danger', err.message || 'No se pudo eliminar la ubicación.');
      setLocationToDelete(null);
    }
  };

  // Mapa de nombres de ubicaciones por ID para vista plana
  const locationMap = useMemo(() => {
    const map = new Map<string, string>();
    locationsFlat.forEach((loc) => map.set(loc.id, loc.name));
    return map;
  }, [locationsFlat]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-[99999] p-4 rounded-2xl shadow-2xl border text-xs font-bold animate-in slide-in-from-top-2 duration-200 ${toastMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Encabezado y Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Ubicaciones y Sedes</h1>
          <p className="text-xs text-slate-500 mt-1">
            Estructura jerárquica de minas, plantas, almacenes y oficinas operativas de COMIBOL
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenCreate(null)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-xs rounded-xl shadow-sm transition-all shrink-0"
        >
          <HiPlus className="text-base" />
          <span>Nueva Ubicación</span>
        </button>
      </div>

      {/* Barra de Filtros, Búsqueda y Selector de Vista */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="w-full sm:w-96">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre o descripción..."
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'tree'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <HiOutlineFolderOpen className="text-sm" />
              <span>Árbol Jerárquico</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('flat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'flat'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <HiOutlineBars3 className="text-sm" />
              <span>Vista Lista</span>
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Total: <span className="font-bold text-slate-800">{locationsFlat.length}</span> ubicaciones
          </div>
        </div>
      </div>

      {/* Contenido Principal / Estado de Carga */}
      {isLoading && locationsTree.length === 0 ? (
        <div className="py-16">
          <LoadingSpinner label="Cargando estructura de ubicaciones..." />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-600 text-center">
          {error}
        </div>
      ) : viewMode === 'tree' ? (
        locationsTree.length === 0 ? (
          <EmptyState
            icon={<HiOutlineMapPin className="text-4xl text-slate-400" />}
            title="No hay ubicaciones registradas"
            description="Empieza creando la primera ubicación principal o sede de COMIBOL."
            actionText="Crear Ubicación"
            onAction={() => handleOpenCreate(null)}
          />
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <LocationsTreeView
              nodes={locationsTree}
              onAddSubLocation={(parent) => handleOpenCreate(parent.id)}
              onEditLocation={handleOpenEdit}
              onDeleteLocation={(node) => setLocationToDelete(node)}
            />
          </div>
        )
      ) : filteredFlatLocations.length === 0 ? (
        <EmptyState
          icon={<HiOutlineMapPin className="text-4xl text-slate-400" />}
          title="No se encontraron ubicaciones"
          description={
            searchTerm
              ? 'No hay registros que coincidan con la búsqueda actual.'
              : 'Empieza registrando la primera ubicación para organizar las sedes.'
          }
          actionText={searchTerm ? 'Limpiar búsqueda' : 'Crear Ubicación'}
          onAction={searchTerm ? () => setSearchTerm('') : () => handleOpenCreate(null)}
        />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5 w-16 text-center">N°</th>
                  <th className="px-6 py-3.5">Nombre de la Ubicación</th>
                  <th className="px-6 py-3.5">Ubicación Padre</th>
                  <th className="px-6 py-3.5">Descripción</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredFlatLocations.map((loc, index) => (
                  <tr key={loc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 text-center font-bold text-slate-400">{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{loc.name}</td>
                    <td className="px-6 py-4 text-slate-600 font-semibold">
                      {loc.parentId ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] bg-slate-100 text-slate-700">
                          {locationMap.get(loc.parentId) || loc.parentId}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">— Sede Raíz</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-md truncate">{loc.description || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenCreate(loc.id)}
                          title="Agregar sub-ubicación"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <HiPlus className="text-base" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(loc)}
                          title="Editar ubicación"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <HiPencilSquare className="text-base" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setLocationToDelete(loc)}
                          title="Eliminar ubicación"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <HiTrash className="text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Formulario */}
      <LocationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        locationItem={selectedLocation}
        defaultParentId={defaultParentId}
        locationsList={locationsFlat}
        isLoading={isLoading}
      />

      {/* Modal Confirmación de Eliminación */}
      <ConfirmDialog
        isOpen={!!locationToDelete}
        onOpenChange={(open) => !open && setLocationToDelete(null)}
        title="¿Eliminar ubicación?"
        message={`¿Está seguro de eliminar la ubicación "${locationToDelete?.name}"? Esta acción desvinculará sus dependencias.`}
        confirmText="Sí, Eliminar"
        color="danger"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default LocationsPage;
