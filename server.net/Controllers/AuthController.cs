using ConstructOs.Server.Config;
using ConstructOs.Server.Utils;
using Microsoft.AspNetCore.Mvc;
using BCrypt.Net;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Dapper;

namespace ConstructOs.Server.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IDatabaseService _db;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IDatabaseService db, IConfiguration configuration, ILogger<AuthController> logger)
    {
        _db = db;
        _configuration = configuration;
        _logger = logger;
    }

    private string GenerateJwtToken(string userId, string email, string role)
    {
        var jwtSecret = _configuration["JWT_SECRET"] ?? "constructos-secret-key-change-in-production";
        var key = Encoding.UTF8.GetBytes(jwtSecret);

        var claims = new[]
        {
            new Claim("userId", userId),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Name) || 
                string.IsNullOrEmpty(request.Email) || 
                string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { error = "Vui lòng nhập đầy đủ tên, email và mật khẩu" });
            }

            if (request.Password.Length < 6)
            {
                return BadRequest(new { error = "Mật khẩu phải có ít nhất 6 ký tự" });
            }

            // Check if user already exists
            var existing = await _db.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT id FROM users WHERE email = ?",
                new { request.Email });

            if (existing != null)
            {
                return BadRequest(new { error = "Email đã tồn tại" });
            }

            // Hash password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 10);

            // Validate and resolve role_id
            string? roleId = request.Role;
            if (string.IsNullOrEmpty(roleId))
            {
                // Try to get default role "construction_department"
                var defaultRole = await _db.QueryFirstOrDefaultAsync<dynamic>(
                    "SELECT id FROM roles WHERE LOWER(name) = ? OR LOWER(name) = ?",
                    new { roleName1 = "construction_department", roleName2 = "phòng xây dựng" });

                if (defaultRole != null)
                {
                    roleId = defaultRole.id?.ToString();
                }
                else
                {
                    // Fallback: get first role
                    var fallbackRole = await _db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT id FROM roles LIMIT 1");
                    
                    if (fallbackRole != null)
                    {
                        roleId = fallbackRole.id?.ToString();
                        _logger.LogWarning("Role 'construction_department' not found, using first available role");
                    }
                    else
                    {
                        return BadRequest(new { error = "No roles found in database. Please create at least one role first." });
                    }
                }
            }
            else
            {
                // Check if role is a UUID format
                var isUUID = System.Text.RegularExpressions.Regex.IsMatch(roleId, 
                    @"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", 
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase);

                if (!isUUID)
                {
                    // Role is a name string, find the UUID by name
                    var roleNameMap = new Dictionary<string, string>
                    {
                        { "admin", "admin" },
                        { "project_manager", "project_manager" },
                        { "accountant", "accountant" },
                        { "warehouse", "warehouse" },
                        { "site_manager", "site_manager" },
                        { "engineer", "engineer" },
                        { "client", "client" },
                        { "kế toán", "accountant" },
                        { "quản lý công trường", "site_manager" },
                        { "quản lý dự án", "project_manager" }
                    };

                    var mappedRoleName = roleNameMap.ContainsKey(roleId.ToLower()) 
                        ? roleNameMap[roleId.ToLower()] 
                        : roleId.ToLower();

                    var roleResult = await _db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT id FROM roles WHERE LOWER(name) = ?",
                        new { roleName = mappedRoleName });

                    if (roleResult == null)
                    {
                        return BadRequest(new { error = $"Role \"{roleId}\" not found. Please use a valid role name or UUID." });
                    }

                    roleId = roleResult.id?.ToString();
                }
                else
                {
                    // Role is a UUID, validate it exists
                    var roleCheck = await _db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT id FROM roles WHERE id = ?",
                        new { roleId });

                    if (roleCheck == null)
                    {
                        return BadRequest(new { error = $"Role with id {roleId} does not exist" });
                    }
                }
            }

            // Create user
            var id = Guid.NewGuid().ToString();
            var createdAt = DataHelpers.ToMySQLDateTime();

            await _db.ExecuteAsync(
                @"INSERT INTO users (
                    id, name, email, phone, password_hash, role, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                new
                {
                    id,
                    name = request.Name,
                    email = request.Email,
                    phone = request.Phone ?? "",
                    passwordHash,
                    role = roleId,
                    status = "active",
                    createdAt,
                    updatedAt = createdAt
                });

            // Get created user (without password)
            var newUser = await _db.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT id, name, email, phone, role, status, avatar, created_at, updated_at FROM users WHERE id = ?",
                new { id });

            // Generate JWT token
            var token = GenerateJwtToken(id, request.Email, request.Role ?? "client");

            return StatusCode(201, new
            {
                user = newUser,
                token
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering user");
            return StatusCode(500, new
            {
                error = "Đăng ký thất bại",
                message = ex.Message
            });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { error = "Vui lòng nhập email và mật khẩu" });
            }

            // Find user
            var user = await _db.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT * FROM users WHERE email = ?",
                new { request.Email });

            if (user == null)
            {
                return Unauthorized(new { error = "Email hoặc mật khẩu không đúng" });
            }

            // Check if user is active
            if (user.status?.ToString() != "active")
            {
                return StatusCode(403, new { error = "Tài khoản chưa được kích hoạt" });
            }

            // Verify password
            var passwordHash = user.password_hash?.ToString() ?? "";
            var isValidPassword = BCrypt.Net.BCrypt.Verify(request.Password, passwordHash);

            if (!isValidPassword)
            {
                return Unauthorized(new { error = "Email hoặc mật khẩu không đúng" });
            }

            // Generate JWT token
            var role = user.role?.ToString() ?? "client";
            var token = GenerateJwtToken(user.id?.ToString() ?? "", user.email?.ToString() ?? "", role);

            // Return user (without password)
            return Ok(new
            {
                user = new
                {
                    id = user.id,
                    name = user.name,
                    email = user.email,
                    phone = user.phone,
                    role = user.role,
                    status = user.status,
                    avatar = user.avatar,
                    createdAt = user.created_at,
                    updatedAt = user.updated_at
                },
                token
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging in");
            return StatusCode(500, new
            {
                error = "Đăng nhập thất bại",
                message = ex.Message
            });
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest(new { error = "Vui lòng nhập email" });
            }

            // Find user
            var user = await _db.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT id, name, email FROM users WHERE email = ?",
                new { request.Email });

            // Always return success (security: don't reveal if email exists)
            if (user != null)
            {
                // Generate reset token
                var resetToken = GenerateJwtToken(user.id?.ToString() ?? "", user.email?.ToString() ?? "", "password_reset");
                
                // In production, send email with reset link
                _logger.LogInformation($"Password reset token for {request.Email}: {resetToken}");
                
                // TODO: Send email with reset link
            }

            // Always return success message
            return Ok(new
            {
                message = "Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in forgot password");
            return StatusCode(500, new
            {
                error = "Xử lý yêu cầu đặt lại mật khẩu thất bại",
                message = ex.Message
            });
        }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Token) || string.IsNullOrEmpty(request.NewPassword))
            {
                return BadRequest(new { error = "Vui lòng nhập token và mật khẩu mới" });
            }

            if (request.NewPassword.Length < 6)
            {
                return BadRequest(new { error = "Mật khẩu phải có ít nhất 6 ký tự" });
            }

            // Verify token
            var jwtSecret = _configuration["JWT_SECRET"] ?? "constructos-secret-key-change-in-production";
            var key = Encoding.UTF8.GetBytes(jwtSecret);
            var tokenHandler = new JwtSecurityTokenHandler();

            SecurityToken? validatedToken;
            ClaimsPrincipal? principal;
            try
            {
                principal = tokenHandler.ValidateToken(request.Token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out validatedToken);
            }
            catch
            {
                return BadRequest(new { error = "Token không hợp lệ hoặc đã hết hạn" });
            }

            var userId = principal?.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { error = "Token không hợp lệ" });
            }

            // Hash new password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, 10);

            // Update password
            var updatedAt = DataHelpers.ToMySQLDateTime();
            await _db.ExecuteAsync(
                "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
                new { passwordHash, updatedAt, userId });

            return Ok(new { message = "Đặt lại mật khẩu thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password");
            return StatusCode(500, new
            {
                error = "Đặt lại mật khẩu thất bại",
                message = ex.Message
            });
        }
    }

    [HttpPost("verify-token")]
    public async Task<IActionResult> VerifyToken([FromBody] VerifyTokenRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Token))
            {
                return BadRequest(new { error = "Vui lòng nhập token" });
            }

            var jwtSecret = _configuration["JWT_SECRET"] ?? "constructos-secret-key-change-in-production";
            var key = Encoding.UTF8.GetBytes(jwtSecret);
            var tokenHandler = new JwtSecurityTokenHandler();

            try
            {
                var principal = tokenHandler.ValidateToken(request.Token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out _);

                var type = principal?.FindFirst(ClaimTypes.Role)?.Value == "password_reset" 
                    ? "password_reset" 
                    : "auth";

                return Ok(new { valid = true, type });
            }
            catch
            {
                return Ok(new { valid = false });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying token");
            return StatusCode(500, new
            {
                error = "Xác thực token thất bại",
                message = ex.Message
            });
        }
    }
}

public class RegisterRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Password { get; set; } = string.Empty;
    public string? Role { get; set; }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class ForgotPasswordRequest
{
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class VerifyTokenRequest
{
    public string Token { get; set; } = string.Empty;
}

