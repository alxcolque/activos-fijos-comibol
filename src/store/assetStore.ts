import { create } from 'zustand';
import type { Asset, Category, Location, Custodian } from '../interfaces';
import { getAssets, getCategories, getLocations, getCustodians } from '../services/api';

interface AssetState {
  assets: Asset[];
  categories: Category[];
  locations: Location[];
  custodians: Custodian[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  fetchInitialData: () => Promise<void>;
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
}

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],
  categories: [],
  locations: [],
  custodians: [],
  loading: false,
  error: null,
  initialized: false,

  fetchInitialData: async () => {
    // Only load if not already initialized to prevent overwriting in-memory changes
    if (get().initialized) return;

    set({ loading: true, error: null });
    try {
      const [assets, categories, locations, custodians] = await Promise.all([
        getAssets(),
        getCategories(),
        getLocations(),
        getCustodians(),
      ]);
      set({
        assets,
        categories,
        locations,
        custodians,
        loading: false,
        initialized: true,
      });
    } catch (err: any) {
      set({ error: err.message || 'Error al cargar datos de activos', loading: false });
    }
  },

  addAsset: (newAssetData) => {
    const id = `act-${Date.now()}`;
    const newAsset: Asset = {
      ...newAssetData,
      id,
    };
    set((state) => ({
      assets: [newAsset, ...state.assets],
    }));
  },

  updateAsset: (updatedAsset) => {
    set((state) => ({
      assets: state.assets.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)),
    }));
  },

  deleteAsset: (id) => {
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== id),
    }));
  },
}));
