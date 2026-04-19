#!/bin/bash
# Build the frontend for Cloudflare deployment
# Usage: ./build-for-cloudflare.sh https://your-api-server-url.replit.app

API_URL="$1"

if [ -z "$API_URL" ]; then
  echo "Error: You must provide your API server URL"
  echo "Usage: ./build-for-cloudflare.sh https://your-api-url.replit.app"
  exit 1
fi

echo "Building frontend for Cloudflare..."
echo "API URL: $API_URL"
echo ""

VITE_API_URL="$API_URL" \
VITE_CLERK_PUBLISHABLE_KEY="$VITE_CLERK_PUBLISHABLE_KEY" \
  pnpm --filter @workspace/sim-rentals build:cloudflare

if [ $? -eq 0 ]; then
  echo ""
  echo "Build complete!"
  echo "Upload the contents of: artifacts/sim-rentals/dist/cloudflare/"
  echo "to your Cloudflare Pages project."
else
  echo ""
  echo "Build failed. Check the errors above."
fi
