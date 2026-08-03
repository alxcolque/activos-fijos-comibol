export interface AssetsReportSummary {
  totalAssets: number;
  totalPurchaseValue: number;
  totalCurrentValue: number;
}

export interface DepreciationReportItem {
  id: string;
  code: string;
  name: string;
  category: string;
  purchaseYear: number | null;
  purchaseValue: number;
  usefulLife: number;
  elapsedYears: number;
  annualDepreciation: number;
  accumulatedDepreciation: number;
  netBookValue: number;
}

export interface DepreciationReportSummary {
  totalAssets: number;
  totalOriginalValue: number;
  totalAccumulatedDepreciation: number;
  totalNetBookValue: number;
}

export interface ReportQueryParams {
  category?: string;
  status?: string;
  location?: string;
  projectId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  year?: number;
  activeOnly?: boolean;
}
