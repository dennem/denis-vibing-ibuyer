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

# Basic configuration
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
)