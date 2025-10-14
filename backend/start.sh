#!/bin/bash

echo "========================================"
echo "Take Care Me (TCM) - Startup Script"
echo "========================================"

echo ""
echo "[1/3] Starting Backend Server..."
echo "========================================"
npm run start:dev &
BACKEND_PID=$!

echo ""
echo "[2/3] Waiting for backend to start..."
sleep 10

echo ""
echo "[3/3] Starting Frontend Application..."
echo "========================================"
cd Index
npm start &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "TCM System Started Successfully!"
echo "========================================"
echo ""
echo "Backend API: http://localhost:3000"
echo "Frontend App: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services..."

# Function to cleanup processes
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for user to stop
wait




