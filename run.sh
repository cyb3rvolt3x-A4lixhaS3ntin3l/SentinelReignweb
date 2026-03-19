#!/bin/bash
echo "Starting SentinelReign Backend..."
cd backend
../venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
