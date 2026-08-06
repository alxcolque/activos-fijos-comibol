import { useCurrencyStore } from '../store/currencyStore';

/**
 * Formatea un monto expresado en Pesos Bolivianos (BOB) a la moneda seleccionada en el estado global (BOB o USD).
 */
export const formatCurrency = (amountInBOB?: number | null): string => {
  return useCurrencyStore.getState().formatAmount(amountInBOB);
};

/**
 * Convierte un monto expresado en Pesos Bolivianos (BOB) a un valor numérico en la moneda activa.
 */
export const convertCurrency = (amountInBOB?: number | null): number => {
  return useCurrencyStore.getState().convertFromBOB(amountInBOB);
};

/**
 * Hook para consultar el estado y funciones de conversión de moneda en componentes React.
 */
export const useCurrency = () => {
  const currency = useCurrencyStore((state) => state.currency);
  const exchangeRate = useCurrencyStore((state) => state.exchangeRate);
  const toggleCurrency = useCurrencyStore((state) => state.toggleCurrency);
  const fetchExchangeRate = useCurrencyStore((state) => state.fetchExchangeRate);
  const isLoadingRate = useCurrencyStore((state) => state.isLoadingRate);
  const formatAmount = useCurrencyStore((state) => state.formatAmount);
  const convertFromBOB = useCurrencyStore((state) => state.convertFromBOB);

  return {
    currency,
    exchangeRate,
    toggleCurrency,
    fetchExchangeRate,
    isLoadingRate,
    formatCurrency: formatAmount,
    convertCurrency: convertFromBOB,
    isUSD: currency === 'USD',
    isBOB: currency === 'BOB',
  };
};
