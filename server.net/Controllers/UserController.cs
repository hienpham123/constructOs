using ConstructOs.Server.Config;
using ConstructOs.Server.Middleware;
using ConstructOs.Server.Models;
using ConstructOs.Server.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BCrypt.Net;

namespace ConstructOs.Server.Controllers;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly IDatabaseService _db;
    private readonly IConfiguration _configuration;
    private readonly ILogger<UserController> _logger;
    private readonly IWebHostEnvironment _environment;

    public UserController(
        IDatabaseService db, 
        IConfiguration configuration, 
        ILogger<UserController> logger,
        IWebHostEnvironment environment)
    {
        _db = db;
        _configuration = configuration;
        _logger = logger;
        _environment = environment;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] int? pageSize, [FromQuery] int? pageIndex, 
        [FromQuery] string? search, [FromQuery] string? sortBy, [FromQuery] string? sortOrder)
    {
        try
        {
            var pageSizeNum = pageSize ?? 10;
            var pageIndexNum = pageIndex ?? 0;
            var offset = pageIndexNum * pageSizeNum;

            var queryParams = new List<object>();
            var searchClause = DataHelpers.BuildSearchClause(search, 
                new[] { "name", "email", "phone", "role" }, out queryParams);

            var countSearchClause = searchClause
                .Replace("name", "u.name")
                .Replace("email", "u.email")
                .Replace("phone", "u.phone")
                .Replace("role", "u.role");

            var countSql = $"SELECT COUNT(*) as total FROM users u {countSearchClause}";
            dynamic? countResult = null;
            if (queryParams.Count > 0)
            {
                // Pass parameters as array for Dapper
                countResult = await _db.QueryFirstOrDefaultAsync<dynamic>(countSql, queryParams.ToArray());
            }
            else
            {
                countResult = await _db.QueryFirstOrDefaultAsync<dynamic>(countSql);
            }
            var total = Convert.ToInt32(countResult?.total ?? 0);

            var allowedSortFields = new[] { "name", "email", "phone", "role", "status", "created_at", "updated_at" };
            var sortClause = DataHelpers.BuildSortClause(sortBy, allowedSortFields, "created_at", sortOrder);
            var sortClauseWithAlias = sortClause
                .Replace("name", "u.name")
                .Replace("email", "u.email")
                .Replace("phone", "u.phone")
                .Replace("role", "u.role")
                .Replace("status", "u.status")
                .Replace("created_at", "u.created_at")
                .Replace("updated_at", "u.updated_at");

            var searchClauseWithAlias = searchClause
                .Replace("name", "u.name")
                .Replace("email", "u.email")
                .Replace("phone", "u.phone")
                .Replace("role", "u.role");

            var sql = $@"SELECT 
                u.id, u.name, u.email, u.phone, 
                u.role,
                COALESCE(r.description, r.name) as role_description,
                u.status, u.avatar, u.created_at, u.updated_at 
            FROM users u
            LEFT JOIN roles r ON u.role = r.id
            {searchClauseWithAlias} {sortClauseWithAlias} LIMIT {pageSizeNum} OFFSET {offset}";

            IEnumerable<dynamic> results;
            if (queryParams.Count > 0)
            {
                // Pass parameters as array for Dapper
                results = await _db.QueryAsync<dynamic>(sql, queryParams.ToArray());
            }
            else
            {
                results = await _db.QueryAsync<dynamic>(sql);
            }

            return Ok(new
            {
                data = results,
                total,
                pageIndex = pageIndexNum,
                pageSize = pageSizeNum
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching users");
            return StatusCode(500, new { error = "Không thể lấy danh sách người dùng" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        try
        {
            var sql = @"SELECT 
                u.id, u.name, u.email, u.phone, 
                u.role,
                COALESCE(r.description, r.name) as role_description,
                u.status, u.avatar, u.created_at, u.updated_at 
            FROM users u
            LEFT JOIN roles r ON u.role = r.id
            WHERE u.id = ?";

            var user = await _db.QueryFirstOrDefaultAsync<dynamic>(sql, new { id });

            if (user == null)
            {
                return NotFound(new { error = "Không tìm thấy người dùng" });
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching user");
            return StatusCode(500, new { error = "Không thể lấy thông tin người dùng" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        try
        {
            var id = Guid.NewGuid().ToString();
            var createdAt = DataHelpers.ToMySQLDateTime();

            // Hash password
            string passwordHash;
            if (!string.IsNullOrEmpty(request.Password))
            {
                passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 10);
            }
            else
            {
                return BadRequest(new { error = "Vui lòng nhập mật khẩu" });
            }

            // Validate role
            string? roleId = request.Role;
            if (string.IsNullOrEmpty(roleId))
            {
                var defaultRole = await _db.QueryFirstOrDefaultAsync<dynamic>("SELECT id FROM roles LIMIT 1");
                if (defaultRole == null)
                {
                    return BadRequest(new { error = "No roles found in database. Please create at least one role first." });
                }
                roleId = defaultRole.id?.ToString();
            }
            else
            {
                var roleCheck = await _db.QueryFirstOrDefaultAsync<dynamic>(
                    "SELECT id FROM roles WHERE id = ?", new { roleId });
                if (roleCheck == null)
                {
                    return BadRequest(new { error = $"Role with id {roleId} does not exist" });
                }
            }

            await _db.ExecuteAsync(
                @"INSERT INTO users (
                    id, name, email, phone, password_hash, role, status, avatar, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                new
                {
                    id,
                    name = request.Name,
                    email = request.Email,
                    phone = request.Phone ?? "",
                    passwordHash,
                    role = roleId,
                    status = request.Status,
                    avatar = DataHelpers.NormalizeString(request.Avatar),
                    createdAt,
                    updatedAt = createdAt
                });

            var newUser = await _db.QueryFirstOrDefaultAsync<dynamic>(
                @"SELECT 
                    u.id, u.name, u.email, u.phone, 
                    u.role,
                    COALESCE(r.description, r.name) as role_description,
                    u.status, u.avatar, u.created_at, u.updated_at 
                FROM users u
                LEFT JOIN roles r ON u.role = r.id
                WHERE u.id = ?",
                new { id });

            return StatusCode(201, newUser);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            if (ex.Message.Contains("Duplicate") || ex.Message.Contains("ER_DUP_ENTRY"))
            {
                return BadRequest(new { error = "Email đã tồn tại" });
            }
            return StatusCode(500, new { error = "Không thể tạo người dùng", message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserRequest request)
    {
        try
        {
            var existing = await _db.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT * FROM users WHERE id = ?", new { id });

            if (existing == null)
            {
                return NotFound(new { error = "Không tìm thấy người dùng" });
            }

            var updates = new List<string>();
            var values = new Dictionary<string, object?>();

            if (request.Name != null)
            {
                updates.Add("name = ?");
                values["name"] = request.Name;
            }
            if (request.Email != null)
            {
                updates.Add("email = ?");
                values["email"] = request.Email;
            }
            if (request.Phone != null)
            {
                updates.Add("phone = ?");
                values["phone"] = request.Phone;
            }
            if (!string.IsNullOrEmpty(request.Password))
            {
                updates.Add("password_hash = ?");
                values["passwordHash"] = BCrypt.Net.BCrypt.HashPassword(request.Password, 10);
            }
            if (request.Role != null)
            {
                var roleCheck = await _db.QueryFirstOrDefaultAsync<dynamic>(
                    "SELECT id FROM roles WHERE id = ?", new { roleId = request.Role });
                if (roleCheck == null)
                {
                    return BadRequest(new { error = $"Role with id {request.Role} does not exist" });
                }
                updates.Add("role = ?");
                values["role"] = request.Role;
            }
            if (request.Status != null)
            {
                updates.Add("status = ?");
                values["status"] = request.Status;
            }
            if (request.Avatar != null)
            {
                updates.Add("avatar = ?");
                values["avatar"] = DataHelpers.NormalizeString(request.Avatar);
            }

            updates.Add("updated_at = ?");
            values["updatedAt"] = DataHelpers.ToMySQLDateTime();
            values["id"] = id;

            if (updates.Count > 1) // More than just updated_at
            {
                var sql = $"UPDATE users SET {string.Join(", ", updates)} WHERE id = ?";
                await _db.ExecuteAsync(sql, values);
            }

            var updated = await _db.QueryFirstOrDefaultAsync<dynamic>(
                @"SELECT 
                    u.id, u.name, u.email, u.phone, 
                    u.role,
                    COALESCE(r.description, r.name) as role_description,
                    u.status, u.avatar, u.created_at, u.updated_at 
                FROM users u
                LEFT JOIN roles r ON u.role = r.id
                WHERE u.id = ?",
                new { id });

            return Ok(updated);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user");
            if (ex.Message.Contains("Duplicate") || ex.Message.Contains("ER_DUP_ENTRY"))
            {
                return BadRequest(new { error = "Email đã tồn tại" });
            }
            return StatusCode(500, new { error = "Không thể cập nhật người dùng", message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        try
        {
            var existing = await _db.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT * FROM users WHERE id = ?", new { id });

            if (existing == null)
            {
                return NotFound(new { error = "Không tìm thấy người dùng" });
            }

            await _db.ExecuteAsync("DELETE FROM users WHERE id = ?", new { id });

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user");
            return StatusCode(500, new { error = "Không thể xóa người dùng" });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var sql = @"SELECT 
                u.id, u.name, u.email, u.phone, 
                u.role,
                COALESCE(r.description, r.name) as role_description,
                u.status, u.avatar, u.created_at, u.updated_at 
            FROM users u
            LEFT JOIN roles r ON u.role = r.id
            WHERE u.id = ?";

            var user = await _db.QueryFirstOrDefaultAsync<dynamic>(sql, new { userId });

            if (user == null)
            {
                return NotFound(new { error = "Không tìm thấy người dùng" });
            }

            // Convert avatar filename to URL if exists
            if (user.avatar != null)
            {
                user.avatar = FileUploadHelper.GetAvatarUrl(user.avatar?.ToString(), _configuration);
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching current user");
            return StatusCode(500, new { error = "Không thể lấy thông tin người dùng hiện tại" });
        }
    }

    [HttpPost("me/avatar")]
    [Authorize]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            if (file == null || file.Length == 0)
            {
                return BadRequest(new { error = "Không có file được tải lên" });
            }

            if (!FileUploadHelper.IsImageFile(file))
            {
                return BadRequest(new { error = "Chỉ cho phép upload file ảnh (JPEG, JPG, PNG, GIF, WEBP)" });
            }

            if (file.Length > 2 * 1024 * 1024) // 2MB
            {
                return BadRequest(new { error = "File quá lớn. Kích thước tối đa là 2MB" });
            }

            var updatedAt = DataHelpers.ToMySQLDateTime();

            // Handle file upload
            var (filename, url) = await FileUploadHelper.HandleFileUpload(
                file, "avatars", _configuration, _environment);

            // Store filename or full URL in database
            var avatarValue = url.StartsWith("http") ? url : filename;

            // Update user avatar in database
            await _db.ExecuteAsync(
                "UPDATE users SET avatar = ?, updated_at = ? WHERE id = ?",
                new { avatar = avatarValue, updatedAt, userId });

            // Get updated user
            var sql = @"SELECT 
                u.id, u.name, u.email, u.phone, 
                u.role,
                COALESCE(r.description, r.name) as role_description,
                u.status, u.avatar, u.created_at, u.updated_at 
            FROM users u
            LEFT JOIN roles r ON u.role = r.id
            WHERE u.id = ?";

            var user = await _db.QueryFirstOrDefaultAsync<dynamic>(sql, new { userId });

            if (user == null)
            {
                return NotFound(new { error = "Không tìm thấy người dùng" });
            }

            user.avatar = FileUploadHelper.GetAvatarUrl(user.avatar?.ToString(), _configuration);

            return Ok(new
            {
                message = "Tải lên ảnh đại diện thành công",
                avatar = user.avatar,
                user
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading avatar");
            return StatusCode(500, new { error = "Không thể tải lên ảnh đại diện", message = ex.Message });
        }
    }
}

