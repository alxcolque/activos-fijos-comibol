export interface SupplyItem {
  id: string;
  name: string;
  categoryId?: string | null;
  locationId?: string | null;
  unit: string;
  inputQuantity: number;
  outputQuantity: number;
  entryDate?: string | null;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string } | null;
  location?: { id: string; name: string } | null;
}

export interface CreateSupplyDTO {
  name: string;
  categoryId?: string | null;
  locationId?: string | null;
  unit?: string;
  inputQuantity?: number;
  outputQuantity?: number;
  entryDate?: string | null;
  observations?: string | null;
}

export interface UpdateSupplyDTO {
  name?: string;
  categoryId?: string | null;
  locationId?: string | null;
  unit?: string;
  inputQuantity?: number;
  outputQuantity?: number;
  entryDate?: string | null;
  observations?: string | null;
}

export interface SupplyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  locationId?: string;
}

export interface SupplyProjectItem {
  id: string;
  supplyId: string;
  projectId: string;
  quantity: number;
  outputQuantity: number;
  assignedAt: string;
  releasedAt?: string | null;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
  supply?: {
    id: string;
    name: string;
    unit: string;
    categoryId?: string | null;
    locationId?: string | null;
    category?: { id: string; name: string } | null;
    location?: { id: string; name: string } | null;
  } | null;
  project?: {
    id: string;
    name: string;
  } | null;
}
