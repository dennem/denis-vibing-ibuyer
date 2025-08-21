"""
Minimal Celery configuration for iBuyer
Just like Sidekiq - handles background jobs
"""
from celery import Celery
import os

# Create Celery instance
celery_app = Celery(
    'ibuyer',
    broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    include=['tasks.email']  # Just one task module for now
)

# Basic configuration with memory optimization
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Bangkok',
    enable_utc=True,
    
    # Retry failed tasks (like Sidekiq's default behavior)
    task_acks_late=True,
    task_default_retry_delay=60,  # 60 seconds
    task_max_retries=3,
    
    # Memory optimization settings
    worker_max_tasks_per_child=100,  # Restart worker after 100 tasks to prevent memory leaks
    worker_prefetch_multiplier=1,    # Only fetch one task at a time
    worker_concurrency=1,             # Use only 1 worker process (lowest memory usage)
    worker_disable_rate_limits=True,  # Disable rate limiting to save memory
    
    # Redis connection pooling
    broker_connection_retry_on_startup=True,
    broker_pool_limit=1,              # Minimal connection pool
    redis_max_connections=2,          # Limit Redis connections
    
    # Result backend optimization (we don't really need results stored)
    result_expires=300,               # Results expire after 5 minutes
    result_backend=None,              # Don't store results at all to save memory
)