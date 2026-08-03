export interface LocationNode {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  children?: LocationNode[];
  _count?: {
    assets: number;
    children?: number;
  };
  totalAssets?: number;
  totalChildren?: number;
}

export interface CreateLocationDTO {
  name: string;
  description?: string;
  parentId?: string | null;
}

export interface UpdateLocationDTO extends Partial<CreateLocationDTO> {}
