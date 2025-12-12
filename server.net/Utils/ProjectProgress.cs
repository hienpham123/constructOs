using ConstructOs.Server.Config;

namespace ConstructOs.Server.Utils;

public static class ProjectProgressHelper
{
    /// <summary>
    /// Tính tiến độ dự án tự động dựa trên trạng thái các công việc
    /// </summary>
    public static async Task<int> CalculateProjectProgress(IDatabaseService db, string projectId)
    {
        try
        {
            var sql = @"SELECT id, status, parent_task_id 
                       FROM project_tasks 
                       WHERE project_id = ?";
            
            var tasks = (await db.QueryAsync<dynamic>(sql, new { projectId })).ToList();

            if (tasks.Count == 0)
            {
                return 0; // Không có task nào thì tiến độ = 0
            }

            // Chỉ tính các task không phải là child task (parent tasks hoặc standalone tasks)
            var topLevelTasks = tasks.Where(t =>
            {
                var parentTaskId = t.parent_task_id?.ToString();
                var status = t.status?.ToString() ?? "";
                return string.IsNullOrEmpty(parentTaskId) && status != "cancelled";
            }).ToList();

            if (topLevelTasks.Count == 0)
            {
                // Nếu tất cả đều là child tasks hoặc cancelled, tính các task không cancelled
                var validTasks = tasks.Where(t => t.status?.ToString() != "cancelled").ToList();
                if (validTasks.Count == 0)
                {
                    return 0; // Tất cả đều cancelled
                }
                var completedTasks = validTasks.Count(t => t.status?.ToString() == "completed");
                return (int)Math.Round((double)completedTasks / validTasks.Count * 100);
            }

            // Tính tiến độ dựa trên top-level tasks
            var completedTopLevelTasks = topLevelTasks.Count(t => t.status?.ToString() == "completed");
            var progress = (int)Math.Round((double)completedTopLevelTasks / topLevelTasks.Count * 100);

            return Math.Min(100, Math.Max(0, progress));
        }
        catch
        {
            return 0;
        }
    }

    /// <summary>
    /// Cập nhật tiến độ dự án tự động
    /// </summary>
    public static async Task UpdateProjectProgress(IDatabaseService db, string projectId)
    {
        try
        {
            var progress = await CalculateProjectProgress(db, projectId);
            
            var sql = "UPDATE projects SET progress = ?, updated_at = ? WHERE id = ?";
            await db.ExecuteAsync(sql, new
            {
                progress,
                updatedAt = DataHelpers.ToMySQLDateTime(),
                id = projectId
            });
        }
        catch (Exception ex)
        {
            throw new Exception($"Error updating project progress: {ex.Message}", ex);
        }
    }
}

