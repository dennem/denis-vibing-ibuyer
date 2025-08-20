#!/usr/bin/env python
"""Start script for Railway deployment"""
import os
import sys

# Add backend to path
sys.path.insert(0, 'backend')

# Import and run the main app
from backend.main import app
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)