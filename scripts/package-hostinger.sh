#!/usr/bin/env bash
# Build and zip the project for Hostinger "upload zip" deploy.
# Usage:
#   ./scripts/package-hostinger.sh
#   ./scripts/package-hostinger.sh ./my-deploy.zip
#   HOSTINGER_ROOT_DIR=my-app ./scripts/package-hostinger.sh
#
# In hPanel, set Root directory to the same name as HOSTINGER_ROOT_DIR (default: backend-main).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ZIP_NAME="${HOSTINGER_ROOT_DIR:-backend-main}"
OUT_ZIP="${1:-${ROOT}/${ZIP_NAME}.zip}"

echo "==> eden-backend-service: npm ci + build"
npm ci
npm run build

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

mkdir -p "$STAGE/${ZIP_NAME}"

echo "==> Staging files into ${ZIP_NAME}/ (excludes node_modules, dist, .git, .env)"
rsync -a \
  --exclude node_modules \
  --exclude dist \
  --exclude .git \
  --exclude .env \
  --exclude .env.* \
  --exclude '*.zip' \
  --exclude .DS_Store \
  --exclude coverage \
  "${ROOT}/" "${STAGE}/${ZIP_NAME}/"

rm -f "$OUT_ZIP"
(
  cd "$STAGE"
  zip -rq "$(basename "$OUT_ZIP")" "$ZIP_NAME"
)
mv "${STAGE}/$(basename "$OUT_ZIP")" "$OUT_ZIP"

echo ""
echo "Created: $OUT_ZIP"
echo "Upload this zip in Hostinger → Deployments."
echo "Set Root directory to: ${ZIP_NAME}"
echo "Set Entry file to: server.js"
echo "After deploy, check: https://<your-host>/health"
