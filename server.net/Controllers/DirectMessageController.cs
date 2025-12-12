using ConstructOs.Server.Config;
using ConstructOs.Server.Hubs;
using ConstructOs.Server.Middleware;
using ConstructOs.Server.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ConstructOs.Server.Controllers;

[ApiController]
[Route("api/direct-messages")]
[Authorize]
public class DirectMessageController : ControllerBase
{
    private readonly IDatabaseService _db;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;
    private readonly IHubContext<DirectMessageHub> _hubContext;

    public DirectMessageController(
        IDatabaseService db,
        IConfiguration configuration,
        IWebHostEnvironment environment,
        IHubContext<DirectMessageHub> hubContext)
    {
        _db = db;
        _configuration = configuration;
        _environment = environment;
        _hubContext = hubContext;
    }

    private string GetMessageAttachmentUrl(string? filename)
    {
        if (string.IsNullOrEmpty(filename)) return string.Empty;
        if (filename.StartsWith("http://") || filename.StartsWith("https://")) return filename;
        
        if (Utils.SupabaseStorage.IsSupabaseStorageEnabled(_configuration))
        {
            return Utils.SupabaseStorage.GetSupabaseStorageUrl(_configuration, "direct-messages", filename);
        }
        
        var baseUrl = _configuration["API_BASE_URL"] ?? 
                     _configuration["SERVER_URL"] ?? 
                     (_configuration["ASPNETCORE_ENVIRONMENT"] == "Production"
                        ? _configuration["PRODUCTION_API_URL"] ?? "https://your-api-domain.com"
                        : "http://localhost:2222");
        
        return $"{baseUrl}/uploads/direct-messages/{filename}";
    }

    private async Task<string> GetOrCreateConversation(string user1Id, string user2Id)
    {
        if (string.IsNullOrEmpty(user1Id) || string.IsNullOrEmpty(user2Id))
        {
            throw new Exception("user1Id and user2Id are required");
        }

        if (user1Id == user2Id)
        {
            throw new Exception("Cannot create conversation with yourself");
        }

        var u1 = user1Id.CompareTo(user2Id) < 0 ? user1Id : user2Id;
        var u2 = user1Id.CompareTo(user2Id) < 0 ? user2Id : user1Id;

        var existing = await _db.QueryAsync<dynamic>(
            "SELECT id FROM conversations WHERE user1_id = ? AND user2_id = ?",
            new[] { u1, u2 }
        );

        if (existing.Any())
        {
            return existing.First().id?.ToString() ?? "";
        }

        var conversationId = Guid.NewGuid().ToString();
        var now = DataHelpers.ToMySQLDateTime();
        await _db.ExecuteAsync(
            @"INSERT INTO conversations (id, user1_id, user2_id, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?)",
            new object[] { conversationId, u1, u2, now, now }
        );

        return conversationId;
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var conversations = await _db.QueryAsync<dynamic>(
                @"SELECT c.*,
                  CASE 
                    WHEN c.user1_id = ? THEN c.user2_id 
                    ELSE c.user1_id 
                  END as other_user_id
                  FROM conversations c
                  WHERE (c.user1_id = ? OR c.user2_id = ?)
                    AND (CASE 
                      WHEN c.user1_id = ? THEN c.user1_deleted_at IS NULL
                      ELSE c.user2_deleted_at IS NULL
                    END)
                  ORDER BY c.updated_at DESC",
                new[] { userId, userId, userId, userId }
            );

            var conversationsWithDetails = new List<dynamic>();
            foreach (var conv in conversations)
            {
                var otherUserId = conv.other_user_id?.ToString();
                if (string.IsNullOrEmpty(otherUserId)) continue;

                var userResult = await _db.QueryAsync<dynamic>(
                    "SELECT id, name, email, avatar, status FROM users WHERE id = ?",
                    new[] { otherUserId }
                );

                if (!userResult.Any()) continue;

                var otherUser = userResult.First();
                var avatarUrl = FileUploadHelper.GetAvatarUrl(otherUser.avatar?.ToString(), _configuration);

                var lastMessageResult = await _db.QueryAsync<dynamic>(
                    @"SELECT dm.*, u.name as sender_name, u.avatar as sender_avatar
                      FROM direct_messages dm
                      LEFT JOIN users u ON dm.sender_id = u.id
                      WHERE dm.conversation_id = ?
                      ORDER BY dm.created_at DESC
                      LIMIT 1",
                    new[] { conv.id }
                );

                var lastReadField = conv.user1_id?.ToString() == userId ? "user1_last_read_at" : "user2_last_read_at";
                var lastReadAt = conv.user1_id?.ToString() == userId ? conv.user1_last_read_at : conv.user2_last_read_at;
                int unreadCount = 0;

                if (lastReadAt != null)
                {
                    var unreadResult = await _db.QueryFirstOrDefaultAsync<dynamic>(
                        @"SELECT COUNT(*) as count FROM direct_messages 
                         WHERE conversation_id = ? AND sender_id != ? AND created_at > ?",
                        new[] { conv.id, userId, lastReadAt }
                    );
                    unreadCount = Convert.ToInt32(unreadResult?.count ?? 0);
                }
                else
                {
                    var unreadResult = await _db.QueryFirstOrDefaultAsync<dynamic>(
                        @"SELECT COUNT(*) as count FROM direct_messages 
                         WHERE conversation_id = ? AND sender_id != ?",
                        new[] { conv.id, userId }
                    );
                    unreadCount = Convert.ToInt32(unreadResult?.count ?? 0);
                }

                conversationsWithDetails.Add(new
                {
                    id = conv.id,
                    otherUser = new
                    {
                        id = otherUser.id,
                        name = otherUser.name,
                        email = otherUser.email,
                        avatar = avatarUrl,
                        status = otherUser.status
                    },
                    lastMessage = lastMessageResult.Any() ? new
                    {
                        id = lastMessageResult.First().id,
                        content = lastMessageResult.First().content,
                        senderId = lastMessageResult.First().sender_id,
                        senderName = lastMessageResult.First().sender_name,
                        createdAt = lastMessageResult.First().created_at
                    } : null,
                    unreadCount,
                    updatedAt = conv.updated_at,
                    createdAt = conv.created_at
                });
            }

            return Ok(conversationsWithDetails);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching conversations: {ex}");
            return StatusCode(500, new { error = "Không thể lấy danh sách trò chuyện" });
        }
    }

    [HttpGet("conversations/{conversationId}")]
    public async Task<IActionResult> GetConversation(string conversationId)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var convResult = await _db.QueryAsync<dynamic>(
                "SELECT * FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)",
                new[] { conversationId, userId, userId }
            );

            if (!convResult.Any())
            {
                return NotFound(new { error = "Không tìm thấy cuộc trò chuyện" });
            }

            var conv = convResult.First();
            var otherUserId = conv.user1_id?.ToString() == userId ? conv.user2_id?.ToString() : conv.user1_id?.ToString();

            var userResult = await _db.QueryAsync<dynamic>(
                "SELECT id, name, email, avatar, status FROM users WHERE id = ?",
                new[] { otherUserId }
            );

            if (!userResult.Any())
            {
                return NotFound(new { error = "Không tìm thấy người dùng" });
            }

            var otherUser = userResult.First();
            var avatarUrl = FileUploadHelper.GetAvatarUrl(otherUser.avatar?.ToString(), _configuration);

            var lastReadField = conv.user1_id?.ToString() == userId ? "user1_last_read_at" : "user2_last_read_at";
            var lastReadAt = conv.user1_id?.ToString() == userId ? conv.user1_last_read_at : conv.user2_last_read_at;

            return Ok(new
            {
                id = conversationId,
                otherUser = new
                {
                    id = otherUser.id,
                    name = otherUser.name,
                    email = otherUser.email,
                    avatar = avatarUrl,
                    status = otherUser.status
                },
                lastReadAt,
                createdAt = conv.created_at,
                updatedAt = conv.updated_at
            });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching conversation: {ex}");
            return StatusCode(500, new { error = "Không thể lấy thông tin trò chuyện" });
        }
    }

    [HttpDelete("conversations/{conversationId}")]
    public async Task<IActionResult> DeleteConversation(string conversationId)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var convResult = await _db.QueryAsync<dynamic>(
                "SELECT * FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)",
                new[] { conversationId, userId, userId }
            );

            if (!convResult.Any())
            {
                return NotFound(new { error = "Không tìm thấy cuộc trò chuyện" });
            }

            var conv = convResult.First();
            var now = DataHelpers.ToMySQLDateTime();

            if (conv.user1_id?.ToString() == userId)
            {
                await _db.ExecuteAsync(
                    "UPDATE conversations SET user1_deleted_at = ?, updated_at = ? WHERE id = ?",
                    new object[] { now, now, conversationId }
                );
            }
            else
            {
                await _db.ExecuteAsync(
                    "UPDATE conversations SET user2_deleted_at = ?, updated_at = ? WHERE id = ?",
                    new object[] { now, now, conversationId }
                );
            }

            return Ok(new { message = "Cuộc trò chuyện đã được xóa" });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error deleting conversation: {ex}");
            return StatusCode(500, new { error = "Không thể xóa cuộc trò chuyện" });
        }
    }

    [HttpGet("conversations/{conversationId}/messages")]
    public async Task<IActionResult> GetMessages(string conversationId, [FromQuery] int? limit, [FromQuery] int? offset)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var limitNum = Math.Max(1, Math.Min(limit ?? 50, 100));
            var offsetNum = Math.Max(0, offset ?? 0);

            var convResult = await _db.QueryAsync<dynamic>(
                "SELECT * FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)",
                new[] { conversationId, userId, userId }
            );

            if (!convResult.Any())
            {
                return StatusCode(403, new { error = "Bạn không có quyền truy cập cuộc trò chuyện này" });
            }

            var messages = await _db.QueryAsync<dynamic>(
                $@"SELECT dm.*, u.name as sender_name, u.avatar as sender_avatar
                   FROM direct_messages dm
                   LEFT JOIN users u ON dm.sender_id = u.id
                   WHERE dm.conversation_id = ?
                   ORDER BY dm.created_at DESC
                   LIMIT {limitNum} OFFSET {offsetNum}",
                new[] { conversationId }
            );

            var messagesWithAttachments = new List<dynamic>();
            foreach (var msg in messages)
            {
                var attachments = await _db.QueryAsync<dynamic>(
                    "SELECT * FROM direct_message_attachments WHERE message_id = ? ORDER BY created_at ASC",
                    new[] { msg.id }
                );

                var attachmentsWithUrls = attachments.Select(att => new
                {
                    id = att.id,
                    messageId = att.message_id,
                    filename = att.filename,
                    originalFilename = att.original_filename,
                    fileType = att.file_type,
                    fileSize = att.file_size,
                    fileUrl = GetMessageAttachmentUrl(att.filename?.ToString()),
                    createdAt = att.created_at
                }).ToList();

                var avatarUrl = FileUploadHelper.GetAvatarUrl(msg.sender_avatar?.ToString(), _configuration);

                messagesWithAttachments.Add(new
                {
                    id = msg.id,
                    conversationId = msg.conversation_id,
                    senderId = msg.sender_id,
                    receiverId = msg.receiver_id,
                    senderName = msg.sender_name,
                    senderAvatar = avatarUrl,
                    content = msg.content,
                    attachments = attachmentsWithUrls,
                    createdAt = msg.created_at,
                    updatedAt = msg.updated_at
                });
            }

            var conv = convResult.First();
            var now = DataHelpers.ToMySQLDateTime();
            if (conv.user1_id?.ToString() == userId)
            {
                await _db.ExecuteAsync(
                    "UPDATE conversations SET user1_last_read_at = ?, updated_at = ? WHERE id = ?",
                    new object[] { now, now, conversationId }
                );
            }
            else
            {
                await _db.ExecuteAsync(
                    "UPDATE conversations SET user2_last_read_at = ?, updated_at = ? WHERE id = ?",
                    new object[] { now, now, conversationId }
                );
            }

            return Ok(messagesWithAttachments.Reverse<dynamic>().ToList());
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching messages: {ex}");
            return StatusCode(500, new { error = "Không thể lấy tin nhắn" });
        }
    }

    [HttpPost("users/{receiverId}/messages")]
    public async Task<IActionResult> SendMessage(string receiverId, [FromForm] string? content, [FromForm] IFormFileCollection? files)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            if (string.IsNullOrEmpty(receiverId))
            {
                return BadRequest(new { error = "Thiếu ID người nhận" });
            }

            var hasContent = !string.IsNullOrWhiteSpace(content);
            var hasFiles = files != null && files.Count > 0;

            if (!hasContent && !hasFiles)
            {
                return BadRequest(new { error = "Nội dung hoặc file đính kèm là bắt buộc" });
            }

            if (receiverId == userId)
            {
                return BadRequest(new { error = "Không thể gửi tin nhắn cho chính mình" });
            }

            var conversationId = await GetOrCreateConversation(userId, receiverId);

            var receiverResult = await _db.QueryAsync<dynamic>("SELECT id FROM users WHERE id = ?", new[] { receiverId });
            if (!receiverResult.Any())
            {
                return NotFound(new { error = "Không tìm thấy người nhận" });
            }

            var messageId = Guid.NewGuid().ToString();
            var now = DataHelpers.ToMySQLDateTime();

            await _db.ExecuteAsync(
                @"INSERT INTO direct_messages (id, conversation_id, sender_id, receiver_id, content, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?)",
                new object[] { messageId, conversationId, userId, receiverId, content ?? "", now, now }
            );

            await _db.ExecuteAsync(
                "UPDATE conversations SET updated_at = ? WHERE id = ?",
                new object[] { now, conversationId }
            );

            var attachments = new List<dynamic>();
            if (files != null && files.Count > 0)
            {
                foreach (var file in files)
                {
                    var attachmentId = Guid.NewGuid().ToString();
                    var (filename, url) = await FileUploadHelper.HandleFileUpload(file, "direct-messages", _configuration, _environment);

                    await _db.ExecuteAsync(
                        @"INSERT INTO direct_message_attachments (id, message_id, filename, original_filename, file_type, file_size, file_url, created_at)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        new object[]
                        {
                            attachmentId, messageId, filename, file.FileName, file.ContentType, file.Length,
                            url, now
                        }
                    );

                    attachments.Add(new
                    {
                        id = attachmentId,
                        messageId,
                        filename,
                        originalFilename = file.FileName,
                        fileType = file.ContentType,
                        fileSize = file.Length,
                        fileUrl = url,
                        createdAt = now
                    });
                }
            }

            var created = await _db.QueryAsync<dynamic>(
                @"SELECT dm.*, u.name as sender_name, u.avatar as sender_avatar
                  FROM direct_messages dm
                  LEFT JOIN users u ON dm.sender_id = u.id
                  WHERE dm.id = ?",
                new[] { messageId }
            );

            var avatarUrl = FileUploadHelper.GetAvatarUrl(created.First().sender_avatar?.ToString(), _configuration);

            var message = new
            {
                id = created.First().id,
                conversationId = created.First().conversation_id,
                senderId = created.First().sender_id,
                receiverId = created.First().receiver_id,
                senderName = created.First().sender_name,
                senderAvatar = avatarUrl,
                content = created.First().content,
                attachments,
                createdAt = created.First().created_at,
                updatedAt = created.First().updated_at
            };

            // Send to receiver via SignalR
            await _hubContext.Clients.User(receiverId).SendAsync("DirectMessageReceived", new
            {
                conversationId,
                message
            });

            // Notify receiver about conversation update
            await _hubContext.Clients.Group($"conversation-{conversationId}").SendAsync("ConversationUpdated", new
            {
                conversationId,
                forReceiverOnly = true
            });

            return StatusCode(201, message);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error sending message: {ex}");
            return StatusCode(500, new { error = "Không thể gửi tin nhắn" });
        }
    }

    [HttpPut("messages/{messageId}")]
    public async Task<IActionResult> UpdateMessage(string messageId, [FromBody] dynamic messageData)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var content = messageData.content?.ToString();
            if (string.IsNullOrWhiteSpace(content))
            {
                return BadRequest(new { error = "Nội dung tin nhắn là bắt buộc" });
            }

            var messages = await _db.QueryAsync<dynamic>("SELECT * FROM direct_messages WHERE id = ?", new[] { messageId });
            if (!messages.Any())
            {
                return NotFound(new { error = "Không tìm thấy tin nhắn" });
            }

            var message = messages.First();
            if (message.sender_id?.ToString() != userId)
            {
                return StatusCode(403, new { error = "Bạn chỉ có thể chỉnh sửa tin nhắn của chính mình" });
            }

            // Check if message is older than 30 minutes
            var timeCheckQuery = SqlHelpers.GetMinutesAgoSelectQuery(_db, "created_at", "direct_messages", "id = ?");
            var timeCheck = await _db.QueryFirstOrDefaultAsync<dynamic>(timeCheckQuery, new[] { messageId });
            if (timeCheck != null && Convert.ToDouble(timeCheck.minutes_ago ?? 0) > 30)
            {
                return StatusCode(403, new { error = "Không thể chỉnh sửa tin nhắn sau 30 phút" });
            }

            var attachments = await _db.QueryAsync<dynamic>(
                "SELECT * FROM direct_message_attachments WHERE message_id = ?",
                new[] { messageId }
            );

            if (attachments.Any())
            {
                return BadRequest(new { error = "Không thể chỉnh sửa tin nhắn có file đính kèm" });
            }

            var now = DataHelpers.ToMySQLDateTime();
            await _db.ExecuteAsync(
                "UPDATE direct_messages SET content = ?, updated_at = ? WHERE id = ?",
                new object[] { content, now, messageId }
            );

            var updated = await _db.QueryAsync<dynamic>(
                @"SELECT dm.*, u.name as sender_name, u.avatar as sender_avatar
                  FROM direct_messages dm
                  LEFT JOIN users u ON dm.sender_id = u.id
                  WHERE dm.id = ?",
                new[] { messageId }
            );

            var avatarUrl = FileUploadHelper.GetAvatarUrl(updated.First().sender_avatar?.ToString(), _configuration);

            var updatedMessage = new
            {
                id = updated.First().id,
                conversationId = updated.First().conversation_id,
                senderId = updated.First().sender_id,
                receiverId = updated.First().receiver_id,
                senderName = updated.First().sender_name,
                senderAvatar = avatarUrl,
                content = updated.First().content,
                attachments = new List<dynamic>(),
                createdAt = updated.First().created_at,
                updatedAt = updated.First().updated_at
            };

            // Broadcast update via SignalR
            await _hubContext.Clients.Group($"conversation-{updated.First().conversation_id}").SendAsync("DirectMessageUpdated", new
            {
                conversationId = updated.First().conversation_id,
                message = updatedMessage
            });

            return Ok(updatedMessage);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error updating message: {ex}");
            return StatusCode(500, new { error = "Không thể cập nhật tin nhắn" });
        }
    }

    [HttpDelete("messages/{messageId}")]
    public async Task<IActionResult> DeleteMessage(string messageId)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var messages = await _db.QueryAsync<dynamic>("SELECT * FROM direct_messages WHERE id = ?", new[] { messageId });
            if (!messages.Any())
            {
                return NotFound(new { error = "Không tìm thấy tin nhắn" });
            }

            var message = messages.First();
            if (message.sender_id?.ToString() != userId)
            {
                return StatusCode(403, new { error = "Bạn chỉ có thể xóa tin nhắn của chính mình" });
            }

            // Check if message is older than 30 minutes
            var timeCheckQuery = SqlHelpers.GetMinutesAgoSelectQuery(_db, "created_at", "direct_messages", "id = ?");
            var timeCheck = await _db.QueryFirstOrDefaultAsync<dynamic>(timeCheckQuery, new[] { messageId });
            if (timeCheck != null && Convert.ToDouble(timeCheck.minutes_ago ?? 0) > 30)
            {
                return StatusCode(403, new { error = "Không thể xóa tin nhắn sau 30 phút" });
            }

            var attachments = await _db.QueryAsync<dynamic>(
                "SELECT * FROM direct_message_attachments WHERE message_id = ?",
                new[] { messageId }
            );

            foreach (var att in attachments)
            {
                try
                {
                    var filePath = Path.Combine(_environment.ContentRootPath, "uploads", "direct-messages", att.filename?.ToString() ?? "");
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }
                catch (Exception fileEx)
                {
                    Console.Error.WriteLine($"Error deleting file {att.filename}: {fileEx}");
                }
            }

            var conversationId = message.conversation_id?.ToString();
            await _db.ExecuteAsync("DELETE FROM direct_messages WHERE id = ?", new[] { messageId });

            // Broadcast deletion via SignalR
            await _hubContext.Clients.Group($"conversation-{conversationId}").SendAsync("DirectMessageDeleted", new
            {
                conversationId,
                messageId
            });

            return Ok(new { message = "Tin nhắn đã được xóa" });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error deleting message: {ex}");
            return StatusCode(500, new { error = "Không thể xóa tin nhắn" });
        }
    }
}

