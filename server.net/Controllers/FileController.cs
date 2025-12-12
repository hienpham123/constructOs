using ConstructOs.Server.Config;
using Microsoft.AspNetCore.Mvc;

namespace ConstructOs.Server.Controllers;

[ApiController]
[Route("api/files")]
public class FileController : ControllerBase
{
    private readonly IDatabaseService _db;
    private readonly IConfiguration _configuration;

    public FileController(IDatabaseService db, IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
    }

    private string GetFileUrl(string type, string filename)
    {
        var baseUrl = _configuration["API_BASE_URL"] ?? 
                     _configuration["SERVER_URL"] ?? 
                     (_configuration["ASPNETCORE_ENVIRONMENT"] == "Production"
                        ? _configuration["PRODUCTION_API_URL"] ?? "https://your-api-domain.com"
                        : "http://localhost:2222");
        
        return $"{baseUrl}/uploads/{type}/{filename}";
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllFiles([FromQuery] string? type, [FromQuery] int? limit, [FromQuery] int? offset)
    {
        try
        {
            var limitNum = Math.Min(limit ?? 100, 500);
            var offsetNum = Math.Max(offset ?? 0, 0);
            var allFiles = new List<dynamic>();

            if (string.IsNullOrEmpty(type) || type == "avatars")
            {
                var users = await _db.QueryAsync<dynamic>(
                    "SELECT id, name, email, avatar, created_at FROM users WHERE avatar IS NOT NULL AND avatar != ? LIMIT ? OFFSET ?",
                    new object[] { "", limitNum, offsetNum }
                );

                foreach (var user in users)
                {
                    allFiles.Add(new
                    {
                        id = user.id,
                        type = "avatar",
                        category = "users",
                        filename = user.avatar,
                        originalFilename = user.avatar,
                        fileUrl = GetFileUrl("avatars", user.avatar?.ToString() ?? ""),
                        relatedId = user.id,
                        relatedName = user.name,
                        createdAt = user.created_at
                    });
                }
            }

            if (string.IsNullOrEmpty(type) || type == "transactions")
            {
                var attachments = await _db.QueryAsync<dynamic>(
                    @"SELECT ta.*, mt.id as transaction_id, mt.type as transaction_type 
                      FROM transaction_attachments ta
                      LEFT JOIN material_transactions mt ON ta.transaction_id = mt.id
                      ORDER BY ta.created_at DESC
                      LIMIT ? OFFSET ?",
                    new object[] { limitNum, offsetNum }
                );

                foreach (var att in attachments)
                {
                    allFiles.Add(new
                    {
                        id = att.id,
                        type = "attachment",
                        category = "transactions",
                        filename = att.filename,
                        originalFilename = att.original_filename,
                        fileType = att.file_type,
                        fileSize = att.file_size,
                        fileUrl = att.file_url?.ToString() ?? GetFileUrl("transactions", att.filename?.ToString() ?? ""),
                        relatedId = att.transaction_id,
                        createdAt = att.created_at
                    });
                }
            }

            if (string.IsNullOrEmpty(type) || type == "comments")
            {
                var attachments = await _db.QueryAsync<dynamic>(
                    @"SELECT ca.*, pc.id as comment_id, pc.content as comment_content
                      FROM comment_attachments ca
                      LEFT JOIN project_comments pc ON ca.comment_id = pc.id
                      ORDER BY ca.created_at DESC
                      LIMIT ? OFFSET ?",
                    new object[] { limitNum, offsetNum }
                );

                foreach (var att in attachments)
                {
                    allFiles.Add(new
                    {
                        id = att.id,
                        type = "attachment",
                        category = "project-comments",
                        filename = att.filename,
                        originalFilename = att.original_filename,
                        fileType = att.file_type,
                        fileSize = att.file_size,
                        fileUrl = att.file_url?.ToString() ?? GetFileUrl("comments", att.filename?.ToString() ?? ""),
                        relatedId = att.comment_id,
                        createdAt = att.created_at
                    });
                }
            }

            var counts = new Dictionary<string, int>();
            if (string.IsNullOrEmpty(type) || type == "avatars")
            {
                var userCount = await _db.QueryFirstOrDefaultAsync<dynamic>(
                    "SELECT COUNT(*) as total FROM users WHERE avatar IS NOT NULL AND avatar != ?",
                    new[] { "" }
                );
                counts["avatars"] = Convert.ToInt32(userCount?.total ?? 0);
            }

            if (string.IsNullOrEmpty(type) || type == "transactions")
            {
                var transCount = await _db.QueryFirstOrDefaultAsync<dynamic>(
                    "SELECT COUNT(*) as total FROM transaction_attachments"
                );
                counts["transactions"] = Convert.ToInt32(transCount?.total ?? 0);
            }

            if (string.IsNullOrEmpty(type) || type == "comments")
            {
                var commentCount = await _db.QueryFirstOrDefaultAsync<dynamic>(
                    "SELECT COUNT(*) as total FROM comment_attachments"
                );
                counts["project-comments"] = Convert.ToInt32(commentCount?.total ?? 0);
            }

            allFiles = allFiles.OrderByDescending(f => DateTime.Parse(f.createdAt?.ToString() ?? DateTime.MinValue.ToString())).ToList();

            return Ok(new
            {
                files = allFiles,
                total = allFiles.Count,
                counts,
                limit = limitNum,
                offset = offsetNum
            });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching all files: {ex}");
            return StatusCode(500, new { error = "Không thể lấy danh sách file", message = ex.Message });
        }
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetFileStats()
    {
        try
        {
            var stats = new Dictionary<string, int>();

            var userAvatars = await _db.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT COUNT(*) as total FROM users WHERE avatar IS NOT NULL AND avatar != ?",
                new[] { "" }
            );
            stats["userAvatars"] = Convert.ToInt32(userAvatars?.total ?? 0);

            var transactionAttachments = await _db.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT COUNT(*) as total FROM transaction_attachments"
            );
            stats["transactionAttachments"] = Convert.ToInt32(transactionAttachments?.total ?? 0);

            var commentAttachments = await _db.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT COUNT(*) as total FROM comment_attachments"
            );
            stats["commentAttachments"] = Convert.ToInt32(commentAttachments?.total ?? 0);

            stats["total"] = stats.Values.Sum();

            return Ok(stats);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching file stats: {ex}");
            return StatusCode(500, new { error = "Không thể lấy thống kê file", message = ex.Message });
        }
    }
}

