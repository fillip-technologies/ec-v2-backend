import { PrismaClient } from '@prisma/client';

export async function seedCountriesAndGateways(prisma: PrismaClient) {
  console.log('🌍 [1/7] Seeding Global Countries & Payment Gateways...');

  const countries = [
    {
      id: 1,
      isoCode: 'IN',
      name: 'India',
      defaultLocal: 'en-IN',
      timezone: 'Asia/Kolkata',
      currencyCode: 'INR',
      isActive: true,
    },
    {
      id: 2,
      isoCode: 'US',
      name: 'United States',
      defaultLocal: 'en-US',
      timezone: 'America/New_York',
      currencyCode: 'USD',
      isActive: true,
    },
    {
      id: 3,
      isoCode: 'GB',
      name: 'United Kingdom',
      defaultLocal: 'en-GB',
      timezone: 'Europe/London',
      currencyCode: 'GBP',
      isActive: true,
    },
    {
      id: 4,
      isoCode: 'AE',
      name: 'United Arab Emirates',
      defaultLocal: 'ar-AE',
      timezone: 'Asia/Dubai',
      currencyCode: 'AED',
      isActive: true,
    },
    {
      id: 5,
      isoCode: 'SG',
      name: 'Singapore',
      defaultLocal: 'en-SG',
      timezone: 'Asia/Singapore',
      currencyCode: 'SGD',
      isActive: true,
    },
    {
      id: 6,
      isoCode: 'DE',
      name: 'Germany',
      defaultLocal: 'de-DE',
      timezone: 'Europe/Berlin',
      currencyCode: 'EUR',
      isActive: true,
    },
    {
      id: 7,
      isoCode: 'CA',
      name: 'Canada',
      defaultLocal: 'en-CA',
      timezone: 'America/Toronto',
      currencyCode: 'CAD',
      isActive: true,
    },
    {
      id: 8,
      isoCode: 'AU',
      name: 'Australia',
      defaultLocal: 'en-AU',
      timezone: 'Australia/Sydney',
      currencyCode: 'AUD',
      isActive: true,
    },
  ];

  for (const c of countries) {
    await prisma.country.upsert({
      where: { isoCode: c.isoCode },
      update: {
        name: c.name,
        defaultLocal: c.defaultLocal,
        timezone: c.timezone,
        currencyCode: c.currencyCode,
        isActive: c.isActive,
      },
      create: {
        id: c.id,
        name: c.name,
        isoCode: c.isoCode,
        defaultLocal: c.defaultLocal,
        timezone: c.timezone,
        currencyCode: c.currencyCode,
        isActive: c.isActive,
      },
    });
  }

  // Payment Gateways
  const gateways = [
    {
      id: 1,
      code: 'razorpay',
      name: 'Razorpay Payment Gateway (UPI / Cards / Netbanking)',
      isActive: true,
      priority: 1,
      supportedCountryIsoCodes: ['IN'],
    },
    {
      id: 2,
      code: 'stripe',
      name: 'Stripe International (Credit Cards / Apple Pay)',
      isActive: true,
      priority: 2,
      supportedCountryIsoCodes: ['US', 'GB', 'AE', 'SG', 'DE', 'CA', 'AU'],
    },
    {
      id: 3,
      code: 'paypal',
      name: 'PayPal Global Wallet',
      isActive: true,
      priority: 3,
      supportedCountryIsoCodes: ['US', 'GB', 'SG', 'DE', 'CA', 'AU'],
    },
  ];

  for (const g of gateways) {
    const gateway = await prisma.paymentGatewayConfig.upsert({
      where: { code: g.code },
      update: {
        name: g.name,
        isActive: g.isActive,
        priority: g.priority,
      },
      create: {
        code: g.code,
        name: g.name,
        isActive: g.isActive,
        priority: g.priority,
      },
    });

    for (const iso of g.supportedCountryIsoCodes) {
      const country = await prisma.country.findUnique({ where: { isoCode: iso } });
      if (country) {
        await prisma.gatewayCountry.upsert({
          where: { gatewayId_countryId: { gatewayId: gateway.id, countryId: country.id } },
          update: {},
          create: { gatewayId: gateway.id, countryId: country.id },
        });
      }
    }
  }

  console.log(`  ✅ ${countries.length} Countries & ${gateways.length} Payment Gateways seeded successfully`);
}
