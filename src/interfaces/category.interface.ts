export type CategoryType = 'ASSET' | 'SUPPLY';

export interface AssetCategory {
  id: string;
  name: string;
  description?: string | null;
  type?: CategoryType;
  usefulLife?: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assets: number;
  };
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  type?: CategoryType;
  usefulLife?: number;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}
