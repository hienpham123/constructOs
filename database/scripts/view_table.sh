#!/bin/bash

# Script để xem dữ liệu trong một table
# Usage: ./view_table.sh table_name [limit]

DB_USER="constructos_user"
DB_PASSWORD="constructos123"
DB_NAME="constructos"
TABLE_NAME=$1
LIMIT=${2:-10}

if [ -z "$TABLE_NAME" ]; then
    echo "❌ Lỗi: Vui lòng cung cấp tên table"
    echo "Usage: ./view_table.sh <table_name> [limit]"
    echo "Example: ./view_table.sh users 5"
    exit 1
fi

echo "📊 Dữ liệu trong table '$TABLE_NAME' (limit: $LIMIT):"
echo ""

mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT * FROM $TABLE_NAME LIMIT $LIMIT;" 2>/dev/null

echo ""
echo "Tổng số records:"
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT COUNT(*) as total FROM $TABLE_NAME;" 2>/dev/null | grep -v "Warning" | tail -n +2

