import os
import redis
import logging
from celery import Celery

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

def is_redis_available(url):
    try:
        r = redis.Redis.from_url(url, socket_timeout=1)
        r.ping()
        return True
    except Exception:
        return False

# Defensive fallback
redis_ready = is_redis_available(REDIS_URL)

if not redis_ready:
    logger.warning("⚠️ Redis is not available at %s. Falling back to SYNCHRONOUS tasks.", REDIS_URL)

celery_app = Celery(
    "sentinel_tasks",
    broker=REDIS_URL if redis_ready else "memory://",
    backend=REDIS_URL if redis_ready else "cache+memory://"
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    task_always_eager=not redis_ready,
    task_eager_propagates=not redis_ready,
    worker_prefetch_multiplier=1, # Important for strict rate limiting
)

# Auto-discover tasks in services
celery_app.autodiscover_tasks(['services'])
