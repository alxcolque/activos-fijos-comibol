export interface AssetCategory {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assets: number;
  };
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}
