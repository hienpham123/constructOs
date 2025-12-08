#!/bin/bash
# Start script for Render
# This ensures the server starts correctly on Render

# Wait for database to be ready (if needed)
# sleep 2

# Start the server
node dist/index.js

