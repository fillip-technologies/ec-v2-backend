import { detectUserGeoLocation } from '@/lib/api/geo';

/**
 * Centralized Currency & Formatting Helper Utilities
 */

/**
 * Convert 2-letter ISO country code (e.g. "IN", "US", "GB", "AE") into Flag Emoji dynamically
 */
export function getFlagEmoji(isoCode: string): string {
  if (!isoCode || isoCode.length !== 2) return "🌐";
  try {
    const codePoints = isoCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌐";
  }
}

/**
 * Dynamically extract currency symbol for any 3-letter ISO 4217 code (INR, USD, GBP, EUR, AED, etc.)
 */
export function getCurrencySymbol(currencyCode = "INR"): string {
  try {
    return (0)
      .toLocaleString("en", {
        style: "currency",
        currency: currencyCode.toUpperCase(),
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace(/\d/g, "")
      .trim();
  } catch {
    const symbolMap: Record<string, string> = {
      INR: "₹",
      USD: "$",
      GBP: "£",
      EUR: "€",
      AED: "AED ",
    };
    return symbolMap[currencyCode.toUpperCase()] || currencyCode.toUpperCase() + " ";
  }
}

/**
 * Dynamically format numerical price into formatted string with symbol (e.g. ₹2,999, $49)
 */
export function formatPrice(amount?: number | null, currencyCode = "INR"): string {
  if (amount == null || isNaN(amount)) {
    return `${getCurrencySymbol(currencyCode)}0`;
  }

  try {
    const locale = currencyCode.toUpperCase() === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${getCurrencySymbol(currencyCode)}${amount.toLocaleString()}`;
  }
}

/**
 * Standard alias for formatPrice (e.g. ₹48,25,000)
 */
export function formatCurrency(amount?: number | null, currencyCode = "INR"): string {
  return formatPrice(amount, currencyCode);
}

/**
 * Detect visitor location and currency dynamically via IP Geolocation API
 */
export async function detectUserCurrency(): Promise<{
  countryCode: string;
  currency: string;
  countryName: string;
}> {
  return detectUserGeoLocation();
}
