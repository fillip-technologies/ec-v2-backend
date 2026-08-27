# Production Build & Deployment Guide

This document covers the build configuration, environment variable specifications, and deployment recommendations for the **Engineers Clinic Frontend**.

---

## ⚙️ 1. Environment Variables Reference

Create a `.env.production` (or inject via CI/CD secrets) with the following parameters:

```env
# Backend API Base Endpoint (Must include /api suffix)
NEXT_PUBLIC_BACKEND_URL="https://api.engineersclinic.com/api"

# Razorpay Client Key ID (Live Key for production checkout)
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxx"

# Google Analytics / Telemetry ID (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

---

## 🏗️ 2. Production Build Execution

Before deploying, verify that the TypeScript compiler and Next.js Turbopack build succeed without errors:

```bash
# Clean previous build artifacts
rm -rf .next

# Run full Next.js production build
npm run build
```

Expected output:
```
✓ Compiled successfully
✓ Finished TypeScript
✓ Collecting page data
✓ Generating static pages (15/15)
✓ Finalizing page optimization
```

---

## 🚢 3. Deployment Options

### Option A: Vercel (Recommended for Next.js)
1. Import the `engineers-clinic-frontend` repository into Vercel.
2. Set Framework Preset: **Next.js**.
3. Configure Environment Variables (`NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`).
4. Deploy automatically on push to `main`.

### Option B: Self-Hosted Docker / Node.js Server
1. Build the production package:
   ```bash
   npm run build
   ```
2. Start the production Node server with a process manager like PM2:
   ```bash
   pm2 start "npm run start" --name "engineers-clinic-frontend"
   ```
3. Configure Nginx Reverse Proxy with SSL (Let's Encrypt) pointing to port `3000`.

---

## ⚡ 4. Performance & Caching Guidelines
- **Catalog Pages (`/catalog`, `/catalog/[slug]`)**: Rendered using Next.js on-demand dynamic rendering with fast TTFB.
- **Protected Dashboards (`/student`, `/college`, `/admin`)**: Client-side data hydration wrapped in `<Suspense>` fallbacks to ensure instant page transitions.
- **Images**: All assets use `next/image` with WebP compression and responsive srcset generation.
