export interface AssetAssignment {
  id: string;
  assetId: string;
  responsibleName: string;
  position?: string | null;
  assignedAt: string;
  returnedAt?: string | null;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
  asset?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface AssignCustodianDTO {
  assetId: string;
  responsibleName: string;
  position?: string;
  observations?: string;
}

export interface ReturnCustodianDTO {
  assetId: string;
  observations?: string;
}
