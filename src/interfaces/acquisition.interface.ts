export interface AcquisitionDetailItem {
  id: string;
  acquisitionId: string;
  supplyId?: string | null;
  assetId?: string | null;
  unit?: string | null;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
  supply?: {
    id: string;
    name: string;
    unit: string;
  } | null;
  asset?: {
    id: string;
    code: string;
    name: string;
  } | null;
}

export interface AcquisitionItem {
  id: string;
  userId: string;
  projectId?: string | null;
  checkoutUserId?: string | null;
  departureDate?: string | null;
  type?: 'SUPPLY' | 'ASSET' | string;
  createdAt: string;
  updatedAt: string;

  user?: {
    id: string;
    fullName: string;
    email: string;
    profession?: string | null;
  } | null;

  project?: {
    id: string;
    name: string;
  } | null;

  checkoutUser?: {
    id: string;
    fullName: string;
    email: string;
    profession?: string | null;
  } | null;

  details?: AcquisitionDetailItem[];
}

export interface CreateAcquisitionDTO {
  userId: string;
  projectId?: string | null;
  checkoutUserId?: string | null;
  departureDate?: string | null;
  type?: 'SUPPLY' | 'ASSET' | string;
  details?: {
    supplyId?: string | null;
    assetId?: string | null;
    unit?: string | null;
    quantity?: number;
  }[];
}

export interface UpdateAcquisitionDTO extends Partial<CreateAcquisitionDTO> {}
