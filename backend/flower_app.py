"""
Flower monitoring app - open access
Run as part of the main app in production
"""
import os
import subprocess
import threading

def start_flower_in_background():
    """Start Flower in a background thread"""
    def run_flower():
        try:
            # Run Flower on port 5555 (internal port)
            # Note: Flower itself runs without auth, we handle it in FastAPI
            subprocess.run([
                "celery", "-A", "celery_app", "flower",
                "--port=5555",
                "--url_prefix=/admin/flower"  # Mount under /admin/flower
            ])
        except Exception as e:
            print(f"Flower failed to start: {e}")
    
    # Only start in production or when explicitly enabled
    if os.getenv("ENABLE_FLOWER", "false").lower() == "true":
        thread = threading.Thread(target=run_flower, daemon=True)
        thread.start()
        print("Flower monitoring started at /admin/flower")