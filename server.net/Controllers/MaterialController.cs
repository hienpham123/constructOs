using ConstructOs.Server.Config;
using ConstructOs.Server.Middleware;
using ConstructOs.Server.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ConstructOs.Server.Controllers;

[ApiController]
[Route("api/materials")]
public class MaterialController : ControllerBase
{
    private readonly IDatabaseService _db;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public MaterialController(IDatabaseService db, IConfiguration configuration, IWebHostEnvironment environment)
    {
        _db = db;
        _configuration = configuration;
        _environment = environment;
    }

    [HttpGet]
    public async Task<IActionResult> GetMaterials([FromQuery] int? pageSize, [FromQuery] int? pageIndex, 
        [FromQuery] string? search, [FromQuery] string? sortBy, [FromQuery] string? sortOrder)
    {
        try
        {
            var pageSizeNum = pageSize ?? 10;
            var pageIndexNum = pageIndex ?? 0;
            var offset = pageIndexNum * pageSizeNum;

            var queryParams = new List<object>();
            var searchClause = DataHelpers.BuildSearchClause(
                search,
                new[] { "name", "code", "type", "category", "supplier", "barcode", "qr_code" },
                out queryParams
            );

            var allowedSortFields = new[] { "name", "code", "type", "category", "unit", "current_stock", "import_price", "unit_price", "supplier", "status", "created_at", "updated_at" };
            var sortClause = DataHelpers.BuildSortClause(sortBy, allowedSortFields, "created_at", sortOrder);

            var countSql = $"SELECT COUNT(*) as total FROM materials {searchClause}";
            dynamic? countResult = null;
            if (queryParams.Count > 0)
            {
                countResult = await _db.QueryFirstOrDefaultAsync<dynamic>(countSql, queryParams.ToArray());
            }
            else
            {
                countResult = await _db.QueryFirstOrDefaultAsync<dynamic>(countSql);
            }
            var total = Convert.ToInt32(countResult?.total ?? 0);

            var sql = $"SELECT * FROM materials {searchClause} {sortClause} LIMIT {pageSizeNum} OFFSET {offset}";
            IEnumerable<dynamic> results;
            if (queryParams.Count > 0)
            {
                results = await _db.QueryAsync<dynamic>(sql, queryParams.ToArray());
            }
            else
            {
                results = await _db.QueryAsync<dynamic>(sql);
            }

            return Ok(new { data = results, total, pageIndex = pageIndexNum, pageSize = pageSizeNum });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching materials: {ex}");
            return StatusCode(500, new { error = "Không thể lấy danh sách vật tư" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMaterialById(string id)
    {
        try
        {
            var results = await _db.QueryAsync<dynamic>("SELECT * FROM materials WHERE id = ?", new[] { id });
            var material = results.FirstOrDefault();

            if (material == null)
            {
                return NotFound(new { error = "Không tìm thấy vật tư" });
            }

            return Ok(material);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching material: {ex}");
            return StatusCode(500, new { error = "Không thể lấy thông tin vật tư" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateMaterial([FromBody] dynamic materialData)
    {
        try
        {
            var id = Guid.NewGuid().ToString();
            var createdAt = DataHelpers.ToMySQLDateTime();

            var currentStock = materialData.currentStock != null ? Convert.ToDouble(materialData.currentStock) : 0;
            var status = "available";
            if (currentStock == 0)
            {
                status = "out_of_stock";
            }
            else if (currentStock <= 10)
            {
                status = "low_stock";
            }

            var code = id.Substring(0, 8).ToUpper();
            var type = materialData.type?.ToString() ?? "";
            var category = type;

            await _db.ExecuteAsync(
                @"INSERT INTO materials (id, code, name, category, type, unit, current_stock, min_stock, max_stock, 
                  unit_price, import_price, supplier, location, barcode, qr_code, status, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                new object[]
                {
                    id, code, materialData.name, category, type,
                    materialData.unit, currentStock, 0, 0,
                    materialData.importPrice ?? 0, materialData.importPrice ?? 0,
                    materialData.supplier ?? null, null,
                    materialData.barcode ?? null, materialData.qrCode ?? null,
                    status, createdAt, createdAt
                }
            );

            var newMaterial = await _db.QueryAsync<dynamic>("SELECT * FROM materials WHERE id = ?", new[] { id });
            return StatusCode(201, newMaterial.First());
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error creating material: {ex}");
            return StatusCode(500, new { error = "Không thể tạo vật tư" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMaterial(string id, [FromBody] dynamic materialData)
    {
        try
        {
            var existing = await _db.QueryAsync<dynamic>("SELECT * FROM materials WHERE id = ?", new[] { id });
            if (!existing.Any())
            {
                return NotFound(new { error = "Không tìm thấy vật tư" });
            }

            var currentStock = materialData.currentStock != null ? Convert.ToDouble(materialData.currentStock) : 0;
            var status = "available";
            if (currentStock == 0)
            {
                status = "out_of_stock";
            }
            else if (currentStock <= 10)
            {
                status = "low_stock";
            }

            var updatedAt = DataHelpers.ToMySQLDateTime();

            await _db.ExecuteAsync(
                @"UPDATE materials SET name = ?, type = ?, unit = ?, current_stock = ?,
                  import_price = ?, supplier = ?, barcode = ?, qr_code = ?, status = ?, updated_at = ?
                  WHERE id = ?",
                new object[]
                {
                    materialData.name, materialData.type, materialData.unit, currentStock,
                    materialData.importPrice, materialData.supplier ?? null,
                    materialData.barcode ?? null, materialData.qrCode ?? null,
                    status, updatedAt, id
                }
            );

            var updated = await _db.QueryAsync<dynamic>("SELECT * FROM materials WHERE id = ?", new[] { id });
            return Ok(updated.First());
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error updating material: {ex}");
            return StatusCode(500, new { error = "Không thể cập nhật vật tư" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMaterial(string id)
    {
        try
        {
            var existing = await _db.QueryAsync<dynamic>("SELECT * FROM materials WHERE id = ?", new[] { id });
            if (!existing.Any())
            {
                return NotFound(new { error = "Không tìm thấy vật tư" });
            }

            await _db.ExecuteAsync("DELETE FROM materials WHERE id = ?", new[] { id });
            return NoContent();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error deleting material: {ex}");
            return StatusCode(500, new { error = "Không thể xóa vật tư" });
        }
    }

    [HttpGet("transactions/list")]
    public async Task<IActionResult> GetTransactions([FromQuery] int? pageSize, [FromQuery] int? pageIndex,
        [FromQuery] string? search, [FromQuery] string? sortBy, [FromQuery] string? sortOrder)
    {
        try
        {
            var pageSizeNum = pageSize ?? 10;
            var pageIndexNum = pageIndex ?? 0;
            var offset = pageIndexNum * pageSizeNum;

            var queryParams = new List<object>();
            var searchClause = DataHelpers.BuildSearchClause(
                search,
                new[] { "mt.material_name", "mt.project_name", "mt.reason", "mt.type", "u.name" },
                out queryParams
            );

            var sortFieldMap = new Dictionary<string, string>
            {
                { "material_name", "mt.material_name" },
                { "type", "mt.type" },
                { "quantity", "mt.quantity" },
                { "project_name", "mt.project_name" },
                { "performed_at", "mt.performed_at" },
                { "created_at", "mt.performed_at" }
            };

            var dbSortField = sortFieldMap.ContainsKey(sortBy ?? "") ? sortFieldMap[sortBy] : "mt.performed_at";
            var validSortOrder = sortOrder == "desc" ? "DESC" : "ASC";
            var finalSortClause = $"ORDER BY {dbSortField} {validSortOrder}";

            var countSql = $"SELECT COUNT(*) as total FROM material_transactions mt LEFT JOIN users u ON mt.performed_by = u.id {searchClause}";
            dynamic? countResult = null;
            if (queryParams.Count > 0)
            {
                countResult = await _db.QueryFirstOrDefaultAsync<dynamic>(countSql, queryParams.ToArray());
            }
            else
            {
                countResult = await _db.QueryFirstOrDefaultAsync<dynamic>(countSql);
            }
            var total = Convert.ToInt32(countResult?.total ?? 0);

            var sql = $@"SELECT mt.*, u.name as performed_by_name
                         FROM material_transactions mt
                         LEFT JOIN users u ON mt.performed_by = u.id
                         {searchClause} {finalSortClause} LIMIT {pageSizeNum} OFFSET {offset}";

            IEnumerable<dynamic> results;
            if (queryParams.Count > 0)
            {
                results = await _db.QueryAsync<dynamic>(sql, queryParams.ToArray());
            }
            else
            {
                results = await _db.QueryAsync<dynamic>(sql);
            }

            return Ok(new { data = results, total, pageIndex = pageIndexNum, pageSize = pageSizeNum });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching transactions: {ex}");
            return StatusCode(500, new { error = "Không thể lấy danh sách giao dịch" });
        }
    }

    [HttpGet("transactions/{id}")]
    public async Task<IActionResult> GetTransactionById(string id)
    {
        try
        {
            var results = await _db.QueryAsync<dynamic>(
                @"SELECT mt.*, u.name as performed_by_name
                  FROM material_transactions mt
                  LEFT JOIN users u ON mt.performed_by = u.id
                  WHERE mt.id = ?",
                new[] { id }
            );

            if (!results.Any())
            {
                return NotFound(new { error = "Không tìm thấy giao dịch" });
            }

            var transaction = results.First();
            var attachments = await _db.QueryAsync<dynamic>(
                "SELECT * FROM transaction_attachments WHERE transaction_id = ? ORDER BY created_at ASC",
                new[] { id }
            );

            var attachmentsWithUrls = attachments.Select(att => new
            {
                id = att.id,
                transactionId = att.transaction_id,
                filename = att.filename,
                originalFilename = att.original_filename,
                fileType = att.file_type,
                fileSize = att.file_size,
                fileUrl = FileUploadHelper.GetFileUrl(att.filename?.ToString(), "transactions", _configuration),
                createdAt = att.created_at
            }).ToList();

            var transactionDict = (IDictionary<string, object>)transaction;
            transactionDict["attachments"] = attachmentsWithUrls.Select(a => a.fileUrl).ToList();
            transactionDict["attachmentDetails"] = attachmentsWithUrls;

            return Ok(transaction);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching transaction: {ex}");
            return StatusCode(500, new { error = "Không thể lấy thông tin giao dịch" });
        }
    }

    [HttpPost("transactions")]
    [Authorize]
    public async Task<IActionResult> CreateTransaction([FromBody] dynamic transactionData)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            if (transactionData.materialId == null)
            {
                return BadRequest(new { error = "Vật tư là bắt buộc" });
            }

            var type = transactionData.type?.ToString();
            if (type != "import" && type != "export")
            {
                return BadRequest(new { error = "Loại giao dịch không hợp lệ" });
            }

            var quantity = transactionData.quantity != null ? Convert.ToDouble(transactionData.quantity) : 0;
            if (quantity <= 0)
            {
                return BadRequest(new { error = "Số lượng phải lớn hơn 0" });
            }

            if (transactionData.reason == null)
            {
                return BadRequest(new { error = "Lý do là bắt buộc" });
            }

            var material = await _db.QueryAsync<dynamic>("SELECT * FROM materials WHERE id = ?", new[] { transactionData.materialId.ToString() });
            if (!material.Any())
            {
                return NotFound(new { error = "Không tìm thấy vật tư" });
            }

            var materialObj = material.First();
            var currentStock = Convert.ToDouble(materialObj.current_stock ?? 0);
            var transactionQuantity = quantity;

            if (type == "export" && currentStock < transactionQuantity)
            {
                return BadRequest(new { error = $"Không đủ tồn kho. Tồn kho hiện tại: {currentStock} {materialObj.unit ?? ""}" });
            }

            string? projectId = null;
            string? projectName = null;

            if (transactionData.projectId != null)
            {
                var normalized = await DataHelpers.NormalizeProject(
                    transactionData.projectId?.ToString(),
                    transactionData.projectName?.ToString(),
                    _db
                );

                if (string.IsNullOrEmpty(normalized.projectId))
                {
                    return BadRequest(new { error = "Dự án không hợp lệ" });
                }

                var projectCheck = await _db.QueryAsync<dynamic>("SELECT id, name FROM projects WHERE id = ?", new[] { normalized.projectId });
                if (!projectCheck.Any())
                {
                    return BadRequest(new { error = "Dự án không tồn tại" });
                }

                projectId = normalized.projectId;
                projectName = normalized.projectName ?? projectCheck.First().name?.ToString();
            }

            var newStock = currentStock;
            if (type == "import")
            {
                newStock += transactionQuantity;
            }
            else if (type == "export")
            {
                newStock -= transactionQuantity;
            }

            if (newStock < 0)
            {
                return BadRequest(new { error = $"Không thể thực hiện giao dịch. Tồn kho sẽ âm: {newStock}" });
            }

            var id = Guid.NewGuid().ToString();
            var performedAt = DataHelpers.ToMySQLDateTime();

            string? attachmentValue = null;
            if (transactionData.attachments != null)
            {
                var attachments = JsonSerializer.Deserialize<List<string>>(transactionData.attachments.ToString() ?? "[]");
                if (attachments != null && attachments.Count > 0)
                {
                    var filenames = attachments.Select(url =>
                    {
                        if (url.StartsWith("http://") || url.StartsWith("https://"))
                        {
                            var urlParts = url.Split('/');
                            return urlParts[urlParts.Length - 1];
                        }
                        return url;
                    }).ToList();
                    attachmentValue = JsonSerializer.Serialize(filenames);
                }
            }

            await _db.ExecuteAsync(
                @"INSERT INTO material_transactions (id, material_id, material_name, type, quantity, unit,
                  project_id, project_name, reason, attachment, performed_by, performed_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                new object[]
                {
                    id, transactionData.materialId, transactionData.materialName ?? materialObj.name,
                    type, quantity, transactionData.unit ?? materialObj.unit,
                    projectId, projectName, transactionData.reason,
                    attachmentValue, userId, performedAt
                }
            );

            await _db.ExecuteAsync("UPDATE materials SET current_stock = ? WHERE id = ?", new object[] { newStock, transactionData.materialId });

            var newTransaction = await _db.QueryAsync<dynamic>("SELECT * FROM material_transactions WHERE id = ?", new[] { id });
            return StatusCode(201, newTransaction.First());
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error creating transaction: {ex}");
            return StatusCode(500, new { error = "Không thể tạo giao dịch" });
        }
    }

    [HttpPut("transactions/{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateTransaction(string id, [FromBody] dynamic transactionData)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var existing = await _db.QueryAsync<dynamic>("SELECT * FROM material_transactions WHERE id = ?", new[] { id });
            if (!existing.Any())
            {
                return NotFound(new { error = "Không tìm thấy giao dịch" });
            }

            var existingTransaction = existing.First();
            // Implementation for update transaction - similar to create but with stock recalculation
            // This is a simplified version, full implementation would need to handle stock recalculation

            return Ok(new { message = "Update transaction - implementation needed" });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error updating transaction: {ex}");
            return StatusCode(500, new { error = "Không thể cập nhật giao dịch" });
        }
    }

    [HttpDelete("transactions/{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteTransaction(string id)
    {
        try
        {
            var existing = await _db.QueryAsync<dynamic>("SELECT * FROM material_transactions WHERE id = ?", new[] { id });
            if (!existing.Any())
            {
                return NotFound(new { error = "Không tìm thấy giao dịch" });
            }

            await _db.ExecuteAsync("DELETE FROM material_transactions WHERE id = ?", new[] { id });
            return NoContent();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error deleting transaction: {ex}");
            return StatusCode(500, new { error = "Không thể xóa giao dịch" });
        }
    }

    [HttpGet("purchase-requests/list")]
    public async Task<IActionResult> GetPurchaseRequests([FromQuery] int? pageSize, [FromQuery] int? pageIndex,
        [FromQuery] string? search, [FromQuery] string? sortBy, [FromQuery] string? sortOrder)
    {
        try
        {
            var pageSizeNum = pageSize ?? 10;
            var pageIndexNum = pageIndex ?? 0;
            var offset = pageIndexNum * pageSizeNum;

            var queryParams = new List<object>();
            var searchClause = DataHelpers.BuildSearchClause(
                search,
                new[] { "pr.material_name", "pr.reason", "pr.status", "u1.name", "u2.name" },
                out queryParams
            );

            var sortFieldMap = new Dictionary<string, string>
            {
                { "material_name", "pr.material_name" },
                { "quantity", "pr.quantity" },
                { "status", "pr.status" },
                { "requested_at", "pr.requested_at" },
                { "approved_at", "pr.approved_at" }
            };

            var dbSortField = sortFieldMap.ContainsKey(sortBy ?? "") ? sortFieldMap[sortBy] : "pr.requested_at";
            var validSortOrder = sortOrder == "desc" ? "DESC" : "ASC";
            var finalSortClause = $"ORDER BY {dbSortField} {validSortOrder}";

            var countSql = $"SELECT COUNT(*) as total FROM purchase_requests pr LEFT JOIN users u1 ON pr.requested_by = u1.id LEFT JOIN users u2 ON pr.approved_by = u2.id {searchClause}";
            dynamic? countResult = null;
            if (queryParams.Count > 0)
            {
                countResult = await _db.QueryFirstOrDefaultAsync<dynamic>(countSql, queryParams.ToArray());
            }
            else
            {
                countResult = await _db.QueryFirstOrDefaultAsync<dynamic>(countSql);
            }
            var total = Convert.ToInt32(countResult?.total ?? 0);

            var sql = $@"SELECT pr.*, u1.name as requested_by_name, u2.name as approved_by_name, p.name as project_name
                         FROM purchase_requests pr
                         LEFT JOIN users u1 ON pr.requested_by = u1.id
                         LEFT JOIN users u2 ON pr.approved_by = u2.id
                         LEFT JOIN projects p ON pr.project_id = p.id
                         {searchClause} {finalSortClause} LIMIT {pageSizeNum} OFFSET {offset}";

            IEnumerable<dynamic> results;
            if (queryParams.Count > 0)
            {
                results = await _db.QueryAsync<dynamic>(sql, queryParams.ToArray());
            }
            else
            {
                results = await _db.QueryAsync<dynamic>(sql);
            }

            return Ok(new { data = results, total, pageIndex = pageIndexNum, pageSize = pageSizeNum });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching purchase requests: {ex}");
            return StatusCode(500, new { error = "Không thể lấy danh sách yêu cầu mua hàng" });
        }
    }

    [HttpGet("purchase-requests/{id}")]
    public async Task<IActionResult> GetPurchaseRequestById(string id)
    {
        try
        {
            var results = await _db.QueryAsync<dynamic>(
                @"SELECT pr.*, u1.name as requested_by_name, u2.name as approved_by_name, p.name as project_name
                  FROM purchase_requests pr
                  LEFT JOIN users u1 ON pr.requested_by = u1.id
                  LEFT JOIN users u2 ON pr.approved_by = u2.id
                  LEFT JOIN projects p ON pr.project_id = p.id
                  WHERE pr.id = ?",
                new[] { id }
            );

            if (!results.Any())
            {
                return NotFound(new { error = "Không tìm thấy yêu cầu mua hàng" });
            }

            return Ok(results.First());
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching purchase request: {ex}");
            return StatusCode(500, new { error = "Không thể lấy thông tin yêu cầu mua hàng" });
        }
    }

    [HttpPost("purchase-requests")]
    [Authorize]
    public async Task<IActionResult> CreatePurchaseRequest([FromBody] dynamic requestData)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            if (requestData.materialId == null)
            {
                return BadRequest(new { error = "Vật tư là bắt buộc" });
            }

            var quantity = requestData.quantity != null ? Convert.ToDouble(requestData.quantity) : 0;
            if (quantity <= 0)
            {
                return BadRequest(new { error = "Số lượng phải lớn hơn 0" });
            }

            if (requestData.reason == null)
            {
                return BadRequest(new { error = "Lý do là bắt buộc" });
            }

            var material = await _db.QueryAsync<dynamic>("SELECT * FROM materials WHERE id = ?", new[] { requestData.materialId.ToString() });
            if (!material.Any())
            {
                return NotFound(new { error = "Không tìm thấy vật tư" });
            }

            var materialObj = material.First();
            var requestId = Guid.NewGuid().ToString();
            var requestedAt = DataHelpers.ToMySQLDateTime();

            await _db.ExecuteAsync(
                @"INSERT INTO purchase_requests (id, material_id, material_name, quantity, unit, reason,
                  requested_by, requested_at, status, project_id)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                new object[]
                {
                    requestId, requestData.materialId, requestData.materialName ?? materialObj.name,
                    quantity, requestData.unit ?? materialObj.unit, requestData.reason,
                    userId, requestedAt, "pending", requestData.projectId ?? null
                }
            );

            var newRequest = await _db.QueryAsync<dynamic>(
                @"SELECT pr.*, u.name as requested_by_name, p.name as project_name
                  FROM purchase_requests pr
                  LEFT JOIN users u ON pr.requested_by = u.id
                  LEFT JOIN projects p ON pr.project_id = p.id
                  WHERE pr.id = ?",
                new[] { requestId }
            );

            return StatusCode(201, newRequest.First());
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error creating purchase request: {ex}");
            return StatusCode(500, new { error = "Không thể tạo yêu cầu mua hàng" });
        }
    }

    [HttpPut("purchase-requests/{id}")]
    [Authorize]
    public async Task<IActionResult> UpdatePurchaseRequest(string id, [FromBody] dynamic requestData)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var existing = await _db.QueryAsync<dynamic>("SELECT * FROM purchase_requests WHERE id = ?", new[] { id });
            if (!existing.Any())
            {
                return NotFound(new { error = "Không tìm thấy yêu cầu mua hàng" });
            }

            var updatedAt = DataHelpers.ToMySQLDateTime();
            var status = requestData.status?.ToString() ?? existing.First().status?.ToString();

            if (status == "approved")
            {
                var approvedBy = userId;
                var approvedAt = updatedAt;
                await _db.ExecuteAsync(
                    @"UPDATE purchase_requests SET status = ?, approved_by = ?, approved_at = ?, updated_at = ? WHERE id = ?",
                    new object[] { status, approvedBy, approvedAt, updatedAt, id }
                );
            }
            else
            {
                await _db.ExecuteAsync(
                    @"UPDATE purchase_requests SET status = ?, updated_at = ? WHERE id = ?",
                    new object[] { status, updatedAt, id }
                );
            }

            var updated = await _db.QueryAsync<dynamic>(
                @"SELECT pr.*, u1.name as requested_by_name, u2.name as approved_by_name, p.name as project_name
                  FROM purchase_requests pr
                  LEFT JOIN users u1 ON pr.requested_by = u1.id
                  LEFT JOIN users u2 ON pr.approved_by = u2.id
                  LEFT JOIN projects p ON pr.project_id = p.id
                  WHERE pr.id = ?",
                new[] { id }
            );

            return Ok(updated.First());
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error updating purchase request: {ex}");
            return StatusCode(500, new { error = "Không thể cập nhật yêu cầu mua hàng" });
        }
    }

    [HttpDelete("purchase-requests/{id}")]
    [Authorize]
    public async Task<IActionResult> DeletePurchaseRequest(string id)
    {
        try
        {
            var existing = await _db.QueryAsync<dynamic>("SELECT * FROM purchase_requests WHERE id = ?", new[] { id });
            if (!existing.Any())
            {
                return NotFound(new { error = "Không tìm thấy yêu cầu mua hàng" });
            }

            await _db.ExecuteAsync("DELETE FROM purchase_requests WHERE id = ?", new[] { id });
            return NoContent();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error deleting purchase request: {ex}");
            return StatusCode(500, new { error = "Không thể xóa yêu cầu mua hàng" });
        }
    }
}

