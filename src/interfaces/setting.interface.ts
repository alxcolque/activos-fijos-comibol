export interface CompanySettings {
  companyName: string;
  nit: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  assetPrefix: string;
}

export interface UpdateSettingsDTO extends Partial<CompanySettings> {}
