#!/bin/bash

# Script để start Adminer web server

WEB_DIR="/Users/hochihien/Code/constructOS/database/web"
PORT=${1:-8080}

# Kiểm tra Adminer đã được setup chưa
if [ ! -f "$WEB_DIR/adminer.php" ]; then
    echo "❌ Adminer chưa được setup"
    echo "📦 Đang setup Adminer..."
    "$(dirname "$0")/setup_adminer.sh"
fi

cd "$WEB_DIR"

echo "🚀 Đang khởi động Adminer server..."
echo "🌐 Mở browser và vào: http://localhost:$PORT/adminer.php"
echo ""
echo "📋 Thông tin đăng nhập:"
echo "   System: MySQL"
echo "   Server: localhost:3306"
echo "   Username: constructos_user"
echo "   Password: constructos123"
echo "   Database: constructos"
echo ""
echo "⏹️  Nhấn Ctrl+C để dừng server"
echo ""

php -S localhost:$PORT
