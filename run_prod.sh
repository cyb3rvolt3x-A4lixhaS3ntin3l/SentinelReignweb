#!/bin/bash

# ==============================================================================
# SentinelReign Production Master Control (PM2 Orchestrated)
# ==============================================================================
# This script executes the high-performance production pipeline.
# It pre-compiles the Next.js frontend into static SSG bundles and uses PM2 to run
# FastAPI, Next.js, and Celery concurrent processes.

set -e

echo "====================================================="
echo "   Initiating SentinelReign Production Deployment"
echo "====================================================="

# 1. Clean up potential hanging pm2
echo "[System] Terminating stale processes..."
pm2 delete all || true

# 2. Build High-Performance Frontend
echo "[Interface] Compiling Next.js SSG Production Bundles..."
cd v3-frontend
npm run build
cd ..

# 3. Boot PM2 Ecosystem
echo "[Engine] Booting Uvicorn Matrix, Next.js, and Celery Swarm via PM2..."
pm2 start ecosystem.config.js

echo "====================================================="
echo "   SentinelReign is now LIVE in Production Mode"
echo "   Backend: http://localhost:8000"
echo "   Frontend: http://localhost:3001"
echo "   Monitor Agents: pm2 monit"
echo "====================================================="
