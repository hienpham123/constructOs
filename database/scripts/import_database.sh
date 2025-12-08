#!/bin/bash

# Import Database Script
# Imports database from SQL file
# Usage: ./import_database.sh [sql_file] [database_name]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if SQL file is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: SQL file path is required${NC}"
    echo ""
    echo "Usage: ./import_database.sh <sql_file> [database_name]"
    echo ""
    echo "Examples:"
    echo "  ./import_database.sh ../../database/exports/constructOS_export_20240101_120000.sql"
    echo "  ./import_database.sh ../../database/mysql_schema.sql constructOS"
    echo ""
    exit 1
fi

SQL_FILE="$1"

# Check if file exists
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}❌ Error: File not found: $SQL_FILE${NC}"
    exit 1
fi

# Get database name from argument or .env file
if [ -z "$2" ]; then
    # Try to read from .env file
    if [ -f "../../server/.env" ]; then
        DB_NAME=$(grep "^DB_NAME=" ../../server/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    else
        DB_NAME="constructOS"
    fi
else
    DB_NAME="$2"
fi

# Get MySQL credentials from .env or use defaults
if [ -f "../../server/.env" ]; then
    DB_HOST=$(grep "^DB_HOST=" ../../server/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "localhost")
    DB_PORT=$(grep "^DB_PORT=" ../../server/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "3306")
    DB_USER=$(grep "^DB_USER=" ../../server/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "root")
    DB_PASSWORD=$(grep "^DB_PASSWORD=" ../../server/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "")
else
    DB_HOST="localhost"
    DB_PORT="3306"
    DB_USER="root"
    DB_PASSWORD=""
fi

echo -e "${GREEN}📥 Importing database: $DB_NAME${NC}"
echo -e "${YELLOW}SQL file: $SQL_FILE${NC}"
echo ""

# Build mysql command
MYSQL_CMD="mysql"
if [ -n "$DB_HOST" ] && [ "$DB_HOST" != "localhost" ]; then
    MYSQL_CMD="$MYSQL_CMD -h $DB_HOST"
fi
if [ -n "$DB_PORT" ] && [ "$DB_PORT" != "3306" ]; then
    MYSQL_CMD="$MYSQL_CMD -P $DB_PORT"
fi
if [ -n "$DB_USER" ]; then
    MYSQL_CMD="$MYSQL_CMD -u $DB_USER"
fi
if [ -n "$DB_PASSWORD" ]; then
    MYSQL_CMD="$MYSQL_CMD -p$DB_PASSWORD"
fi

# Check if database exists
echo -e "${YELLOW}🔍 Checking if database exists...${NC}"
DB_EXISTS=$($MYSQL_CMD -e "SHOW DATABASES LIKE '$DB_NAME';" 2>/dev/null | grep -c "$DB_NAME" || echo "0")

if [ "$DB_EXISTS" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' does not exist. Creating...${NC}"
    if $MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null; then
        echo -e "${GREEN}✅ Database '$DB_NAME' created successfully${NC}"
    else
        echo -e "${RED}❌ Error creating database. Trying with password prompt...${NC}"
        if [ -z "$DB_PASSWORD" ]; then
            mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        fi
    fi
else
    echo -e "${GREEN}✅ Database '$DB_NAME' already exists${NC}"
fi

# Confirm before importing (if database has data)
if [ "$DB_EXISTS" -ne 0 ]; then
    TABLE_COUNT=$($MYSQL_CMD -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$DB_NAME';" 2>/dev/null | tail -n 1 || echo "0")
    if [ "$TABLE_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Database '$DB_NAME' already has $TABLE_COUNT tables.${NC}"
        read -p "Do you want to continue? This will overwrite existing data. (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Cancelled.${NC}"
            exit 0
        fi
    fi
fi

# Import SQL file
echo -e "${YELLOW}📥 Importing SQL file...${NC}"
echo -e "${YELLOW}This may take a while depending on file size...${NC}"

if $MYSQL_CMD "$DB_NAME" < "$SQL_FILE" 2>/dev/null; then
    echo -e "${GREEN}✅ Database imported successfully!${NC}"
else
    echo -e "${RED}❌ Error importing database. Trying with password prompt...${NC}"
    if [ -z "$DB_PASSWORD" ]; then
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" < "$SQL_FILE"
    else
        echo -e "${RED}❌ Import failed. Please check:${NC}"
        echo "   1. MySQL credentials are correct"
        echo "   2. Database user has sufficient permissions"
        echo "   3. SQL file is valid"
        exit 1
    fi
fi

# Show summary
echo ""
echo -e "${GREEN}✅ Import completed!${NC}"
echo ""
echo -e "${YELLOW}📊 Database summary:${NC}"
TABLE_COUNT=$($MYSQL_CMD -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$DB_NAME';" 2>/dev/null | tail -n 1 || echo "0")
echo "   Tables: $TABLE_COUNT"

# Count records in main tables
if [ "$TABLE_COUNT" -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}📈 Record counts (if tables exist):${NC}"
    
    for TABLE in users projects materials personnel roles; do
        COUNT=$($MYSQL_CMD -e "SELECT COUNT(*) FROM \`$DB_NAME\`.\`$TABLE\`;" 2>/dev/null | tail -n 1 || echo "N/A")
        if [ "$COUNT" != "N/A" ]; then
            echo "   $TABLE: $COUNT records"
        fi
    done
fi

echo ""
echo -e "${GREEN}🎉 Done! Your database is ready to use.${NC}"

