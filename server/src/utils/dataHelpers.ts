// Helper functions for data normalization

/**
 * Convert empty string to null for database
 */
export function normalizeString(value: string | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
}

/**
 * Convert Date to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
 */
export function toMySQLDateTime(date?: Date | string): string {
  const d = date ? new Date(date) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Convert Date to MySQL date format (YYYY-MM-DD)
 */
export function toMySQLDate(date?: Date | string): string {
  const d = date ? new Date(date) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Normalize projectId and get projectName if needed
 */
export async function normalizeProject(
  projectId: string | undefined | null,
  projectName: string | undefined | null,
  query: (sql: string, params?: any[]) => Promise<any>
): Promise<{ projectId: string | null; projectName: string | null }> {
  const normalizedProjectId = normalizeString(projectId);
  
  if (!normalizedProjectId) {
    return { projectId: null, projectName: null };
  }
  
  // If projectName is not provided, fetch it from database
  if (!projectName || projectName.trim() === '') {
    try {
      const project = await query(
        'SELECT name FROM projects WHERE id = ?',
        [normalizedProjectId]
      ) as any[];
      return {
        projectId: normalizedProjectId,
        projectName: project.length > 0 ? project[0].name : null,
      };
    } catch (error) {
      console.error('Error fetching project name:', error);
      return { projectId: normalizedProjectId, projectName: null };
    }
  }
  
  return { projectId: normalizedProjectId, projectName };
}

/**
 * Build WHERE clause for search
 * @param search - Search term
 * @param searchFields - Array of field names to search in
 * @param queryParams - Array to push query parameters to
 * @returns WHERE clause string
 */
export function buildSearchClause(
  search: string | undefined | null,
  searchFields: string[],
  queryParams: any[]
): string {
  if (!search || typeof search !== 'string' || !search.trim()) {
    return '';
  }

  const searchTerm = `%${search.trim()}%`;
  // Push searchTerm for each field
  searchFields.forEach(() => queryParams.push(searchTerm));
  
  return `WHERE (${searchFields.map(field => `${field} LIKE ?`).join(' OR ')})`;
}

/**
 * Build ORDER BY clause with validation
 * @param sortBy - Field name to sort by
 * @param allowedFields - Array of allowed field names
 * @param defaultField - Default field if sortBy is invalid
 * @param sortOrder - 'asc' or 'desc'
 * @returns ORDER BY clause string
 */
export function buildSortClause(
  sortBy: string | undefined | null,
  allowedFields: string[],
  defaultField: string,
  sortOrder: string | undefined | null
): string {
  const validSortBy = allowedFields.includes(sortBy as string) ? sortBy : defaultField;
  const validSortOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';
  
  return `ORDER BY ${validSortBy} ${validSortOrder}`;
}

