/**
 * Centralized Backend Currency Utilities
 */

/**
 * Extract currency symbol dynamically for ISO 4217 currency code
 */
export function getCurrencySymbol(currencyCode = 'INR'): string {
  try {
    return (0)
      .toLocaleString('en', {
        style: 'currency',
        currency: currencyCode.toUpperCase(),
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace(/\d/g, '')
      .trim();
  } catch {
    const symbolMap: Record<string, string> = {
      INR: '₹',
      USD: '$',
      GBP: '£',
      EUR: '€',
      AED: 'AED ',
    };
    return symbolMap[currencyCode.toUpperCase()] || currencyCode.toUpperCase() + ' ';
  }
}

/**
 * Format currency amount with symbol
 */
export function formatCurrencyAmount(amount: number, currencyCode = 'INR'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${getCurrencySymbol(currencyCode)}${amount.toLocaleString()}`;
  }
}
