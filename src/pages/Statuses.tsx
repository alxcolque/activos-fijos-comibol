import React, { useEffect, useState, useMemo } from 'react';
import { useStatusStore } from '../store/statusStore';
import type { AssetStatus, CreateStatusDTO } from '../interfaces/status.interface';
import { StatusFormModal } from '../components/statuses/StatusFormModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { SearchBar } from '../components/SearchBar';
import { StatusBadge } from '../components/StatusBadge';
import { HiPlus, HiPencilSquare, HiTrash, HiOutlineCheckCircle } from 'react-icons/hi2';

export const StatusesPage: React.FC = () => {
  const { statuses, isLoading, error, fetchStatuses, createStatus, updateStatus, deleteStatus } =
    useStatusStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<AssetStatus | null>(null);
  const [statusToDelete, setStatusToDelete] = useState<AssetStatus | null>(null);

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const showNotification = (type: 'success' | 'danger', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredStatuses = useMemo(() => {
    if (!searchTerm.trim()) return statuses;
    const term = searchTerm.toLowerCase();
    return statuses.filter(
      (st) =>
        st.name.toLowerCase().includes(term) ||
        (st.description && st.description.toLowerCase().includes(term)),
    );
  }, [statuses, searchTerm]);

  const handleOpenCreate = () => {
    setSelectedStatus(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (statusItem: AssetStatus) => {
    setSelectedStatus(statusItem);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: CreateStatusDTO) => {
    try {
      if (selectedStatus) {
        await updateStatus(selectedStatus.id, data);
        showNotification('success', 'Estado operativo actualizado exitosamente.');
      } else {
        await createStatus(data);
        showNotification('success', 'Estado operativo registrado exitosamente.');
      }
    } catch (err: any) {
      showNotification('danger', err.message || 'Error al guardar el estado operativo.');
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!statusToDelete) return;
    try {
      await deleteStatus(statusToDelete.id);
      showNotification('success', 'Estado operativo eliminado correctamente.');
      setStatusToDelete(null);
    } catch (err: any) {
      showNotification('danger', err.message || 'No se pudo eliminar el estado operativo.');
      setStatusToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-xl border text-xs font-bold animate-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === 'success'
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
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Estados Operativos</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestión del ciclo de vida y condiciones operativas de activos patrimoniales
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-xs rounded-xl shadow-sm transition-all shrink-0"
        >
          <HiPlus className="text-base" />
          <span>Nuevo Estado</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="w-full sm:w-96">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre o descripción..."
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Total: <span className="font-bold text-slate-800">{filteredStatuses.length}</span> estados
        </div>
      </div>

      {/* Contenido Principal / Estado de Carga */}
      {isLoading && statuses.length === 0 ? (
        <div className="py-16">
          <LoadingSpinner label="Cargando estados operativos..." />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-600 text-center">
          {error}
        </div>
      ) : filteredStatuses.length === 0 ? (
        <EmptyState
          icon={<HiOutlineCheckCircle className="text-4xl text-slate-400" />}
          title="No se encontraron estados operativos"
          description={
            searchTerm
              ? 'No hay registros que coincidan con la búsqueda actual.'
              : 'Empieza registrando el primer estado operativo para los activos fijos.'
          }
          actionText={searchTerm ? 'Limpiar búsqueda' : 'Crear Estado'}
          onAction={searchTerm ? () => setSearchTerm('') : handleOpenCreate}
        />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5 w-16 text-center">N°</th>
                  <th className="px-6 py-3.5">Nombre del Estado</th>
                  <th className="px-6 py-3.5">Descripción</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStatuses.map((st, index) => (
                  <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 text-center font-bold text-slate-400">{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <StatusBadge status={st.name} size="md" />
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-md truncate">{st.description || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(st)}
                          title="Editar estado"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <HiPencilSquare className="text-base" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatusToDelete(st)}
                          title="Eliminar estado"
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
      <StatusFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        statusItem={selectedStatus}
        isLoading={isLoading}
      />

      {/* Modal Confirmación de Eliminación */}
      <ConfirmDialog
        isOpen={!!statusToDelete}
        onOpenChange={(open) => !open && setStatusToDelete(null)}
        title="¿Eliminar estado operativo?"
        message={`¿Está seguro de eliminar el estado "${statusToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar"
        color="danger"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default StatusesPage;
