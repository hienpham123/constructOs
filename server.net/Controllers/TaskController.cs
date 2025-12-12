using ConstructOs.Server.Config;
using ConstructOs.Server.Middleware;
using ConstructOs.Server.Models;
using ConstructOs.Server.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using Dapper;

namespace ConstructOs.Server.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class TaskController : ControllerBase
{
    private readonly IDatabaseService _db;
    private readonly ILogger<TaskController> _logger;

    private static readonly string[] AllowedStatuses = { "pending", "in_progress", "submitted", "completed", "blocked", "cancelled" };
    private static readonly string[] AllowedPriorities = { "low", "normal", "high" };
    private static readonly string[] BlockedStatuses = { "completed", "cancelled" };

    public TaskController(IDatabaseService db, ILogger<TaskController> logger)
    {
        _db = db;
        _logger = logger;
    }

    private TaskDto MapTask(TaskRow row)
    {
        return new TaskDto
        {
            Id = row.Id,
            ProjectId = row.ProjectId,
            ParentTaskId = row.ParentTaskId,
            Title = row.Title,
            Description = row.Description,
            Priority = row.Priority,
            Status = row.Status,
            DueDate = row.DueDate,
            AssignedTo = row.AssignedTo,
            AssignedToName = row.AssignedToName ?? "",
            CreatedBy = row.CreatedBy,
            CreatedByName = row.CreatedByName ?? "",
            CreatedAt = row.CreatedAt,
            UpdatedAt = row.UpdatedAt,
            Children = new List<TaskDto>()
        };
    }

    private async Task<TaskRow?> GetTaskRow(string taskId)
    {
        var sql = @"SELECT pt.*, u1.name AS assigned_to_name, u2.name AS created_by_name
                    FROM project_tasks pt
                    LEFT JOIN users u1 ON pt.assigned_to = u1.id
                    LEFT JOIN users u2 ON pt.created_by = u2.id
                    WHERE pt.id = ?";
        
        return await _db.QueryFirstOrDefaultAsync<TaskRow>(sql, new { taskId });
    }

    private async Task AssertProjectExists(string projectId)
    {
        var sql = "SELECT id FROM projects WHERE id = ?";
        var result = await _db.QueryFirstOrDefaultAsync<dynamic>(sql, new { projectId });
        if (result == null)
        {
            throw new Exception("Dự án không tồn tại");
        }
    }

    private async Task<List<string>> GetProjectManagers(string projectId)
    {
        var sql = "SELECT manager_ids, manager_id FROM projects WHERE id = ?";
        var project = await _db.QueryFirstOrDefaultAsync<dynamic>(sql, new { projectId });
        
        if (project == null) return new List<string>();

        // Try to parse manager_ids JSON field
        if (project.manager_ids != null)
        {
            try
            {
                var managerIds = System.Text.Json.JsonSerializer.Deserialize<List<string>>(project.manager_ids.ToString() ?? "[]");
                if (managerIds != null && managerIds.Count > 0)
                {
                    return managerIds;
                }
            }
            catch
            {
                // Invalid JSON, fall through to manager_id
            }
        }

        // Fallback to manager_id
        if (project.manager_id != null)
        {
            return new List<string> { project.manager_id.ToString()! };
        }

        return new List<string>();
    }

    private async Task<bool> IsProjectManager(string userId, string projectId)
    {
        var managerIds = await GetProjectManagers(projectId);
        return managerIds.Contains(userId);
    }

    [HttpGet("projects/{projectId}/tasks")]
    public async Task<IActionResult> GetTasksByProject(string projectId)
    {
        try
        {
            await AssertProjectExists(projectId);

            var sql = @"SELECT pt.*, u1.name AS assigned_to_name, u2.name AS created_by_name
                       FROM project_tasks pt
                       LEFT JOIN users u1 ON pt.assigned_to = u1.id
                       LEFT JOIN users u2 ON pt.created_by = u2.id
                       WHERE pt.project_id = ?
                       ORDER BY pt.created_at ASC";

            var rows = (await _db.QueryAsync<TaskRow>(sql, new { projectId })).ToList();

            var tasksMap = new Dictionary<string, TaskDto>();
            var roots = new List<TaskDto>();

            foreach (var row in rows)
            {
                var task = MapTask(row);
                tasksMap[task.Id] = task;
            }

            foreach (var row in rows)
            {
                var task = tasksMap[row.Id];
                if (!string.IsNullOrEmpty(row.ParentTaskId) && tasksMap.ContainsKey(row.ParentTaskId))
                {
                    tasksMap[row.ParentTaskId].Children.Add(task);
                }
                else
                {
                    roots.Add(task);
                }
            }

            return Ok(roots);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching tasks");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("projects/{projectId}/tasks")]
    public async Task<IActionResult> CreateTask(string projectId, [FromBody] CreateTaskRequest request)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            if (string.IsNullOrEmpty(request.Title) || string.IsNullOrEmpty(request.AssignedTo))
            {
                return BadRequest(new { error = "Thiếu tiêu đề hoặc người được giao" });
            }

            if (!AllowedPriorities.Contains(request.Priority))
            {
                return BadRequest(new { error = "Độ ưu tiên không hợp lệ" });
            }

            await AssertProjectExists(projectId);

            var isManager = await IsProjectManager(userId, projectId);
            if (!isManager)
            {
                return StatusCode(403, new { error = "Chỉ quản lý dự án mới có thể tạo công việc" });
            }

            if (!string.IsNullOrEmpty(request.ParentTaskId))
            {
                var parentSql = "SELECT id, project_id, status FROM project_tasks WHERE id = ?";
                var parent = await _db.QueryFirstOrDefaultAsync<dynamic>(parentSql, new { request.ParentTaskId });
                
                if (parent == null || parent.project_id?.ToString() != projectId)
                {
                    return BadRequest(new { error = "Công việc cha không hợp lệ" });
                }
                
                if (parent.status?.ToString() == "cancelled")
                {
                    return BadRequest(new { error = "Không thể tạo công việc con vì công việc cha đã bị hủy" });
                }
            }

            var id = Guid.NewGuid().ToString();
            var now = DataHelpers.ToMySQLDateTime();

            await _db.TransactionAsync(async (connection) =>
            {
                var insertSql = @"INSERT INTO project_tasks (
                    id, project_id, parent_task_id, title, description, priority, status,
                    due_date, assigned_to, created_by, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

                await connection.ExecuteAsync(insertSql, new
                {
                    id,
                    projectId,
                    parentTaskId = request.ParentTaskId,
                    title = request.Title,
                    description = request.Description,
                    priority = request.Priority,
                    status = "pending",
                    dueDate = !string.IsNullOrEmpty(request.DueDate) ? DataHelpers.ToMySQLDate(request.DueDate) : null,
                    assignedTo = request.AssignedTo,
                    createdBy = userId,
                    createdAt = now,
                    updatedAt = now
                });

                var activitySql = @"INSERT INTO task_activity (id, task_id, action, note, actor_id, created_at)
                                   VALUES (?, ?, ?, ?, ?, ?)";
                
                await connection.ExecuteAsync(activitySql, new
                {
                    id = Guid.NewGuid().ToString(),
                    taskId = id,
                    action = "created",
                    note = request.Description ?? "",
                    actorId = userId ?? request.AssignedTo,
                    createdAt = now
                });
            });

            var newTask = await GetTaskRow(id);
            if (newTask == null)
            {
                return StatusCode(500, new { error = "Không thể tạo công việc" });
            }

            return StatusCode(201, MapTask(newTask));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPut("tasks/{taskId}")]
    public async Task<IActionResult> UpdateTask(string taskId, [FromBody] UpdateTaskRequest request)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var existing = await GetTaskRow(taskId);
            if (existing == null)
            {
                return NotFound(new { error = "Không tìm thấy công việc" });
            }

            var isManager = await IsProjectManager(userId, existing.ProjectId);
            if (!isManager)
            {
                return StatusCode(403, new { error = "Chỉ quản lý dự án mới có thể chỉnh sửa công việc" });
            }

            var nextPriority = request.Priority ?? existing.Priority;
            if (!AllowedPriorities.Contains(nextPriority))
            {
                return BadRequest(new { error = "Độ ưu tiên không hợp lệ" });
            }

            var now = DataHelpers.ToMySQLDateTime();

            await _db.TransactionAsync(async (connection) =>
            {
                var updateSql = @"UPDATE project_tasks SET
                    title = ?, description = ?, priority = ?, due_date = ?, assigned_to = ?, updated_at = ?
                WHERE id = ?";

                await connection.ExecuteAsync(updateSql, new
                {
                    title = request.Title ?? existing.Title,
                    description = request.Description ?? existing.Description,
                    priority = nextPriority,
                    dueDate = !string.IsNullOrEmpty(request.DueDate) ? DataHelpers.ToMySQLDate(request.DueDate) : existing.DueDate,
                    assignedTo = request.AssignedTo ?? existing.AssignedTo,
                    updatedAt = now,
                    taskId
                });

                var activitySql = @"INSERT INTO task_activity (id, task_id, action, note, actor_id, created_at)
                                   VALUES (?, ?, ?, ?, ?, ?)";
                
                await connection.ExecuteAsync(activitySql, new
                {
                    id = Guid.NewGuid().ToString(),
                    taskId,
                    action = "updated",
                    note = "Cập nhật thông tin công việc",
                    actorId = userId,
                    createdAt = now
                });
            });

            var updated = await GetTaskRow(taskId);
            if (updated == null)
            {
                return StatusCode(500, new { error = "Không thể cập nhật công việc" });
            }

            return Ok(MapTask(updated));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task");
            return StatusCode(500, new { error = "Không thể cập nhật công việc" });
        }
    }

    [HttpPost("tasks/{taskId}/status")]
    public async Task<IActionResult> UpdateTaskStatus(string taskId, [FromBody] UpdateTaskStatusRequest request)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            if (!AllowedStatuses.Contains(request.Status))
            {
                return BadRequest(new { error = "Trạng thái không hợp lệ" });
            }

            var task = await GetTaskRow(taskId);
            if (task == null)
            {
                return NotFound(new { error = "Không tìm thấy công việc" });
            }

            var isManager = await IsProjectManager(userId, task.ProjectId);
            var isAssigned = task.AssignedTo == userId;

            if (!isManager && !isAssigned)
            {
                return StatusCode(403, new { error = "Chỉ người được giao hoặc quản lý dự án mới có thể thay đổi trạng thái" });
            }

            if (BlockedStatuses.Contains(task.Status) && task.Status != request.Status)
            {
                return BadRequest(new { error = "Không thể thay đổi trạng thái từ \"Hoàn thành\" hoặc \"Hủy\"" });
            }

            if (request.Status == "completed")
            {
                await ValidateCompletionOrder(task);
            }

            var now = DataHelpers.ToMySQLDateTime();

            await _db.TransactionAsync(async (connection) =>
            {
                var updateSql = "UPDATE project_tasks SET status = ?, updated_at = ? WHERE id = ?";
                await connection.ExecuteAsync(updateSql, new
                {
                    status = request.Status,
                    updatedAt = now,
                    taskId
                });

                var activitySql = @"INSERT INTO task_activity (id, task_id, action, note, actor_id, created_at)
                                   VALUES (?, ?, ?, ?, ?, ?)";
                
                await connection.ExecuteAsync(activitySql, new
                {
                    id = Guid.NewGuid().ToString(),
                    taskId,
                    action = "status_change",
                    note = request.Note ?? $"{task.Status} -> {request.Status}",
                    actorId = userId ?? task.AssignedTo,
                    createdAt = now
                });
            });

            // Auto-update parent task status if this is a child task
            if (!string.IsNullOrEmpty(task.ParentTaskId))
            {
                try
                {
                    await Utils.TaskStatusHelper.UpdateParentTaskStatus(_db, task.ParentTaskId);
                }
                catch { }
            }

            var updated = await GetTaskRow(taskId);
            if (updated == null)
            {
                return StatusCode(500, new { error = "Không thể cập nhật trạng thái" });
            }

            return Ok(MapTask(updated));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task status");
            return BadRequest(new { error = ex.Message });
        }
    }

    private async Task ValidateCompletionOrder(TaskRow task)
    {
        var sql = "SELECT id, status FROM project_tasks WHERE parent_task_id = ?";
        var children = (await _db.QueryAsync<dynamic>(sql, new { task.Id })).ToList();

        if (children.Count > 0)
        {
            var unfinishedChildren = children.Where(c => 
                c.status?.ToString() != "completed" && 
                c.status?.ToString() != "cancelled").ToList();

            if (unfinishedChildren.Count > 0)
            {
                var unfinishedStatuses = string.Join(", ", unfinishedChildren.Select(c => c.status?.ToString()));
                throw new Exception($"Cần hoàn thành hoặc hủy tất cả công việc con trước. Còn {unfinishedChildren.Count} công việc con ở trạng thái: {unfinishedStatuses}");
            }
        }
    }

    [HttpDelete("tasks/{taskId}")]
    public async Task<IActionResult> DeleteTask(string taskId)
    {
        try
        {
            var userId = HttpContext.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Không có quyền truy cập" });
            }

            var task = await GetTaskRow(taskId);
            if (task == null)
            {
                return NotFound(new { error = "Không tìm thấy công việc" });
            }

            var isManager = await IsProjectManager(userId, task.ProjectId);
            if (!isManager)
            {
                return StatusCode(403, new { error = "Chỉ quản lý dự án mới có thể xóa công việc" });
            }

            var allChildTaskIds = await GetAllChildTaskIds(taskId);
            var allTaskIdsToDelete = new List<string> { taskId };
            allTaskIdsToDelete.AddRange(allChildTaskIds);

            if (!string.IsNullOrEmpty(task.ParentTaskId) && allTaskIdsToDelete.Contains(task.ParentTaskId))
            {
                return BadRequest(new { error = "Không thể xóa task cha khi xóa task con" });
            }

            await _db.TransactionAsync(async (connection) =>
            {
                // Delete task activities first
                foreach (var idToDelete in allTaskIdsToDelete)
                {
                    await connection.ExecuteAsync("DELETE FROM task_activity WHERE task_id = ?", new { idToDelete });
                }

                // Delete tasks (children first, then parent)
                var taskInfos = new List<dynamic>();
                foreach (var id in allTaskIdsToDelete)
                {
                    var taskInfo = await connection.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT id, parent_task_id FROM project_tasks WHERE id = ?", 
                        new { id });
                    if (taskInfo != null)
                    {
                        taskInfos.Add(new { id = taskInfo.id?.ToString(), parent_task_id = taskInfo.parent_task_id?.ToString() });
                    }
                }

                var sortedTaskIds = allTaskIdsToDelete.OrderBy(a =>
                {
                    var aInfo = taskInfos.FirstOrDefault(t => t.id == a);
                    var hasParent = taskInfos.Any(t => t.parent_task_id == a);
                    return hasParent ? 0 : 1; // Children first
                }).ToList();

                foreach (var idToDelete in sortedTaskIds)
                {
                    if (idToDelete == task.ParentTaskId)
                    {
                        throw new Exception($"Không thể xóa task cha {idToDelete} khi xóa task con {taskId}");
                    }

                    await connection.ExecuteAsync("DELETE FROM project_tasks WHERE id = ?", new { idToDelete });
                }
            });

            // Tự động cập nhật tiến độ dự án
            try
            {
                await ProjectProgressHelper.UpdateProjectProgress(_db, task.ProjectId);
            }
            catch { }

            // Tự động cập nhật status của task cha nếu task này là task con
            if (!string.IsNullOrEmpty(task.ParentTaskId))
            {
                try
                {
                    await TaskStatusHelper.UpdateParentTaskStatus(_db, task.ParentTaskId);
                }
                catch { }
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting task");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    private async Task<List<string>> GetAllChildTaskIds(string parentTaskId)
    {
        var sql = "SELECT id, parent_task_id FROM project_tasks WHERE parent_task_id = ?";
        var children = (await _db.QueryAsync<dynamic>(sql, new { parentTaskId })).ToList();

        if (children.Count == 0)
        {
            return new List<string>();
        }

        var allChildIds = new List<string>();

        foreach (var child in children)
        {
            var childId = child.id?.ToString();
            if (string.IsNullOrEmpty(childId)) continue;

            if (child.parent_task_id?.ToString() != parentTaskId) continue;

            allChildIds.Add(childId);

            var grandChildren = await GetAllChildTaskIds(childId);
            allChildIds.AddRange(grandChildren);
        }

        return allChildIds;
    }
}

