#!/bin/bash

# Export Database Script
# Exports database schema and data to SQL files
# Usage: ./export_database.sh [database_name] [output_dir]

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
    else
        DB_NAME="constructOS"
    fi
else
    DB_NAME="$1"
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

# Output directory
OUTPUT_DIR="${2:-../../database/exports}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="$OUTPUT_DIR/${DB_NAME}_export_${TIMESTAMP}.sql"
SCHEMA_FILE="$OUTPUT_DIR/${DB_NAME}_schema_${TIMESTAMP}.sql"
DATA_FILE="$OUTPUT_DIR/${DB_NAME}_data_${TIMESTAMP}.sql"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo -e "${GREEN}📦 Exporting database: $DB_NAME${NC}"
echo -e "${YELLOW}Output directory: $OUTPUT_DIR${NC}"
echo ""

# Build mysqldump command
MYSQLDUMP_CMD="mysqldump"
if [ -n "$DB_HOST" ] && [ "$DB_HOST" != "localhost" ]; then
    MYSQLDUMP_CMD="$MYSQLDUMP_CMD -h $DB_HOST"
fi
if [ -n "$DB_PORT" ] && [ "$DB_PORT" != "3306" ]; then
    MYSQLDUMP_CMD="$MYSQLDUMP_CMD -P $DB_PORT"
fi
if [ -n "$DB_USER" ]; then
    MYSQLDUMP_CMD="$MYSQLDUMP_CMD -u $DB_USER"
fi
if [ -n "$DB_PASSWORD" ]; then
    MYSQLDUMP_CMD="$MYSQLDUMP_CMD -p$DB_PASSWORD"
fi

# Export full database (schema + data)
echo -e "${YELLOW}📤 Exporting full database (schema + data)...${NC}"
if $MYSQLDUMP_CMD --single-transaction --routines --triggers "$DB_NAME" > "$OUTPUT_FILE" 2>/dev/null; then
    # Check if file is empty or contains error
    if [ ! -s "$OUTPUT_FILE" ] || grep -q "Access denied\|Got error" "$OUTPUT_FILE" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Password required. Please enter MySQL password for user '$DB_USER':${NC}"
        mysqldump --single-transaction --routines --triggers -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" > "$OUTPUT_FILE" 2>&1
        # Check again if export succeeded
        if [ -s "$OUTPUT_FILE" ] && ! grep -q "Access denied\|Got error" "$OUTPUT_FILE" 2>/dev/null; then
            echo -e "${GREEN}✅ Full export saved to: $OUTPUT_FILE${NC}"
            FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
            echo -e "   File size: $FILE_SIZE"
        else
            echo -e "${RED}❌ Export failed. Please check your MySQL credentials.${NC}"
            rm -f "$OUTPUT_FILE"
        fi
    else
        echo -e "${GREEN}✅ Full export saved to: $OUTPUT_FILE${NC}"
        FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
        echo -e "   File size: $FILE_SIZE"
    fi
else
    echo -e "${YELLOW}⚠️  Password required. Please enter MySQL password for user '$DB_USER':${NC}"
    mysqldump --single-transaction --routines --triggers -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" > "$OUTPUT_FILE" 2>&1
    # Check if export succeeded
    if [ -s "$OUTPUT_FILE" ] && ! grep -q "Access denied\|Got error" "$OUTPUT_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ Full export saved to: $OUTPUT_FILE${NC}"
        FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
        echo -e "   File size: $FILE_SIZE"
    else
        echo -e "${RED}❌ Export failed. Please check your MySQL credentials.${NC}"
        rm -f "$OUTPUT_FILE"
    fi
fi

# Export schema only (structure)
echo -e "${YELLOW}📤 Exporting schema only (structure)...${NC}"
if $MYSQLDUMP_CMD --no-data --routines --triggers "$DB_NAME" > "$SCHEMA_FILE" 2>/dev/null; then
    echo -e "${GREEN}✅ Schema export saved to: $SCHEMA_FILE${NC}"
    # Get file size
    FILE_SIZE=$(du -h "$SCHEMA_FILE" | cut -f1)
    echo -e "   File size: $FILE_SIZE"
else
    echo -e "${RED}❌ Error exporting schema. Trying with password prompt...${NC}"
    if [ -z "$DB_PASSWORD" ]; then
        mysqldump --no-data --routines --triggers -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" > "$SCHEMA_FILE"
    fi
fi

# Export data only (no structure)
echo -e "${YELLOW}📤 Exporting data only (no structure)...${NC}"
if $MYSQLDUMP_CMD --no-create-info --single-transaction "$DB_NAME" > "$DATA_FILE" 2>/dev/null; then
    # Check if file is empty or contains error
    if [ ! -s "$DATA_FILE" ] || grep -q "Access denied\|Got error" "$DATA_FILE" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Password required. Please enter MySQL password for user '$DB_USER':${NC}"
        mysqldump --no-create-info --single-transaction -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" > "$DATA_FILE" 2>&1
        # Check again if export succeeded
        if [ -s "$DATA_FILE" ] && ! grep -q "Access denied\|Got error" "$DATA_FILE" 2>/dev/null; then
            echo -e "${GREEN}✅ Data export saved to: $DATA_FILE${NC}"
            FILE_SIZE=$(du -h "$DATA_FILE" | cut -f1)
            echo -e "   File size: $FILE_SIZE"
        else
            echo -e "${RED}❌ Export failed. Please check your MySQL credentials.${NC}"
            rm -f "$DATA_FILE"
        fi
    else
        echo -e "${GREEN}✅ Data export saved to: $DATA_FILE${NC}"
        FILE_SIZE=$(du -h "$DATA_FILE" | cut -f1)
        echo -e "   File size: $FILE_SIZE"
    fi
else
    echo -e "${YELLOW}⚠️  Password required. Please enter MySQL password for user '$DB_USER':${NC}"
    mysqldump --no-create-info --single-transaction -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" > "$DATA_FILE" 2>&1
    # Check if export succeeded
    if [ -s "$DATA_FILE" ] && ! grep -q "Access denied\|Got error" "$DATA_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ Data export saved to: $DATA_FILE${NC}"
        FILE_SIZE=$(du -h "$DATA_FILE" | cut -f1)
        echo -e "   File size: $FILE_SIZE"
    else
        echo -e "${RED}❌ Export failed. Please check your MySQL credentials.${NC}"
        rm -f "$DATA_FILE"
    fi
fi

echo ""
echo -e "${GREEN}✅ Export completed!${NC}"
echo ""
echo -e "${YELLOW}📁 Exported files:${NC}"
echo "   Full export:    $OUTPUT_FILE"
echo "   Schema only:    $SCHEMA_FILE"
echo "   Data only:      $DATA_FILE"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "   - Full export includes both schema and data (use for complete backup)"
echo "   - Schema only: structure without data (use for setup on new machine)"
echo "   - Data only: data without structure (use to import data to existing schema)"
echo ""
echo -e "${YELLOW}📤 To share with team:${NC}"
echo "   - Commit the export files to git (if small enough)"
echo "   - Or share via cloud storage (Dropbox, Google Drive, etc.)"
echo "   - Or use: git lfs track '*.sql' for large files"

