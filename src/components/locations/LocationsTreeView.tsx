import React, { useState } from 'react';
import type { LocationNode } from '../../interfaces/location.interface';
import {
  HiChevronRight,
  HiChevronDown,
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiPlus,
  HiPencilSquare,
  HiTrash,
} from 'react-icons/hi2';

interface LocationsTreeViewProps {
  nodes: LocationNode[];
  onAddSubLocation: (parentNode: LocationNode) => void;
  onEditLocation: (node: LocationNode) => void;
  onDeleteLocation: (node: LocationNode) => void;
  level?: number;
}

const TreeNodeItem: React.FC<{
  node: LocationNode;
  onAddSubLocation: (parentNode: LocationNode) => void;
  onEditLocation: (node: LocationNode) => void;
  onDeleteLocation: (node: LocationNode) => void;
  level: number;
}> = ({ node, onAddSubLocation, onEditLocation, onDeleteLocation, level }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasChildren = node.children && node.children.length > 0;
  const assetCount = node.totalAssets ?? node._count?.assets ?? 0;

  return (
    <div className="select-none">
      <div
        className={`flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-100/80 transition-colors group ${
          level === 0 ? 'bg-slate-50/70 font-semibold' : ''
        }`}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Botón Expander */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0"
            >
              {isExpanded ? (
                <HiChevronDown className="text-sm" />
              ) : (
                <HiChevronRight className="text-sm" />
              )}
            </button>
          ) : (
            <span className="w-5 shrink-0" />
          )}

          {/* Icono de Tipo de Ubicación */}
          {level === 0 ? (
            <HiOutlineBuildingOffice2 className="text-amber-500 text-base shrink-0" />
          ) : (
            <HiOutlineMapPin className="text-blue-500 text-sm shrink-0" />
          )}

          {/* Nombre y Descripción */}
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-800 truncate">{node.name}</span>
            {node.description && (
              <span className="text-[10px] text-slate-400 truncate">{node.description}</span>
            )}
          </div>

          {/* Insignia de Activos */}
          {assetCount > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50 shrink-0">
              {assetCount} activos
            </span>
          )}
        </div>

        {/* Acciones por Nodo */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            onClick={() => onAddSubLocation(node)}
            title="Agregar sub-ubicación"
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors text-xs font-bold flex items-center gap-1"
          >
            <HiPlus />
            <span className="hidden sm:inline text-[10px]">Sub-área</span>
          </button>

          <button
            type="button"
            onClick={() => onEditLocation(node)}
            title="Editar ubicación"
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <HiPencilSquare className="text-sm" />
          </button>

          <button
            type="button"
            onClick={() => onDeleteLocation(node)}
            title="Eliminar ubicación"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <HiTrash className="text-sm" />
          </button>
        </div>
      </div>

      {/* Renderizado Recursivo de Hijos */}
      {hasChildren && isExpanded && (
        <div className="border-l-2 border-slate-100 ml-4 space-y-0.5 my-0.5">
          {node.children!.map((childNode) => (
            <TreeNodeItem
              key={childNode.id}
              node={childNode}
              onAddSubLocation={onAddSubLocation}
              onEditLocation={onEditLocation}
              onDeleteLocation={onDeleteLocation}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const LocationsTreeView: React.FC<LocationsTreeViewProps> = ({
  nodes,
  onAddSubLocation,
  onEditLocation,
  onDeleteLocation,
  level = 0,
}) => {
  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <TreeNodeItem
          key={node.id}
          node={node}
          onAddSubLocation={onAddSubLocation}
          onEditLocation={onEditLocation}
          onDeleteLocation={onDeleteLocation}
          level={level}
        />
      ))}
    </div>
  );
};
