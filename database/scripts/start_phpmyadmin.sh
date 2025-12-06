#!/bin/bash

# Script to start phpMyAdmin web server

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATABASE_DIR="$(dirname "$SCRIPT_DIR")"
PHPMYADMIN_DIR="$DATABASE_DIR/phpmyadmin"
PORT=8080

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    echo "❌ PHP is not installed!"
    echo ""
    echo "Please install PHP first:"
    echo "  brew install php"
    echo ""
    exit 1
fi

# Check if phpMyAdmin exists
if [ ! -d "$PHPMYADMIN_DIR" ]; then
    echo "❌ phpMyAdmin not found!"
    echo ""
    echo "Please run setup first:"
    echo "  ./database/scripts/setup_phpmyadmin.sh"
    echo ""
    exit 1
fi

# Check if port is in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port $PORT is already in use!"
    echo ""
    read -p "Do you want to kill the process? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
        sleep 1
    else
        echo "Please free port $PORT first or change the port in this script."
        exit 1
    fi
fi

cd "$PHPMYADMIN_DIR"

echo "🚀 Starting phpMyAdmin..."
echo "📍 URL: http://localhost:$PORT"
echo "🔑 Login automatically configured"
echo ""
echo "Press Ctrl+C to stop"
echo ""

php -S localhost:$PORT

