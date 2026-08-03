export interface AssetStatus {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assets: number;
  };
}

export interface CreateStatusDTO {
  name: string;
  description?: string;
}

export interface UpdateStatusDTO extends Partial<CreateStatusDTO> {}
