using ConstructOs.Server.Config;
using ConstructOs.Server.Middleware;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ConstructOs.Server.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly IDatabaseService _db;

    public NotificationController(IDatabaseService db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] int? limit, [FromQuery] int? offset, [FromQuery] bool? unreadOnly)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var limitNum = limit ?? 50;
            var offsetNum = offset ?? 0;

            var sql = @"SELECT id, title, message, type, priority, is_read, metadata, created_at
                        FROM notifications
                        WHERE user_id = ?";
            var queryParams = new List<object> { userId };

            if (unreadOnly == true)
            {
                sql += " AND is_read = FALSE";
            }

            sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
            queryParams.Add(limitNum);
            queryParams.Add(offsetNum);

            var notifications = await _db.QueryAsync<dynamic>(sql, queryParams.ToArray());

            var unreadCount = await _db.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE",
                new[] { userId }
            );

            var notificationsList = notifications.Select(n => new
            {
                id = n.id,
                title = n.title,
                message = n.message,
                type = n.type,
                priority = n.priority,
                read = Convert.ToBoolean(n.is_read ?? false),
                metadata = !string.IsNullOrEmpty(n.metadata?.ToString()) 
                    ? JsonSerializer.Deserialize<object>(n.metadata.ToString() ?? "{}") 
                    : null,
                createdAt = n.created_at
            }).ToList();

            return Ok(new
            {
                notifications = notificationsList,
                unreadCount = Convert.ToInt32(unreadCount?.count ?? 0)
            });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching notifications: {ex}");
            return StatusCode(500, new { error = "Không thể lấy danh sách thông báo" });
        }
    }

    [HttpPut("{notificationId}/read")]
    public async Task<IActionResult> MarkAsRead(string notificationId)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var notifications = await _db.QueryAsync<dynamic>(
                "SELECT id FROM notifications WHERE id = ? AND user_id = ?",
                new[] { notificationId, userId }
            );

            if (!notifications.Any())
            {
                return NotFound(new { error = "Không tìm thấy thông báo" });
            }

            await _db.ExecuteAsync(
                "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
                new[] { notificationId, userId }
            );

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error marking notification as read: {ex}");
            return StatusCode(500, new { error = "Không thể đánh dấu đã đọc" });
        }
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            await _db.ExecuteAsync(
                "UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE",
                new[] { userId }
            );

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error marking all notifications as read: {ex}");
            return StatusCode(500, new { error = "Không thể đánh dấu tất cả đã đọc" });
        }
    }

    [HttpDelete("{notificationId}")]
    public async Task<IActionResult> DeleteNotification(string notificationId)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var notifications = await _db.QueryAsync<dynamic>(
                "SELECT id FROM notifications WHERE id = ? AND user_id = ?",
                new[] { notificationId, userId }
            );

            if (!notifications.Any())
            {
                return NotFound(new { error = "Không tìm thấy thông báo" });
            }

            await _db.ExecuteAsync(
                "DELETE FROM notifications WHERE id = ? AND user_id = ?",
                new[] { notificationId, userId }
            );

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error deleting notification: {ex}");
            return StatusCode(500, new { error = "Không thể xóa thông báo" });
        }
    }
}

