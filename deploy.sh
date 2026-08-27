#!/bin/bash
set -e

echo "🚀 [1/3] Syncing .env & Building Backend..."
cp -f .env backend/.env 2>/dev/null || true
cd backend
npm install
if [ -f "./node_modules/.bin/prisma" ]; then
    ./node_modules/.bin/prisma generate --schema prisma/schema
    ./node_modules/.bin/prisma db push --schema prisma/schema --accept-data-loss
else
    npx --yes prisma generate --schema prisma/schema
    npx --yes prisma db push --schema prisma/schema --accept-data-loss
fi
npm run build
cd ..

echo "🎨 [2/3] Syncing .env & Building Frontend..."
cp -f .env frontend/.env.local 2>/dev/null || true
cd frontend
npm install
npm run build
cd ..

echo "⚡ [3/3] Starting/Reloading Services with PM2..."
if command -v pm2 &> /dev/null; then
    pm2 delete all 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save || true
elif [ -f "./node_modules/.bin/pm2" ]; then
    ./node_modules/.bin/pm2 delete all 2>/dev/null || true
    ./node_modules/.bin/pm2 start ecosystem.config.js
    ./node_modules/.bin/pm2 save || true
elif [ -f "./backend/node_modules/.bin/pm2" ]; then
    ./backend/node_modules/.bin/pm2 delete all 2>/dev/null || true
    ./backend/node_modules/.bin/pm2 start ecosystem.config.js
    ./backend/node_modules/.bin/pm2 save || true
else
    npx --yes pm2 delete all 2>/dev/null || true
    npx --yes pm2 start ecosystem.config.js
    npx --yes pm2 save || true
fi

echo "✅ Full-Stack Deployment Complete! Frontend (:3000) & Backend (:4000) are live."
