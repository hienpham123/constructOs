#!/bin/bash

# Script to setup phpMyAdmin
# This script downloads and configures phpMyAdmin

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATABASE_DIR="$(dirname "$SCRIPT_DIR")"
PHPMYADMIN_DIR="$DATABASE_DIR/phpmyadmin"
PHPMYADMIN_VERSION="5.2.1"

echo "🚀 Setting up phpMyAdmin..."

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    echo "❌ PHP is not installed!"
    echo ""
    echo "Please install PHP first:"
    echo "  brew install php"
    echo ""
    exit 1
fi

PHP_VERSION=$(php -r 'echo PHP_VERSION;')
echo "✅ PHP version: $PHP_VERSION"

# Check if phpMyAdmin already exists
if [ -d "$PHPMYADMIN_DIR" ]; then
    echo "⚠️  phpMyAdmin directory already exists at: $PHPMYADMIN_DIR"
    read -p "Do you want to reinstall? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping download..."
        exit 0
    fi
    rm -rf "$PHPMYADMIN_DIR"
fi

# Create directory
mkdir -p "$PHPMYADMIN_DIR"
cd "$PHPMYADMIN_DIR"

# Download phpMyAdmin
echo "📥 Downloading phpMyAdmin $PHPMYADMIN_VERSION..."
curl -L "https://files.phpmyadmin.net/phpMyAdmin/${PHPMYADMIN_VERSION}/phpMyAdmin-${PHPMYADMIN_VERSION}-all-languages.tar.gz" -o phpmyadmin.tar.gz

# Extract
echo "📦 Extracting..."
tar -xzf phpmyadmin.tar.gz --strip-components=1

# Clean up
rm phpmyadmin.tar.gz

# Create config file
echo "⚙️  Creating configuration..."
cat > config.inc.php << 'EOF'
<?php
/**
 * phpMyAdmin configuration for constructOS
 */

$cfg['blowfish_secret'] = 'constructos-secret-key-change-this-in-production';

$i = 0;
$i++;

/* Server: constructos MySQL */
$cfg['Servers'][$i]['auth_type'] = 'config';
$cfg['Servers'][$i]['host'] = 'localhost';
$cfg['Servers'][$i]['port'] = '3306';
$cfg['Servers'][$i]['user'] = 'constructos_user';
$cfg['Servers'][$i]['password'] = 'constructos123';
$cfg['Servers'][$i]['compress'] = false;
$cfg['Servers'][$i]['AllowNoPassword'] = false;

/* Directories for saving/loading files from server */
$cfg['UploadDir'] = '';
$cfg['SaveDir'] = '';

/* End of servers configuration */

$cfg['DefaultLang'] = 'en';
$cfg['ServerDefault'] = 1;
$cfg['VersionCheck'] = false;
EOF

echo "✅ phpMyAdmin setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Run: ./database/scripts/start_phpmyadmin.sh"
echo "  2. Open: http://localhost:8080"
echo ""

