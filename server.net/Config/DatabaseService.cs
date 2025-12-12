using Dapper;
using MySql.Data.MySqlClient;
using Npgsql;
using System.Data;
using System.Text.RegularExpressions;

namespace ConstructOs.Server.Config;

public interface IDatabaseService
{
    Task<IEnumerable<T>> QueryAsync<T>(string sql, object? parameters = null);
    Task<T?> QueryFirstOrDefaultAsync<T>(string sql, object? parameters = null);
    Task<int> ExecuteAsync(string sql, object? parameters = null);
    Task<T> TransactionAsync<T>(Func<IDbConnection, Task<T>> callback);
    string GetDatabaseType();
    IDbConnection GetConnection();
}

public class DatabaseService : IDatabaseService
{
    private readonly IConfiguration _configuration;
    private readonly string _connectionString;
    private readonly string _dbType;

    public DatabaseService(IConfiguration configuration)
    {
        _configuration = configuration;
        _dbType = DetermineDatabaseType();
        _connectionString = BuildConnectionString();
        
        Console.WriteLine($"📦 Using {_dbType} database");
        Console.WriteLine($"   Environment: {_configuration["ASPNETCORE_ENVIRONMENT"] ?? "Development"}");
    }

    private string DetermineDatabaseType()
    {
        // 1. Check DB_TYPE env variable first
        var dbType = _configuration["DB_TYPE"];
        if (!string.IsNullOrEmpty(dbType))
        {
            if (dbType.ToLower() == "mysql") return "mysql";
            if (dbType.ToLower() == "postgres" || dbType.ToLower() == "postgresql") return "postgres";
        }

        // 2. Check environment
        var nodeEnv = _configuration["ASPNETCORE_ENVIRONMENT"] ?? _configuration["NODE_ENV"] ?? "Development";
        var dbHost = _configuration["DB_HOST"] ?? "";

        if (nodeEnv == "Production" || nodeEnv == "Local")
        {
            if (dbHost.Contains("supabase") || dbHost.Contains("render") || 
                dbHost.Contains("railway") || dbHost.Contains("postgres"))
            {
                return "postgres";
            }
            return "mysql";
        }

        if (nodeEnv == "Development")
        {
            if (dbHost.Contains("supabase") || dbHost.Contains("render") || 
                dbHost.Contains("railway") || dbHost.Contains("postgres"))
            {
                return "postgres";
            }
            return "mysql";
        }

        // 3. Check port
        var dbPort = _configuration["DB_PORT"] ?? "3306";
        if (dbPort == "3306") return "mysql";
        if (dbPort == "5432" || dbPort == "6543") return "postgres";

        // 4. Default: MySQL
        return "mysql";
    }

    private string BuildConnectionString()
    {
        var host = _configuration["DB_HOST"] ?? "localhost";
        var port = _configuration["DB_PORT"] ?? (_dbType == "mysql" ? "3306" : "5432");
        var user = _configuration["DB_USER"] ?? (_dbType == "mysql" ? "root" : "postgres");
        var password = _configuration["DB_PASSWORD"] ?? "";
        var database = _configuration["DB_NAME"] ?? "constructos";

        if (_dbType == "mysql")
        {
            return $"Server={host};Port={port};Database={database};User Id={user};Password={password};";
        }
        else
        {
            var ssl = _configuration["DB_SSL"] == "true" || host.Contains("supabase");
            return $"Host={host};Port={port};Database={database};Username={user};Password={password};SSL Mode={(ssl ? "Require" : "Prefer")};";
        }
    }

    public IDbConnection GetConnection()
    {
        if (_dbType == "mysql")
        {
            return new MySqlConnection(_connectionString);
        }
        else
        {
            return new NpgsqlConnection(_connectionString);
        }
    }

    private (string sql, object? parameters) ConvertSQLAndParameters(string sql, object? parameters)
    {
        if (parameters == null) return (sql, null);

        // Count ? placeholders in SQL
        var placeholderCount = Regex.Matches(sql, @"\?").Count;
        if (placeholderCount == 0) return (sql, parameters);

        if (_dbType == "postgres")
        {
            // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
            int paramIndex = 1;
            var convertedSql = Regex.Replace(sql, @"\?", m => $"${paramIndex++}");
            
            // For PostgreSQL, Dapper needs parameters as array or dictionary
            // Extract parameter values in order from anonymous object
            var paramList = new List<object?>();
            var props = parameters.GetType().GetProperties();
            
            // If we have more placeholders than properties, we might be using array
            if (parameters is Array arr)
            {
                return (convertedSql, arr);
            }
            
            // For anonymous objects, extract values in property order
            // Note: Property order in anonymous objects is not guaranteed in all .NET versions
            // This is a best-effort approach
            foreach (var prop in props)
            {
                paramList.Add(prop.GetValue(parameters));
            }
            
            // If we don't have enough parameters, return as-is and let Dapper handle it
            if (paramList.Count < placeholderCount)
            {
                // Try to use Dapper's parameter expansion
                return (convertedSql, parameters);
            }
            
            return (convertedSql, paramList.ToArray());
        }
        
        // For MySQL, Dapper can handle ? placeholders with anonymous objects
        // But we need to convert to named parameters or use array
        // Let's use Dapper's built-in support for ? with anonymous objects
        // by converting to named parameters
        var mysqlParams = new DynamicParameters();
        var props2 = parameters.GetType().GetProperties();
        int index = 0;
        
        // Convert ? to named parameters for better Dapper support
        var mysqlSql = sql;
        foreach (var prop in props2)
        {
            if (index < placeholderCount)
            {
                var paramName = $"@p{index}";
                mysqlParams.Add(paramName, prop.GetValue(parameters));
                mysqlSql = Regex.Replace(mysqlSql, @"\?", paramName, 1);
                index++;
            }
        }
        
        // If we still have ? placeholders, keep original approach
        if (mysqlSql.Contains("?"))
        {
            return (sql, parameters);
        }
        
        return (mysqlSql, mysqlParams);
    }

    public string GetDatabaseType() => _dbType;

    public async Task<IEnumerable<T>> QueryAsync<T>(string sql, object? parameters = null)
    {
        var (convertedSql, convertedParams) = ConvertSQLAndParameters(sql, parameters);
        using var connection = GetConnection();
        await connection.OpenAsync();
        
        if (convertedParams is DynamicParameters dp)
        {
            return await connection.QueryAsync<T>(convertedSql, dp);
        }
        return await connection.QueryAsync<T>(convertedSql, convertedParams);
    }

    public async Task<T?> QueryFirstOrDefaultAsync<T>(string sql, object? parameters = null)
    {
        var (convertedSql, convertedParams) = ConvertSQLAndParameters(sql, parameters);
        using var connection = GetConnection();
        await connection.OpenAsync();
        
        if (convertedParams is DynamicParameters dp)
        {
            return await connection.QueryFirstOrDefaultAsync<T>(convertedSql, dp);
        }
        return await connection.QueryFirstOrDefaultAsync<T>(convertedSql, convertedParams);
    }

    public async Task<int> ExecuteAsync(string sql, object? parameters = null)
    {
        var (convertedSql, convertedParams) = ConvertSQLAndParameters(sql, parameters);
        using var connection = GetConnection();
        await connection.OpenAsync();
        
        if (convertedParams is DynamicParameters dp)
        {
            return await connection.ExecuteAsync(convertedSql, dp);
        }
        return await connection.ExecuteAsync(convertedSql, convertedParams);
    }

    public async Task<T> TransactionAsync<T>(Func<IDbConnection, Task<T>> callback)
    {
        using var connection = GetConnection();
        await connection.OpenAsync();
        using var transaction = connection.BeginTransaction();
        try
        {
            var result = await callback(connection);
            transaction.Commit();
            return result;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}
