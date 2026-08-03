export interface LocationNode {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  children?: LocationNode[];
}

export interface CreateLocationDTO {
  name: string;
  description?: string | null;
  parentId?: string | null;
}

export interface UpdateLocationDTO extends Partial<CreateLocationDTO> {}
