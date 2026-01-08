from celery import Celery
from app.core.vault_loader import load_config_from_api_v2
from app.core.config import settings
from app.core.firebase import initialize_firebase

# Load configuration from Vault before anything else
load_config_from_api_v2()

initialize_firebase()

celery_app = Celery(
    "worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[],  # Explicitly include tasks module
)

# Configure Celery settings for better timeout handling
celery_app.conf.update(
    # Task timeout settings
    task_soft_time_limit=30000,
    task_time_limit=60000,
    # Worker settings
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    worker_max_tasks_per_child=50,
    # Retry settings
    task_default_retry_delay=60,
    task_max_retries=3,
)
