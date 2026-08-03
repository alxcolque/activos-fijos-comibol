export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE';

export interface AssetMaintenance {
  id: string;
  assetId: string;
  type: MaintenanceType;
  maintenanceDate: string;
  provider?: string | null;
  cost?: number | null;
  nextMaintenance?: string | null;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
  asset?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface CreateMaintenanceDTO {
  assetId: string;
  type: MaintenanceType;
  maintenanceDate: string;
  provider?: string;
  cost?: number;
  nextMaintenance?: string;
  observations?: string;
}

export interface UpdateMaintenanceDTO extends Partial<CreateMaintenanceDTO> {}
