import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import type { Project, CreateProjectDTO, ProjectStatus } from '../interfaces/project.interface';
import { ProjectFormModal } from '../components/projects/ProjectFormModal';
import { ProjectStatusBadge } from '../components/projects/ProjectStatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { formatDate } from '../utils/assets';
import {
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiEye,
  HiOutlineBriefcase,
  HiOutlineCube,
  HiOutlineArchiveBox,
} from 'react-icons/hi2';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isGuest = user?.role === 'guest';
  const { projects, pagination, isLoading, error, fetchProjects, createProject, updateProject, deleteProject } =
    useProjectStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  useEffect(() => {
    fetchProjects({
      page: currentPage,
      limit: 10,
      search: searchTerm || undefined,
      status: (selectedStatus as ProjectStatus) || undefined,
    });
  }, [currentPage, searchTerm, selectedStatus]);

  const showNotification = (type: 'success' | 'danger', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenCreate = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleOpenShow = (project: Project) => {
    navigate(`/proyectos/${project.id}`);
  };

  const handleFormSubmit = async (data: CreateProjectDTO) => {
    try {
      if (selectedProject) {
        await updateProject(selectedProject.id, data);
        showNotification('success', 'Proyecto actualizado exitosamente.');
      } else {
        await createProject(data);
        showNotification('success', 'Proyecto registrado exitosamente.');
      }
    } catch (err: any) {
      showNotification('danger', err.message || 'Error al guardar el proyecto.');
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete.id);
      showNotification('success', 'Proyecto eliminado correctamente.');
      setProjectToDelete(null);
    } catch (err: any) {
      showNotification('danger', err.message || 'No se pudo eliminar el proyecto.');
      setProjectToDelete(null);
    }
  };

  const formatDateRange = (startDate?: string | null, endDate?: string | null) => {
    if (!startDate && !endDate) return '—';
    const startStr = startDate ? formatDate(startDate) : 'Indefinido';
    const endStr = endDate ? formatDate(endDate) : 'Presente';
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-[99999] p-4 rounded-2xl shadow-2xl border text-xs font-bold animate-in slide-in-from-top-2 duration-200 ${
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Proyectos Mineros e Institucionales</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de proyectos de exploración, explotación y centros de costos COMIBOL
          </p>
        </div>

        {!isGuest && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-xs rounded-xl shadow-xs transition-all shrink-0"
          >
            <HiPlus className="text-base" />
            <span>Nuevo Proyecto</span>
          </button>
        )}
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="w-full sm:w-96">
          <SearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Buscar proyectos por nombre, responsable, dirección..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          {/* Selector de Estado */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:border-amber-500 transition-all shadow-2xs"
          >
            <option value="">-- Todos los Estados --</option>
            <option value="ACTIVE">Activos</option>
            <option value="FINISHED">Finalizados</option>
            <option value="SUSPENDED">Suspendidos</option>
            <option value="CANCELLED">Cancelados</option>
          </select>

          <div className="text-xs font-semibold text-slate-500">
            Total: <span className="font-bold text-slate-900">{projects.length}</span> proyectos
          </div>
        </div>
      </div>

      {/* Contenido Principal / Estado de Carga */}
      {isLoading && projects.length === 0 ? (
        <div className="py-16">
          <LoadingSpinner label="Cargando catálogo de proyectos..." />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-600 text-center">
          {error}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<HiOutlineBriefcase className="text-4xl text-slate-400" />}
          title="No se encontraron proyectos"
          description={
            searchTerm || selectedStatus
              ? 'No hay registros que coincidan con los filtros aplicados.'
              : 'Empieza registrando el primer proyecto minero o administrativo.'
          }
          actionText={searchTerm || selectedStatus ? 'Limpiar filtros' : 'Crear Proyecto'}
          onAction={
            searchTerm || selectedStatus
              ? () => {
                  setSearchTerm('');
                  setSelectedStatus('');
                }
              : handleOpenCreate
          }
        />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5 w-16 text-center">N°</th>
                  <th className="px-6 py-3.5">Nombre del Proyecto</th>
                  <th className="px-6 py-3.5">Dirección / Ubicación</th>
                  <th className="px-6 py-3.5">Responsable</th>
                  <th className="px-6 py-3.5 text-center">Estado</th>
                  <th className="px-6 py-3.5 text-center">Vigencia (Inicio - Fin)</th>
                  <th className="px-6 py-3.5 text-center">Activos Asignados</th>
                  <th className="px-6 py-3.5 text-center">Suministros Asignados</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {projects.map((pry, index) => (
                  <tr key={pry.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 text-center font-bold text-slate-400">{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex flex-col">
                        <span
                          onClick={() => handleOpenShow(pry)}
                          className="hover:text-amber-600 cursor-pointer transition-colors"
                        >
                          {pry.name}
                        </span>
                        {pry.description && (
                          <span className="text-[11px] font-normal text-slate-400 truncate max-w-xs">
                            {pry.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{pry.address || '—'}</td>
                    <td className="px-6 py-4 text-slate-600 font-semibold">{pry.responsible || '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <ProjectStatusBadge status={pry.status} />
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600 font-medium">
                      {formatDateRange(pry.startDate, pry.endDate)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-950 border border-blue-200/60">
                        <HiOutlineCube className="text-amber-500 text-xs" />
                        <span>{pry.totalAssets ?? pry._count?.assetProjects ?? 0} activos</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-950 border border-emerald-200/60">
                        <HiOutlineArchiveBox className="text-emerald-600 text-xs" />
                        <span>{pry.totalSupplies ?? pry._count?.supplyProjects ?? 0} suministros</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Ojo / Show */}
                        <button
                          type="button"
                          onClick={() => handleOpenShow(pry)}
                          title="Ver detalle y asignar activos (Show)"
                          className="p-2 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <HiEye className="text-base" />
                        </button>
                        {/* Editar */}
                        {!isGuest && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(pry)}
                            title="Editar información general"
                            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <HiPencilSquare className="text-base" />
                          </button>
                        )}
                        {/* Eliminar */}
                        {!isGuest && (
                          <button
                            type="button"
                            onClick={() => setProjectToDelete(pry)}
                            title="Eliminar proyecto"
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <HiTrash className="text-base" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Control de Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={10}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      {/* Modal Formulario Datos Generales */}
      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        projectItem={selectedProject}
        isLoading={isLoading}
      />

      {/* Modal Confirmación de Eliminación */}
      <ConfirmDialog
        isOpen={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
        title="¿Eliminar proyecto?"
        message={`¿Está seguro de eliminar el proyecto "${projectToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar"
        color="danger"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ProjectsPage;
