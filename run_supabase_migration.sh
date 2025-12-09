#!/bin/bash
# Script helper để chạy migration trên Supabase
# Usage: ./run_supabase_migration.sh

echo "🚀 Supabase Task Migration Helper"
echo ""
echo "Vui lòng nhập thông tin Supabase:"
echo ""

read -p "DB_HOST (ví dụ: db.xxxxx.supabase.co): " DB_HOST
read -p "DB_PORT (5432 hoặc 6543 cho IPv4): " DB_PORT
read -p "DB_USER (ví dụ: postgres.xxxxx): " DB_USER
read -s -p "DB_PASSWORD: " DB_PASSWORD
echo ""
read -p "DB_NAME (mặc định: postgres): " DB_NAME
DB_NAME=${DB_NAME:-postgres}

echo ""
echo "🔌 Đang kết nối và chạy migration..."

cd server
DB_TYPE=postgres \
DB_HOST="$DB_HOST" \
DB_PORT="$DB_PORT" \
DB_USER="$DB_USER" \
DB_PASSWORD="$DB_PASSWORD" \
DB_NAME="$DB_NAME" \
npx tsx src/scripts/runTaskMigrationSupabase.ts
