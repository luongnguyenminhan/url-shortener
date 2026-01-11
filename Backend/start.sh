#!/usr/bin/env bash
set -e

export PYTHONUNBUFFERED=1

# Start Celery in background (KHÔNG pipe, KHÔNG log màu)
celery -A app.jobs.celery_worker worker --loglevel=info &

# 🚨 Uvicorn PHẢI là PID 1
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000
