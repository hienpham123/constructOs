using ConstructOs.Server.Config;
using ConstructOs.Server.Middleware;
using ConstructOs.Server.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ConstructOs.Server.Controllers;

[ApiController]
[Route("api/roles")]
public class RoleController : ControllerBase
{
    private readonly IDatabaseService _db;

    public RoleController(IDatabaseService db)
    {
        _db = db;
    }

    [HttpGet("public")]
    public async Task<IActionResult> GetPublicRoles([FromQuery] string? search, [FromQuery] string? sortBy = "name", [FromQuery] string? sortOrder = "asc")
    {
        return await GetRoles(search, sortBy, sortOrder);
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetRoles([FromQuery] string? search, [FromQuery] string? sortBy = "name", [FromQuery] string? sortOrder = "asc")
    {
        try
        {
            var whereClause = "";
            var queryParams = new List<object>();

            if (!string.IsNullOrWhiteSpace(search))
            {
                whereClause = "WHERE name LIKE ? OR description LIKE ?";
                var searchTerm = $"%{search.Trim()}%";
                queryParams.Add(searchTerm);
                queryParams.Add(searchTerm);
            }

            var allowedSortFields = new[] { "name", "description", "created_at", "updated_at" };
            var validSortBy = allowedSortFields.Contains(sortBy) ? sortBy : "name";
            var validSortOrder = sortOrder == "desc" ? "DESC" : "ASC";

            var sql = $"SELECT * FROM roles {whereClause} ORDER BY {validSortBy} {validSortOrder}".Trim();
            var roles = await _db.QueryAsync<dynamic>(sql, queryParams.Count > 0 ? queryParams.ToArray() : null);

            var rolesWithPermissions = new List<dynamic>();
            foreach (var role in roles)
            {
                var permissions = await _db.QueryAsync<dynamic>(
                    "SELECT permission_type, allowed FROM role_permissions WHERE role_id = ?",
                    new[] { role.id }
                );

                var permissionsDict = new Dictionary<string, bool>();
                foreach (var perm in permissions)
                {
                    permissionsDict[perm.permission_type?.ToString() ?? ""] = 
                        Convert.ToBoolean(perm.allowed ?? false);
                }

                var roleDict = (IDictionary<string, object>)role;
                roleDict["permissions"] = permissionsDict;
                rolesWithPermissions.Add(roleDict);
            }

            return Ok(rolesWithPermissions);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching roles: {ex}");
            return StatusCode(500, new { error = "Không thể lấy danh sách vai trò" });
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetRoleById(string id)
    {
        try
        {
            var roles = await _db.QueryAsync<dynamic>("SELECT * FROM roles WHERE id = ?", new[] { id });
            if (!roles.Any())
            {
                return NotFound(new { error = "Không tìm thấy vai trò" });
            }

            var role = roles.First();
            var permissions = await _db.QueryAsync<dynamic>(
                "SELECT permission_type, allowed FROM role_permissions WHERE role_id = ?",
                new[] { id }
            );

            var permissionsDict = new Dictionary<string, bool>();
            foreach (var perm in permissions)
            {
                permissionsDict[perm.permission_type?.ToString() ?? ""] = 
                    Convert.ToBoolean(perm.allowed ?? false);
            }

            var roleDict = (IDictionary<string, object>)role;
            roleDict["permissions"] = permissionsDict;

            return Ok(roleDict);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching role: {ex}");
            return StatusCode(500, new { error = "Không thể lấy thông tin vai trò" });
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateRole([FromBody] dynamic roleData)
    {
        try
        {
            if (roleData.name == null)
            {
                return BadRequest(new { error = "Tên vai trò là bắt buộc" });
            }

            var id = Guid.NewGuid().ToString();
            var createdAt = DataHelpers.ToMySQLDateTime();

            await _db.ExecuteAsync(
                "INSERT INTO roles (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
                new object[] { id, roleData.name, roleData.description ?? null, createdAt, createdAt }
            );

            if (roleData.permissions != null)
            {
                var permissionTypes = new[] { "view_drawing", "view_contract", "view_report", "view_daily_report" };
                var permissions = JsonSerializer.Deserialize<Dictionary<string, bool>>(roleData.permissions.ToString() ?? "{}");

                foreach (var permType in permissionTypes)
                {
                    var allowed = permissions != null && permissions.ContainsKey(permType) && permissions[permType];
                    var permId = Guid.NewGuid().ToString();
                    await _db.ExecuteAsync(
                        "INSERT INTO role_permissions (id, role_id, permission_type, allowed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                        new object[] { permId, id, permType, allowed, createdAt, createdAt }
                    );
                }
            }

            var role = await _db.QueryAsync<dynamic>("SELECT * FROM roles WHERE id = ?", new[] { id });
            var rolePermissions = await _db.QueryAsync<dynamic>(
                "SELECT permission_type, allowed FROM role_permissions WHERE role_id = ?",
                new[] { id }
            );

            var permissionsDict = new Dictionary<string, bool>();
            foreach (var perm in rolePermissions)
            {
                permissionsDict[perm.permission_type?.ToString() ?? ""] = 
                    Convert.ToBoolean(perm.allowed ?? false);
            }

            var roleDict = (IDictionary<string, object>)role.First();
            roleDict["permissions"] = permissionsDict;

            return StatusCode(201, roleDict);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error creating role: {ex}");
            return StatusCode(500, new { error = "Không thể tạo vai trò" });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateRole(string id, [FromBody] dynamic roleData)
    {
        try
        {
            var existing = await _db.QueryAsync<dynamic>("SELECT * FROM roles WHERE id = ?", new[] { id });
            if (!existing.Any())
            {
                return NotFound(new { error = "Không tìm thấy vai trò" });
            }

            var updatedAt = DataHelpers.ToMySQLDateTime();

            if (roleData.name != null || roleData.description != null)
            {
                await _db.ExecuteAsync(
                    "UPDATE roles SET name = COALESCE(?, name), description = COALESCE(?, description), updated_at = ? WHERE id = ?",
                    new object[] { roleData.name ?? null, roleData.description ?? null, updatedAt, id }
                );
            }

            if (roleData.permissions != null)
            {
                var permissionTypes = new[] { "view_drawing", "view_contract", "view_report", "view_daily_report" };
                var permissions = JsonSerializer.Deserialize<Dictionary<string, bool>>(roleData.permissions.ToString() ?? "{}");

                foreach (var permType in permissionTypes)
                {
                    if (permissions != null && permissions.ContainsKey(permType))
                    {
                        var allowed = permissions[permType];
                        var existingPerms = await _db.QueryAsync<dynamic>(
                            "SELECT id FROM role_permissions WHERE role_id = ? AND permission_type = ?",
                            new[] { id, permType }
                        );

                        if (existingPerms.Any())
                        {
                            await _db.ExecuteAsync(
                                "UPDATE role_permissions SET allowed = ?, updated_at = ? WHERE role_id = ? AND permission_type = ?",
                                new object[] { allowed, updatedAt, id, permType }
                            );
                        }
                        else
                        {
                            var permId = Guid.NewGuid().ToString();
                            await _db.ExecuteAsync(
                                "INSERT INTO role_permissions (id, role_id, permission_type, allowed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                                new object[] { permId, id, permType, allowed, updatedAt, updatedAt }
                            );
                        }
                    }
                }
            }

            var role = await _db.QueryAsync<dynamic>("SELECT * FROM roles WHERE id = ?", new[] { id });
            var rolePermissions = await _db.QueryAsync<dynamic>(
                "SELECT permission_type, allowed FROM role_permissions WHERE role_id = ?",
                new[] { id }
            );

            var permissionsDict = new Dictionary<string, bool>();
            foreach (var perm in rolePermissions)
            {
                permissionsDict[perm.permission_type?.ToString() ?? ""] = 
                    Convert.ToBoolean(perm.allowed ?? false);
            }

            var roleDict = (IDictionary<string, object>)role.First();
            roleDict["permissions"] = permissionsDict;

            return Ok(roleDict);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error updating role: {ex}");
            return StatusCode(500, new { error = "Không thể cập nhật vai trò" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteRole(string id)
    {
        try
        {
            var usersWithRole = await _db.QueryAsync<dynamic>(
                "SELECT COUNT(*) as count FROM users WHERE role = ?",
                new[] { id }
            );

            if (usersWithRole.Any() && Convert.ToInt32(usersWithRole.First().count ?? 0) > 0)
            {
                return BadRequest(new { error = "Không thể xóa vai trò này vì đang có người dùng sử dụng" });
            }

            var existing = await _db.QueryAsync<dynamic>("SELECT * FROM roles WHERE id = ?", new[] { id });
            if (!existing.Any())
            {
                return NotFound(new { error = "Không tìm thấy vai trò" });
            }

            await _db.ExecuteAsync("DELETE FROM roles WHERE id = ?", new[] { id });
            return Ok(new { message = "Xóa vai trò thành công" });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error deleting role: {ex}");
            return StatusCode(500, new { error = "Không thể xóa vai trò" });
        }
    }

    [HttpGet("my-permissions")]
    [Authorize]
    public async Task<IActionResult> GetUserPermissions()
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Unauthorized" });
            }

            var users = await _db.QueryAsync<dynamic>("SELECT role FROM users WHERE id = ?", new[] { userId });
            if (!users.Any())
            {
                return NotFound(new { error = "Không tìm thấy người dùng" });
            }

            var user = users.First();
            var roleId = user.role?.ToString();

            var defaultPermissions = new Dictionary<string, bool>
            {
                { "view_drawing", false },
                { "view_contract", false },
                { "view_report", false },
                { "view_daily_report", false }
            };

            if (string.IsNullOrEmpty(roleId))
            {
                return Ok(new { permissions = defaultPermissions });
            }

            var permissions = await _db.QueryAsync<dynamic>(
                "SELECT permission_type, allowed FROM role_permissions WHERE role_id = ?",
                new[] { roleId }
            );

            var permissionsMap = defaultPermissions;
            foreach (var perm in permissions)
            {
                var permType = perm.permission_type?.ToString() ?? "";
                if (permissionsMap.ContainsKey(permType))
                {
                    permissionsMap[permType] = Convert.ToBoolean(perm.allowed ?? false);
                }
            }

            return Ok(new { permissions = permissionsMap });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching user permissions: {ex}");
            return StatusCode(500, new { error = "Không thể lấy quyền của người dùng" });
        }
    }
}

