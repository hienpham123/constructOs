#!/bin/bash

# Wrapper script to start phpMyAdmin from anywhere

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

./database/scripts/start_phpmyadmin.sh

