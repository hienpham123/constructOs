using ConstructOs.Server.Config;
using ConstructOs.Server.Hubs;
using ConstructOs.Server.Middleware;
using ConstructOs.Server.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Text.Json;

namespace ConstructOs.Server.Controllers;

[ApiController]
[Route("api/group-chats")]
[Authorize]
public class GroupChatController : ControllerBase
{
    private readonly IDatabaseService _db;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;
    private readonly IHubContext<GroupChatHub> _hubContext;

    public GroupChatController(
        IDatabaseService db,
        IConfiguration configuration,
        IWebHostEnvironment environment,
        IHubContext<GroupChatHub> hubContext)
    {
        _db = db;
        _configuration = configuration;
        _environment = environment;
        _hubContext = hubContext;
    }

    private string GetGroupAvatarUrl(string? filename)
    {
        if (string.IsNullOrEmpty(filename)) return string.Empty;
        if (filename.StartsWith("http://") || filename.StartsWith("https://")) return filename;
        
        if (Utils.SupabaseStorage.IsSupabaseStorageEnabled(_configuration))
        {
            return Utils.SupabaseStorage.GetSupabaseStorageUrl(_configuration, "group-avatars", filename);
        }
        
        var baseUrl = _configuration["API_BASE_URL"] ?? 
                     _configuration["SERVER_URL"] ?? 
                     (_configuration["ASPNETCORE_ENVIRONMENT"] == "Production"
                        ? _configuration["PRODUCTION_API_URL"] ?? "https://your-api-domain.com"
                        : "http://localhost:2222");
        
        return $"{baseUrl}/uploads/group-avatars/{filename}";
    }

    private string GetMessageAttachmentUrl(string? filename)
    {
        if (string.IsNullOrEmpty(filename)) return string.Empty;
        if (filename.StartsWith("http://") || filename.StartsWith("https://")) return filename;
        
        if (Utils.SupabaseStorage.IsSupabaseStorageEnabled(_configuration))
        {
            return Utils.SupabaseStorage.GetSupabaseStorageUrl(_configuration, "group-messages", filename);
        }
        
        var baseUrl = _configuration["API_BASE_URL"] ?? 
                     _configuration["SERVER_URL"] ?? 
                     (_configuration["ASPNETCORE_ENVIRONMENT"] == "Production"
                        ? _configuration["PRODUCTION_API_URL"] ?? "https://your-api-domain.com"
                        : "http://localhost:2222");
        
        return $"{baseUrl}/uploads/group-messages/{filename}";
    }

    [HttpGet]
    public async Task<IActionResult> GetGroups()
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var userGroups = await _db.QueryAsync<dynamic>(
                @"SELECT gc.*, gm.pinned, gm.pinned_at
                  FROM group_chats gc
                  INNER JOIN group_members gm ON gc.id = gm.group_id
                  WHERE gm.user_id = ?",
                new[] { userId }
            );

            var groups = new List<dynamic>();
            foreach (var ug in userGroups)
            {
                var memberCount = await _db.QueryFirstOrDefaultAsync<dynamic>(
                    "SELECT COUNT(*) as count FROM group_members WHERE group_id = ?",
                    new[] { ug.id }
                );

                var lastMessageAt = await _db.QueryFirstOrDefaultAsync<dynamic>(
                    "SELECT MAX(created_at) as last_message_at FROM group_messages WHERE group_id = ?",
                    new[] { ug.id }
                );

                var groupDict = (IDictionary<string, object>)ug;
                groupDict["member_count"] = Convert.ToInt32(memberCount?.count ?? 0);
                groupDict["last_message_at"] = lastMessageAt?.last_message_at;
                groups.Add(groupDict);
            }

            // Sort groups
            groups = groups.OrderByDescending(g => Convert.ToBoolean(g.pinned ?? false))
                          .ThenByDescending(g => g.last_message_at != null ? DateTime.Parse(g.last_message_at?.ToString() ?? "") : DateTime.MinValue)
                          .ThenByDescending(g => DateTime.Parse(g.created_at?.ToString() ?? ""))
                          .ToList();

            var groupsWithDetails = new List<dynamic>();
            foreach (var group in groups)
            {
                var avatarUrl = group.avatar != null ? GetGroupAvatarUrl(group.avatar?.ToString()) : null;

                var lastMessage = await _db.QueryAsync<dynamic>(
                    @"SELECT gmsg.*, u.name as user_name, u.avatar as user_avatar
                      FROM group_messages gmsg
                      LEFT JOIN users u ON gmsg.user_id = u.id
                      WHERE gmsg.group_id = ?
                      ORDER BY gmsg.created_at DESC
                      LIMIT 1",
                    new[] { group.id }
                );

                var memberInfo = await _db.QueryAsync<dynamic>(
                    "SELECT last_read_at FROM group_members WHERE group_id = ? AND user_id = ?",
                    new[] { group.id, userId }
                );

                var lastReadAt = memberInfo.Any() ? memberInfo.First().last_read_at : null;
                int unreadCount = 0;

                if (lastReadAt != null)
                {
                    var unreadResult = await _db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT COUNT(*) as count FROM group_messages WHERE group_id = ? AND created_at > ?",
                        new[] { group.id, lastReadAt }
                    );
                    unreadCount = Convert.ToInt32(unreadResult?.count ?? 0);
                }
                else
                {
                    var unreadResult = await _db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT COUNT(*) as count FROM group_messages WHERE group_id = ?",
                        new[] { group.id }
                    );
                    unreadCount = Convert.ToInt32(unreadResult?.count ?? 0);
                }

                groupsWithDetails.Add(new
                {
                    id = group.id,
                    name = group.name,
                    avatar = avatarUrl,
                    description = group.description,
                    createdBy = group.created_by,
                    memberCount = Convert.ToInt32(group.member_count ?? 0),
                    unreadCount,
                    lastMessageAt = group.last_message_at,
                    pinned = Convert.ToBoolean(group.pinned ?? false),
                    pinnedAt = group.pinned_at,
                    lastMessage = lastMessage.Any() ? new
                    {
                        id = lastMessage.First().id,
                        content = lastMessage.First().content,
                        userName = lastMessage.First().user_name,
                        createdAt = lastMessage.First().created_at
                    } : null,
                    createdAt = group.created_at,
                    updatedAt = group.updated_at
                });
            }

            return Ok(groupsWithDetails);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching groups: {ex}");
            return StatusCode(500, new { error = "Không thể lấy danh sách nhóm" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetGroupById(string id)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var member = await _db.QueryAsync<dynamic>(
                "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
                new[] { id, userId }
            );

            if (!member.Any())
            {
                return StatusCode(403, new { error = "Bạn không phải thành viên của nhóm này" });
            }

            var groups = await _db.QueryAsync<dynamic>("SELECT * FROM group_chats WHERE id = ?", new[] { id });
            if (!groups.Any())
            {
                return NotFound(new { error = "Không tìm thấy nhóm" });
            }

            var group = groups.First();
            var members = await _db.QueryAsync<dynamic>(
                @"SELECT gm.*, u.name, u.email, u.avatar, u.phone
                  FROM group_members gm
                  LEFT JOIN users u ON gm.user_id = u.id
                  WHERE gm.group_id = ?
                  ORDER BY 
                    CASE gm.role
                      WHEN 'owner' THEN 1
                      WHEN 'admin' THEN 2
                      ELSE 3
                    END,
                    gm.joined_at ASC",
                new[] { id }
            );

            var userMember = await _db.QueryAsync<dynamic>(
                "SELECT pinned, pinned_at FROM group_members WHERE group_id = ? AND user_id = ?",
                new[] { id, userId }
            );

            var avatarUrl = group.avatar != null ? GetGroupAvatarUrl(group.avatar?.ToString()) : null;

            var membersWithAvatars = members.Select(m => new
            {
                id = m.id,
                userId = m.user_id,
                groupId = m.group_id,
                role = m.role,
                name = m.name,
                email = m.email,
                phone = m.phone,
                avatar = FileUploadHelper.GetAvatarUrl(m.avatar?.ToString(), _configuration),
                joinedAt = m.joined_at,
                lastReadAt = m.last_read_at
            }).ToList();

            return Ok(new
            {
                id = group.id,
                name = group.name,
                avatar = avatarUrl,
                description = group.description,
                createdBy = group.created_by,
                members = membersWithAvatars,
                pinned = userMember.Any() && Convert.ToBoolean(userMember.First().pinned ?? false),
                pinnedAt = userMember.Any() ? userMember.First().pinned_at : null,
                createdAt = group.created_at,
                updatedAt = group.updated_at
            });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching group: {ex}");
            return StatusCode(500, new { error = "Không thể lấy thông tin nhóm" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateGroup([FromForm] string name, [FromForm] string? description, 
        [FromForm] IFormFile? avatar, [FromForm] string? memberIds)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest(new { error = "Tên nhóm là bắt buộc" });
            }

            var groupId = Guid.NewGuid().ToString();
            var now = DataHelpers.ToMySQLDateTime();

            string? avatarFilename = null;
            if (avatar != null)
            {
                if (!FileUploadHelper.IsImageFile(avatar))
                {
                    return BadRequest(new { error = "Chỉ chấp nhận file ảnh" });
                }

                var (filename, url) = await FileUploadHelper.HandleFileUpload(avatar, "group-avatars", _configuration, _environment);
                avatarFilename = url.StartsWith("http") ? url : filename;
            }

            await _db.ExecuteAsync(
                @"INSERT INTO group_chats (id, name, avatar, description, created_by, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?)",
                new object[] { groupId, name.Trim(), avatarFilename, description ?? null, userId, now, now }
            );

            await _db.ExecuteAsync(
                @"INSERT INTO group_members (id, group_id, user_id, role, joined_at)
                  VALUES (?, ?, ?, 'owner', ?)",
                new object[] { Guid.NewGuid().ToString(), groupId, userId, now }
            );

            if (!string.IsNullOrEmpty(memberIds))
            {
                List<string> memberIdsList;
                try
                {
                    memberIdsList = JsonSerializer.Deserialize<List<string>>(memberIds) ?? new List<string>();
                }
                catch
                {
                    memberIdsList = new List<string> { memberIds };
                }

                var uniqueMemberIds = memberIdsList.Where(id => !string.IsNullOrEmpty(id) && id != userId).Distinct().ToList();
                foreach (var memberId in uniqueMemberIds)
                {
                    await _db.ExecuteAsync(
                        @"INSERT INTO group_members (id, group_id, user_id, role, joined_at)
                          VALUES (?, ?, ?, 'member', ?)",
                        new object[] { Guid.NewGuid().ToString(), groupId, memberId, now }
                    );
                }
            }

            var created = await _db.QueryAsync<dynamic>("SELECT * FROM group_chats WHERE id = ?", new[] { groupId });
            var avatarUrl = created.Any() && created.First().avatar != null 
                ? GetGroupAvatarUrl(created.First().avatar?.ToString()) 
                : null;

            return StatusCode(201, new
            {
                id = created.First().id,
                name = created.First().name,
                avatar = avatarUrl,
                description = created.First().description,
                createdBy = created.First().created_by,
                createdAt = created.First().created_at,
                updatedAt = created.First().updated_at
            });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error creating group: {ex}");
            return StatusCode(500, new { error = "Không thể tạo nhóm" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGroup(string id, [FromForm] string? name, [FromForm] string? description, [FromForm] IFormFile? avatar)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var member = await _db.QueryAsync<dynamic>(
                "SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role IN ('owner', 'admin')",
                new[] { id, userId }
            );

            if (!member.Any())
            {
                return StatusCode(403, new { error = "Bạn không có quyền chỉnh sửa nhóm này" });
            }

            var now = DataHelpers.ToMySQLDateTime();
            var updates = new List<string>();
            var values = new List<object>();

            if (!string.IsNullOrEmpty(name))
            {
                updates.Add("name = ?");
                values.Add(name.Trim());
            }

            if (description != null)
            {
                updates.Add("description = ?");
                values.Add(description);
            }

            if (avatar != null)
            {
                if (!FileUploadHelper.IsImageFile(avatar))
                {
                    return BadRequest(new { error = "Chỉ chấp nhận file ảnh" });
                }

                var (filename, url) = await FileUploadHelper.HandleFileUpload(avatar, "group-avatars", _configuration, _environment);
                var avatarValue = url.StartsWith("http") ? url : filename;
                updates.Add("avatar = ?");
                values.Add(avatarValue);
            }

            if (updates.Count == 0)
            {
                return BadRequest(new { error = "Không có thay đổi nào" });
            }

            updates.Add("updated_at = ?");
            values.Add(now);
            values.Add(id);

            await _db.ExecuteAsync(
                $"UPDATE group_chats SET {string.Join(", ", updates)} WHERE id = ?",
                values.ToArray()
            );

            var updated = await _db.QueryAsync<dynamic>("SELECT * FROM group_chats WHERE id = ?", new[] { id });
            var avatarUrl = updated.Any() && updated.First().avatar != null 
                ? GetGroupAvatarUrl(updated.First().avatar?.ToString()) 
                : null;

            return Ok(new
            {
                id = updated.First().id,
                name = updated.First().name,
                avatar = avatarUrl,
                description = updated.First().description,
                createdBy = updated.First().created_by,
                createdAt = updated.First().created_at,
                updatedAt = updated.First().updated_at
            });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error updating group: {ex}");
            return StatusCode(500, new { error = "Không thể cập nhật nhóm" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGroup(string id)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var member = await _db.QueryAsync<dynamic>(
                "SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'owner'",
                new[] { id, userId }
            );

            if (!member.Any())
            {
                return StatusCode(403, new { error = "Chỉ chủ nhóm mới có quyền xóa nhóm" });
            }

            var group = await _db.QueryAsync<dynamic>("SELECT avatar FROM group_chats WHERE id = ?", new[] { id });
            if (group.Any() && group.First().avatar != null)
            {
                var avatarPath = Path.Combine(_environment.ContentRootPath, "uploads", "group-avatars", group.First().avatar?.ToString() ?? "");
                if (System.IO.File.Exists(avatarPath))
                {
                    System.IO.File.Delete(avatarPath);
                }
            }

            await _db.ExecuteAsync("DELETE FROM group_chats WHERE id = ?", new[] { id });
            return Ok(new { message = "Nhóm đã được xóa" });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error deleting group: {ex}");
            return StatusCode(500, new { error = "Không thể xóa nhóm" });
        }
    }

    [HttpPost("{id}/members")]
    public async Task<IActionResult> AddMembers(string id, [FromBody] dynamic requestData)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var memberIds = requestData.memberIds;
            if (memberIds == null)
            {
                return BadRequest(new { error = "Danh sách thành viên là bắt buộc" });
            }

            List<string> memberIdsList;
            try
            {
                memberIdsList = JsonSerializer.Deserialize<List<string>>(memberIds.ToString() ?? "[]") ?? new List<string>();
            }
            catch
            {
                return BadRequest(new { error = "Danh sách thành viên không hợp lệ" });
            }

            if (memberIdsList.Count == 0)
            {
                return BadRequest(new { error = "Danh sách thành viên là bắt buộc" });
            }

            var member = await _db.QueryAsync<dynamic>(
                "SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role IN ('owner', 'admin')",
                new[] { id, userId }
            );

            if (!member.Any())
            {
                return StatusCode(403, new { error = "Bạn không có quyền thêm thành viên" });
            }

            var now = DataHelpers.ToMySQLDateTime();
            var addedMembers = new List<string>();

            foreach (var memberId in memberIdsList)
            {
                var existing = await _db.QueryAsync<dynamic>(
                    "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
                    new[] { id, memberId }
                );

                if (!existing.Any())
                {
                    await _db.ExecuteAsync(
                        @"INSERT INTO group_members (id, group_id, user_id, role, joined_at)
                          VALUES (?, ?, ?, 'member', ?)",
                        new object[] { Guid.NewGuid().ToString(), id, memberId, now }
                    );
                    addedMembers.Add(memberId);
                }
            }

            return Ok(new { message = $"Đã thêm {addedMembers.Count} thành viên", addedMembers });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error adding members: {ex}");
            return StatusCode(500, new { error = "Không thể thêm thành viên" });
        }
    }

    [HttpDelete("{id}/members/{memberId}")]
    public async Task<IActionResult> RemoveMember(string id, string memberId)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var member = await _db.QueryAsync<dynamic>(
                "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
                new[] { id, userId }
            );

            if (!member.Any())
            {
                return StatusCode(403, new { error = "Bạn không phải thành viên của nhóm này" });
            }

            var isOwnerOrAdmin = member.First().role?.ToString() == "owner" || member.First().role?.ToString() == "admin";
            var isRemovingSelf = memberId == userId;

            if (!isOwnerOrAdmin && !isRemovingSelf)
            {
                return StatusCode(403, new { error = "Bạn không có quyền xóa thành viên này" });
            }

            var targetMember = await _db.QueryAsync<dynamic>(
                "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
                new[] { id, memberId }
            );

            if (!targetMember.Any())
            {
                return NotFound(new { error = "Không tìm thấy thành viên" });
            }

            if (targetMember.First().role?.ToString() == "owner")
            {
                return StatusCode(403, new { error = "Không thể xóa chủ nhóm" });
            }

            await _db.ExecuteAsync(
                "DELETE FROM group_members WHERE group_id = ? AND user_id = ?",
                new[] { id, memberId }
            );

            return Ok(new { message = "Đã xóa thành viên khỏi nhóm" });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error removing member: {ex}");
            return StatusCode(500, new { error = "Không thể xóa thành viên" });
        }
    }

    [HttpPost("{id}/transfer-ownership")]
    public async Task<IActionResult> TransferOwnership(string id, [FromBody] dynamic requestData)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var newOwnerId = requestData.newOwnerId?.ToString();
            if (string.IsNullOrEmpty(newOwnerId))
            {
                return BadRequest(new { error = "ID chủ nhóm mới là bắt buộc" });
            }

            var member = await _db.QueryAsync<dynamic>(
                "SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'owner'",
                new[] { id, userId }
            );

            if (!member.Any())
            {
                return StatusCode(403, new { error = "Chỉ chủ nhóm mới có quyền chuyển quyền" });
            }

            var newOwner = await _db.QueryAsync<dynamic>(
                "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
                new[] { id, newOwnerId }
            );

            if (!newOwner.Any())
            {
                return NotFound(new { error = "Người dùng không phải thành viên của nhóm" });
            }

            await _db.ExecuteAsync(
                "UPDATE group_members SET role = 'member' WHERE group_id = ? AND user_id = ?",
                new[] { id, userId }
            );
            await _db.ExecuteAsync(
                "UPDATE group_members SET role = 'owner' WHERE group_id = ? AND user_id = ?",
                new[] { id, newOwnerId }
            );

            return Ok(new { message = "Đã chuyển quyền chủ nhóm" });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error transferring ownership: {ex}");
            return StatusCode(500, new { error = "Không thể chuyển quyền chủ nhóm" });
        }
    }

    [HttpGet("{id}/messages")]
    public async Task<IActionResult> GetMessages(string id, [FromQuery] int? limit, [FromQuery] int? offset)
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

            var member = await _db.QueryAsync<dynamic>(
                "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
                new[] { id, userId }
            );

            if (!member.Any())
            {
                return StatusCode(403, new { error = "Bạn không phải thành viên của nhóm này" });
            }

            var messages = await _db.QueryAsync<dynamic>(
                $@"SELECT gmsg.*, u.name as user_name, u.avatar as user_avatar
                   FROM group_messages gmsg
                   LEFT JOIN users u ON gmsg.user_id = u.id
                   WHERE gmsg.group_id = ?
                   ORDER BY gmsg.created_at DESC
                   LIMIT {limitNum} OFFSET {offsetNum}",
                new[] { id }
            );

            var messagesWithAttachments = new List<dynamic>();
            foreach (var msg in messages)
            {
                var attachments = await _db.QueryAsync<dynamic>(
                    "SELECT * FROM group_message_attachments WHERE message_id = ? ORDER BY created_at ASC",
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

                var avatarUrl = FileUploadHelper.GetAvatarUrl(msg.user_avatar?.ToString(), _configuration);

                messagesWithAttachments.Add(new
                {
                    id = msg.id,
                    groupId = msg.group_id,
                    userId = msg.user_id,
                    userName = msg.user_name,
                    userAvatar = avatarUrl,
                    content = msg.content,
                    attachments = attachmentsWithUrls,
                    createdAt = msg.created_at,
                    updatedAt = msg.updated_at
                });
            }

            var now = DataHelpers.ToMySQLDateTime();
            await _db.ExecuteAsync(
                "UPDATE group_members SET last_read_at = ? WHERE group_id = ? AND user_id = ?",
                new object[] { now, id, userId }
            );

            return Ok(messagesWithAttachments.Reverse<dynamic>().ToList());
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching messages: {ex}");
            return StatusCode(500, new { error = "Không thể lấy tin nhắn" });
        }
    }

    [HttpGet("{id}/messages/search")]
    public async Task<IActionResult> SearchMessages(string id, [FromQuery] string? query, 
        [FromQuery] string? senderId, [FromQuery] string? startDate, [FromQuery] string? endDate,
        [FromQuery] int? limit, [FromQuery] int? offset)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var member = await _db.QueryAsync<dynamic>(
                "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
                new[] { id, userId }
            );

            if (!member.Any())
            {
                return StatusCode(403, new { error = "Bạn không phải thành viên của nhóm này" });
            }

            var limitNum = limit ?? 50;
            var offsetNum = offset ?? 0;

            var conditions = new List<string> { "gmsg.group_id = ?" };
            var queryParams = new List<object> { id };

            if (!string.IsNullOrWhiteSpace(query))
            {
                conditions.Add("gmsg.content LIKE ?");
                queryParams.Add($"%{query.Trim()}%");
            }

            if (!string.IsNullOrEmpty(senderId))
            {
                conditions.Add("gmsg.user_id = ?");
                queryParams.Add(senderId);
            }

            if (!string.IsNullOrEmpty(startDate))
            {
                conditions.Add("gmsg.created_at >= ?");
                queryParams.Add(startDate);
            }

            if (!string.IsNullOrEmpty(endDate))
            {
                conditions.Add("gmsg.created_at <= ?");
                queryParams.Add(endDate);
            }

            var whereClause = conditions.Count > 0 ? $"WHERE {string.Join(" AND ", conditions)}" : "";

            var messages = await _db.QueryAsync<dynamic>(
                $@"SELECT gmsg.*, u.name as user_name, u.avatar as user_avatar
                   FROM group_messages gmsg
                   LEFT JOIN users u ON gmsg.user_id = u.id
                   {whereClause}
                   ORDER BY gmsg.created_at DESC
                   LIMIT {limitNum} OFFSET {offsetNum}",
                queryParams.ToArray()
            );

            var messagesWithAttachments = new List<dynamic>();
            foreach (var msg in messages)
            {
                var attachments = await _db.QueryAsync<dynamic>(
                    "SELECT * FROM group_message_attachments WHERE message_id = ? ORDER BY created_at ASC",
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

                var avatarUrl = FileUploadHelper.GetAvatarUrl(msg.user_avatar?.ToString(), _configuration);

                messagesWithAttachments.Add(new
                {
                    id = msg.id,
                    groupId = msg.group_id,
                    userId = msg.user_id,
                    userName = msg.user_name,
                    userAvatar = avatarUrl,
                    content = msg.content,
                    attachments = attachmentsWithUrls,
                    createdAt = msg.created_at,
                    updatedAt = msg.updated_at
                });
            }

            return Ok(messagesWithAttachments);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error searching messages: {ex}");
            return StatusCode(500, new { error = "Không thể tìm kiếm tin nhắn" });
        }
    }

    [HttpPost("{id}/messages")]
    public async Task<IActionResult> SendMessage(string id, [FromForm] string? content, [FromForm] IFormFileCollection? files)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var hasContent = !string.IsNullOrWhiteSpace(content);
            var hasFiles = files != null && files.Count > 0;

            if (!hasContent && !hasFiles)
            {
                return BadRequest(new { error = "Nội dung hoặc file đính kèm là bắt buộc" });
            }

            var member = await _db.QueryAsync<dynamic>(
                "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
                new[] { id, userId }
            );

            if (!member.Any())
            {
                return StatusCode(403, new { error = "Bạn không phải thành viên của nhóm này" });
            }

            var messageId = Guid.NewGuid().ToString();
            var now = DataHelpers.ToMySQLDateTime();

            await _db.ExecuteAsync(
                @"INSERT INTO group_messages (id, group_id, user_id, content, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?)",
                new object[] { messageId, id, userId, content ?? "", now, now }
            );

            var attachments = new List<dynamic>();
            if (files != null && files.Count > 0)
            {
                foreach (var file in files)
                {
                    var attachmentId = Guid.NewGuid().ToString();
                    var (filename, url) = await FileUploadHelper.HandleFileUpload(file, "group-messages", _configuration, _environment);

                    await _db.ExecuteAsync(
                        @"INSERT INTO group_message_attachments (id, message_id, filename, original_filename, file_type, file_size, file_url, created_at)
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
                @"SELECT gmsg.*, u.name as user_name, u.avatar as user_avatar
                  FROM group_messages gmsg
                  LEFT JOIN users u ON gmsg.user_id = u.id
                  WHERE gmsg.id = ?",
                new[] { messageId }
            );

            var avatarUrl = FileUploadHelper.GetAvatarUrl(created.First().user_avatar?.ToString(), _configuration);

            var message = new
            {
                id = created.First().id,
                groupId = created.First().group_id,
                userId = created.First().user_id,
                userName = created.First().user_name,
                userAvatar = avatarUrl,
                content = created.First().content,
                attachments,
                createdAt = created.First().created_at,
                updatedAt = created.First().updated_at
            };

            // Broadcast to group via SignalR (excluding sender)
            await _hubContext.Clients.Group($"group-{id}").SendAsync("GroupMessageReceived", new
            {
                groupId = id,
                message
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

            var messages = await _db.QueryAsync<dynamic>("SELECT * FROM group_messages WHERE id = ?", new[] { messageId });
            if (!messages.Any())
            {
                return NotFound(new { error = "Không tìm thấy tin nhắn" });
            }

            var message = messages.First();
            if (message.user_id?.ToString() != userId)
            {
                return StatusCode(403, new { error = "Bạn chỉ có thể chỉnh sửa tin nhắn của chính mình" });
            }

            // Check if message is older than 30 minutes
            var timeCheckQuery = SqlHelpers.GetMinutesAgoSelectQuery(_db, "created_at", "group_messages", "id = ?");
            var timeCheck = await _db.QueryFirstOrDefaultAsync<dynamic>(timeCheckQuery, new[] { messageId });
            if (timeCheck != null && Convert.ToDouble(timeCheck.minutes_ago ?? 0) > 30)
            {
                return StatusCode(403, new { error = "Không thể chỉnh sửa tin nhắn sau 30 phút" });
            }

            var attachments = await _db.QueryAsync<dynamic>(
                "SELECT * FROM group_message_attachments WHERE message_id = ?",
                new[] { messageId }
            );

            if (attachments.Any())
            {
                return BadRequest(new { error = "Không thể chỉnh sửa tin nhắn có file đính kèm" });
            }

            var now = DataHelpers.ToMySQLDateTime();
            await _db.ExecuteAsync(
                "UPDATE group_messages SET content = ?, updated_at = ? WHERE id = ?",
                new object[] { content, now, messageId }
            );

            var updated = await _db.QueryAsync<dynamic>(
                @"SELECT gmsg.*, u.name as user_name, u.avatar as user_avatar
                  FROM group_messages gmsg
                  LEFT JOIN users u ON gmsg.user_id = u.id
                  WHERE gmsg.id = ?",
                new[] { messageId }
            );

            var avatarUrl = FileUploadHelper.GetAvatarUrl(updated.First().user_avatar?.ToString(), _configuration);

            var updatedMessage = new
            {
                id = updated.First().id,
                groupId = updated.First().group_id,
                userId = updated.First().user_id,
                userName = updated.First().user_name,
                userAvatar = avatarUrl,
                content = updated.First().content,
                attachments = new List<dynamic>(),
                createdAt = updated.First().created_at,
                updatedAt = updated.First().updated_at
            };

            // Broadcast update via SignalR
            await _hubContext.Clients.Group($"group-{updated.First().group_id}").SendAsync("GroupMessageUpdated", new
            {
                groupId = updated.First().group_id,
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

            var messages = await _db.QueryAsync<dynamic>("SELECT * FROM group_messages WHERE id = ?", new[] { messageId });
            if (!messages.Any())
            {
                return NotFound(new { error = "Không tìm thấy tin nhắn" });
            }

            var message = messages.First();
            var member = await _db.QueryAsync<dynamic>(
                @"SELECT gm.* FROM group_members gm
                  WHERE gm.group_id = ? AND gm.user_id = ? AND gm.role IN ('owner', 'admin')",
                new[] { message.group_id, userId }
            );

            var isSender = message.user_id?.ToString() == userId;
            var isAdminOrOwner = member.Any();

            if (!isSender && !isAdminOrOwner)
            {
                return StatusCode(403, new { error = "Bạn không có quyền xóa tin nhắn này" });
            }

            if (isSender && !isAdminOrOwner)
            {
                var timeCheckQuery = SqlHelpers.GetMinutesAgoSelectQuery(_db, "created_at", "group_messages", "id = ?");
                var timeCheck = await _db.QueryFirstOrDefaultAsync<dynamic>(timeCheckQuery, new[] { messageId });
                if (timeCheck != null && Convert.ToDouble(timeCheck.minutes_ago ?? 0) > 30)
                {
                    return StatusCode(403, new { error = "Không thể xóa tin nhắn sau 30 phút" });
                }
            }

            var attachments = await _db.QueryAsync<dynamic>(
                "SELECT * FROM group_message_attachments WHERE message_id = ?",
                new[] { messageId }
            );

            foreach (var att in attachments)
            {
                try
                {
                    var filePath = Path.Combine(_environment.ContentRootPath, "uploads", "group-messages", att.filename?.ToString() ?? "");
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

            var groupId = message.group_id?.ToString();
            await _db.ExecuteAsync("DELETE FROM group_messages WHERE id = ?", new[] { messageId });

            // Broadcast deletion via SignalR
            await _hubContext.Clients.Group($"group-{groupId}").SendAsync("GroupMessageDeleted", new
            {
                groupId,
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

    [HttpPost("{id}/pin")]
    public async Task<IActionResult> TogglePinGroup(string id)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var member = await _db.QueryAsync<dynamic>(
                "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
                new[] { id, userId }
            );

            if (!member.Any())
            {
                return StatusCode(403, new { error = "Bạn không phải thành viên của nhóm này" });
            }

            var currentPinned = Convert.ToBoolean(member.First().pinned ?? false);
            var newPinned = !currentPinned;
            var now = DataHelpers.ToMySQLDateTime();

            await _db.ExecuteAsync(
                @"UPDATE group_members SET pinned = ?, pinned_at = ? WHERE group_id = ? AND user_id = ?",
                new object[] { newPinned, newPinned ? now : null, id, userId }
            );

            return Ok(new
            {
                message = newPinned ? "Đã ghim nhóm" : "Đã bỏ ghim nhóm",
                pinned = newPinned
            });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error toggling pin: {ex}");
            return StatusCode(500, new { error = "Không thể thay đổi trạng thái ghim" });
        }
    }
}

