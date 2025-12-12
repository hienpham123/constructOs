namespace ConstructOs.Server.Models;

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Role { get; set; } = string.Empty;
    public string? RoleDescription { get; set; }
    public string Status { get; set; } = "active";
    public string? Avatar { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string UpdatedAt { get; set; } = string.Empty;
}

public class CreateUserRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Password { get; set; } = string.Empty;
    public string? Role { get; set; }
    public string Status { get; set; } = "active";
    public string? Avatar { get; set; }
}

public class UpdateUserRequest
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Password { get; set; }
    public string? Role { get; set; }
    public string? Status { get; set; }
    public string? Avatar { get; set; }
}

