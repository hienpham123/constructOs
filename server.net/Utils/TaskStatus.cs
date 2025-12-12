using ConstructOs.Server.Config;

namespace ConstructOs.Server.Utils;

public static class TaskStatusHelper
{
    public static readonly string[] AllowedStatuses = { "pending", "in_progress", "submitted", "completed", "blocked", "cancelled" };

    /// <summary>
    /// Tính status tự động của task cha dựa trên status của các task con
    /// </summary>
    public static async Task<string> CalculateParentTaskStatus(IDatabaseService db, string parentTaskId)
    {
        try
        {
            var sql = "SELECT status FROM project_tasks WHERE parent_task_id = ?";
            var childTasks = (await db.QueryAsync<dynamic>(sql, new { parentTaskId })).ToList();

            if (childTasks.Count == 0)
            {
                throw new Exception("Task không có task con");
            }

            var statuses = childTasks.Select(t => t.status?.ToString() ?? "").ToList();
            var hasBlocked = statuses.Any(s => s == "blocked");
            var nonBlockedStatuses = statuses.Where(s => s != "blocked").ToList();

            // Nếu tất cả task con đều blocked
            if (nonBlockedStatuses.Count == 0)
            {
                return "blocked";
            }

            // Kiểm tra cancelled
            if (nonBlockedStatuses.All(s => s == "cancelled"))
            {
                return "cancelled";
            }

            // Kiểm tra completed
            if (nonBlockedStatuses.All(s => s == "completed") && !hasBlocked)
            {
                return "completed";
            }

            // Kiểm tra in_progress, submitted, hoặc blocked
            if (nonBlockedStatuses.Any(s => s == "in_progress" || s == "submitted") || hasBlocked)
            {
                return "in_progress";
            }

            // Mặc định: pending
            return "pending";
        }
        catch (Exception ex)
        {
            throw new Exception($"Error calculating parent task status: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Cập nhật status của task cha tự động
    /// </summary>
    public static async Task UpdateParentTaskStatus(IDatabaseService db, string parentTaskId)
    {
        try
        {
            var sql = "SELECT id, status FROM project_tasks WHERE id = ?";
            var parentTask = await db.QueryFirstOrDefaultAsync<dynamic>(sql, new { parentTaskId });

            if (parentTask == null)
            {
                return; // Task cha không tồn tại
            }

            var newStatus = await CalculateParentTaskStatus(db, parentTaskId);
            var currentStatus = parentTask.status?.ToString() ?? "";

            if (newStatus != currentStatus)
            {
                var updateSql = "UPDATE project_tasks SET status = ?, updated_at = ? WHERE id = ?";
                await db.ExecuteAsync(updateSql, new
                {
                    status = newStatus,
                    updatedAt = DataHelpers.ToMySQLDateTime(),
                    id = parentTaskId
                });

                // Kiểm tra xem task cha này có phải là task con của task khác không
                var grandParentSql = "SELECT parent_task_id FROM project_tasks WHERE id = ?";
                var grandParent = await db.QueryFirstOrDefaultAsync<dynamic>(grandParentSql, new { parentTaskId });

                if (grandParent != null && grandParent.parent_task_id != null)
                {
                    await UpdateParentTaskStatus(db, grandParent.parent_task_id.ToString()!);
                }
            }
        }
        catch (Exception ex)
        {
            if (ex.Message.Contains("không có task con"))
            {
                return;
            }
            throw;
        }
    }

    /// <summary>
    /// Kiểm tra task có task con không
    /// </summary>
    public static async Task<bool> HasChildTasks(IDatabaseService db, string taskId)
    {
        try
        {
            var sql = "SELECT COUNT(*) as count FROM project_tasks WHERE parent_task_id = ?";
            var result = await db.QueryFirstOrDefaultAsync<dynamic>(sql, new { taskId });
            var count = result?.count;
            
            if (count is int intCount)
            {
                return intCount > 0;
            }
            if (count is long longCount)
            {
                return longCount > 0;
            }
            return false;
        }
        catch
        {
            return false;
        }
    }
}

