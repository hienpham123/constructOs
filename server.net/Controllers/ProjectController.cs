using ConstructOs.Server.Config;
using ConstructOs.Server.Models;
using ConstructOs.Server.Utils;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ConstructOs.Server.Controllers;

[ApiController]
[Route("api/projects")]
public class ProjectController : ControllerBase
{
    private readonly IDatabaseService _db;
    private readonly ILogger<ProjectController> _logger;

    public ProjectController(IDatabaseService db, ILogger<ProjectController> logger)
    {
        _db = db;
        _logger = logger;
    }

    private async Task<List<ProjectManagerDto>> GetProjectManagers(string? managerIdsJson)
    {
        if (string.IsNullOrEmpty(managerIdsJson))
        {
            return new List<ProjectManagerDto>();
        }

        List<string> managerIds;
        try
        {
            managerIds = JsonSerializer.Deserialize<List<string>>(managerIdsJson) ?? new List<string>();
        }
        catch
        {
            return new List<ProjectManagerDto>();
        }

        if (managerIds.Count == 0)
        {
            return new List<ProjectManagerDto>();
        }

        // Get user details for each manager ID
        var placeholders = string.Join(",", managerIds.Select((_, i) => "?"));
        var sql = $"SELECT id, name, email, avatar FROM users WHERE id IN ({placeholders})";
        
        var users = (await _db.QueryAsync<dynamic>(sql, new { managerIds })).ToList();

        return users.Select(u => new ProjectManagerDto
        {
            Id = u.id?.ToString() ?? "",
            UserId = u.id?.ToString() ?? "",
            UserName = u.name?.ToString() ?? "",
            UserEmail = u.email?.ToString(),
            UserAvatar = u.avatar?.ToString()
        }).ToList();
    }

    [HttpGet]
    public async Task<IActionResult> GetProjects([FromQuery] int? pageSize, [FromQuery] int? pageIndex,
        [FromQuery] string? search, [FromQuery] string? sortBy, [FromQuery] string? sortOrder)
    {
        try
        {
            var pageSizeNum = pageSize ?? 10;
            var pageIndexNum = pageIndex ?? 0;
            var offset = pageIndexNum * pageSizeNum;

            var queryParams = new List<object>();
            var searchClause = DataHelpers.BuildSearchClause(search,
                new[] { "name", "description", "investor", "client", "contact_person", "location" },
                out queryParams);

            var countSql = $"SELECT COUNT(*) as total FROM projects {searchClause}";
            dynamic? countResult = null;
            if (queryParams.Count > 0)
            {
                // Pass parameters as array for Dapper
                countResult = await _db.QueryFirstOrDefaultAsync<dynamic>(countSql, queryParams.ToArray());
            }
            else
            {
                countResult = await _db.QueryFirstOrDefaultAsync<dynamic>(countSql);
            }
            var total = Convert.ToInt32(countResult?.total ?? 0);

            var allowedSortFields = new[] { "name", "investor", "client", "location", "status", "progress", "budget", "actual_cost", "start_date", "end_date", "created_at", "updated_at" };
            var sortClause = DataHelpers.BuildSortClause(sortBy, allowedSortFields, "created_at", sortOrder);

            var sql = $"SELECT * FROM projects {searchClause} {sortClause} LIMIT {pageSizeNum} OFFSET {offset}";
            IEnumerable<dynamic> results;
            if (queryParams.Count > 0)
            {
                // Pass parameters as array for Dapper
                results = await _db.QueryAsync<dynamic>(sql, queryParams.ToArray());
            }
            else
            {
                results = await _db.QueryAsync<dynamic>(sql);
            }

            // For each project, get managers from manager_ids field
            var projectsWithRelations = new List<object>();
            foreach (var project in results)
            {
                var managers = await GetProjectManagers(project.manager_ids?.ToString());

                string managerName = "";
                string? managerId = project.manager_id?.ToString();
                if (managers.Count == 0 && project.manager_id != null)
                {
                    var manager = await _db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT name FROM users WHERE id = ?", new { managerId = project.manager_id });
                    managerName = manager?.name?.ToString() ?? "";
                }
                else if (managers.Count > 0)
                {
                    managerId = managers[0].UserId;
                    managerName = string.Join(", ", managers.Select(m => m.UserName));
                }

                projectsWithRelations.Add(new
                {
                    id = project.id,
                    code = project.code,
                    name = project.name,
                    description = project.description,
                    client = project.client,
                    investor = project.investor ?? project.client ?? "",
                    contact_person = project.contact_person,
                    location = project.location,
                    start_date = project.start_date,
                    end_date = project.end_date,
                    status = project.status,
                    progress = project.progress,
                    budget = project.budget,
                    actual_cost = project.actual_cost,
                    manager_id = managerId,
                    created_at = project.created_at,
                    updated_at = project.updated_at,
                    startDate = project.start_date,
                    endDate = project.end_date,
                    actualCost = project.actual_cost,
                    managerId = managerId,
                    createdAt = project.created_at,
                    contactPerson = project.contact_person,
                    stages = new List<object>(),
                    documents = new List<object>(),
                    managerName,
                    managers
                });
            }

            return Ok(new
            {
                data = projectsWithRelations,
                total,
                pageIndex = pageIndexNum,
                pageSize = pageSizeNum
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching projects");
            return StatusCode(500, new { error = "Không thể lấy danh sách dự án" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProjectById(string id)
    {
        try
        {
            // Auto-update project progress
            try
            {
                await ProjectProgressHelper.UpdateProjectProgress(_db, id);
            }
            catch { }

            var project = await _db.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT * FROM projects WHERE id = ?", new { id });

            if (project == null)
            {
                return NotFound(new { error = "Không tìm thấy dự án" });
            }

            var managers = await GetProjectManagers(project.manager_ids?.ToString());

            string managerName = "";
            string? managerId = project.manager_id?.ToString();
            if (managers.Count == 0 && project.manager_id != null)
            {
                var manager = await _db.QueryFirstOrDefaultAsync<dynamic>(
                    "SELECT name FROM users WHERE id = ?", new { managerId = project.manager_id });
                managerName = manager?.name?.ToString() ?? "";
            }
            else if (managers.Count > 0)
            {
                managerId = managers[0].UserId;
                managerName = string.Join(", ", managers.Select(m => m.UserName));
            }

            return Ok(new
            {
                id = project.id,
                code = project.code,
                name = project.name,
                description = project.description,
                client = project.client,
                investor = project.investor ?? project.client ?? "",
                contact_person = project.contact_person,
                location = project.location,
                start_date = project.start_date,
                end_date = project.end_date,
                status = project.status,
                progress = project.progress,
                budget = project.budget,
                actual_cost = project.actual_cost,
                manager_id = managerId,
                created_at = project.created_at,
                updated_at = project.updated_at,
                startDate = project.start_date,
                endDate = project.end_date,
                actualCost = project.actual_cost,
                managerId = managerId,
                createdAt = project.created_at,
                contactPerson = project.contact_person,
                stages = new List<object>(),
                documents = new List<object>(),
                managerName,
                managers
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching project");
            return StatusCode(500, new { error = "Không thể lấy thông tin dự án" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequest request)
    {
        try
        {
            var id = Guid.NewGuid().ToString();
            var createdAt = DataHelpers.ToMySQLDateTime();
            var code = id.Substring(0, 8).ToUpper();
            var investor = request.Investor ?? request.Client ?? "";

            // Get manager IDs from managers array or fallback to managerId
            var managerIds = new List<string>();
            if (request.Managers != null && request.Managers.Count > 0)
            {
                managerIds = request.Managers;
            }
            else if (!string.IsNullOrEmpty(request.ManagerId))
            {
                managerIds.Add(request.ManagerId);
            }

            var primaryManagerId = managerIds.Count > 0 ? managerIds[0] : null;
            var managerIdsJson = JsonSerializer.Serialize(managerIds);

            await _db.ExecuteAsync(
                @"INSERT INTO projects (
                    id, code, name, description, client, investor, contact_person, location, start_date, end_date,
                    status, progress, budget, actual_cost, manager_id, manager_ids, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                new
                {
                    id,
                    code,
                    name = request.Name,
                    description = request.Description,
                    client = investor,
                    investor,
                    contactPerson = request.ContactPerson,
                    location = request.Location,
                    startDate = !string.IsNullOrEmpty(request.StartDate) ? DataHelpers.ToMySQLDate(request.StartDate) : null,
                    endDate = !string.IsNullOrEmpty(request.EndDate) ? DataHelpers.ToMySQLDate(request.EndDate) : null,
                    status = request.Status,
                    progress = 0,
                    budget = request.Budget ?? 0,
                    actualCost = request.ActualCost ?? 0,
                    managerId = primaryManagerId,
                    managerIds = managerIdsJson,
                    createdAt,
                    updatedAt = createdAt
                });

            var newProject = await _db.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT * FROM projects WHERE id = ?", new { id });

            var managers = await GetProjectManagers(managerIdsJson);
            var managerName = managers.Count > 0 ? string.Join(", ", managers.Select(m => m.UserName)) : "";

            return StatusCode(201, new
            {
                id = newProject.id,
                code = newProject.code,
                name = newProject.name,
                description = newProject.description,
                client = newProject.client,
                investor = newProject.investor ?? newProject.client ?? "",
                contact_person = newProject.contact_person,
                location = newProject.location,
                start_date = newProject.start_date,
                end_date = newProject.end_date,
                status = newProject.status,
                progress = newProject.progress,
                budget = newProject.budget,
                actual_cost = newProject.actual_cost,
                manager_id = primaryManagerId ?? newProject.manager_id,
                created_at = newProject.created_at,
                updated_at = newProject.updated_at,
                startDate = newProject.start_date,
                endDate = newProject.end_date,
                actualCost = newProject.actual_cost,
                managerId = primaryManagerId ?? newProject.manager_id,
                createdAt = newProject.created_at,
                contactPerson = newProject.contact_person,
                stages = new List<object>(),
                documents = new List<object>(),
                managerName,
                managers
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating project");
            return StatusCode(500, new { error = "Không thể tạo dự án" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProject(string id, [FromBody] UpdateProjectRequest request)
    {
        try
        {
            var existing = await _db.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT * FROM projects WHERE id = ?", new { id });

            if (existing == null)
            {
                return NotFound(new { error = "Không tìm thấy dự án" });
            }

            // Auto-update project progress
            await ProjectProgressHelper.UpdateProjectProgress(_db, id);
            var projectWithProgress = await _db.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT progress FROM projects WHERE id = ?", new { id });
            var autoProgress = Convert.ToInt32(projectWithProgress?.progress ?? 0);

            // Get manager IDs
            var managerIds = new List<string>();
            if (request.Managers != null && request.Managers.Count > 0)
            {
                managerIds = request.Managers;
            }
            else if (!string.IsNullOrEmpty(request.ManagerId))
            {
                managerIds.Add(request.ManagerId);
            }

            var primaryManagerId = managerIds.Count > 0 ? managerIds[0] : null;
            var managerIdsJson = JsonSerializer.Serialize(managerIds);
            var investor = request.Investor ?? request.Client ?? "";

            await _db.ExecuteAsync(
                @"UPDATE projects SET
                    name = ?, description = ?, investor = ?, contact_person = ?, location = ?,
                    start_date = ?, end_date = ?, status = ?, progress = ?,
                    budget = ?, actual_cost = ?, manager_id = ?, manager_ids = ?, updated_at = ?
                WHERE id = ?",
                new
                {
                    name = request.Name,
                    description = request.Description,
                    investor,
                    contactPerson = request.ContactPerson,
                    location = request.Location,
                    startDate = !string.IsNullOrEmpty(request.StartDate) ? DataHelpers.ToMySQLDate(request.StartDate) : null,
                    endDate = !string.IsNullOrEmpty(request.EndDate) ? DataHelpers.ToMySQLDate(request.EndDate) : null,
                    status = request.Status,
                    progress = autoProgress,
                    budget = request.Budget,
                    actualCost = request.ActualCost,
                    managerId = primaryManagerId,
                    managerIds = managerIdsJson,
                    updatedAt = DataHelpers.ToMySQLDateTime(),
                    id
                });

            var updated = await _db.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT * FROM projects WHERE id = ?", new { id });

            var managers = await GetProjectManagers(managerIdsJson);
            var managerName = managers.Count > 0 ? string.Join(", ", managers.Select(m => m.UserName)) : "";

            return Ok(new
            {
                id = updated.id,
                code = updated.code,
                name = updated.name,
                description = updated.description,
                client = updated.client,
                investor = updated.investor ?? updated.client ?? "",
                contact_person = updated.contact_person,
                location = updated.location,
                start_date = updated.start_date,
                end_date = updated.end_date,
                status = updated.status,
                progress = updated.progress,
                budget = updated.budget,
                actual_cost = updated.actual_cost,
                manager_id = primaryManagerId ?? updated.manager_id,
                created_at = updated.created_at,
                updated_at = updated.updated_at,
                startDate = updated.start_date,
                endDate = updated.end_date,
                actualCost = updated.actual_cost,
                managerId = primaryManagerId ?? updated.manager_id,
                createdAt = updated.created_at,
                contactPerson = updated.contact_person,
                stages = new List<object>(),
                documents = new List<object>(),
                managerName,
                managers
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating project");
            return StatusCode(500, new { error = "Không thể cập nhật dự án" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(string id)
    {
        try
        {
            var existing = await _db.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT * FROM projects WHERE id = ?", new { id });

            if (existing == null)
            {
                return NotFound(new { error = "Không tìm thấy dự án" });
            }

            await _db.ExecuteAsync("DELETE FROM projects WHERE id = ?", new { id });

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting project");
            return StatusCode(500, new { error = "Không thể xóa dự án" });
        }
    }
}

