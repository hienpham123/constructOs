#!/bin/bash

# Script to drop removed tables from database
# Usage: ./drop_tables.sh

echo "=========================================="
echo "Dropping removed tables from database"
echo "=========================================="
echo ""
echo "WARNING: This will permanently delete all data in:"
echo "  - maintenance_schedules"
echo "  - equipment_usage"
echo "  - equipment"
echo "  - contract_documents"
echo "  - contracts"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Operation cancelled."
    exit 0
fi

echo ""
echo "Please enter MySQL password when prompted..."
echo ""

# Try with root user first, then fallback to constructos_user
if mysql -u root -p constructos < "$(dirname "$0")/drop_removed_tables.sql" 2>/dev/null; then
    echo ""
    echo "✅ Tables dropped successfully!"
elif mysql -u constructos_user -p constructos < "$(dirname "$0")/drop_removed_tables.sql" 2>/dev/null; then
    echo ""
    echo "✅ Tables dropped successfully!"
else
    echo ""
    echo "❌ Failed to connect to database."
    echo "Please run manually:"
    echo "  mysql -u root -p constructos < database/drop_removed_tables.sql"
    exit 1
fi

