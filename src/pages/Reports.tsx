import React, { useState, useEffect } from 'react';
import { getReports } from '../services/api';
import { useAssetStore } from '../store/assetStore';
import { PageTitle } from '../components/PageTitle';
import { SectionCard } from '../components/SectionCard';
import { StatCard } from '../components/StatCard';
import { HiOutlineDocumentText, HiOutlineArrowDownTray, HiOutlineChartPie, HiOutlineSparkles } from 'react-icons/hi2';
import type { ReportItem } from '../interfaces';

export const Reports: React.FC = () => {
  const { assets, categories, locations } = useAssetStore();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para generador de reportes
  const [genCategory, setGenCategory] = useState('');
  const [genLocation, setGenLocation] = useState('');
  const [genType, setGenType] = useState<'PDF' | 'Excel'>('PDF');
  const [generating, setGenerating] = useState(false);

  // Estado para simular descarga
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await getReports();
        setReports(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  const handleDownload = (id: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      alert(`Reporte descargado exitosamente.`);
    }, 1500);
  };

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    setTimeout(() => {
      const catName = genCategory 
        ? categories.find(c => c.id === genCategory)?.name 
        : 'Todos';
      const locName = genLocation 
        ? locations.find(l => l.id === genLocation)?.name 
        : 'Todas';
      
      const newReport: ReportItem = {
        id: `rep-${Date.now()}`,
        title: `Reporte de Activos - Cat: ${catName} / Loc: ${locName}`,
        type: genType,
        size: `${(Math.random() * 2 + 0.1).toFixed(1)} MB`,
        date: new Date().toISOString().split('T')[0]
      };

      setReports(prev => [newReport, ...prev]);
      setGenerating(false);
      alert('Reporte generado e incorporado a la lista.');
    }, 2000);
  };

  const totalAssetsValue = assets.reduce((sum, a) => sum + a.value, 0);
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(totalAssetsValue);

  return (
    <div className="space-y-6">
      <PageTitle 
        title="Reportes de Activos Fijos" 
        subtitle="Generación y exportación de inventarios valorados e informes institucionales"
      />

      {/* KPI de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Valor Total Inventariado"
          value={formattedValue}
          icon={HiOutlineChartPie}
          iconColorClass="text-amber-600 bg-amber-50 border border-amber-100"
          description="Base imponible depreciable"
        />
        <StatCard
          title="Reportes Disponibles"
          value={reports.length}
          icon={HiOutlineDocumentText}
          iconColorClass="text-blue-600 bg-blue-50 border border-blue-100"
          description="Archivos listos para exportar"
        />
        <StatCard
          title="Formato Predilecto"
          value="PDF / Excel"
          icon={HiOutlineSparkles}
          iconColorClass="text-emerald-600 bg-emerald-50 border border-emerald-100"
          description="Exportación estándar oficial"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generador Personalizado */}
        <div className="lg:col-span-1">
          <SectionCard 
            title="Generador de Reportes" 
            subtitle="Configure filtros para compilar un nuevo reporte"
          >
            <form onSubmit={handleGenerateReport} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Categoría de Activos</label>
                <select
                  value={genCategory}
                  onChange={(e) => setGenCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm bg-white cursor-pointer transition-colors h-9"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Ubicación Geográfica</label>
                <select
                  value={genLocation}
                  onChange={(e) => setGenLocation(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm bg-white cursor-pointer transition-colors h-9"
                >
                  <option value="">Todas las ubicaciones</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Formato de Archivo</label>
                <select
                  value={genType}
                  onChange={(e) => setGenType(e.target.value as 'PDF' | 'Excel')}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm bg-white cursor-pointer transition-colors h-9"
                >
                  <option value="PDF">Documento PDF (.pdf)</option>
                  <option value="Excel">Hoja de Cálculo Excel (.xlsx)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full font-bold text-white text-sm py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl shadow-md shadow-amber-500/25 mt-4 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Compilando datos...
                  </>
                ) : (
                  'Generar Reporte'
                )}
              </button>
            </form>
          </SectionCard>
        </div>

        {/* Lista de Reportes Generados */}
        <div className="lg:col-span-2">
          <SectionCard 
            title="Reportes del Sistema" 
            subtitle="Historial de reportes listos para su descarga"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold text-slate-500">Cargando reportes...</span>
              </div>
            ) : (
              <div className="w-full overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-3 text-slate-500 text-xs font-bold uppercase tracking-wider">Reporte</th>
                      <th className="px-4 py-3 text-slate-500 text-xs font-bold uppercase tracking-wider">Formato</th>
                      <th className="px-4 py-3 text-slate-500 text-xs font-bold uppercase tracking-wider">Tamaño</th>
                      <th className="px-4 py-3 text-slate-500 text-xs font-bold uppercase tracking-wider">Fecha</th>
                      <th className="px-4 py-3 text-slate-500 text-xs font-bold uppercase tracking-wider text-right">Descargar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((rep) => (
                      <tr key={rep.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-600 text-lg">📄</span>
                            <span className="font-bold text-slate-800 text-sm line-clamp-1">{rep.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rep.type === 'PDF' 
                              ? 'bg-rose-50 text-rose-700' 
                              : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {rep.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-middle text-xs font-semibold text-slate-500">{rep.size}</td>
                        <td className="px-4 py-3 align-middle text-xs font-semibold text-slate-400">{rep.date}</td>
                        <td className="px-4 py-3 align-middle text-right">
                          <button
                            type="button"
                            disabled={downloadingId === rep.id}
                            onClick={() => handleDownload(rep.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-amber-600 transition-colors shrink-0"
                          >
                            {downloadingId === rep.id ? (
                              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <HiOutlineArrowDownTray className="text-base" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Reports;
