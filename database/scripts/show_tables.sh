#!/bin/bash

# Script để xem tất cả tables trong database

DB_USER="constructos_user"
DB_PASSWORD="constructos123"
DB_NAME="constructos"

echo "📋 Danh sách tables trong database '$DB_NAME':"
echo ""

mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES;" 2>/dev/null | grep -v "Warning" | tail -n +2

echo ""
echo "Tổng số tables:"
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES;" 2>/dev/null | grep -v "Warning" | tail -n +2 | wc -l | xargs

