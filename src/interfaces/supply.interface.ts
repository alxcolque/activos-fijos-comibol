export interface SupplyItem {
  id: string;
  name: string;
  unit: string;
  inputQuantity: number;
  outputQuantity: number;
  entryDate?: string | null;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplyDTO {
  name: string;
  unit?: string;
  inputQuantity?: number;
  outputQuantity?: number;
  entryDate?: string | null;
  observations?: string | null;
}

export interface UpdateSupplyDTO {
  name?: string;
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
}
