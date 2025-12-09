import { dbType } from '../config/db.js';

/**
 * Generate SQL query to calculate minutes difference between a timestamp and NOW()
 * Works with both MySQL and PostgreSQL
 * @param timestampColumn Column name (e.g., 'created_at')
 * @returns SQL expression string
 */
export function getMinutesAgoQuery(timestampColumn: string): string {
  if (dbType === 'mysql') {
    // MySQL syntax: TIMESTAMPDIFF(MINUTE, created_at, NOW())
    return `TIMESTAMPDIFF(MINUTE, ${timestampColumn}, NOW())`;
  } else {
    // PostgreSQL syntax: EXTRACT(EPOCH FROM (NOW() - created_at)) / 60
    return `EXTRACT(EPOCH FROM (NOW() - ${timestampColumn})) / 60`;
  }
}

/**
 * Generate SQL query to get minutes difference as a SELECT statement
 * @param timestampColumn Column name (e.g., 'created_at')
 * @param tableName Table name (e.g., 'direct_messages')
 * @param whereClause WHERE clause (e.g., 'id = ?')
 * @returns Complete SQL query string
 */
export function getMinutesAgoSelectQuery(
  timestampColumn: string,
  tableName: string,
  whereClause: string
): string {
  const minutesAgoExpr = getMinutesAgoQuery(timestampColumn);
  return `SELECT ${minutesAgoExpr} as minutes_ago FROM ${tableName} WHERE ${whereClause}`;
}

