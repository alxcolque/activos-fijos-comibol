import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.instance';
import { PageTitle } from '../components/PageTitle';
import { StatCard } from '../components/StatCard';
import { SectionCard } from '../components/SectionCard';
//import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  HiOutlineBriefcase,
  HiOutlineCurrencyDollar,
  HiOutlineCheckCircle,
  HiOutlineWrenchScrewdriver,
  HiOutlineCube,
  HiOutlineBuildingOffice2,
  HiOutlineArrowRight,
  HiOutlineArrowPathRoundedSquare,
  HiOutlinePlus,
  HiOutlineFolderOpen,
} from 'react-icons/hi2';
import { formatCurrency, formatCompactCurrency } from '../utils/currency';
import type { Project } from '../interfaces/project.interface';

interface DashboardSummaryData {
  totalAssets: number;
  totalValue: number;
  operationalAssets: number;
  maintenanceAssets: number;
  inactiveAssets: number;
  totalProjects: number;
  activeProjects: number;
  totalAssignedQuantity: number;
  totalAvailableQuantity: number;
}

interface CategoryStatItem {
  category: string;
  quantity: number;
  value: number;
}

interface RecentAssetItem {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  purchaseValue?: number;
  location?: { name: string };
  status?: { name: string };
}

interface RecentActivityItem {
  action: string;
  description: string;
  date: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [byCategory, setByCategory] = useState<CategoryStatItem[]>([]);
  const [recentAssets, setRecentAssets] = useState<RecentAssetItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [dashRes, projRes] = await Promise.all([
        api.get('/dashboard').catch(() => null),
        api.get('/projects?limit=5&status=ACTIVE').catch(() => null),
      ]);

      if (dashRes?.data?.data) {
        const d = dashRes.data.data;
        setSummary(d.summary || null);
        setByCategory(d.byCategory || []);
        setRecentAssets(d.recentAssets || []);
        setRecentActivities(d.recentActivities || []);
      }

      if (projRes?.data?.data) {
        setActiveProjects(projRes.data.data || []);
      }
    } catch (err) {
      console.error('Error al cargar datos del Dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalAssetsCount = summary?.totalAssets || 0;
  const totalValueNum = summary?.totalValue || 0;
  const operationalCount = summary?.operationalAssets || 0;
  const maintenanceCount = summary?.maintenanceAssets || 0;
  const totalAssignedQty = summary?.totalAssignedQuantity || 0;
  const totalAvailableQty = summary?.totalAvailableQuantity || 0;
  const activeProjectsCount = summary?.activeProjects || activeProjects.length;

  const formattedTotalValue = formatCurrency(totalValueNum);

  const maxValueCategory = Math.max(...byCategory.map((c) => c.value), 1);

  return (
    <div className="space-y-6 pb-12">
      <PageTitle
        title="Dashboard de Control Patrimonial"
        subtitle="Monitoreo en tiempo real de inventarios, valoración patrimonial y proyectos mineros de COMIBOL"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-2xs transition-all"
              onClick={loadDashboard}
              title="Refrescar métricas"
            >
              <HiOutlineArrowPathRoundedSquare className="text-base text-amber-500" />
              <span>Refrescar</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 rounded-xl font-extrabold text-xs shadow-xs transition-all shrink-0"
              onClick={() => navigate('/proyectos')}
            >
              <HiOutlineBuildingOffice2 className="text-base" />
              <span>Proyectos Mineros</span>
            </button>
          </div>
        }
      />

      {isLoading ? (
        <div className="py-20">
          <LoadingSpinner label="Cargando métricas del Dashboard..." />
        </div>
      ) : (
        <>
          {/* Tarjetas Principales de Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Fichas Activos"
              value={totalAssetsCount}
              icon={HiOutlineBriefcase}
              iconColorClass="text-amber-600 bg-amber-50 border border-amber-100"
              description="Fichas registradas en catálogo"
            />
            <StatCard
              title="Valoración Patrimonial"
              value={formatCompactCurrency(totalValueNum)}
              icon={HiOutlineCurrencyDollar}
              iconColorClass="text-emerald-600 bg-emerald-50 border border-emerald-100"
              description={`${formattedTotalValue} en inventario`}
            />
            <StatCard
              title="Asignados a Proyectos"
              value={`${totalAssignedQty} u.`}
              icon={HiOutlineCube}
              iconColorClass="text-blue-600 bg-blue-50 border border-blue-100"
              description="Desplegados en operaciones mineras"
            />
            <StatCard
              title="Stock en Almacén"
              value={`${totalAvailableQty} u.`}
              icon={HiOutlineCheckCircle}
              iconColorClass="text-teal-600 bg-teal-50 border border-teal-100"
              description="Unidades disponibles para asignar"
            />
            <StatCard
              title="Proyectos Activos"
              value={activeProjectsCount}
              icon={HiOutlineBuildingOffice2}
              iconColorClass="text-indigo-600 bg-indigo-50 border border-indigo-100"
              description="Centros mineros en ejecución"
            />
          </div>

          {/* Sección Proyectos Mineros Destacados y Gráfico por Categoría */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Proyectos Mineros e Institucionales */}
            <SectionCard
              title="Proyectos Mineros e Institucionales"
              subtitle="Operaciones mineras activas con asignación de activos"
              className="lg:col-span-2"
              action={
                <button
                  type="button"
                  onClick={() => navigate('/proyectos')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  <span>Ver todos los proyectos</span>
                  <HiOutlineArrowRight />
                </button>
              }
            >
              <div className="space-y-3 py-1">
                {activeProjects.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-2">
                    <HiOutlineFolderOpen className="text-3xl text-slate-300 mx-auto" />
                    <p>No existen proyectos activos registrados actualmente.</p>
                    <button
                      onClick={() => navigate('/proyectos')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 rounded-lg text-xs font-bold hover:bg-amber-100 transition-all border border-amber-200"
                    >
                      <HiOutlinePlus className="text-sm" />
                      <span>Crear nuevo proyecto</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeProjects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => navigate(`/proyectos/${p.id}`)}
                        className="p-4 bg-slate-50/70 hover:bg-amber-50/60 border border-slate-200/80 hover:border-amber-300 rounded-2xl cursor-pointer transition-all space-y-2.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-extrabold text-blue-950 group-hover:text-amber-900 transition-colors truncate max-w-[70%]">
                            {p.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {p.status || 'ACTIVO'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <span>Responsable: <strong className="text-slate-700">{p.responsible || 'S/N'}</strong></span>
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-white px-2 py-0.5 rounded-lg border border-amber-200/60 shadow-2xs">
                            <HiOutlineCube className="text-amber-500" />
                            {p.totalAssets || 0} asignados
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Actividad Reciente */}
            <SectionCard
              title="Actividad Reciente"
              subtitle="Últimos eventos registrados en el sistema"
            >
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                {recentActivities.map((act, idx) => (
                  <div key={idx} className="flex gap-3 text-xs leading-relaxed pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="font-semibold text-slate-700">
                        {act.description || `${act.action} en inventario`}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400">
                        {act.date ? new Date(act.date).toLocaleDateString('es-BO', { timeZone: 'UTC' }) : 'Reciente'}
                      </span>
                    </div>
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <p className="text-xs text-slate-400 font-medium text-center py-8">
                    No hay actividades registradas recientemente.
                  </p>
                )}
              </div>
            </SectionCard>
          </div>

          {/* Gráfico de Distribución del Valor por Categoría & Mantenimiento */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SectionCard
              title="Valoración Patrimonial por Categoría"
              subtitle="Distribución financiera según tipos de activos fijos"
              className="lg:col-span-2"
            >
              <div className="space-y-4 py-2">
                {byCategory.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium text-center py-6">
                    No se han registrado categorías con valor asignado.
                  </p>
                ) : (
                  byCategory.map((cat, index) => {
                    const percentage = Math.round((cat.value / maxValueCategory) * 100);
                    const formattedVal = formatCurrency(cat.value);

                    return (
                      <div key={index} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                          <span className="truncate max-w-[70%] font-bold text-blue-950">{cat.category}</span>
                          <span className="font-extrabold text-slate-900">
                            {formattedVal} <span className="text-[10px] font-semibold text-slate-400">({cat.quantity} u.)</span>
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.max(percentage, 3)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </SectionCard>

            {/* Resumen de Mantenimiento y Estado de Conservación */}
            <SectionCard
              title="Estado de Conservación"
              subtitle="Salud técnica de los activos fijos"
            >
              <div className="space-y-4 py-2">
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                      <HiOutlineCheckCircle className="text-lg" />
                    </div>
                    <div>
                      <h5 className="text-xs font-extrabold text-emerald-950">Operativos</h5>
                      <p className="text-[11px] text-emerald-700 font-medium">Listos para trabajo continuo</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-emerald-950">{operationalCount}</span>
                </div>

                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-100 text-rose-800 rounded-xl">
                      <HiOutlineWrenchScrewdriver className="text-lg" />
                    </div>
                    <div>
                      <h5 className="text-xs font-extrabold text-rose-950">En Mantenimiento</h5>
                      <p className="text-[11px] text-rose-700 font-medium">Requieren intervención técnica</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-rose-950">{maintenanceCount}</span>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ÚLTIMOS ACTIVOS REGISTRADOS */}
          <SectionCard
            title="Últimos Activos Fijos Registrados"
            subtitle="Fichas de activos añadidas recientemente al catálogo oficial"
            action={
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                onClick={() => navigate('/activos')}
              >
                <span>Ver catálogo completo</span>
                <HiOutlineArrowRight />
              </button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Nombre del Activo</th>
                    <th className="py-3 px-4 text-center">Registrado El</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {recentAssets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      onClick={() => navigate(`/activos/${asset.id}`)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-700">{asset.code}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{asset.name}</td>
                      <td className="py-3.5 px-4 text-center text-slate-500 font-medium">
                        {asset.createdAt
                          ? new Date(asset.createdAt).toLocaleDateString('es-BO', { timeZone: 'UTC' })
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/activos/${asset.id}`);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
                        >
                          Ver Ficha
                        </button>
                      </td>
                    </tr>
                  ))}
                  {recentAssets.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400 font-semibold text-xs">
                        No hay activos fijos registrados en la base de datos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
};

export default Dashboard;
