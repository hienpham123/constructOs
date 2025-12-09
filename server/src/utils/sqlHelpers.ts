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

/**
 * Build SQL IN clause with string values
 * Works with both MySQL and PostgreSQL
 * Uses single quotes for string literals (compatible with both databases)
 * @param values Array of string values
 * @returns SQL IN clause string (e.g., "IN ('value1', 'value2')")
 * @example
 * buildInClause(['owner', 'admin']) // returns "IN ('owner', 'admin')"
 */
export function buildInClause(values: string[]): string {
  if (values.length === 0) {
    return 'IN ()';
  }
  // Escape single quotes in values and wrap in single quotes
  const escapedValues = values.map(v => `'${v.replace(/'/g, "''")}'`);
  return `IN (${escapedValues.join(', ')})`;
}

/**
 * Build SQL IN clause with parameterized placeholders
 * Works with both MySQL and PostgreSQL
 * @param count Number of values
 * @returns Object with SQL clause and parameter array
 * @example
 * const { clause, params } = buildParameterizedInClause(['owner', 'admin']);
 * // clause: "IN (?, ?)" for MySQL or "IN ($1, $2)" for PostgreSQL
 * // params: ['owner', 'admin']
 */
export function buildParameterizedInClause(values: string[]): {
  clause: string;
  params: string[];
} {
  if (values.length === 0) {
    return { clause: 'IN ()', params: [] };
  }
  
  // For MySQL, use ? placeholders
  // For PostgreSQL, the convertMySQLToPostgreSQL function will convert ? to $1, $2, etc.
  const placeholders = values.map(() => '?').join(', ');
  return {
    clause: `IN (${placeholders})`,
    params: values,
  };
}

