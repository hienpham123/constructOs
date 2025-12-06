#!/bin/bash

# Script để setup Adminer (web interface cho MySQL)

echo "🚀 Đang setup Adminer..."

# Kiểm tra PHP
if ! command -v php &> /dev/null; then
    echo "❌ PHP chưa được cài đặt"
    echo "📦 Đang cài PHP..."
    brew install php
fi

echo "✅ PHP đã sẵn sàng: $(php --version | head -n 1)"

# Tạo thư mục web
WEB_DIR="/Users/hochihien/Code/constructOS/database/web"
mkdir -p "$WEB_DIR"
cd "$WEB_DIR"

# Download Adminer nếu chưa có
if [ ! -f "adminer.php" ]; then
    echo "📥 Đang download Adminer..."
    curl -L -o adminer.php https://www.adminer.org/latest.php
    echo "✅ Đã download Adminer"
else
    echo "✅ Adminer đã tồn tại"
fi

# Tạo file index.html để redirect
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=adminer.php">
    <title>Adminer - MySQL Web Interface</title>
</head>
<body>
    <p>Đang chuyển đến Adminer... <a href="adminer.php">Click here</a></p>
</body>
</html>
EOF

echo ""
echo "✅ Setup hoàn tất!"
echo ""
echo "📋 Thông tin kết nối:"
echo "   System: MySQL"
echo "   Server: localhost:3306"
echo "   Username: constructos_user"
echo "   Password: constructos123"
echo "   Database: constructos"
echo ""
echo "🚀 Để chạy server, chạy lệnh:"
echo "   cd $WEB_DIR"
echo "   php -S localhost:8080"
echo ""
echo "🌐 Sau đó mở browser: http://localhost:8080"
echo ""

