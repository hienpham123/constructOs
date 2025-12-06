#!/bin/bash

# Script để mở MySQL console với database constructos

DB_USER="constructos_user"
DB_PASSWORD="constructos123"
DB_NAME="constructos"

echo "🔌 Đang kết nối đến database '$DB_NAME'..."
echo "User: $DB_USER"
echo ""
echo "💡 Các lệnh hữu ích:"
echo "  - SHOW TABLES;              → Xem tất cả tables"
echo "  - DESCRIBE users;           → Xem cấu trúc table users"
echo "  - SELECT * FROM users;      → Xem dữ liệu users"
echo "  - SELECT COUNT(*) FROM users; → Đếm số users"
echo "  - EXIT;                     → Thoát"
echo ""

mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" 2>/dev/null

