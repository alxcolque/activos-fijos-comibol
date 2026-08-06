import React, { useEffect } from 'react';
import { useAssetStore } from '../store/assetStore';
import { useDashboardStore } from '../store/dashboardStore';
import { PageTitle } from '../components/PageTitle';
import { StatCard } from '../components/StatCard';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { 
  HiOutlineBriefcase, 
  HiOutlineCurrencyDollar, 
  HiOutlineCheckCircle, 
  HiOutlineWrenchScrewdriver 
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { assets, categories, fetchInitialData } = useAssetStore();
  const { recentActivities, fetchDashboardData } = useDashboardStore();

  useEffect(() => {
    fetchInitialData();
    fetchDashboardData();
  }, []);

  const totalAssets = assets.length;
  
  const totalValue = assets.reduce((sum, asset) => sum + (asset.purchaseValue || 0), 0);
  
  const operationalCount = assets.filter(a => a.status?.name?.toLowerCase().includes('operativo')).length;
  const maintenanceCount = assets.filter(a => a.status?.name?.toLowerCase().includes('mantenimiento')).length;

  const formattedTotalValue = formatCurrency(totalValue);

  const categoryChartData = categories.map(cat => {
    const catAssets = assets.filter(a => a.categoryId === cat.id);
    const valueSum = catAssets.reduce((sum, a) => sum + (a.purchaseValue || 0), 0);
    return {
      name: cat.name,
      count: catAssets.length,
      value: valueSum
    };
  }).sort((a, b) => b.value - a.value);

  const maxValue = Math.max(...categoryChartData.map(c => c.value), 1);

  const recentAssets = assets.slice(0, 4);

  return (
    <div className="space-y-6">
      <PageTitle 
        title="Dashboard" 
        subtitle="Resumen de control y distribución de activos fijos de COMIBOL"
        action={
          <button 
            type="button"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 rounded-xl font-bold text-xs shadow-xs transition-all shrink-0"
            onClick={() => navigate('/assets/new')}
          >
            Nuevo Activo
          </button>
        }
      />

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Activos"
          value={totalAssets}
          icon={HiOutlineBriefcase}
          iconColorClass="text-amber-600 bg-amber-50 border border-amber-100"
          description="Activos registrados en total"
        />
        <StatCard
          title="Valoración Total"
          value={formattedTotalValue}
          icon={HiOutlineCurrencyDollar}
          iconColorClass="text-emerald-600 bg-emerald-50 border border-emerald-100"
          description="Inversión patrimonial"
        />
        <StatCard
          title="Operativos"
          value={operationalCount}
          icon={HiOutlineCheckCircle}
          iconColorClass="text-blue-600 bg-blue-50 border border-blue-100"
          description={`${totalAssets ? Math.round((operationalCount / totalAssets) * 100) : 0}% de los activos`}
        />
        <StatCard
          title="En Mantenimiento"
          value={maintenanceCount}
          icon={HiOutlineWrenchScrewdriver}
          iconColorClass="text-rose-600 bg-rose-50 border border-rose-100"
          description="Requieren atención técnica"
        />
      </div>

      {/* Sección Gráfica y Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Distribución de Valor por Categoría */}
        <SectionCard 
          title="Valor por Categoría" 
          subtitle="Distribución financiera según tipos de activos"
          className="lg:col-span-2"
        >
          <div className="space-y-5 py-2">
            {categoryChartData.map((data, index) => {
              const percentage = (data.value / maxValue) * 100;
              const formattedVal = formatCurrency(data.value);

              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="truncate max-w-[70%]">{data.name}</span>
                    <span className="font-bold text-slate-900">{formattedVal} <span className="text-[10px] text-slate-400">({data.count} u.)</span></span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Actividad Reciente */}
        <SectionCard 
          title="Actividad Reciente" 
          subtitle="Últimos movimientos del sistema"
        >
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {recentActivities.map((act) => {
              return (
                <div key={act.id} className="flex gap-3 text-xs leading-relaxed pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="font-semibold text-slate-700">
                      <span className="font-bold text-slate-800">{act.user}</span> {act.action.toLowerCase()}: <span className="text-slate-600 font-medium italic">{act.target}</span>
                    </p>
                    <span className="text-[10px] font-semibold text-slate-400">{act.time}</span>
                  </div>
                </div>
              );
            })}
            {recentActivities.length === 0 && (
              <p className="text-xs text-slate-400 font-medium text-center py-6">No hay actividades recientes.</p>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Últimos Activos Registrados */}
      <SectionCard 
        title="Últimos Activos Registrados" 
        subtitle="Fichas de activos añadidas recientemente al sistema"
        action={
          <button 
            type="button"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors shrink-0"
            onClick={() => navigate('/assets')}
          >
            Ver todos los activos
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-2.5">Código</th>
                <th className="py-2.5">Nombre</th>
                <th className="py-2.5">Ubicación</th>
                <th className="py-2.5">Estado</th>
                <th className="py-2.5 text-right">Valor (Bs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentAssets.map((asset) => {
                const formattedVal = formatCurrency(asset.purchaseValue || 0);

                return (
                  <tr 
                    key={asset.id} 
                    className="hover:bg-slate-50/60 cursor-pointer transition-colors"
                    onClick={() => navigate(`/assets/${asset.id}`)}
                  >
                    <td className="py-3 font-mono font-bold text-amber-600">{asset.code}</td>
                    <td className="py-3 font-bold text-slate-800">{asset.name}</td>
                    <td className="py-3 font-medium text-slate-500">{asset.location?.name || 'Sin Ubicación'}</td>
                    <td className="py-3"><StatusBadge status={asset.status?.name || 'Operativo'} /></td>
                    <td className="py-3 font-bold text-slate-800 text-right">{formattedVal}</td>
                  </tr>
                );
              })}
              {recentAssets.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400 font-semibold text-xs">No hay activos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default Dashboard;
