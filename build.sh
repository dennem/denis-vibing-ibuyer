#!/bin/bash

# Build script for Railway deployment

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Installing Node dependencies..."
cd frontend && npm install

echo "Building frontend..."
npm run build

echo "Build complete!"