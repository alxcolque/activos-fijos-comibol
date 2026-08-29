import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios.instance';
import type { Project } from '../interfaces/project.interface';
import type { AssetModel } from '../interfaces/asset.interface';
import type { SupplyItem, SupplyProjectItem } from '../interfaces/supply.interface';
import { useAuthStore } from '../store/authStore';
import { formatDate } from '../utils/assets';
import { ProjectStatusBadge } from '../components/projects/ProjectStatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  HiArrowLeft,
  HiOutlineMapPin,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineCube,
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowPathRoundedSquare,
  HiOutlineTrash,
  HiOutlineLockOpen,
  HiOutlineArrowDownTray,
  HiXMark,
  HiOutlineBriefcase,
} from 'react-icons/hi2';

interface AssetAssignmentItem {
  id: string;
  assetId: string;
  projectId: string;
  quantity: number;
  assignedAt: string;
  releasedAt: string | null;
  observations: string | null;
  asset?: {
    id: string;
    code: string;
    name: string;
    brand?: string;
    model?: string;
    category?: { id: string; name: string };
    status?: { id: string; name: string };
  };
}

export const ProjectShowPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isGuest = user?.role === 'guest';

  // Pestañas (Activos Fijos vs Suministros)
  const [activeTab, setActiveTab] = useState<'ASSETS' | 'SUPPLIES'>('ASSETS');

  // Estados del Proyecto
  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  // Estados de Asignaciones de Activos Fijos
  const [assignments, setAssignments] = useState<AssetAssignmentItem[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [assetsCatalog, setAssetsCatalog] = useState<AssetModel[]>([]);

  // Modal "Asignar activo"
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [searchAsset, setSearchAsset] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [assignQuantity, setAssignQuantity] = useState<number>(1);
  const [assignObservations, setAssignObservations] = useState('');
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);
  const [assignValidationWarning, setAssignValidationWarning] = useState<string | null>(null);

  // Modal "Liberar activo"
  const [releaseItem, setReleaseItem] = useState<AssetAssignmentItem | null>(null);
  const [releaseQuantity, setReleaseQuantity] = useState<number>(1);
  const [releaseObservations, setReleaseObservations] = useState('');
  const [isReleasing, setIsReleasing] = useState(false);
  const [releaseValidationWarning, setReleaseValidationWarning] = useState<string | null>(null);

  // Modal "Eliminar asignación de activo"
  const [deleteItem, setDeleteItem] = useState<AssetAssignmentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados de Asignaciones de Suministros
  const [supplyAssignments, setSupplyAssignments] = useState<SupplyProjectItem[]>([]);
  const [isLoadingSupplyAssignments, setIsLoadingSupplyAssignments] = useState(false);
  const [suppliesCatalog, setSuppliesCatalog] = useState<SupplyItem[]>([]);

  // Modal "Asignar suministro"
  const [isAssignSupplyModalOpen, setIsAssignSupplyModalOpen] = useState(false);
  const [searchSupply, setSearchSupply] = useState('');
  const [selectedSupplyId, setSelectedSupplyId] = useState('');
  const [assignSupplyQty, setAssignSupplyQty] = useState<number>(1);
  const [assignSupplyObs, setAssignSupplyObs] = useState('');
  const [isSubmittingSupplyAssign, setIsSubmittingSupplyAssign] = useState(false);
  const [assignSupplyWarning, setAssignSupplyWarning] = useState<string | null>(null);

  // Modal "Liberar suministro"
  const [releaseSupplyItem, setReleaseSupplyItem] = useState<SupplyProjectItem | null>(null);
  const [releaseSupplyQty, setReleaseSupplyQty] = useState<number>(1);
  const [releaseSupplyObs, setReleaseSupplyObs] = useState('');
  const [isReleasingSupply, setIsReleasingSupply] = useState(false);
  const [releaseSupplyWarning, setReleaseSupplyWarning] = useState<string | null>(null);

  // Modal "Eliminar asignación de suministro"
  const [deleteSupplyItem, setDeleteSupplyItem] = useState<SupplyProjectItem | null>(null);

  // Modal "Reporte Word"
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [pageSize, setPageSize] = useState<'carta' | 'a4' | 'oficio'>('carta');
  const [isDownloadingWord, setIsDownloadingWord] = useState(false);

  // Notificaciones Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'danger', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDownloadWordReport = async () => {
    if (!projectId) return;
    setIsDownloadingWord(true);
    try {
      const response = await api.get(`/projects/${projectId}/report-word`, {
        params: { pageSize },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = (project?.name || 'Proyecto').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.setAttribute('download', `Informe_Inventario_${safeName}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setIsWordModalOpen(false);
      showNotification('success', 'Informe Word generado y descargado exitosamente.');
    } catch (err: any) {
      console.error('Error al descargar reporte Word:', err);
      showNotification('danger', 'No se pudo generar el informe Word.');
    } finally {
      setIsDownloadingWord(false);
    }
  };

  // Cargar datos del proyecto, asignaciones y catálogos
  useEffect(() => {
    if (!projectId) return;
    loadProjectData();
    loadAssignments();
    loadAssetsCatalog();
    loadSupplyAssignments();
    loadSuppliesCatalog();
  }, [projectId]);

  const loadProjectData = async () => {
    setIsLoadingProject(true);
    setProjectError(null);
    try {
      const res = await api.get<{ success: boolean; data: Project }>(`/projects/${projectId}`);
      if (res.data?.data) {
        setProject(res.data.data);
      }
    } catch (err: any) {
      setProjectError(err.response?.data?.message || 'Error al cargar el proyecto.');
    } finally {
      setIsLoadingProject(false);
    }
  };

  const loadAssignments = async () => {
    setIsLoadingAssignments(true);
    try {
      const res = await api.get<{ success: boolean; data: AssetAssignmentItem[] }>(
        `/asset-projects/project/${projectId}`,
      );
      if (res.data?.data) {
        setAssignments(res.data.data);
      }
    } catch (err) {
      console.error('Error al cargar asignaciones de activos del proyecto:', err);
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  const loadAssetsCatalog = async () => {
    try {
      const res = await api.get<{ success: boolean; data: AssetModel[] }>('/assets', {
        params: { limit: 300 },
      });
      if (res.data?.data) {
        setAssetsCatalog(res.data.data);
      }
    } catch (err) {
      console.error('Error al cargar catálogo de activos:', err);
    }
  };

  const loadSupplyAssignments = async () => {
    if (!projectId) return;
    setIsLoadingSupplyAssignments(true);
    try {
      const res = await api.get<{ success: boolean; data: SupplyProjectItem[] }>(
        `/supply-projects/project/${projectId}`,
      );
      if (res.data?.data) {
        setSupplyAssignments(res.data.data);
      }
    } catch (err) {
      console.error('Error al cargar suministros asignados al proyecto:', err);
    } finally {
      setIsLoadingSupplyAssignments(false);
    }
  };

  const loadSuppliesCatalog = async () => {
    try {
      const res = await api.get<{ success: boolean; data: SupplyItem[] }>('/supplies', {
        params: { limit: 500 },
      });
      if (res.data?.data) {
        setSuppliesCatalog(res.data.data);
      }
    } catch (err) {
      console.error('Error al cargar catálogo de suministros:', err);
    }
  };

  // Cálculo de disponibilidad de un activo
  const getAssetStockInfo = (asset: AssetModel) => {
    const total = Number(asset.quantity || 1);
    const out = Number(asset.quantityOut || 0);
    const available = Math.max(0, total - out);
    return {
      total,
      out,
      available,
      isOutOfStock: available <= 0,
    };
  };

  // Cálculo de disponibilidad de un suministro
  const getSupplyStockInfo = (supply: SupplyItem) => {
    const total = Number(supply.inputQuantity || 0);
    const out = Number(supply.outputQuantity || 0);
    const available = Math.max(0, total - out);
    return {
      total,
      out,
      available,
      isOutOfStock: available <= 0,
    };
  };

  const selectedAsset = assetsCatalog.find((a) => a.id === selectedAssetId);
  const selectedAssetStock = selectedAsset ? getAssetStockInfo(selectedAsset) : null;

  const selectedSupply = suppliesCatalog.find((s) => s.id === selectedSupplyId);
  const selectedSupplyStock = selectedSupply ? getSupplyStockInfo(selectedSupply) : null;

  // Manejo de Modal Asignación de Activo
  const handleOpenAssignModal = () => {
    setSelectedAssetId('');
    setSearchAsset('');
    setAssignQuantity(1);
    setAssignObservations('');
    setAssignValidationWarning(null);
    setIsAssignModalOpen(true);
  };

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    setAssignValidationWarning(null);

    const target = assetsCatalog.find((a) => a.id === assetId);
    if (!target) return;

    const stock = getAssetStockInfo(target);
    if (stock.isOutOfStock) {
      setAssignQuantity(0);
      setAssignValidationWarning('⚠️ No existen unidades disponibles en almacén para asignar este activo.');
    } else {
      setAssignQuantity(1);
    }
  };

  const handleAssignQuantityChange = (valStr: string) => {
    const val = parseInt(valStr, 10);
    if (isNaN(val) || val <= 0) {
      setAssignQuantity(isNaN(val) ? 0 : val);
      setAssignValidationWarning('⚠️ La cantidad a asignar debe ser mayor a cero.');
      return;
    }

    setAssignQuantity(val);

    if (!selectedAsset) return;
    const stock = getAssetStockInfo(selectedAsset);

    if (val > stock.available) {
      setAssignValidationWarning(
        `⚠️ La cantidad ingresada (${val}) supera las unidades disponibles (${stock.available} de ${stock.total} totales).`,
      );
    } else {
      setAssignValidationWarning(null);
    }
  };

  const handleAssignAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !selectedAssetId || !selectedAsset) return;

    const stock = getAssetStockInfo(selectedAsset);
    if (assignQuantity <= 0 || assignQuantity > stock.available) {
      setAssignValidationWarning(`Ingrese una cantidad válida entre 1 y ${stock.available}.`);
      return;
    }

    setIsSubmittingAssign(true);
    try {
      await api.post('/asset-projects/assign', {
        projectId,
        assetId: selectedAssetId,
        quantity: assignQuantity,
        observations: assignObservations.trim() || undefined,
      });

      showNotification('success', 'Activo asignado al proyecto exitosamente.');
      setIsAssignModalOpen(false);

      await Promise.all([loadAssignments(), loadAssetsCatalog(), loadProjectData()]);
    } catch (err: any) {
      showNotification('danger', err.response?.data?.message || 'Error al asignar el activo.');
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  // Manejo de Modal Asignación de Suministro
  const handleOpenAssignSupplyModal = () => {
    setSelectedSupplyId('');
    setSearchSupply('');
    setAssignSupplyQty(1);
    setAssignSupplyObs('');
    setAssignSupplyWarning(null);
    setIsAssignSupplyModalOpen(true);
  };

  const handleSelectSupply = (supplyId: string) => {
    setSelectedSupplyId(supplyId);
    setAssignSupplyWarning(null);

    const target = suppliesCatalog.find((s) => s.id === supplyId);
    if (!target) return;

    const stock = getSupplyStockInfo(target);
    if (stock.isOutOfStock) {
      setAssignSupplyQty(0);
      setAssignSupplyWarning('⚠️ No existen unidades disponibles en almacén para este suministro.');
    } else {
      setAssignSupplyQty(1);
    }
  };

  const handleAssignSupplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !selectedSupplyId || !selectedSupply) return;

    const stock = getSupplyStockInfo(selectedSupply);
    if (assignSupplyQty <= 0 || assignSupplyQty > stock.available) {
      setAssignSupplyWarning(`Ingrese una cantidad válida entre 1 y ${stock.available}.`);
      return;
    }

    setIsSubmittingSupplyAssign(true);
    try {
      await api.post('/supply-projects', {
        projectId,
        supplyId: selectedSupplyId,
        quantity: assignSupplyQty,
        observations: assignSupplyObs.trim() || undefined,
      });

      showNotification('success', 'Suministro asignado al proyecto exitosamente.');
      setIsAssignSupplyModalOpen(false);

      await Promise.all([loadSupplyAssignments(), loadSuppliesCatalog(), loadProjectData()]);
    } catch (err: any) {
      showNotification('danger', err.response?.data?.message || 'Error al asignar el suministro.');
    } finally {
      setIsSubmittingSupplyAssign(false);
    }
  };

  // Liberar Activo Fijo
  const handleOpenReleaseModal = (item: AssetAssignmentItem) => {
    setReleaseItem(item);
    setReleaseQuantity(item.quantity);
    setReleaseObservations('');
    setReleaseValidationWarning(null);
  };

  const handleConfirmReleaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseItem || !projectId) return;

    setIsReleasing(true);
    try {
      await api.post('/asset-projects/release', {
        assignmentId: releaseItem.id,
        assetId: releaseItem.assetId,
        projectId,
        quantityToRelease: releaseQuantity,
        observations: releaseObservations.trim() || undefined,
      });

      showNotification('success', 'Activo liberado del proyecto correctamente.');
      setReleaseItem(null);

      await Promise.all([loadAssignments(), loadAssetsCatalog(), loadProjectData()]);
    } catch (err: any) {
      showNotification('danger', err.response?.data?.message || 'Error al liberar el activo.');
    } finally {
      setIsReleasing(false);
    }
  };

  // Liberar Suministro
  const handleOpenReleaseSupplyModal = (item: SupplyProjectItem) => {
    setReleaseSupplyItem(item);
    setReleaseSupplyQty(item.quantity);
    setReleaseSupplyObs('');
    setReleaseSupplyWarning(null);
  };

  const handleConfirmReleaseSupplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseSupplyItem || !projectId) return;

    setIsReleasingSupply(true);
    try {
      await api.put(`/supply-projects/${releaseSupplyItem.id}/release`, {
        quantityToRelease: releaseSupplyQty,
        observations: releaseSupplyObs.trim() || undefined,
      });

      showNotification('success', 'Suministro liberado del proyecto correctamente.');
      setReleaseSupplyItem(null);

      await Promise.all([loadSupplyAssignments(), loadSuppliesCatalog(), loadProjectData()]);
    } catch (err: any) {
      showNotification('danger', err.response?.data?.message || 'Error al liberar el suministro.');
    } finally {
      setIsReleasingSupply(false);
    }
  };

  // Confirmar Eliminación Asignación Activo
  const handleConfirmDelete = async () => {
    if (!deleteItem || isDeleting) return;

    setIsDeleting(true);
    try {
      await api.delete(`/asset-projects/${deleteItem.id}`);

      showNotification('success', 'Asignación eliminada del proyecto correctamente.');
      setDeleteItem(null);

      await Promise.all([loadAssignments(), loadAssetsCatalog(), loadProjectData()]);
    } catch (err: any) {
      showNotification('danger', err.response?.data?.message || 'Error al eliminar la asignación.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Confirmar Eliminación Asignación Suministro
  const handleConfirmDeleteSupply = async () => {
    if (!deleteSupplyItem) return;

    try {
      await api.delete(`/supply-projects/${deleteSupplyItem.id}`);

      showNotification('success', 'Asignación de suministro eliminada correctamente.');
      setDeleteSupplyItem(null);

      await Promise.all([loadSupplyAssignments(), loadSuppliesCatalog(), loadProjectData()]);
    } catch (err: any) {
      showNotification('danger', err.response?.data?.message || 'Error al eliminar la asignación.');
      setDeleteSupplyItem(null);
    }
  };

  const filteredAssets = assetsCatalog.filter((a) => {
    const q = searchAsset.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q);
  });

  const filteredSupplies = suppliesCatalog.filter((s) => {
    const q = searchSupply.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.category?.name && s.category.name.toLowerCase().includes(q));
  });

  const activeAssignmentsCount = assignments.filter((a) => !a.releasedAt).length;
  const activeSupplyAssignmentsCount = supplyAssignments.filter((s) => !s.releasedAt).length;

  if (isLoadingProject && !project) {
    return (
      <div className="py-20">
        <LoadingSpinner label="Cargando información del proyecto..." />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/proyectos')}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <HiArrowLeft />
          <span>Volver a Proyectos</span>
        </button>
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center text-rose-700 text-sm font-semibold">
          {projectError || 'El proyecto solicitado no fue encontrado.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
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

      {/* Botón Volver y Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/proyectos')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-1 cursor-pointer"
          >
            <HiArrowLeft className="text-sm" />
            <span>Volver a Proyectos Mineros e Institucionales</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setIsWordModalOpen(true)}
            title="Descargar Informe de Inventario en documento Word (.docx)"
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 border border-blue-800 cursor-pointer"
          >
            <HiOutlineArrowDownTray className="text-base text-amber-400" />
            <span>Reporte Word</span>
          </button>

          {!isGuest && (
            <>
              <button
                onClick={handleOpenAssignModal}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
              >
                <HiOutlinePlus className="text-base" />
                <span>Asignar activo</span>
              </button>

              <button
                onClick={handleOpenAssignSupplyModal}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
              >
                <HiOutlinePlus className="text-base" />
                <span>Asignar suministro</span>
              </button>
            </>
          )}

          <button
            onClick={() => {
              loadProjectData();
              loadAssignments();
              loadAssetsCatalog();
              loadSupplyAssignments();
              loadSuppliesCatalog();
            }}
            title="Actualizar datos"
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <HiOutlineArrowPathRoundedSquare className="text-base text-amber-500" />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {/* Detalles Informativos del Proyecto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <HiOutlineUser className="text-amber-500 text-sm" />
            <span>Responsable Técnico</span>
          </div>
          <p className="text-sm font-bold text-slate-800">{project.responsible || 'Sin asignar'}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <HiOutlineMapPin className="text-amber-500 text-sm" />
            <span>Ubicación / Dirección</span>
          </div>
          <p className="text-sm font-bold text-slate-800 truncate">{project.address || 'Sin dirección especificada'}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <HiOutlineCalendar className="text-amber-500 text-sm" />
            <span>Vigencia del Proyecto</span>
          </div>
          <p className="text-xs font-bold text-slate-800">
            {project.startDate ? formatDate(project.startDate) : '—'} al {project.endDate ? formatDate(project.endDate) : 'Indefinido'}
          </p>
        </div>
      </div>

      {/* Pestañas de Asignación (Activos Fijos vs Suministros) */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-3xl px-4 pt-4 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('ASSETS')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs rounded-t-2xl transition-all border-b-2 cursor-pointer ${
            activeTab === 'ASSETS'
              ? 'border-amber-500 text-amber-600 bg-amber-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <HiOutlineBriefcase className="text-base" />
          <span>Activos Fijos Asignados ({activeAssignmentsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SUPPLIES')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs rounded-t-2xl transition-all border-b-2 cursor-pointer ${
            activeTab === 'SUPPLIES'
              ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <HiOutlineCube className="text-base" />
          <span>Suministros / Materiales Asignados ({activeSupplyAssignmentsCount})</span>
        </button>
      </div>

      {/* TAB 1: Tabla Activos Fijos Asignados al Proyecto */}
      {activeTab === 'ASSETS' && (
        <div className="bg-white border border-slate-200/80 rounded-b-3xl shadow-xs overflow-hidden space-y-4">
          <div className="p-6 pb-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Activos Fijos Asignados al Proyecto</h3>
              <p className="text-xs text-slate-500">Historial y estado de los bienes vinculados a este proyecto.</p>
            </div>
            {!isGuest && (
              <button
                onClick={handleOpenAssignModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <HiOutlinePlus className="text-sm" />
                <span>Asignar activo</span>
              </button>
            )}
          </div>

          {isLoadingAssignments ? (
            <div className="py-12">
              <LoadingSpinner label="Cargando activos del proyecto..." />
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-medium space-y-3">
              <p>No se han asignado activos fijos a este proyecto.</p>
              {!isGuest && (
                <button
                  onClick={handleOpenAssignModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-blue-950 rounded-xl text-xs font-bold hover:bg-amber-400 transition-all cursor-pointer"
                >
                  <HiOutlinePlus className="text-sm" />
                  <span>Asignar activo ahora</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Código</th>
                    <th className="px-6 py-3.5">Activo Fijo</th>
                    <th className="px-6 py-3.5 text-center">Cantidad</th>
                    <th className="px-6 py-3.5 text-center">Asignado El</th>
                    <th className="px-6 py-3.5 text-center">Estado / Liberación</th>
                    <th className="px-6 py-3.5">Observaciones</th>
                    <th className="px-6 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {assignments.map((item) => {
                    const isReleased = !!item.releasedAt;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 font-bold text-blue-950">{item.asset?.code || 'S/C'}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{item.asset?.name || 'Activo Fijo'}</span>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 font-medium">
                              {item.asset?.category?.name && (
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">
                                  {item.asset.category.name}
                                </span>
                              )}
                              {item.asset?.brand && <span>• {item.asset.brand}</span>}
                              {item.asset?.model && <span>({item.asset.model})</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-950 border border-blue-200">
                            {item.quantity} unidades
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 font-medium">
                          {formatDate(item.assignedAt)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isReleased ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              Liberado: {formatDate(item.releasedAt)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Vigente en Proyecto
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-normal">
                          {item.observations || 'Sin observaciones'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isGuest && !isReleased && (
                              <button
                                type="button"
                                onClick={() => handleOpenReleaseModal(item)}
                                title="Liberar activo del proyecto"
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold text-[11px] transition-colors border border-amber-200 cursor-pointer"
                              >
                                <HiOutlineLockOpen className="text-sm" />
                                <span>Liberar</span>
                              </button>
                            )}

                            {!isGuest && (
                              <button
                                type="button"
                                onClick={() => setDeleteItem(item)}
                                title="Eliminar asignación"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <HiOutlineTrash className="text-base" />
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
          )}
        </div>
      )}

      {/* TAB 2: Tabla Suministros / Materiales Asignados al Proyecto */}
      {activeTab === 'SUPPLIES' && (
        <div className="bg-white border border-slate-200/80 rounded-b-3xl shadow-xs overflow-hidden space-y-4">
          <div className="p-6 pb-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Suministros y Materiales Asignados</h3>
              <p className="text-xs text-slate-500">Insumos y materiales extraídos del almacén para este proyecto.</p>
            </div>
            {!isGuest && (
              <button
                onClick={handleOpenAssignSupplyModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <HiOutlinePlus className="text-sm" />
                <span>Asignar suministro</span>
              </button>
            )}
          </div>

          {isLoadingSupplyAssignments ? (
            <div className="py-12">
              <LoadingSpinner label="Cargando suministros asignados al proyecto..." />
            </div>
          ) : supplyAssignments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-medium space-y-3">
              <p>No se han asignado suministros o materiales a este proyecto.</p>
              {!isGuest && (
                <button
                  onClick={handleOpenAssignSupplyModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-all cursor-pointer"
                >
                  <HiOutlinePlus className="text-sm" />
                  <span>Asignar suministro ahora</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Material / Suministro</th>
                    <th className="px-5 py-3.5">Categoría / Ubicación</th>
                    <th className="px-5 py-3.5 text-center">Asignado</th>
                    <th className="px-5 py-3.5 text-center">Salida Proyecto</th>
                    <th className="px-5 py-3.5 text-center">Saldo Disponible</th>
                    <th className="px-5 py-3.5 text-center">Asignado El</th>
                    <th className="px-5 py-3.5 text-center">Estado / Liberación</th>
                    <th className="px-5 py-3.5">Observaciones</th>
                    <th className="px-5 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {supplyAssignments.map((item) => {
                    const isReleased = !!item.releasedAt;
                    const stockInProject = Math.max(0, item.quantity - (item.outputQuantity || 0));

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-800">
                          {item.supply?.name || 'Suministro'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            {item.supply?.category?.name && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 w-max">
                                {item.supply.category.name}
                              </span>
                            )}
                            {item.supply?.location?.name && (
                              <span className="text-[11px] font-semibold text-slate-500">
                                📍 {item.supply.location.name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center font-bold text-slate-700">
                          {item.quantity} {item.supply?.unit || 'PZA'}
                        </td>
                        <td className="px-5 py-4 text-center font-bold text-rose-600">
                          {item.outputQuantity || 0} {item.supply?.unit || 'PZA'}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${
                              stockInProject <= 0
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {stockInProject} {item.supply?.unit || 'PZA'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 font-medium">
                          {formatDate(item.assignedAt)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isReleased ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              Liberado: {formatDate(item.releasedAt)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Vigente en Proyecto
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-normal">
                          {item.observations || 'Sin observaciones'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isGuest && !isReleased && (
                              <button
                                type="button"
                                onClick={() => handleOpenReleaseSupplyModal(item)}
                                title="Liberar suministro del proyecto"
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-bold text-[11px] transition-colors border border-emerald-200 cursor-pointer"
                              >
                                <HiOutlineLockOpen className="text-sm" />
                                <span>Liberar</span>
                              </button>
                            )}

                            {!isGuest && (
                              <button
                                type="button"
                                onClick={() => setDeleteSupplyItem(item)}
                                title="Eliminar asignación"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <HiOutlineTrash className="text-base" />
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
          )}
        </div>
      )}

      {/* MODAL 1: Asignar Activo al Proyecto */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-2xl">
                  <HiOutlinePlus className="text-xl" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Asignar Activo al Proyecto</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Seleccione un activo del inventario e indique la cantidad a asignar.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                <HiXMark className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleAssignAssetSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Buscador de Activo */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Buscar Activo Fijo</label>
                <div className="relative">
                  <HiOutlineMagnifyingGlass className="absolute left-3.5 top-3 text-slate-400 text-sm" />
                  <input
                    type="text"
                    value={searchAsset}
                    onChange={(e) => setSearchAsset(e.target.value)}
                    placeholder="Filtrar por código o nombre..."
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Selector de Activos */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Seleccione el Activo</label>
                <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 bg-slate-50/50">
                  {filteredAssets.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No se encontraron activos.</div>
                  ) : (
                    filteredAssets.map((asset) => {
                      const stock = getAssetStockInfo(asset);
                      const isSelected = selectedAssetId === asset.id;
                      return (
                        <div
                          key={asset.id}
                          onClick={() => handleSelectAsset(asset.id)}
                          className={`p-3 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? 'bg-amber-50/80 font-bold border-l-4 border-amber-500' : 'hover:bg-slate-100/60'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-slate-800">{asset.code}</span> - {asset.name}
                            <div className="text-[10px] text-slate-400 font-normal">
                              Disponibles: {stock.available} de {stock.total} unidades
                            </div>
                          </div>
                          {stock.isOutOfStock ? (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              Sin Stock
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Stock: {stock.available}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Cantidad y Advertencia */}
              {selectedAsset && (
                <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">Cantidad a Asignar:</span>
                    <input
                      type="number"
                      min="1"
                      max={selectedAssetStock?.available || 1}
                      value={assignQuantity}
                      onChange={(e) => handleAssignQuantityChange(e.target.value)}
                      className="w-24 px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-center focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  {assignValidationWarning && (
                    <div className="text-[11px] font-semibold text-rose-700">{assignValidationWarning}</div>
                  )}
                </div>
              )}

              {/* Observaciones */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Observaciones / Notas</label>
                <textarea
                  rows={2}
                  value={assignObservations}
                  onChange={(e) => setAssignObservations(e.target.value)}
                  placeholder="Detalles sobre el uso o condición de entrega..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAssign || !selectedAssetId || !!assignValidationWarning}
                  className="px-5 py-2.5 text-xs font-bold text-blue-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingAssign ? 'Asignando...' : 'Confirmar Asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Asignar Suministro al Proyecto */}
      {isAssignSupplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-2xl">
                  <HiOutlinePlus className="text-xl" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Asignar Suministro al Proyecto</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Seleccione un material de almacén e indique la cantidad a entregar al proyecto.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignSupplyModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                <HiXMark className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleAssignSupplySubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Buscador de Suministro */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Buscar Suministro / Material</label>
                <div className="relative">
                  <HiOutlineMagnifyingGlass className="absolute left-3.5 top-3 text-slate-400 text-sm" />
                  <input
                    type="text"
                    value={searchSupply}
                    onChange={(e) => setSearchSupply(e.target.value)}
                    placeholder="Filtrar por nombre o categoría de suministro..."
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Selector de Suministros */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Seleccione el Material</label>
                <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 bg-slate-50/50">
                  {filteredSupplies.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No se encontraron suministros.</div>
                  ) : (
                    filteredSupplies.map((supply) => {
                      const stock = getSupplyStockInfo(supply);
                      const isSelected = selectedSupplyId === supply.id;
                      return (
                        <div
                          key={supply.id}
                          onClick={() => handleSelectSupply(supply.id)}
                          className={`p-3 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? 'bg-emerald-50/80 font-bold border-l-4 border-emerald-500' : 'hover:bg-slate-100/60'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-slate-800">{supply.name}</span>
                            <div className="text-[10px] text-slate-400 font-normal">
                              Categoría: {supply.category?.name || 'General'} • Disponible: {stock.available} {supply.unit}
                            </div>
                          </div>
                          {stock.isOutOfStock ? (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              Sin Stock
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Stock: {stock.available} {supply.unit}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Cantidad y Advertencia */}
              {selectedSupply && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">Cantidad a Asignar ({selectedSupply.unit}):</span>
                    <input
                      type="number"
                      min="1"
                      max={selectedSupplyStock?.available || 1}
                      value={assignSupplyQty}
                      onChange={(e) => setAssignSupplyQty(Number(e.target.value))}
                      className="w-24 px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-center focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  {assignSupplyWarning && (
                    <div className="text-[11px] font-semibold text-rose-700">{assignSupplyWarning}</div>
                  )}
                </div>
              )}

              {/* Observaciones */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Observaciones / Notas</label>
                <textarea
                  rows={2}
                  value={assignSupplyObs}
                  onChange={(e) => setAssignSupplyObs(e.target.value)}
                  placeholder="Detalles sobre entrega de materiales (Ej: Para el área de mantenimiento)..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignSupplyModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSupplyAssign || !selectedSupplyId || !!assignSupplyWarning}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingSupplyAssign ? 'Asignando...' : 'Confirmar Entrega'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Liberar Activo del Proyecto */}
      {releaseItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 bg-amber-50/50 flex items-center justify-between">
              <h3 className="text-base font-bold text-amber-950">Liberar Activo Fijo del Proyecto</h3>
              <button
                type="button"
                onClick={() => setReleaseItem(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <HiXMark className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleConfirmReleaseSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 font-medium">
                Indique la cantidad de unidades que retornarán al almacén desde este proyecto.
              </p>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Cantidad a Liberar</label>
                <input
                  type="number"
                  min="1"
                  max={releaseItem.quantity}
                  value={releaseQuantity}
                  onChange={(e) => setReleaseQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              {releaseValidationWarning && (
                <div className="text-[11px] font-semibold text-rose-700">{releaseValidationWarning}</div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Observaciones de Devolución</label>
                <textarea
                  rows={2}
                  value={releaseObservations}
                  onChange={(e) => setReleaseObservations(e.target.value)}
                  placeholder="Ej: Devolución por conclusión de etapa..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReleaseItem(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isReleasing || !!releaseValidationWarning}
                  className="px-5 py-2 text-xs font-bold text-amber-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {isReleasing ? 'Procesando...' : 'Confirmar Liberación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Liberar Suministro del Proyecto */}
      {releaseSupplyItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 bg-emerald-50/50 flex items-center justify-between">
              <h3 className="text-base font-bold text-emerald-950">Liberar / Devolver Suministro</h3>
              <button
                type="button"
                onClick={() => setReleaseSupplyItem(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <HiXMark className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleConfirmReleaseSupplySubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 font-medium">
                Indique la cantidad del suministro <strong>"{releaseSupplyItem.supply?.name}"</strong> que retorna al almacén.
              </p>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Cantidad a Liberar ({releaseSupplyItem.supply?.unit})</label>
                <input
                  type="number"
                  min="1"
                  max={releaseSupplyItem.quantity}
                  value={releaseSupplyQty}
                  onChange={(e) => setReleaseSupplyQty(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              {releaseSupplyWarning && (
                <div className="text-[11px] font-semibold text-rose-700">{releaseSupplyWarning}</div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Observaciones de Devolución</label>
                <textarea
                  rows={2}
                  value={releaseSupplyObs}
                  onChange={(e) => setReleaseSupplyObs(e.target.value)}
                  placeholder="Ej: Material no utilizado en proyecto..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReleaseSupplyItem(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isReleasingSupply}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {isReleasingSupply ? 'Procesando...' : 'Confirmar Liberación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmación Eliminar Asignación Activo */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onOpenChange={(open) => { if (!open) setDeleteItem(null); }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Asignación de Activo"
        message={`¿Está seguro de eliminar la asignación del activo "${deleteItem?.asset?.name}"? Esta acción eliminará el registro.`}
        confirmText="Sí, eliminar"
        color="danger"
      />

      {/* Confirmación Eliminar Asignación Suministro */}
      <ConfirmDialog
        isOpen={!!deleteSupplyItem}
        onOpenChange={(open) => { if (!open) setDeleteSupplyItem(null); }}
        onConfirm={handleConfirmDeleteSupply}
        title="Eliminar Asignación de Suministro"
        message={`¿Está seguro de eliminar la asignación del suministro "${deleteSupplyItem?.supply?.name}"? Esta acción eliminará el registro.`}
        confirmText="Sí, eliminar"
        color="danger"
      />

      {/* Modal Reporte Word */}
      {isWordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-5 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Exportar Reporte de Inventario</h3>
              <button
                onClick={() => setIsWordModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <HiXMark className="text-xl" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold">Tamaño de Hoja</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'carta', label: 'Carta', sub: '8.5" x 11"' },
                    { id: 'a4', label: 'A4', sub: '210 x 297 mm' },
                    { id: 'oficio', label: 'Oficio', sub: '8.5" x 14"' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPageSize(item.id as any)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                        pageSize === item.id
                          ? 'border-blue-900 bg-blue-50/70 text-blue-950 font-bold shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-600 font-medium'
                      }`}
                    >
                      <span className="capitalize">{item.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{item.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsWordModalOpen(false)}
                disabled={isDownloadingWord}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDownloadWordReport}
                disabled={isDownloadingWord}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDownloadingWord ? (
                  <span>Generando Word...</span>
                ) : (
                  <>
                    <HiOutlineArrowDownTray className="text-base" />
                    <span>Descargar Reporte (.docx)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectShowPage;
