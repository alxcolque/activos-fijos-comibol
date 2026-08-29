import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.instance';
import type { AcquisitionItem, CreateAcquisitionDTO } from '../interfaces/acquisition.interface';
import type { User } from '../interfaces/user.interface';
import type { Project } from '../interfaces/project.interface';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { formatDate } from '../utils/assets';
import { useAuthStore } from '../store/authStore';
import {
  HiPlus,
  HiTrash,
  HiCheckCircle,
  HiXCircle,
  HiUserGroup,
  HiXMark,
  HiEye,
  HiUser,
  HiArchiveBox,
  HiCube,
} from 'react-icons/hi2';

export const PersonalList: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'admin';
  const isGuest = currentUser?.role === 'guest';

  // Estados Principales
  const [acquisitions, setAcquisitions] = useState<AcquisitionItem[]>([]);
  const [totalAcquisitions, setTotalAcquisitions] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Catálogos para selectores
  const [usersList, setUsersList] = useState<User[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [acquisitionToDelete, setAcquisitionToDelete] = useState<AcquisitionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Campos del Formulario de Creación
  const [typeTab, setTypeTab] = useState<'SUPPLY' | 'ASSET'>('SUPPLY');
  const [userId, setUserId] = useState(currentUser?.id || '');
  const [checkoutUserId, setCheckoutUserId] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAcquisitions();
    loadSupportCatalog();
  }, [page, search]);

  const fetchAcquisitions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<{
        success: boolean;
        data: AcquisitionItem[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>('/acquisitions', {
        params: {
          page,
          limit: 10,
          search: search || undefined,
        },
      });

      if (res.data?.data) {
        setAcquisitions(res.data.data);
        setTotalAcquisitions(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener los registros de personal.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSupportCatalog = async () => {
    try {
      const [resUsers, resProjects] = await Promise.all([
        api.get('/users?limit=100'),
        api.get('/projects?limit=100'),
      ]);
      if (resUsers.data?.data) setUsersList(resUsers.data.data);
      if (resProjects.data?.data) setProjectsList(resProjects.data.data);
    } catch (err) {
      console.error('Error cargando catálogos de soporte:', err);
    }
  };

  const showNotification = (type: 'success' | 'danger', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setTypeTab('SUPPLY');
    setUserId(currentUser?.id || '');
    setCheckoutUserId('');
    setDepartureDate('');
    setSelectedProjectId('');
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Si es operador o admin, validar persona que entrega
    const finalUserId = isAdmin ? userId : (currentUser?.id || '');
    if (!finalUserId) {
      setFormError('Debe seleccionar la persona que entrega el material.');
      return;
    }

    if (!selectedProjectId) {
      setFormError('Debe seleccionar el proyecto asignado.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateAcquisitionDTO = {
        userId: finalUserId,
        projectId: selectedProjectId,
        checkoutUserId: checkoutUserId || null,
        departureDate: departureDate || null,
        type: typeTab,
      };

      const res = await api.post('/acquisitions', payload);
      showNotification('success', 'Nuevo registro de personal registrado correctamente.');
      setIsFormModalOpen(false);
      fetchAcquisitions();

      // Navegar automáticamente a la vista de detalle para agregar insumos/activos
      if (res.data?.data?.id) {
        navigate(`/personal/${res.data.data.id}`);
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Error al guardar el registro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!acquisitionToDelete) return;
    try {
      await api.delete(`/acquisitions/${acquisitionToDelete.id}`);
      showNotification('success', 'El registro de personal fue eliminado exitosamente.');
      setAcquisitionToDelete(null);
      fetchAcquisitions();
    } catch (err: any) {
      showNotification('danger', err.response?.data?.message || 'Error al eliminar el registro.');
      setAcquisitionToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-3 animate-in slide-in-from-top-5 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? <HiCheckCircle className="text-lg text-emerald-600" /> : <HiXCircle className="text-lg text-rose-600" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Encabezado y Acciones */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Personal y Asignaciones</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de entregas de insumos, materiales y activos fijos asignados al personal de COMIBOL.
          </p>
        </div>

        {!isGuest && (
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold rounded-2xl text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <HiPlus className="text-base" />
            <span>Nuevo Registro de Personal</span>
          </button>
        )}
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por usuario que entrega, que retira o proyecto..."
        />
      </div>

      {/* Tabla de Resultados */}
      {isLoading && acquisitions.length === 0 ? (
        <div className="py-20">
          <LoadingSpinner label="Cargando registros de personal..." />
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center text-xs font-semibold text-rose-700">
          {error}
        </div>
      ) : acquisitions.length === 0 ? (
        <EmptyState
          icon={<HiUserGroup className="text-4xl text-slate-400" />}
          title="No se encontraron registros de personal"
          description={search ? `No hay resultados para "${search}".` : 'Aún no se han generado entregas de personal.'}
          actionText={search ? 'Limpiar Búsqueda' : !isGuest ? 'Nuevo Registro' : undefined}
          onAction={search ? () => setSearch('') : !isGuest ? handleOpenCreateModal : undefined}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Persona que Entrega</th>
                  <th className="px-6 py-4">Persona que Retira</th>
                  <th className="px-6 py-4">Proyecto Asignado</th>
                  <th className="px-6 py-4 text-center">Fecha de Salida</th>
                  <th className="px-6 py-4 text-center">Fecha Registro</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {acquisitions.map((item) => {
                  const isSupply = item.type === 'SUPPLY';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            isSupply
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {isSupply ? <HiArchiveBox className="text-xs" /> : <HiCube className="text-xs" />}
                          {isSupply ? 'Suministro' : 'Activo'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <HiUser className="text-amber-500 shrink-0" />
                          <span className="font-bold text-slate-800">
                            {item.user?.fullName || 'No registrada'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-600">
                        {item.checkoutUser?.fullName || <span className="text-slate-300 italic">No especificada</span>}
                      </td>

                      <td className="px-6 py-4">
                        {item.project?.name ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {item.project.name}
                          </span>
                        ) : (
                          <span className="text-slate-300 italic">Sin proyecto</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center text-slate-600 font-semibold">
                        {item.departureDate ? formatDate(item.departureDate) : '-'}
                      </td>

                      <td className="px-6 py-4 text-center text-slate-500 font-medium">
                        {formatDate(item.createdAt)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => navigate(`/personal/${item.id}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-blue-900 bg-amber-400 hover:bg-amber-300 font-bold text-xs shadow-2xs transition-all hover:scale-105"
                            title="Ver detalle de personal"
                          >
                            <HiEye className="text-sm" />
                            <span>Ver detalle de personal</span>
                          </button>

                          {!isGuest && (
                            <button
                              type="button"
                              onClick={() => setAcquisitionToDelete(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                              title="Eliminar registro"
                            >
                              <HiTrash className="text-base" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalAcquisitions}
            />
          </div>
        </div>
      )}

      {/* Modal Formulario Nuevo Registro de Personal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h3 className="text-base font-bold text-slate-800">
                Nuevo Registro de Personal
              </h3>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <HiXMark className="text-xl" />
              </button>
            </div>

            {/* Selector TAB de Tipo (Suministro vs Activo) */}
            <div className="p-4 bg-slate-100/50 border-b border-slate-100 shrink-0">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Tipo de Registro de Personal <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-200/60 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setTypeTab('SUPPLY')}
                  className={`py-2 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                    typeTab === 'SUPPLY'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <HiArchiveBox className="text-base text-emerald-600" />
                  <span>SUMINISTRO</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTypeTab('ASSET')}
                  className={`py-2 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                    typeTab === 'ASSET'
                      ? 'bg-white text-purple-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <HiCube className="text-base text-purple-600" />
                  <span>ACTIVO</span>
                </button>
              </div>
            </div>

            {/* Formulario Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                  {formError}
                </div>
              )}

              {/* Persona que Entrega (Visible para Admin, Oculto & Autoselect para Operador) */}
              {isAdmin ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Persona que Entrega Material (Insumos) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                  >
                    <option value="">-- Seleccionar Persona que Entrega --</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <input type="hidden" value={currentUser?.id || ''} />
              )}

              {/* Persona que Retira */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Persona que Retira Material (Insumos)
                </label>
                <select
                  value={checkoutUserId}
                  onChange={(e) => setCheckoutUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                >
                  <option value="">-- Seleccionar Persona que Retira (Opcional) --</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.profession || 'Sin cargo'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Proyecto Asignado */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proyecto Asignado <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                >
                  <option value="">-- Seleccionar Proyecto --</option>
                  {projectsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha de Salida */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fecha de Salida
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* Footer Modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-blue-900 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Crear e Ir a Detalle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmación Eliminar Registro */}
      <ConfirmDialog
        isOpen={!!acquisitionToDelete}
        onOpenChange={(open) => { if (!open) setAcquisitionToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Registro de Personal"
        message="¿Está seguro de eliminar este registro de personal y todas sus asignaciones asociadas?"
        confirmText="Sí, eliminar registro"
        color="danger"
      />
    </div>
  );
};

export default PersonalList;
