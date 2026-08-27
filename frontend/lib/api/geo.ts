export interface UserGeoLocation {
  countryCode: string;
  currency: string;
  countryName: string;
  ip?: string;
  city?: string;
  region?: string;
  regionCode?: string;
  timezone?: string;
  postal?: string;
  latitude?: number;
  longitude?: number;
  countryCapital?: string;
  currencyName?: string;
  languages?: string;
  org?: string;
  asn?: string;
  raw?: Record<string, any>;
}

const COOKIE_NAME = 'user_geo_data';
const COOKIE_DAYS = 30;

const TIMEZONE_TO_COUNTRY: Record<string, { countryCode: string; currency: string; countryName: string }> = {
  'Asia/Kolkata': { countryCode: 'IN', currency: 'INR', countryName: 'India' },
  'Asia/Calcutta': { countryCode: 'IN', currency: 'INR', countryName: 'India' },
  'America/New_York': { countryCode: 'US', currency: 'USD', countryName: 'United States' },
  'America/Chicago': { countryCode: 'US', currency: 'USD', countryName: 'United States' },
  'America/Los_Angeles': { countryCode: 'US', currency: 'USD', countryName: 'United States' },
  'America/Denver': { countryCode: 'US', currency: 'USD', countryName: 'United States' },
  'America/Phoenix': { countryCode: 'US', currency: 'USD', countryName: 'United States' },
  'Europe/London': { countryCode: 'GB', currency: 'GBP', countryName: 'United Kingdom' },
  'Asia/Dubai': { countryCode: 'AE', currency: 'AED', countryName: 'United Arab Emirates' },
  'Asia/Singapore': { countryCode: 'SG', currency: 'SGD', countryName: 'Singapore' },
  'Australia/Sydney': { countryCode: 'AU', currency: 'AUD', countryName: 'Australia' },
  'America/Toronto': { countryCode: 'CA', currency: 'CAD', countryName: 'Canada' },
  'Europe/Berlin': { countryCode: 'DE', currency: 'EUR', countryName: 'Germany' },
  'Europe/Paris': { countryCode: 'FR', currency: 'EUR', countryName: 'France' },
};

const DEFAULT_LOCATION: UserGeoLocation = {
  countryCode: 'IN',
  currency: 'INR',
  countryName: 'India',
};

let cachedLocation: UserGeoLocation | null = null;

/**
 * Helper to write cookie in browser
 */
function setCookie(name: string, value: string, days: number = COOKIE_DAYS) {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Helper to read cookie in browser
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Detect visitor location and currency dynamically.
 * 1. Checks memory & browser cookie first.
 * 2. Attempts IP geolocation API (https://ipapi.co/json/).
 * 3. ONLY ON SUCCESSFUL ipapi response: stores complete output payload in the cookie (for 30 days).
 * 4. Fallback (timezone or default India) is used in-memory ONLY and NOT saved to cookie.
 */
export async function detectUserGeoLocation(): Promise<UserGeoLocation> {
  // 1. Return in-memory cached location if available
  if (cachedLocation) {
    return cachedLocation;
  }

  // 2. Check Cookie in browser (only successful ipapi responses are stored here)
  if (typeof window !== 'undefined') {
    try {
      const cookieVal = getCookie(COOKIE_NAME);
      if (cookieVal) {
        const parsed = JSON.parse(cookieVal);
        if (parsed && parsed.countryCode) {
          cachedLocation = parsed;
          return parsed;
        }
      }
    } catch {
      // Ignore cookie parsing errors
    }
  }

  // 3. Primary: Try IP Geolocation API (https://ipapi.co/json/) with a 3s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch('https://ipapi.co/json/', {
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      // Only store if ipapi response is successful and has not errored
      if (data && data.country_code && !data.error) {
        const detected: UserGeoLocation = {
          countryCode: data.country_code || 'IN',
          currency: data.currency || 'INR',
          countryName: data.country_name || 'India',
          ip: data.ip,
          city: data.city,
          region: data.region,
          regionCode: data.region_code,
          timezone: data.timezone,
          postal: data.postal,
          latitude: data.latitude,
          longitude: data.longitude,
          countryCapital: data.country_capital,
          currencyName: data.currency_name,
          languages: data.languages,
          org: data.org,
          asn: data.asn,
          raw: data, // Stores all raw fields from ipapi.co
        };

        // Persist successful ipapi data into cookie for 30 days
        setCookie(COOKIE_NAME, JSON.stringify(detected), COOKIE_DAYS);
        cachedLocation = detected;
        return detected;
      }
    }
  } catch {
    // ipapi.co failed, rate-limited, or blocked by ad-blocker -> proceed to temporary in-memory fallback
  }

  // 4. Secondary Fallback: Browser Timezone Detection (IN-MEMORY ONLY, NOT SAVED TO COOKIE)
  if (typeof window !== 'undefined') {
    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTimeZone && TIMEZONE_TO_COUNTRY[userTimeZone]) {
        const fallback = TIMEZONE_TO_COUNTRY[userTimeZone];
        const detected: UserGeoLocation = {
          ...fallback,
          timezone: userTimeZone,
        };
        cachedLocation = detected;
        return detected;
      }
    } catch {
      // Ignore timezone parsing errors
    }
  }

  // 5. Final Fallback: Default Location (IN-MEMORY ONLY, NOT SAVED TO COOKIE)
  cachedLocation = DEFAULT_LOCATION;
  return DEFAULT_LOCATION;
}
