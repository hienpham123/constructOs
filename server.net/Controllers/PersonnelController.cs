using ConstructOs.Server.Config;
using ConstructOs.Server.Middleware;
using ConstructOs.Server.Utils;
using Microsoft.AspNetCore.Mvc;
using BCrypt.Net;

namespace ConstructOs.Server.Controllers;

[ApiController]
[Route("api/personnel")]
public class PersonnelController : ControllerBase
{
    private readonly IDatabaseService _db;
    private readonly IConfiguration _configuration;

    public PersonnelController(IDatabaseService db, IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
    }

    private async Task<string> GenerateUniquePersonnelCode(string? name)
    {
        var prefix = !string.IsNullOrEmpty(name) 
            ? name.Substring(0, Math.Min(3, name.Length)).ToUpper().Replace(" ", "X").PadRight(3, 'X')
            : "NS";
        
        var random = new Random();
        var randomSuffix = random.Next(100000, 999999);
        var randomChars = Guid.NewGuid().ToString().Substring(0, 2).ToUpper();
        
        var code = $"{prefix}-{randomSuffix}{randomChars}";
        
        // Check uniqueness
        var existing = await _db.QueryAsync<dynamic>("SELECT id FROM users WHERE code = ?", new[] { code });
        if (existing.Any())
        {
            // If exists, add timestamp
            var timestamp = DateTime.Now.ToString("HHmmss");
            code = $"{prefix}-{timestamp}{randomChars}";
        }
        
        return code;
    }

    [HttpGet]
    public async Task<IActionResult> GetPersonnel([FromQuery] int? pageSize, [FromQuery] int? pageIndex,
        [FromQuery] string? search, [FromQuery] string? sortBy, [FromQuery] string? sortOrder)
    {
        try
        {
            var pageSizeNum = pageSize ?? 10;
            var pageIndexNum = pageIndex ?? 0;
            var offset = pageIndexNum * pageSizeNum;

            var queryParams = new List<object>();
            var searchClause = DataHelpers.BuildSearchClause(
                search,
                new[] { "name", "code", "phone", "email", "role", "team", "project_name", "status" },
                out queryParams
            );

            var mappedSortBy = sortBy == "position" ? "role" : sortBy;
            var allowedSortFields = new[] { "name", "code", "phone", "email", "role", "team", "project_name", "status", "hire_date", "created_at", "updated_at" };
            var sortClause = DataHelpers.BuildSortClause(mappedSortBy, allowedSortFields, "created_at", sortOrder);

            var countSearchClause = searchClause
                .Replace("name", "u.name")
                .Replace("code", "u.code")
                .Replace("phone", "u.phone")
                .Replace("email", "u.email")
                .Replace("role", "u.role")
                .Replace("team", "u.team")
                .Replace("project_name", "u.project_name")
                .Replace("status", "u.status");

            var countSql = $"SELECT COUNT(*) as total FROM users u {countSearchClause}";
            dynamic? countResult = null;
            if (queryParams.Count > 0)
            {
                countResult = await _db.QueryFirstOrDefaultAsync<dynamic>(countSql, queryParams.ToArray());
            }
            else
            {
                countResult = await _db.QueryFirstOrDefaultAsync<dynamic>(countSql);
            }
            var total = Convert.ToInt32(countResult?.total ?? 0);

            var searchClauseWithAlias = searchClause
                .Replace("name", "u.name")
                .Replace("code", "u.code")
                .Replace("phone", "u.phone")
                .Replace("email", "u.email")
                .Replace("role", "u.role")
                .Replace("team", "u.team")
                .Replace("project_name", "u.project_name")
                .Replace("status", "u.status");

            var sortClauseWithAlias = sortClause
                .Replace("name", "u.name")
                .Replace("code", "u.code")
                .Replace("phone", "u.phone")
                .Replace("email", "u.email")
                .Replace("role", "u.role")
                .Replace("team", "u.team")
                .Replace("project_name", "u.project_name")
                .Replace("status", "u.status")
                .Replace("hire_date", "u.hire_date")
                .Replace("created_at", "u.created_at")
                .Replace("updated_at", "u.updated_at");

            var sql = $@"SELECT u.id, u.code, u.name, u.phone, u.email, 
                         u.role as position,
                         COALESCE(r.description, r.name) as position_description,
                         u.team, u.project_id, u.project_name, u.status, u.hire_date, 
                         u.created_at, u.updated_at
                         FROM users u
                         LEFT JOIN roles r ON u.role = r.id
                         {searchClauseWithAlias} {sortClauseWithAlias} LIMIT {pageSizeNum} OFFSET {offset}";

            IEnumerable<dynamic> results;
            if (queryParams.Count > 0)
            {
                results = await _db.QueryAsync<dynamic>(sql, queryParams.ToArray());
            }
            else
            {
                results = await _db.QueryAsync<dynamic>(sql);
            }

            return Ok(new { data = results, total, pageIndex = pageIndexNum, pageSize = pageSizeNum });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching personnel: {ex}");
            return StatusCode(500, new { error = "Không thể lấy danh sách nhân sự" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPersonnelById(string id)
    {
        try
        {
            var results = await _db.QueryAsync<dynamic>(
                @"SELECT u.id, u.code, u.name, u.phone, u.email, 
                  u.role as position,
                  COALESCE(r.description, r.name) as position_description,
                  u.team, u.project_id, u.project_name, u.status, u.hire_date, 
                  u.created_at, u.updated_at
                  FROM users u
                  LEFT JOIN roles r ON u.role = r.id
                  WHERE u.id = ?",
                new[] { id }
            );

            if (!results.Any())
            {
                return NotFound(new { error = "Không tìm thấy nhân sự" });
            }

            return Ok(results.First());
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching personnel: {ex}");
            return StatusCode(500, new { error = "Không thể lấy thông tin nhân sự" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreatePersonnel([FromBody] dynamic personnelData)
    {
        try
        {
            var id = Guid.NewGuid().ToString();
            var createdAt = DataHelpers.ToMySQLDateTime();

            var normalized = await DataHelpers.NormalizeProject(
                personnelData.projectId?.ToString(),
                personnelData.projectName?.ToString(),
                _db
            );

            var positionValue = personnelData.position?.ToString();
            if (string.IsNullOrEmpty(positionValue))
            {
                var defaultRole = await _db.QueryAsync<dynamic>("SELECT id FROM roles LIMIT 1");
                if (!defaultRole.Any())
                {
                    return BadRequest(new { error = "No roles found in database. Please create at least one role first." });
                }
                positionValue = defaultRole.First().id?.ToString();
            }
            else
            {
                var roleCheck = await _db.QueryAsync<dynamic>("SELECT id FROM roles WHERE id = ?", new[] { positionValue });
                if (!roleCheck.Any())
                {
                    return BadRequest(new { error = $"Role with id {positionValue} does not exist" });
                }
            }

            var code = await GenerateUniquePersonnelCode(personnelData.name?.ToString());
            var status = personnelData.status?.ToString() ?? "active";
            var hireDate = personnelData.hireDate != null 
                ? DataHelpers.ToMySQLDate(personnelData.hireDate.ToString()) 
                : DataHelpers.ToMySQLDate();
            var email = personnelData.email?.ToString() ?? $"personnel_{id}@temp.local";
            var defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("123456");

            await _db.ExecuteAsync(
                @"INSERT INTO users (id, code, name, phone, email, password_hash, role, team, 
                  project_id, project_name, status, hire_date, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                new object[]
                {
                    id, code, personnelData.name, personnelData.phone, email, defaultPasswordHash,
                    positionValue, DataHelpers.NormalizeString(personnelData.team?.ToString()),
                    normalized.projectId, normalized.projectName, status, hireDate, createdAt, createdAt
                }
            );

            var newPersonnel = await _db.QueryAsync<dynamic>(
                @"SELECT u.id, u.code, u.name, u.phone, u.email, 
                  u.role as position,
                  COALESCE(r.description, r.name) as position_description,
                  u.team, u.project_id, u.project_name, u.status, u.hire_date, 
                  u.created_at, u.updated_at
                  FROM users u
                  LEFT JOIN roles r ON u.role = r.id
                  WHERE u.id = ?",
                new[] { id }
            );

            return StatusCode(201, newPersonnel.First());
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error creating personnel: {ex}");
            return StatusCode(500, new { error = "Không thể tạo nhân sự", message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePersonnel(string id, [FromBody] dynamic personnelData)
    {
        try
        {
            var existing = await _db.QueryAsync<dynamic>("SELECT * FROM users WHERE id = ?", new[] { id });
            if (!existing.Any())
            {
                return NotFound(new { error = "Không tìm thấy nhân sự" });
            }

            var existingUser = existing.First();
            var updatedAt = DataHelpers.ToMySQLDateTime();

            var normalized = await DataHelpers.NormalizeProject(
                personnelData.projectId?.ToString(),
                personnelData.projectName?.ToString(),
                _db
            );

            var positionValue = existingUser.role?.ToString();
            if (personnelData.position != null)
            {
                var roleCheck = await _db.QueryAsync<dynamic>("SELECT id FROM roles WHERE id = ?", new[] { personnelData.position.ToString() });
                if (!roleCheck.Any())
                {
                    return BadRequest(new { error = $"Role with id {personnelData.position} does not exist" });
                }
                positionValue = personnelData.position.ToString();
            }

            var code = existingUser.code?.ToString();
            if (string.IsNullOrEmpty(code))
            {
                code = await GenerateUniquePersonnelCode(personnelData.name?.ToString() ?? existingUser.name?.ToString());
            }

            var email = DataHelpers.NormalizeString(personnelData.email?.ToString() ?? existingUser.email?.ToString());
            if (!string.IsNullOrEmpty(email) && email != existingUser.email?.ToString())
            {
                var emailCheck = await _db.QueryAsync<dynamic>("SELECT id FROM users WHERE email = ? AND id != ?", new[] { email, id });
                if (emailCheck.Any())
                {
                    return BadRequest(new { error = "Email đã tồn tại" });
                }
            }

            var status = personnelData.status != null ? personnelData.status.ToString() : existingUser.status?.ToString();
            var hireDate = personnelData.hireDate != null 
                ? DataHelpers.ToMySQLDate(personnelData.hireDate.ToString()) 
                : existingUser.hire_date?.ToString();

            await _db.ExecuteAsync(
                @"UPDATE users SET code = ?, name = ?, phone = ?, email = ?, role = ?, team = ?,
                  project_id = ?, project_name = ?, status = ?, hire_date = ?, updated_at = ?
                  WHERE id = ?",
                new object[]
                {
                    code, personnelData.name, personnelData.phone, email, positionValue,
                    DataHelpers.NormalizeString(personnelData.team?.ToString() ?? existingUser.team?.ToString()),
                    normalized.projectId, normalized.projectName, status, hireDate, updatedAt, id
                }
            );

            var updated = await _db.QueryAsync<dynamic>(
                @"SELECT u.id, u.code, u.name, u.phone, u.email, 
                  u.role as position,
                  COALESCE(r.description, r.name) as position_description,
                  u.team, u.project_id, u.project_name, u.status, u.hire_date, 
                  u.created_at, u.updated_at
                  FROM users u
                  LEFT JOIN roles r ON u.role = r.id
                  WHERE u.id = ?",
                new[] { id }
            );

            return Ok(updated.First());
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error updating personnel: {ex}");
            return StatusCode(500, new { error = "Không thể cập nhật nhân sự", message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePersonnel(string id)
    {
        try
        {
            var existing = await _db.QueryAsync<dynamic>("SELECT * FROM users WHERE id = ?", new[] { id });
            if (!existing.Any())
            {
                return NotFound(new { error = "Không tìm thấy nhân sự" });
            }

            await _db.ExecuteAsync("DELETE FROM users WHERE id = ?", new[] { id });
            return NoContent();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error deleting personnel: {ex}");
            return StatusCode(500, new { error = "Không thể xóa nhân sự" });
        }
    }
}

