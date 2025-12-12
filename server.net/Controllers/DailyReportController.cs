using ConstructOs.Server.Config;
using ConstructOs.Server.Middleware;
using ConstructOs.Server.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConstructOs.Server.Controllers;

[ApiController]
[Route("api/daily-reports")]
[Authorize]
public class DailyReportController : ControllerBase
{
    private readonly IDatabaseService _db;

    public DailyReportController(IDatabaseService db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetDailyReports([FromQuery] string? date, [FromQuery] int? pageSize, 
        [FromQuery] int? pageIndex, [FromQuery] string? search, [FromQuery] string? sortBy, [FromQuery] string? sortOrder)
    {
        try
        {
            var pageSizeNum = pageSize ?? 10;
            var pageIndexNum = pageIndex ?? 0;
            var offset = pageIndexNum * pageSizeNum;

            var queryParams = new List<object>();
            var searchFields = new[] { "u.name", "u.code", "dr.content", "dr.suggestion", "dr.time_slot", "dr.location" };
            var searchClause = DataHelpers.BuildSearchClause(search, searchFields, out queryParams);

            if (!string.IsNullOrEmpty(date))
            {
                var dateFilter = string.IsNullOrEmpty(searchClause) ? "WHERE dr.report_date = ?" : " AND dr.report_date = ?";
                searchClause = string.IsNullOrEmpty(searchClause) ? dateFilter : searchClause + dateFilter;
                queryParams.Add(date);
            }

            var allowedSortFields = new[] { "name", "code", "report_date", "created_at" };
            var sortClause = DataHelpers.BuildSortClause(sortBy, allowedSortFields, "report_date", sortOrder);
            var sortClauseWithAlias = sortClause
                .Replace("name", "u.name")
                .Replace("code", "u.code")
                .Replace("report_date", "dr.report_date")
                .Replace("created_at", "dr.created_at");

            var allUsers = await _db.QueryAsync<dynamic>(
                "SELECT id, name, code, status FROM users WHERE status = 'active' ORDER BY name"
            );

            var countSearchClause = searchClause;
            var countQuery = $@"SELECT COUNT(*) as total 
                               FROM daily_reports dr
                               LEFT JOIN users u ON dr.user_id = u.id
                               {countSearchClause}";
            dynamic? countResult = null;
            if (queryParams.Count > 0)
            {
                countResult = await _db.QueryFirstOrDefaultAsync<dynamic>(countQuery, queryParams.ToArray());
            }
            else
            {
                countResult = await _db.QueryFirstOrDefaultAsync<dynamic>(countQuery);
            }
            var total = Convert.ToInt32(countResult?.total ?? 0);

            var reports = await _db.QueryAsync<dynamic>(
                $@"SELECT dr.id, dr.user_id, dr.report_date, dr.content, dr.suggestion,
                   dr.time_slot, dr.location, dr.created_at, dr.updated_at,
                   u.name as user_name, u.code as user_code
                   FROM daily_reports dr
                   LEFT JOIN users u ON dr.user_id = u.id
                   {searchClause} {sortClauseWithAlias} LIMIT {pageSizeNum} OFFSET {offset}",
                queryParams.Count > 0 ? queryParams.ToArray() : null
            );

            var reportsMap = reports.ToDictionary(r => r.user_id?.ToString() ?? "", r => r);
            var responseData = allUsers.Select(user =>
            {
                var userId = user.id?.ToString() ?? "";
                var report = reportsMap.ContainsKey(userId) ? reportsMap[userId] : null;
                return new
                {
                    user_id = user.id,
                    user_name = user.name,
                    user_code = user.code,
                    has_report = report != null,
                    report = report != null ? new
                    {
                        id = report.id,
                        content = report.content,
                        suggestion = report.suggestion,
                        time_slot = report.time_slot,
                        location = report.location,
                        report_date = report.report_date,
                        created_at = report.created_at,
                        updated_at = report.updated_at
                    } : null
                };
            }).ToList();

            return Ok(new { data = responseData, total = allUsers.Count(), pageIndex = pageIndexNum, pageSize = pageSizeNum });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching daily reports: {ex}");
            return StatusCode(500, new { error = "Không thể lấy danh sách báo cáo ngày" });
        }
    }

    [HttpGet("{userId}/{date}")]
    public async Task<IActionResult> GetDailyReportByUserAndDate(string userId, string date)
    {
        try
        {
            string reportDate;
            if (DateTime.TryParse(date, out var dateObj))
            {
                reportDate = DataHelpers.ToMySQLDate(dateObj);
            }
            else
            {
                reportDate = date;
            }

            var results = await _db.QueryAsync<dynamic>(
                @"SELECT dr.*, u.name as user_name, u.code as user_code, u.status as user_status
                  FROM daily_reports dr
                  LEFT JOIN users u ON dr.user_id = u.id
                  WHERE dr.user_id = ? AND dr.report_date = ?",
                new[] { userId, reportDate }
            );

            if (!results.Any())
            {
                return NotFound(new { error = "Không tìm thấy báo cáo" });
            }

            return Ok(results.First());
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error fetching daily report: {ex}");
            return StatusCode(500, new { error = "Không thể lấy báo cáo ngày" });
        }
    }

    [HttpPost("{userId}/{date}")]
    [HttpPut("{userId}/{date}")]
    public async Task<IActionResult> CreateOrUpdateDailyReport(string userId, string date, [FromBody] dynamic reportData)
    {
        try
        {
            var currentUserId = HttpContext.GetUserId();
            if (userId != currentUserId)
            {
                return StatusCode(403, new { error = "Bạn chỉ có thể báo cáo cho chính mình" });
            }

            if (reportData.content == null)
            {
                return BadRequest(new { error = "Nội dung báo cáo là bắt buộc" });
            }

            string reportDate;
            if (DateTime.TryParse(date, out var dateObj))
            {
                reportDate = DataHelpers.ToMySQLDate(dateObj);
            }
            else
            {
                reportDate = DataHelpers.ToMySQLDate(date);
            }

            var createdAt = DataHelpers.ToMySQLDateTime();
            var existing = await _db.QueryAsync<dynamic>(
                "SELECT id FROM daily_reports WHERE user_id = ? AND report_date = ?",
                new[] { userId, reportDate }
            );

            if (existing.Any())
            {
                var id = existing.First().id?.ToString();
                await _db.ExecuteAsync(
                    @"UPDATE daily_reports SET content = ?, suggestion = ?, time_slot = ?, location = ?, updated_at = ?
                      WHERE id = ?",
                    new object[]
                    {
                        reportData.content, DataHelpers.NormalizeString(reportData.suggestion?.ToString()),
                        DataHelpers.NormalizeString(reportData.time_slot?.ToString()),
                        DataHelpers.NormalizeString(reportData.location?.ToString()), createdAt, id
                    }
                );

                var updated = await _db.QueryAsync<dynamic>(
                    @"SELECT dr.*, u.name as user_name, u.code as user_code
                      FROM daily_reports dr
                      LEFT JOIN users u ON dr.user_id = u.id
                      WHERE dr.id = ?",
                    new[] { id }
                );

                return Ok(updated.First());
            }
            else
            {
                var id = Guid.NewGuid().ToString();
                await _db.ExecuteAsync(
                    @"INSERT INTO daily_reports (id, user_id, report_date, content, suggestion, time_slot, location, created_at, updated_at)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    new object[]
                    {
                        id, userId, reportDate, reportData.content,
                        DataHelpers.NormalizeString(reportData.suggestion?.ToString()),
                        DataHelpers.NormalizeString(reportData.time_slot?.ToString()),
                        DataHelpers.NormalizeString(reportData.location?.ToString()), createdAt, createdAt
                    }
                );

                var newReport = await _db.QueryAsync<dynamic>(
                    @"SELECT dr.*, u.name as user_name, u.code as user_code
                      FROM daily_reports dr
                      LEFT JOIN users u ON dr.user_id = u.id
                      WHERE dr.id = ?",
                    new[] { id }
                );

                return StatusCode(201, newReport.First());
            }
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error creating/updating daily report: {ex}");
            return StatusCode(500, new { error = "Không thể tạo/cập nhật báo cáo ngày" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDailyReport(string id)
    {
        try
        {
            var existing = await _db.QueryAsync<dynamic>("SELECT id FROM daily_reports WHERE id = ?", new[] { id });
            if (!existing.Any())
            {
                return NotFound(new { error = "Không tìm thấy báo cáo" });
            }

            await _db.ExecuteAsync("DELETE FROM daily_reports WHERE id = ?", new[] { id });
            return NoContent();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error deleting daily report: {ex}");
            return StatusCode(500, new { error = "Không thể xóa báo cáo ngày" });
        }
    }
}

