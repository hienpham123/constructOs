using ConstructOs.Server.Config;
using ConstructOs.Server.Middleware;
using ConstructOs.Server.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructOs.Server.Controllers;

[ApiController]
[Route("api/project-comments")]
public class ProjectCommentController : ControllerBase
{
    private readonly IDatabaseService _db;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public ProjectCommentController(IDatabaseService db, IConfiguration configuration, IWebHostEnvironment environment)
    {
        _db = db;
        _configuration = configuration;
        _environment = environment;
    }

    private string GetCommentAttachmentUrl(string? filename)
    {
        if (string.IsNullOrEmpty(filename)) return string.Empty;
        if (filename.StartsWith("http://") || filename.StartsWith("https://")) return filename;
        
        var baseUrl = _configuration["API_BASE_URL"] ?? 
                     _configuration["SERVER_URL"] ?? 
                     (_configuration["ASPNETCORE_ENVIRONMENT"] == "Production"
                        ? _configuration["PRODUCTION_API_URL"] ?? "https://your-api-domain.com"
                        : "http://localhost:2222");
        
        return $"{baseUrl}/uploads/comments/{filename}";
    }

    [HttpGet]
    public async Task<IActionResult> GetComments([FromQuery] string? projectId, [FromQuery] string? category, 
        [FromQuery] int? limit, [FromQuery] int? offset)
    {
        try
        {
            if (string.IsNullOrEmpty(projectId) || string.IsNullOrEmpty(category))
            {
                return BadRequest(new { error = "projectId và category là bắt buộc" });
            }

            if (category != "contract" && category != "project_files")
            {
                return BadRequest(new { error = "category phải là contract hoặc project_files" });
            }

            var limitNum = limit ?? 50;
            var offsetNum = offset ?? 0;

            var comments = await _db.QueryAsync<dynamic>(
                @"SELECT pc.*, u.name as created_by_name, u.avatar as created_by_avatar
                  FROM project_comments pc
                  LEFT JOIN users u ON pc.created_by = u.id
                  WHERE pc.project_id = ? AND pc.category = ?
                  ORDER BY pc.created_at ASC
                  LIMIT ? OFFSET ?",
                new object[] { projectId, category, limitNum, offsetNum }
            );

            var commentsWithAttachments = new List<dynamic>();
            foreach (var comment in comments)
            {
                var attachments = await _db.QueryAsync<dynamic>(
                    "SELECT * FROM comment_attachments WHERE comment_id = ? ORDER BY created_at ASC",
                    new[] { comment.id }
                );

                var attachmentsWithUrls = attachments.Select(att => new
                {
                    id = att.id,
                    commentId = att.comment_id,
                    filename = att.filename,
                    originalFilename = att.original_filename,
                    fileType = att.file_type,
                    fileSize = att.file_size,
                    fileUrl = GetCommentAttachmentUrl(att.filename?.ToString()),
                    createdAt = att.created_at
                }).ToList();

                var avatarUrl = FileUploadHelper.GetAvatarUrl(comment.created_by_avatar?.ToString(), _configuration);

                var commentDict = (IDictionary<string, object>)comment;
                commentDict["createdByAvatar"] = avatarUrl;
                commentDict["attachments"] = attachmentsWithUrls;
                commentsWithAttachments.Add(commentDict);
            }

            return Ok(commentsWithAttachments);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching comments: {ex}");
            return StatusCode(500, new { error = "Không thể lấy danh sách comment" });
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateComment([FromForm] string projectId, [FromForm] string category, 
        [FromForm] string? content, [FromForm] IFormFileCollection? files)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            if (string.IsNullOrEmpty(projectId) || string.IsNullOrEmpty(category))
            {
                return BadRequest(new { error = "projectId và category là bắt buộc" });
            }

            var hasContent = !string.IsNullOrWhiteSpace(content);
            var hasFiles = files != null && files.Count > 0;

            if (!hasContent && !hasFiles)
            {
                return BadRequest(new { error = "Phải có nội dung hoặc file đính kèm" });
            }

            if (category != "contract" && category != "project_files")
            {
                return BadRequest(new { error = "category phải là contract hoặc project_files" });
            }

            var project = await _db.QueryAsync<dynamic>("SELECT id FROM projects WHERE id = ?", new[] { projectId });
            if (!project.Any())
            {
                return NotFound(new { error = "Không tìm thấy dự án" });
            }

            var commentId = Guid.NewGuid().ToString();
            var createdAt = DataHelpers.ToMySQLDateTime();

            await _db.ExecuteAsync(
                @"INSERT INTO project_comments (id, project_id, category, content, created_by, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?)",
                new object[] { commentId, projectId, category, content ?? "", userId, createdAt, createdAt }
            );

            var attachments = new List<dynamic>();
            if (files != null && files.Count > 0)
            {
                foreach (var file in files)
                {
                    var attachmentId = Guid.NewGuid().ToString();
                    var (filename, url) = await FileUploadHelper.HandleFileUpload(file, "comments", _configuration, _environment);

                    await _db.ExecuteAsync(
                        @"INSERT INTO comment_attachments (id, comment_id, filename, original_filename, file_type, file_size, file_url, created_at)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        new object[]
                        {
                            attachmentId, commentId, filename, file.FileName, file.ContentType, file.Length,
                            url, createdAt
                        }
                    );

                    attachments.Add(new
                    {
                        id = attachmentId,
                        commentId,
                        filename,
                        originalFilename = file.FileName,
                        fileType = file.ContentType,
                        fileSize = file.Length,
                        fileUrl = url,
                        createdAt
                    });
                }
            }

            var user = await _db.QueryAsync<dynamic>("SELECT name, avatar FROM users WHERE id = ?", new[] { userId });
            var avatarUrl = user.Any() ? FileUploadHelper.GetAvatarUrl(user.First().avatar?.ToString(), _configuration) : null;

            return StatusCode(201, new
            {
                id = commentId,
                projectId,
                category,
                content = content ?? "",
                createdBy = userId,
                createdByName = user.Any() ? user.First().name : "",
                createdByAvatar = avatarUrl,
                createdAt,
                updatedAt = createdAt,
                attachments
            });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error creating comment: {ex}");
            return StatusCode(500, new { error = "Không thể tạo comment" });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateComment(string id, [FromBody] dynamic commentData)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var content = commentData.content?.ToString();
            if (string.IsNullOrWhiteSpace(content))
            {
                return BadRequest(new { error = "Nội dung comment không được để trống" });
            }

            var comment = await _db.QueryAsync<dynamic>("SELECT * FROM project_comments WHERE id = ?", new[] { id });
            if (!comment.Any())
            {
                return NotFound(new { error = "Không tìm thấy comment" });
            }

            if (comment.First().created_by?.ToString() != userId)
            {
                return StatusCode(403, new { error = "Bạn không có quyền chỉnh sửa comment này" });
            }

            var updatedAt = DataHelpers.ToMySQLDateTime();
            await _db.ExecuteAsync(
                "UPDATE project_comments SET content = ?, updated_at = ? WHERE id = ?",
                new object[] { content.Trim(), updatedAt, id }
            );

            var updated = await _db.QueryAsync<dynamic>(
                @"SELECT pc.*, u.name as created_by_name, u.avatar as created_by_avatar
                  FROM project_comments pc
                  LEFT JOIN users u ON pc.created_by = u.id
                  WHERE pc.id = ?",
                new[] { id }
            );

            if (!updated.Any())
            {
                return NotFound(new { error = "Không tìm thấy comment sau khi cập nhật" });
            }

            var attachments = await _db.QueryAsync<dynamic>(
                "SELECT * FROM comment_attachments WHERE comment_id = ? ORDER BY created_at ASC",
                new[] { id }
            );

            var attachmentsWithUrls = attachments.Select(att => new
            {
                id = att.id,
                commentId = att.comment_id,
                filename = att.filename,
                originalFilename = att.original_filename,
                fileType = att.file_type,
                fileSize = att.file_size,
                fileUrl = GetCommentAttachmentUrl(att.filename?.ToString()),
                createdAt = att.created_at
            }).ToList();

            var avatarUrl = FileUploadHelper.GetAvatarUrl(updated.First().created_by_avatar?.ToString(), _configuration);

            return Ok(new
            {
                id = updated.First().id,
                projectId = updated.First().project_id,
                category = updated.First().category,
                content = updated.First().content,
                createdBy = updated.First().created_by,
                createdByName = updated.First().created_by_name,
                createdByAvatar = avatarUrl,
                createdAt = updated.First().created_at,
                updatedAt = updated.First().updated_at,
                attachments = attachmentsWithUrls
            });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error updating comment: {ex}");
            return StatusCode(500, new { error = "Không thể cập nhật comment" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteComment(string id)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var comment = await _db.QueryAsync<dynamic>("SELECT * FROM project_comments WHERE id = ?", new[] { id });
            if (!comment.Any())
            {
                return NotFound(new { error = "Không tìm thấy comment" });
            }

            if (comment.First().created_by?.ToString() != userId)
            {
                return StatusCode(403, new { error = "Bạn không có quyền xóa comment này" });
            }

            var attachments = await _db.QueryAsync<dynamic>(
                "SELECT * FROM comment_attachments WHERE comment_id = ?",
                new[] { id }
            );

            foreach (var att in attachments)
            {
                try
                {
                    var filePath = Path.Combine(_environment.ContentRootPath, "uploads", "comments", att.filename?.ToString() ?? "");
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

            await _db.ExecuteAsync("DELETE FROM project_comments WHERE id = ?", new[] { id });
            return NoContent();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error deleting comment: {ex}");
            return StatusCode(500, new { error = "Không thể xóa comment" });
        }
    }
}

