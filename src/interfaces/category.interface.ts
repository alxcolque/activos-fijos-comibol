export interface AssetCategory {
  id: string;
  name: string;
  description?: string | null;
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
  usefulLife?: number;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}
