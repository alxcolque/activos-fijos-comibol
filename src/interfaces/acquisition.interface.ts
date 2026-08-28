export interface AcquisitionDetailItem {
  id: string;
  acquisitionId: string;
  projectId?: string | null;
  unit?: string | null;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
  project?: {
    id: string;
    name: string;
  } | null;
}

export interface AcquisitionItem {
  id: string;
  userId: string;
  projectUserId?: string | null;
  checkoutUserId?: string | null;
  departureDate?: string | null;
  createdAt: string;
  updatedAt: string;

  user?: {
    id: string;
    fullName: string;
    email: string;
    profession?: string | null;
  } | null;

  projectUser?: {
    id: string;
    fullName: string;
    email: string;
    profession?: string | null;
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
  projectUserId?: string | null;
  checkoutUserId?: string | null;
  departureDate?: string | null;
  details?: {
    projectId?: string | null;
    unit?: string | null;
    quantity?: number;
  }[];
}

export interface UpdateAcquisitionDTO extends Partial<CreateAcquisitionDTO> {}
