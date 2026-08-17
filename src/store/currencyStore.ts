import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CurrencyType = 'BOB' | 'USD';

export interface DolarApiResponse {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

interface CurrencyState {
  currency: CurrencyType;
  exchangeRate: number; // 1 USD = exchangeRate BOB
  isLoadingRate: boolean;
  lastUpdated: string | null;
  toggleCurrency: () => void;
  setCurrency: (currency: CurrencyType) => void;
  fetchExchangeRate: () => Promise<void>;
  formatAmount: (amountInBOB?: number | null) => string;
  formatCompactAmount: (amountInBOB?: number | null) => string;
  convertFromBOB: (amountInBOB?: number | null) => number;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'BOB',
      exchangeRate: 11.86, // Valor por defecto oficial / mercado
      isLoadingRate: false,
      lastUpdated: null,

      toggleCurrency: () => {
        set((state) => ({
          currency: state.currency === 'BOB' ? 'USD' : 'BOB',
        }));
      },

      setCurrency: (currency) => set({ currency }),

      fetchExchangeRate: async () => {
        set({ isLoadingRate: true });
        try {
          const response = await fetch('https://bo.dolarapi.com/v1/dolares/oficial');
          if (response.ok) {
            const data: DolarApiResponse = await response.json();
            const rate = data.venta || data.compra || 11.86;
            set({
              exchangeRate: rate,
              lastUpdated: data.fechaActualizacion || new Date().toISOString(),
            });
          }
        } catch (error) {
          console.warn('Error al obtener tipo de cambio de DolarApi, usando tasa actual', error);
        } finally {
          set({ isLoadingRate: false });
        }
      },

      convertFromBOB: (amountInBOB?: number | null) => {
        if (amountInBOB == null || isNaN(Number(amountInBOB))) return 0;
        const num = Number(amountInBOB);
        const { currency, exchangeRate } = get();
        if (currency === 'USD') {
          return num / (exchangeRate || 11.86);
        }
        return num;
      },

      formatAmount: (amountInBOB?: number | null) => {
        if (amountInBOB == null || isNaN(Number(amountInBOB))) return '—';
        const num = Number(amountInBOB);
        const { currency, exchangeRate } = get();

        if (currency === 'USD') {
          const valInUSD = num / (exchangeRate || 11.86);
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(valInUSD);
        }

        return new Intl.NumberFormat('es-BO', {
          style: 'currency',
          currency: 'BOB',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(num);
      },

      formatCompactAmount: (amountInBOB?: number | null) => {
        if (amountInBOB == null || isNaN(Number(amountInBOB))) return '—';
        const num = Number(amountInBOB);
        const { currency, exchangeRate } = get();
        const converted = currency === 'USD' ? num / (exchangeRate || 11.86) : num;
        const prefix = currency === 'USD' ? '$' : 'Bs';

        const abs = Math.abs(converted);
        if (abs >= 1e9) {
          const val = (converted / 1e9).toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
          return `${prefix} ${val}B`;
        }
        if (abs >= 1e6) {
          const val = (converted / 1e6).toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
          return `${prefix} ${val}M`;
        }
        if (abs >= 1e3) {
          const val = (converted / 1e3).toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
          return `${prefix} ${val}K`;
        }

        return get().formatAmount(amountInBOB);
      },
    }),
    {
      name: 'comibol-currency-storage',
      partialize: (state) => ({
        currency: state.currency,
        exchangeRate: state.exchangeRate,
        lastUpdated: state.lastUpdated,
      }),
    },
  ),
);
