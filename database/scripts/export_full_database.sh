#!/bin/bash

# Export Full Database Script (with data)
# This script will prompt for MySQL password

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get database name from argument or .env file
if [ -z "$1" ]; then
    # Try to read from .env file
    if [ -f "../../server/.env" ]; then
        DB_NAME=$(grep "^DB_NAME=" ../../server/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
        DB_HOST=$(grep "^DB_HOST=" ../../server/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "localhost")
        DB_PORT=$(grep "^DB_PORT=" ../../server/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "3306")
        DB_USER=$(grep "^DB_USER=" ../../server/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "root")
    else
        DB_NAME="constructOS"
        DB_HOST="localhost"
        DB_PORT="3306"
        DB_USER="root"
    fi
else
    DB_NAME="$1"
    DB_HOST="${2:-localhost}"
    DB_PORT="${3:-3306}"
    DB_USER="${4:-root}"
fi

# Output directory
OUTPUT_DIR="../../database/exports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="$OUTPUT_DIR/${DB_NAME}_full_export_${TIMESTAMP}.sql"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo -e "${GREEN}📦 Exporting FULL database: $DB_NAME${NC}"
echo -e "${YELLOW}Host: $DB_HOST:$DB_PORT${NC}"
echo -e "${YELLOW}User: $DB_USER${NC}"
echo -e "${YELLOW}Output file: $OUTPUT_FILE${NC}"
echo ""
echo -e "${YELLOW}⚠️  You will be prompted for MySQL password${NC}"
echo ""

# Export full database (schema + data)
echo -e "${YELLOW}📤 Exporting full database (schema + data)...${NC}"
echo ""

mysqldump --single-transaction --routines --triggers \
    -h "$DB_HOST" \
    -P "$DB_PORT" \
    -u "$DB_USER" \
    -p \
    "$DB_NAME" > "$OUTPUT_FILE"

# Check if export succeeded
if [ $? -eq 0 ] && [ -s "$OUTPUT_FILE" ]; then
    # Check if file contains error messages
    if grep -q "Access denied\|Got error" "$OUTPUT_FILE" 2>/dev/null; then
        echo ""
        echo -e "${RED}❌ Export failed: MySQL authentication error${NC}"
        echo -e "${YELLOW}Please check your username and password${NC}"
        rm -f "$OUTPUT_FILE"
        exit 1
    else
        echo ""
        echo -e "${GREEN}✅ Full export completed successfully!${NC}"
        FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
        RECORD_COUNT=$(grep -c "^INSERT INTO" "$OUTPUT_FILE" 2>/dev/null || echo "0")
        TABLE_COUNT=$(grep -c "^CREATE TABLE" "$OUTPUT_FILE" 2>/dev/null || echo "0")
        
        echo ""
        echo -e "${GREEN}📊 Export Summary:${NC}"
        echo -e "   File: $OUTPUT_FILE"
        echo -e "   Size: $FILE_SIZE"
        echo -e "   Tables: $TABLE_COUNT"
        echo -e "   Data inserts: $RECORD_COUNT"
        echo ""
        echo -e "${YELLOW}💡 Next steps:${NC}"
        echo -e "   - Share this file with your team"
        echo -e "   - Import on another machine: ./import_database.sh $OUTPUT_FILE"
        echo ""
    fi
else
    echo ""
    echo -e "${RED}❌ Export failed${NC}"
    echo -e "${YELLOW}Please check:${NC}"
    echo -e "   - MySQL server is running"
    echo -e "   - Database name is correct: $DB_NAME"
    echo -e "   - User has permissions"
    exit 1
fi

