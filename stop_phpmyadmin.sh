#!/bin/bash

# Wrapper script to stop phpMyAdmin from anywhere

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

./database/scripts/stop_phpmyadmin.sh

