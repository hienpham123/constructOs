using ConstructOs.Server.Config;

namespace ConstructOs.Server.Utils;

public static class SqlHelpers
{
    /// <summary>
    /// Generate SQL query to calculate minutes difference between a timestamp and NOW()
    /// Works with both MySQL and PostgreSQL
    /// </summary>
    public static string GetMinutesAgoQuery(IDatabaseService db, string timestampColumn)
    {
        var dbType = db.GetDatabaseType();
        if (dbType == "mysql")
        {
            // MySQL syntax: TIMESTAMPDIFF(MINUTE, created_at, NOW())
            return $"TIMESTAMPDIFF(MINUTE, {timestampColumn}, NOW())";
        }
        else
        {
            // PostgreSQL syntax: EXTRACT(EPOCH FROM (NOW() - created_at)) / 60
            return $"EXTRACT(EPOCH FROM (NOW() - {timestampColumn})) / 60";
        }
    }

    /// <summary>
    /// Generate SQL query to get minutes difference as a SELECT statement
    /// </summary>
    public static string GetMinutesAgoSelectQuery(IDatabaseService db, string timestampColumn, string tableName, string whereClause)
    {
        var minutesAgoExpr = GetMinutesAgoQuery(db, timestampColumn);
        return $"SELECT {minutesAgoExpr} as minutes_ago FROM {tableName} WHERE {whereClause}";
    }

    /// <summary>
    /// Build SQL IN clause with string values
    /// Works with both MySQL and PostgreSQL
    /// </summary>
    public static string BuildInClause(string[] values)
    {
        if (values.Length == 0)
        {
            return "IN ()";
        }
        // Escape single quotes in values and wrap in single quotes
        var escapedValues = values.Select(v => $"'{v.Replace("'", "''")}'");
        return $"IN ({string.Join(", ", escapedValues)})";
    }

    /// <summary>
    /// Build SQL IN clause with parameterized placeholders
    /// Works with both MySQL and PostgreSQL
    /// </summary>
    public static (string clause, string[] parameters) BuildParameterizedInClause(string[] values)
    {
        if (values.Length == 0)
        {
            return ("IN ()", Array.Empty<string>());
        }
        
        // For MySQL, use ? placeholders
        // For PostgreSQL, the DatabaseService will convert ? to $1, $2, etc.
        var placeholders = string.Join(", ", values.Select(_ => "?"));
        return ($"IN ({placeholders})", values);
    }
}

