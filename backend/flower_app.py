"""
Flower monitoring app with basic auth
Run as part of the main app in production
"""
import os
import subprocess
import threading
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets

security = HTTPBasic()

# Set admin credentials via environment variables
FLOWER_USER = os.getenv("FLOWER_USER", "admin")
FLOWER_PASSWORD = os.getenv("FLOWER_PASSWORD", "ibuyer2024")  # Change in production!

def verify_flower_credentials(credentials: HTTPBasicCredentials = Depends(security)):
    """Basic auth for Flower access"""
    correct_username = secrets.compare_digest(credentials.username, FLOWER_USER)
    correct_password = secrets.compare_digest(credentials.password, FLOWER_PASSWORD)
    
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

def start_flower_in_background():
    """Start Flower in a background thread"""
    def run_flower():
        try:
            # Run Flower on port 5555 (internal port)
            subprocess.run([
                "celery", "-A", "celery_app", "flower",
                "--port=5555",
                "--url_prefix=/admin/flower",  # Mount under /admin/flower
                f"--basic_auth={FLOWER_USER}:{FLOWER_PASSWORD}"
            ])
        except Exception as e:
            print(f"Flower failed to start: {e}")
    
    # Only start in production or when explicitly enabled
    if os.getenv("ENABLE_FLOWER", "false").lower() == "true":
        thread = threading.Thread(target=run_flower, daemon=True)
        thread.start()
        print("Flower monitoring started at /admin/flower")