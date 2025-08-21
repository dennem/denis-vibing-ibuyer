#!/bin/sh
# Start Celery worker with memory optimization for Railway (1GB limit)

# Python memory optimization flags
export PYTHONOPTIMIZE=2           # Remove docstrings and assertions
export PYTHONUNBUFFERED=1         # Disable output buffering
export MALLOC_TRIM_THRESHOLD_=0   # Return memory to OS more aggressively

# Start Celery with minimal memory usage
# --pool=solo uses single-threaded execution (lowest memory)
# --without-gossip --without-mingle --without-heartbeat reduces network overhead
exec python3 -m celery -A celery_app worker \
    --loglevel=info \
    --pool=solo \
    --concurrency=1 \
    --max-tasks-per-child=100 \
    --without-gossip \
    --without-mingle \
    --without-heartbeat