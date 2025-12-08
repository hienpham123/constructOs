#!/bin/bash
# Quick export script with password prompt

DB_NAME="constructos"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="$(dirname "$0")"

echo "Exporting database: $DB_NAME"
echo "Files will be saved to: $OUTPUT_DIR"
echo ""

# Export full database
echo "📤 Exporting full database (schema + data)..."
mysqldump -u root -p --single-transaction --routines --triggers "$DB_NAME" > "$OUTPUT_DIR/${DB_NAME}_full_${TIMESTAMP}.sql"
echo "✅ Full export: ${DB_NAME}_full_${TIMESTAMP}.sql"

# Export schema only
echo ""
echo "📤 Exporting schema only..."
mysqldump -u root -p --no-data --routines --triggers "$DB_NAME" > "$OUTPUT_DIR/${DB_NAME}_schema_only_${TIMESTAMP}.sql"
echo "✅ Schema export: ${DB_NAME}_schema_only_${TIMESTAMP}.sql"

# Export data only
echo ""
echo "📤 Exporting data only..."
mysqldump -u root -p --no-create-info --single-transaction "$DB_NAME" > "$OUTPUT_DIR/${DB_NAME}_data_only_${TIMESTAMP}.sql"
echo "✅ Data export: ${DB_NAME}_data_only_${TIMESTAMP}.sql"

echo ""
echo "✅ Export completed!"
ls -lh "$OUTPUT_DIR"/*${TIMESTAMP}.sql

