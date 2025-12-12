using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace ConstructOs.Server.Middleware;

public static class AuthExtensions
{
    public static string? GetUserId(this HttpContext context)
    {
        return context.User?.FindFirst("userId")?.Value;
    }

    public static string? GetUserEmail(this HttpContext context)
    {
        return context.User?.FindFirst(ClaimTypes.Email)?.Value;
    }

    public static string? GetUserRole(this HttpContext context)
    {
        return context.User?.FindFirst(ClaimTypes.Role)?.Value;
    }
}

