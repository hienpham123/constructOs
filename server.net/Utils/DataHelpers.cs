using ConstructOs.Server.Config;

namespace ConstructOs.Server.Utils;

public static class DataHelpers
{
    /// <summary>
    /// Convert empty string to null for database
    /// </summary>
    public static string? NormalizeString(string? value)
    {
        if (value == null) return null;
        if (string.IsNullOrWhiteSpace(value)) return null;
        return value;
    }

    /// <summary>
    /// Convert Date to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
    /// </summary>
    public static string ToMySQLDateTime(DateTime? date = null)
    {
        var d = date ?? DateTime.Now;
        return d.ToString("yyyy-MM-dd HH:mm:ss");
    }

    /// <summary>
    /// Convert Date to MySQL date format (YYYY-MM-DD)
    /// </summary>
    public static string ToMySQLDate(DateTime? date = null)
    {
        var d = date ?? DateTime.Now;
        return d.ToString("yyyy-MM-dd");
    }

    /// <summary>
    /// Convert Date to MySQL date format from string
    /// </summary>
    public static string? ToMySQLDate(string? dateString)
    {
        if (string.IsNullOrEmpty(dateString)) return null;
        if (DateTime.TryParse(dateString, out var date))
        {
            return date.ToString("yyyy-MM-dd");
        }
        return null;
    }

    /// <summary>
    /// Build WHERE clause for search
    /// </summary>
    public static string BuildSearchClause(string? search, string[] searchFields, out List<object> queryParams)
    {
        queryParams = new List<object>();
        
        if (string.IsNullOrWhiteSpace(search))
        {
            return "";
        }

        var searchTerm = $"%{search.Trim()}%";
        var conditions = new List<string>();
        
        foreach (var field in searchFields)
        {
            conditions.Add($"{field} LIKE ?");
            queryParams.Add(searchTerm);
        }
        
        return $"WHERE ({string.Join(" OR ", conditions)})";
    }

    /// <summary>
    /// Normalize projectId and get projectName if needed
    /// </summary>
    public static async Task<(string? projectId, string? projectName)> NormalizeProject(
        string? projectId,
        string? projectName,
        IDatabaseService db)
    {
        var normalizedProjectId = NormalizeString(projectId);
        
        if (string.IsNullOrEmpty(normalizedProjectId))
        {
            return (null, null);
        }
        
        // If projectName is not provided, fetch it from database
        if (string.IsNullOrWhiteSpace(projectName))
        {
            try
            {
                var project = await db.QueryFirstOrDefaultAsync<dynamic>(
                    "SELECT name FROM projects WHERE id = ?",
                    new { projectId = normalizedProjectId });
                
                return (normalizedProjectId, project?.name?.ToString());
            }
            catch
            {
                return (normalizedProjectId, null);
            }
        }
        
        return (normalizedProjectId, projectName);
    }

    /// <summary>
    /// Build ORDER BY clause with validation
    /// </summary>
    public static string BuildSortClause(string? sortBy, string[] allowedFields, string defaultField, string? sortOrder)
    {
        var validSortBy = allowedFields.Contains(sortBy ?? "") ? sortBy! : defaultField;
        var validSortOrder = sortOrder?.ToLower() == "desc" ? "DESC" : "ASC";
        
        return $"ORDER BY {validSortBy} {validSortOrder}";
    }
}

