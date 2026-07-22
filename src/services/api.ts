import axios from 'axios';
import dbJson from '../data/db.json';
import type { Asset, Category, Location, Custodian, SystemSettings, ReportItem, DashboardStats, User } from '../interfaces';

// We try to use Axios to simulate a REST API fetching db.json,
// but we have a fallback to the statically imported JSON data in case Axios fails.
const getDbData = async () => {
  try {
    const response = await axios.get('/src/data/db.json');
    return response.data;
  } catch (error) {
    console.warn('Axios failed to load /src/data/db.json, falling back to static import', error);
    return dbJson;
  }
};

export const getDashboard = async (): Promise<{ stats: DashboardStats; user: User }> => {
  const db = await getDbData();
  
  // Calculate dynamic stats from current assets list in db.json
  const assets: Asset[] = db.assets;
  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum: number, asset: Asset) => sum + asset.value, 0);
  const operationalCount = assets.filter((a: Asset) => a.status === 'Operativo').length;
  const maintenanceCount = assets.filter((a: Asset) => a.status === 'En mantenimiento').length;

  return {
    stats: {
      totalAssets,
      totalValue,
      operationalCount,
      maintenanceCount,
      recentActivities: db.dashboard.recentActivities
    },
    user: db.user
  };
};

export const getAssets = async (): Promise<Asset[]> => {
  const db = await getDbData();
  return db.assets;
};

export const getAsset = async (id: string): Promise<Asset | undefined> => {
  const db = await getDbData();
  return db.assets.find((a: Asset) => a.id === id);
};

export const getCategories = async (): Promise<Category[]> => {
  const db = await getDbData();
  return db.categories;
};

export const getLocations = async (): Promise<Location[]> => {
  const db = await getDbData();
  return db.locations;
};

export const getCustodians = async (): Promise<Custodian[]> => {
  const db = await getDbData();
  return db.custodians;
};

export const getReports = async (): Promise<ReportItem[]> => {
  const db = await getDbData();
  return db.reports;
};

export const getSettings = async (): Promise<SystemSettings> => {
  const db = await getDbData();
  return db.settings;
};
