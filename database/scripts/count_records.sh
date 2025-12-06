#!/bin/bash

# Script để đếm số records trong tất cả tables

DB_USER="constructos_user"
DB_PASSWORD="constructos123"
DB_NAME="constructos"

echo "📊 Số lượng records trong các tables:"
echo ""

mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SELECT 
    TABLE_NAME as 'Table',
    TABLE_ROWS as 'Records'
FROM 
    information_schema.TABLES 
WHERE 
    TABLE_SCHEMA = '$DB_NAME'
ORDER BY 
    TABLE_ROWS DESC;
" 2>/dev/null

echo ""
echo "Tổng số tables:"
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES;" 2>/dev/null | grep -v "Warning" | tail -n +2 | wc -l | xargs

