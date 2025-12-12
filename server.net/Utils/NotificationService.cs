using ConstructOs.Server.Config;
using System.Net;
using System.Net.Mail;

namespace ConstructOs.Server.Utils;

public class NotificationService
{
    private readonly IDatabaseService _db;
    private readonly IConfiguration _configuration;
    private readonly ILogger<NotificationService>? _logger;

    public NotificationService(IDatabaseService db, IConfiguration configuration, ILogger<NotificationService>? logger = null)
    {
        _db = db;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendNotification(NotificationOptions options)
    {
        try
        {
            // Get user info
            var user = await _db.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT id, name, email, phone FROM users WHERE id = ?",
                new { userId = options.UserId });

            if (user == null)
            {
                _logger?.LogWarning("Không tìm thấy user với ID: {UserId}", options.UserId);
                return;
            }

            var results = new List<string>();

            // 1. Send Email (FREE, unlimited)
            if (user.email != null)
            {
                try
                {
                    await SendEmailNotification(new EmailParams
                    {
                        To = user.email.ToString()!,
                        Name = user.name?.ToString() ?? "",
                        Subject = options.Title,
                        Message = options.Message
                    });
                    results.Add("Email");
                    _logger?.LogInformation("Đã gửi thông báo Email cho {Name}", user.name);
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Lỗi gửi Email");
                }
            }

            // 2. Send In-App Notification (FREE, unlimited)
            try
            {
                await SendInAppNotification(options);
                results.Add("In-App");
                _logger?.LogInformation("Đã gửi thông báo In-App cho {Name}", user.name);
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Lỗi gửi In-App notification");
            }

            if (results.Count > 0)
            {
                _logger?.LogInformation("Đã gửi thông báo qua: {Results}", string.Join(", ", results));
            }
            else
            {
                _logger?.LogWarning("Không thể gửi thông báo cho {Name}", user.name);
            }
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Lỗi khi gửi thông báo");
            // Don't throw to not affect main flow
        }
    }

    private async Task SendEmailNotification(EmailParams @params)
    {
        var emailService = _configuration["EMAIL_SERVICE"];
        var emailFrom = _configuration["EMAIL_FROM"];
        var smtpHost = _configuration["SMTP_HOST"];
        var smtpPort = _configuration["SMTP_PORT"];
        var smtpUser = _configuration["SMTP_USER"];
        var smtpPass = _configuration["SMTP_PASS"];

        // If email not configured, just log
        if (string.IsNullOrEmpty(emailService) && string.IsNullOrEmpty(smtpHost))
        {
            _logger?.LogInformation("Email chưa được cấu hình. To: {To}, Subject: {Subject}", @params.To, @params.Subject);
            return;
        }

        try
        {
            using var client = new SmtpClient();
            
            if (!string.IsNullOrEmpty(smtpHost))
            {
                client.Host = smtpHost;
                client.Port = int.Parse(smtpPort ?? "587");
                client.EnableSsl = true;
                client.Credentials = new NetworkCredential(smtpUser, smtpPass);
            }
            else if (emailService?.ToLower() == "gmail")
            {
                client.Host = "smtp.gmail.com";
                client.Port = 587;
                client.EnableSsl = true;
                client.Credentials = new NetworkCredential(emailFrom, _configuration["GMAIL_APP_PASSWORD"]);
            }
            else if (emailService?.ToLower() == "outlook")
            {
                client.Host = "smtp-mail.outlook.com";
                client.Port = 587;
                client.EnableSsl = true;
                client.Credentials = new NetworkCredential(emailFrom, _configuration["OUTLOOK_PASSWORD"]);
            }

            var message = new MailMessage
            {
                From = new MailAddress(emailFrom ?? smtpUser ?? "noreply@constructos.com"),
                Subject = @params.Subject,
                Body = $@"
Xin chào {@params.Name},

{@params.Message}

Trân trọng,
ConstructOs Team
",
                IsBodyHtml = false
            };

            message.To.Add(@params.To);

            await client.SendMailAsync(message);
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Lỗi gửi email");
            throw;
        }
    }

    private async Task SendInAppNotification(NotificationOptions options)
    {
        var id = Guid.NewGuid().ToString();
        var createdAt = DataHelpers.ToMySQLDateTime();

        await _db.ExecuteAsync(
            @"INSERT INTO notifications (id, user_id, title, message, type, priority, metadata, is_read, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            new
            {
                id,
                userId = options.UserId,
                title = options.Title,
                message = options.Message,
                type = options.Type ?? "system",
                priority = options.Priority ?? "normal",
                metadata = options.Metadata != null ? System.Text.Json.JsonSerializer.Serialize(options.Metadata) : null,
                isRead = false,
                createdAt
            });

        // TODO: Send via SignalR if available
        // await _hubContext.Clients.User(options.UserId).SendAsync("ReceiveNotification", notification);
    }
}

public class NotificationOptions
{
    public string UserId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Priority { get; set; } // "low", "normal", "high"
    public string? Type { get; set; } // "task_assignment", "task_update", "message", "system"
    public Dictionary<string, object>? Metadata { get; set; }
}

internal class EmailParams
{
    public string To { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

