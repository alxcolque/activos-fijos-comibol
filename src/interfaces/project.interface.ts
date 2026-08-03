export type ProjectStatus = 'ACTIVE' | 'FINISHED' | 'SUSPENDED' | 'CANCELLED';

export interface Project {
  id: string;
  name: string;
  address?: string | null;
  responsible?: string | null;
  status: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  totalAssets?: number;
  _count?: {
    assetProjects: number;
  };
}

export interface CreateProjectDTO {
  name: string;
  address?: string | null;
  responsible?: string | null;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
}

export interface UpdateProjectDTO extends Partial<CreateProjectDTO> {}

export interface ProjectFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
}
