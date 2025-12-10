import { query } from '../config/db.js';

/**
 * Tính tiến độ dự án tự động dựa trên trạng thái các công việc
 * @param projectId - ID của dự án
 * @returns Tiến độ từ 0-100
 */
export async function calculateProjectProgress(projectId: string): Promise<number> {
  try {
    // Lấy tất cả tasks của project (bao gồm cả parent và child tasks)
    const tasks = await query<any[]>(
      `SELECT id, status, parent_task_id 
       FROM project_tasks 
       WHERE project_id = ?`,
      [projectId]
    );

    if (tasks.length === 0) {
      return 0; // Không có task nào thì tiến độ = 0
    }

    // Chỉ tính các task không phải là child task (parent tasks hoặc standalone tasks)
    // Vì child tasks được tính vào parent task
    // Bỏ qua các task có status "cancelled" - không tính vào tiến độ
    // Blocked vẫn được tính là "đang làm" (không phải completed, nhưng vẫn tính vào tổng)
    const topLevelTasks = tasks.filter(
      task => !task.parent_task_id && task.status !== 'cancelled'
    );
    
    if (topLevelTasks.length === 0) {
      // Nếu tất cả đều là child tasks hoặc cancelled, tính các task không cancelled
      const validTasks = tasks.filter(
        task => task.status !== 'cancelled'
      );
      if (validTasks.length === 0) {
        return 0; // Tất cả đều cancelled
      }
      const completedTasks = validTasks.filter(task => task.status === 'completed').length;
      return Math.round((completedTasks / validTasks.length) * 100);
    }

    // Tính tiến độ dựa trên top-level tasks (không tính cancelled)
    // Blocked vẫn được tính vào tổng (như là task đang làm, không phải completed)
    // Mỗi top-level task có trọng số bằng nhau
    const completedTopLevelTasks = topLevelTasks.filter(task => task.status === 'completed').length;
    const progress = Math.round((completedTopLevelTasks / topLevelTasks.length) * 100);
    
    return Math.min(100, Math.max(0, progress));
  } catch (error: any) {
    console.error('Error calculating project progress:', error);
    return 0;
  }
}

/**
 * Cập nhật tiến độ dự án tự động
 * @param projectId - ID của dự án
 */
export async function updateProjectProgress(projectId: string): Promise<void> {
  try {
    const progress = await calculateProjectProgress(projectId);
    const { toMySQLDateTime } = await import('./dataHelpers.js');
    
    await query(
      'UPDATE projects SET progress = ?, updated_at = ? WHERE id = ?',
      [progress, toMySQLDateTime(), projectId]
    );
    
    // Progress updated
  } catch (error: any) {
    console.error('Error updating project progress:', error);
    throw error;
  }
}

