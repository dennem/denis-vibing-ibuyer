#!/bin/bash

# Start script for Railway deployment

echo "Starting IBuyer Thailand Application..."

# Serve frontend static files with Python's built-in server
cd frontend/dist && python3 -m http.server 3000 &

# Start the FastAPI backend
cd /app/backend && python3 main.py