export interface AssetCategoryRef {
  id: string;
  name: string;
  usefulLife?: number;
}

export interface AssetStatusRef {
  id: string;
  name: string;
}

export interface LocationRef {
  id: string;
  name: string;
}

export interface AssetModel {
  id: string;
  code: string;
  qrCode?: string | null;
  name: string;
  description?: string | null;
  categoryId: string;
  statusId: string;
  locationId: string;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  unit?: string | null;
  quantity: number;
  purchaseDate?: string | null;
  purchaseYear?: number | null;
  purchaseValue?: number | null;
  residualValue?: number | null;
  currentValue?: number | null;
  observations?: string | null;
  photo?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: AssetCategoryRef;
  status?: AssetStatusRef;
  location?: LocationRef;
}

export interface CreateAssetDTO {
  code: string;
  name: string;
  categoryId: string;
  statusId: string;
  locationId: string;
  description?: string | null;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  unit?: string;
  quantity?: number;
  purchaseDate?: string | null;
  purchaseValue?: number | null;
  residualValue?: number | null;
  observations?: string | null;
  photo?: string | null;
}

export interface UpdateAssetDTO extends Partial<CreateAssetDTO> {}

export interface AssetQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  statusId?: string;
  locationId?: string;
}
