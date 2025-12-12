using ConstructOs.Server.Config;
using ConstructOs.Server.Middleware;
using ConstructOs.Server.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructOs.Server.Controllers;

[ApiController]
[Route("api/transaction-attachments")]
public class TransactionAttachmentController : ControllerBase
{
    private readonly IDatabaseService _db;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public TransactionAttachmentController(IDatabaseService db, IConfiguration configuration, IWebHostEnvironment environment)
    {
        _db = db;
        _configuration = configuration;
        _environment = environment;
    }

    private string GetTransactionAttachmentUrl(string? filename)
    {
        if (string.IsNullOrEmpty(filename)) return string.Empty;
        if (filename.StartsWith("http://") || filename.StartsWith("https://")) return filename;
        
        var baseUrl = _configuration["API_BASE_URL"] ?? 
                     _configuration["SERVER_URL"] ?? 
                     (_configuration["ASPNETCORE_ENVIRONMENT"] == "Production"
                        ? _configuration["PRODUCTION_API_URL"] ?? "https://your-api-domain.com"
                        : "http://localhost:2222");
        
        return $"{baseUrl}/uploads/transactions/{filename}";
    }

    [HttpGet]
    public async Task<IActionResult> GetAttachments([FromQuery] string? transactionId)
    {
        try
        {
            if (string.IsNullOrEmpty(transactionId))
            {
                return BadRequest(new { error = "transactionId là bắt buộc" });
            }

            var transaction = await _db.QueryAsync<dynamic>(
                "SELECT id FROM material_transactions WHERE id = ?",
                new[] { transactionId }
            );

            if (!transaction.Any())
            {
                return NotFound(new { error = "Không tìm thấy giao dịch" });
            }

            var attachments = await _db.QueryAsync<dynamic>(
                "SELECT * FROM transaction_attachments WHERE transaction_id = ? ORDER BY created_at ASC",
                new[] { transactionId }
            );

            var attachmentsWithUrls = attachments.Select(att => new
            {
                id = att.id,
                transactionId = att.transaction_id,
                filename = att.filename,
                originalFilename = att.original_filename,
                fileType = att.file_type,
                fileSize = att.file_size,
                fileUrl = GetTransactionAttachmentUrl(att.filename?.ToString()),
                createdAt = att.created_at
            }).ToList();

            return Ok(attachmentsWithUrls);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching transaction attachments: {ex}");
            return StatusCode(500, new { error = "Không thể lấy danh sách file đính kèm" });
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateAttachments([FromForm] string transactionId, [FromForm] IFormFileCollection? files)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            if (string.IsNullOrEmpty(transactionId))
            {
                return BadRequest(new { error = "transactionId là bắt buộc" });
            }

            var transaction = await _db.QueryAsync<dynamic>(
                "SELECT id FROM material_transactions WHERE id = ?",
                new[] { transactionId }
            );

            if (!transaction.Any())
            {
                return NotFound(new { error = "Không tìm thấy giao dịch" });
            }

            if (files == null || files.Count == 0)
            {
                return BadRequest(new { error = "Phải có ít nhất một file" });
            }

            var createdAt = DataHelpers.ToMySQLDateTime();
            var attachments = new List<dynamic>();

            foreach (var file in files)
            {
                var attachmentId = Guid.NewGuid().ToString();
                var (filename, url) = await FileUploadHelper.HandleFileUpload(file, "transactions", _configuration, _environment);

                await _db.ExecuteAsync(
                    @"INSERT INTO transaction_attachments (id, transaction_id, filename, original_filename, file_type, file_size, file_url, created_at)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    new object[]
                    {
                        attachmentId, transactionId, filename, file.FileName, file.ContentType, file.Length,
                        url, createdAt
                    }
                );

                attachments.Add(new
                {
                    id = attachmentId,
                    transactionId,
                    filename,
                    originalFilename = file.FileName,
                    fileType = file.ContentType,
                    fileSize = file.Length,
                    fileUrl = url,
                    createdAt
                });
            }

            return StatusCode(201, attachments);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error creating transaction attachments: {ex}");
            return StatusCode(500, new { error = "Không thể tạo file đính kèm" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteAttachment(string id)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var attachment = await _db.QueryAsync<dynamic>(
                "SELECT * FROM transaction_attachments WHERE id = ?",
                new[] { id }
            );

            if (!attachment.Any())
            {
                return NotFound(new { error = "Không tìm thấy file đính kèm" });
            }

            var transaction = await _db.QueryAsync<dynamic>(
                "SELECT id FROM material_transactions WHERE id = ?",
                new[] { attachment.First().transaction_id }
            );

            if (!transaction.Any())
            {
                return NotFound(new { error = "Không tìm thấy giao dịch" });
            }

            try
            {
                var filePath = Path.Combine(_environment.ContentRootPath, "uploads", "transactions", attachment.First().filename?.ToString() ?? "");
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }
            catch (Exception fileEx)
            {
                Console.Error.WriteLine($"Error deleting file {attachment.First().filename}: {fileEx}");
            }

            await _db.ExecuteAsync("DELETE FROM transaction_attachments WHERE id = ?", new[] { id });
            return NoContent();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error deleting transaction attachment: {ex}");
            return StatusCode(500, new { error = "Không thể xóa file đính kèm" });
        }
    }
}

