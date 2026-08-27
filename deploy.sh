#!/bin/bash
set -e

echo "🚀 [1/4] Installing dependencies & Building Backend..."
npm install

# Generate Prisma Client & Sync Database without needing global npx
if [ -f "./node_modules/.bin/prisma" ]; then
    ./node_modules/.bin/prisma generate --schema prisma/schema
    ./node_modules/.bin/prisma db push --schema prisma/schema --accept-data-loss
else
    npx --yes prisma generate --schema prisma/schema
    npx --yes prisma db push --schema prisma/schema --accept-data-loss
fi

npm run build:backend

echo "🎨 [2/4] Syncing single .env & Building Frontend..."
cp -f .env frontend/.env.local 2>/dev/null || true
cd frontend
npm install
npm run build
cd ..

echo "⚡ [3/4] Starting/Reloading Services with PM2..."
if command -v pm2 &> /dev/null; then
    pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js
    pm2 save || true
elif [ -f "./node_modules/.bin/pm2" ]; then
    ./node_modules/.bin/pm2 reload ecosystem.config.js || ./node_modules/.bin/pm2 start ecosystem.config.js
    ./node_modules/.bin/pm2 save || true
else
    npx --yes pm2 reload ecosystem.config.js || npx --yes pm2 start ecosystem.config.js
    npx --yes pm2 save || true
fi

echo "✅ [4/4] Full-Stack Deployment Complete! Frontend (:3000) & Backend (:4000) are live."
