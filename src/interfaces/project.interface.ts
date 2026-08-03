export type ProjectType = 'EXPLORATION' | 'EXPLOITATION' | 'ADMINISTRATIVE' | 'OTHER';
export type ProjectStatus = 'ACTIVE' | 'FINISHED' | 'SUSPENDED' | 'CANCELLED';

export interface Project {
  id: string;
  code: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  _count?: {
    assetProjects: number;
  };
}

export interface CreateProjectDTO {
  code: string;
  name: string;
  type?: ProjectType;
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
  type?: ProjectType;
}
