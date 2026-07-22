import React, { useState, useMemo } from 'react';
import { useAssetStore } from '../store/assetStore';
import { useDashboardStore } from '../store/dashboardStore';
import { PageTitle } from '../components/PageTitle';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { QRBadge } from '../components/QRBadge';
import { AssetCard } from '../components/AssetCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';

import { 
  HiOutlineMagnifyingGlass,
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineSquares2X2,
  HiOutlineListBullet,
  HiOutlineArrowPath
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import type { Asset } from '../interfaces';

export const AssetsList: React.FC = () => {
  const navigate = useNavigate();
  const { assets, categories, locations, custodians, deleteAsset } = useAssetStore();
  const { addActivity } = useDashboardStore();

  // Estados de filtros
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCustodian, setSelectedCustodian] = useState<string>('');
  
  // Vista: tabla o tarjetas
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Diálogo de eliminación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedCustodian('');
  };

  // Filtrado de datos
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchSearch = 
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.code.toLowerCase().includes(search.toLowerCase()) ||
        asset.brand.toLowerCase().includes(search.toLowerCase()) ||
        asset.model.toLowerCase().includes(search.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(search.toLowerCase());

      const matchCategory = selectedCategory ? asset.categoryId === selectedCategory : true;
      const matchStatus = selectedStatus ? asset.status === selectedStatus : true;
      const matchCustodian = selectedCustodian ? asset.custodianId === selectedCustodian : true;

      return matchSearch && matchCategory && matchStatus && matchCustodian;
    });
  }, [assets, search, selectedCategory, selectedStatus, selectedCustodian]);

  // Manejar eliminación
  const handleDeleteRequest = (asset: Asset, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir navegación
    setAssetToDelete(asset);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (assetToDelete) {
      deleteAsset(assetToDelete.id);
      addActivity({
        user: "Ing. Carlos Mendoza",
        action: "Eliminó activo",
        target: `${assetToDelete.name} (${assetToDelete.code})`,
        type: 'danger'
      });
      setAssetToDelete(null);
    }
  };

  // Definición de columnas de la tabla
  const columns = [
    { key: 'code', label: 'Código' },
    { key: 'qr', label: 'Código QR' },
    { key: 'name', label: 'Nombre' },
    { key: 'category', label: 'Categoría' },
    { key: 'location', label: 'Ubicación' },
    { key: 'custodian', label: 'Responsable' },
    { key: 'status', label: 'Estado' },
    { key: 'value', label: 'Valor' },
    { key: 'actions', label: 'Acciones' },
  ];

  // Renderizador de celdas
  const renderCell = (item: Asset, columnKey: React.Key) => {
    switch (columnKey) {
      case 'code':
        return <span className="font-mono text-xs font-bold text-slate-500">{item.code}</span>;
      case 'qr':
        return <QRBadge value={item.code} size={50} />;
      case 'name':
        return (
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</span>
            <span className="text-[10px] text-slate-400 font-semibold">{item.brand} - {item.model}</span>
          </div>
        );
      case 'category':
        const cat = categories.find(c => c.id === item.categoryId);
        return <span className="text-xs font-semibold text-slate-600">{cat?.name || 'Sin Categoría'}</span>;
      case 'location':
        const loc = locations.find(l => l.id === item.locationId);
        return <span className="text-xs text-slate-500 font-medium">{loc?.name || 'Sin Ubicación'}</span>;
      case 'custodian':
        const custodian = custodians.find(c => c.id === item.custodianId);
        return <span className="text-xs text-slate-600 font-medium">{custodian?.name || 'Sin Asignar'}</span>;
      case 'status':
        return <StatusBadge status={item.status} />;
      case 'value':
        const formattedVal = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(item.value);
        return <span className="font-bold text-slate-800 text-sm">{formattedVal}</span>;
      case 'actions':
        return (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => navigate(`/assets/${item.id}`)}
              title="Ver Detalle"
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-amber-600 transition-colors shrink-0"
            >
              <HiOutlineEye className="text-lg" />
            </button>
            <button
              type="button"
              onClick={() => navigate(`/assets/${item.id}/edit`)}
              title="Editar Activo"
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors shrink-0"
            >
              <HiOutlinePencilSquare className="text-lg" />
            </button>
            <button
              type="button"
              onClick={(e) => handleDeleteRequest(item, e)}
              title="Eliminar Activo"
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-rose-600 transition-colors shrink-0"
            >
              <HiOutlineTrash className="text-lg" />
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle 
        title="Control de Activos Fijos" 
        subtitle="Catálogo institucional y registro de activos fijos de la corporación"
        action={
          <button 
            type="button"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all text-sm shrink-0"
            onClick={() => navigate('/assets/new')}
          >
            Nuevo Activo
          </button>
        }
      />

      {/* Contenedor de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Buscador */}
          <div className="lg:col-span-2 relative">
            <input
              type="text"
              placeholder="Buscar por código, nombre, marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm transition-colors h-9"
            />
            <HiOutlineMagnifyingGlass className="absolute left-3 top-2.5 text-slate-400 text-lg pointer-events-none" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Categoría */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm bg-white cursor-pointer transition-colors h-9"
          >
            <option value="">Todas las Categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Estado */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm bg-white cursor-pointer transition-colors h-9"
          >
            <option value="">Todos los Estados</option>
            <option value="Operativo">Operativo</option>
            <option value="En mantenimiento">En mantenimiento</option>
            <option value="En stock">En stock</option>
            <option value="De baja">De baja</option>
          </select>

          {/* Custodio */}
          <select
            value={selectedCustodian}
            onChange={(e) => setSelectedCustodian(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium text-sm bg-white cursor-pointer transition-colors h-9"
          >
            <option value="">Todos los Responsables</option>
            {custodians.map((cust) => (
              <option key={cust.id} value={cust.id}>{cust.name}</option>
            ))}
          </select>
        </div>

        {/* Acciones del filtro y cambio de Vista */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2">
            {(search || selectedCategory || selectedStatus || selectedCustodian) && (
              <button 
                type="button"
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
              >
                <HiOutlineArrowPath className="text-xs" />
                Limpiar Filtros
              </button>
            )}
            <span className="text-xs font-semibold text-slate-400">
              {filteredAssets.length} activo(s) encontrado(s)
            </span>
          </div>

          {/* Selector de tipo de Vista */}
          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button 
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-sm transition-all ${
                viewMode === 'table' 
                  ? 'bg-white text-slate-800 shadow-sm font-bold' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <HiOutlineListBullet className="text-base" />
            </button>
            <button 
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-sm transition-all ${
                viewMode === 'cards' 
                  ? 'bg-white text-slate-800 shadow-sm font-bold' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <HiOutlineSquares2X2 className="text-base" />
            </button>
          </div>
        </div>
      </div>

      {/* Renderizado de datos */}
      {filteredAssets.length === 0 ? (
        <EmptyState
          title="Sin activos encontrados"
          description="Intente modificar sus criterios de búsqueda o filtros para encontrar el activo que busca."
          actionText="Limpiar filtros"
          onAction={handleClearFilters}
        />
      ) : viewMode === 'table' ? (
        <DataTable
          columns={columns}
          items={filteredAssets}
          renderCell={renderCell}
          rowsPerPage={10}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAssets.map(asset => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}

      {/* Confirmación de eliminación */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Activo Fijo"
        message={`¿Está seguro de que desea eliminar el activo "${assetToDelete?.name}" (${assetToDelete?.code})? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default AssetsList;
