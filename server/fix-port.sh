#!/bin/bash

# Script để kill process đang dùng port 2222

PORT=2222

echo "🔍 Đang tìm process đang dùng port $PORT..."

PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
    echo "✅ Port $PORT không bị chiếm. Bạn có thể chạy server!"
    exit 0
fi

echo "⚠️  Tìm thấy process $PID đang dùng port $PORT"
echo "🔄 Đang dừng process..."

kill -9 $PID 2>/dev/null

sleep 1

# Kiểm tra lại
if lsof -ti:$PORT > /dev/null 2>&1; then
    echo "❌ Không thể dừng process. Thử kill force..."
    kill -9 $PID 2>/dev/null
    sleep 1
fi

if lsof -ti:$PORT > /dev/null 2>&1; then
    echo "❌ Vẫn không thể giải phóng port $PORT"
    echo "💡 Hãy thử chạy thủ công:"
    echo "   lsof -ti:$PORT | xargs kill -9"
    exit 1
else
    echo "✅ Đã giải phóng port $PORT thành công!"
    echo "🚀 Bây giờ bạn có thể chạy: npm run dev"
    exit 0
fi

