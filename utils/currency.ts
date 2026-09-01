const DEFAULT_RATES: Record<string, Record<string, number>> = {
    GHS: { USD: 0.065, EUR: 0.060, GBP: 0.051 },
    USD: { GHS: 15.50, EUR: 0.92, GBP: 0.79 },
    EUR: { USD: 1.09, GHS: 16.80, GBP: 0.86 },
    GBP: { USD: 1.27, GHS: 19.50, EUR: 1.16 },
};

function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) {
        return amount;
    }

    const rates = DEFAULT_RATES[fromCurrency];
    if (!rates || !rates[toCurrency]) {
        throw new Error(`Conversion rate from ${fromCurrency} to ${toCurrency} not found.`);
    }

    return amount * rates[toCurrency];
}

const formatCurrency = (amount: number, currency = "USD") => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export { convertCurrency, DEFAULT_RATES, formatCurrency };