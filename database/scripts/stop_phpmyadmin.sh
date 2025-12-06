#!/bin/bash

# Script to stop phpMyAdmin web server

PORT=8080

if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "🛑 Stopping phpMyAdmin on port $PORT..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    echo "✅ Stopped!"
else
    echo "ℹ️  phpMyAdmin is not running on port $PORT"
fi

